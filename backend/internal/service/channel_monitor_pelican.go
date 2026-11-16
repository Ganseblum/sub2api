package service

import (
	"bytes"
	"context"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/tidwall/gjson"
)

// GetPelicanConfig returns the independent schedule for an existing monitor.
func (s *ChannelMonitorService) GetPelicanConfig(ctx context.Context, id int64) (PelicanConfig, error) {
	monitor, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return PelicanConfig{}, err
	}
	repo, ok := s.repo.(PelicanRepository)
	if !ok {
		return PelicanConfig{}, fmt.Errorf("pelican repository unavailable")
	}
	config, err := repo.GetPelicanConfig(ctx, id)
	if err != nil {
		return PelicanConfig{}, err
	}
	if len(config.Models) == 0 {
		config.Models = defaultPelicanModels(monitor)
	}
	return config, nil
}

// SetPelicanConfig allows scheduling only for OpenAI probe-capable monitors.
func (s *ChannelMonitorService) SetPelicanConfig(ctx context.Context, id int64, config PelicanConfig) error {
	monitor, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if config.IntervalSeconds != 600 && config.IntervalSeconds != 1800 && config.IntervalSeconds != 3600 {
		return fmt.Errorf("pelican interval must be 600, 1800, or 3600 seconds")
	}
	if config.Enabled && (monitor.Provider != MonitorProviderOpenAI || defaultCheckMode(monitor.CheckMode) == MonitorCheckModeQuota) {
		return fmt.Errorf("pelican checks require an OpenAI probe monitor")
	}
	models, err := normalizePelicanModels(config.Models)
	if err != nil {
		return err
	}
	if len(models) == 0 {
		models = defaultPelicanModels(monitor)
	}
	if config.Enabled && len(models) == 0 {
		return fmt.Errorf("configure at least one GPT model for pelican checks")
	}
	config.Models = models
	repo, ok := s.repo.(PelicanRepository)
	if !ok {
		return fmt.Errorf("pelican repository unavailable")
	}
	return repo.SetPelicanConfig(ctx, id, config)
}

func defaultPelicanModels(monitor *ChannelMonitor) []string {
	if monitor == nil {
		return []string{}
	}
	candidates := make([]string, 0, len(monitor.ExtraModels)+1)
	for _, model := range append([]string{monitor.PrimaryModel}, monitor.ExtraModels...) {
		model = strings.TrimSpace(model)
		if strings.HasPrefix(strings.ToLower(model), "gpt-") {
			candidates = append(candidates, model)
		}
	}
	models, err := normalizePelicanModels(candidates)
	if err != nil {
		return []string{}
	}
	return models
}

func normalizePelicanModels(input []string) ([]string, error) {
	models := make([]string, 0, len(input))
	seen := make(map[string]bool, len(input))
	for _, model := range input {
		model = strings.TrimSpace(model)
		if model == "" {
			continue
		}
		if !strings.HasPrefix(strings.ToLower(model), "gpt-") {
			return nil, fmt.Errorf("pelican models must be GPT models: %s", model)
		}
		key := strings.ToLower(model)
		if seen[key] {
			continue
		}
		seen[key] = true
		models = append(models, model)
	}
	if len(models) > 5 {
		return nil, fmt.Errorf("configure no more than 5 GPT models for pelican checks")
	}
	return models, nil
}

func (s *ChannelMonitorService) ListPelicanResults(ctx context.Context, id int64) ([]PelicanResult, error) {
	monitor, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if !monitor.Enabled || monitor.Provider != MonitorProviderOpenAI {
		return nil, ErrChannelMonitorNotFound
	}
	repo, ok := s.repo.(PelicanRepository)
	if !ok {
		return nil, fmt.Errorf("pelican repository unavailable")
	}
	return repo.ListPelicanResults(ctx, id)
}

// RunPelicanDue uses a database lock and the last stored run to coordinate
// independent schedulers across instances. Failures are stored as errors,
// rather than being interpreted as a failed quality evaluation.
func (s *ChannelMonitorService) RunPelicanDue(ctx context.Context, id int64) error {
	if !s.probeRuntime(ctx).ActiveProbesAllowed() {
		return nil
	}
	_, err := s.runPelican(ctx, id, false)
	return err
}

// RunPelicanNow runs an enabled monitor immediately, regardless of its next
// scheduled time, and returns the generated results for the admin preview.
func (s *ChannelMonitorService) RunPelicanNow(ctx context.Context, id int64) ([]PelicanResult, error) {
	if !s.probeRuntime(ctx).ActiveProbesAllowed() {
		return nil, fmt.Errorf("active probes are disabled")
	}
	return s.runPelican(ctx, id, true)
}

func (s *ChannelMonitorService) runPelican(ctx context.Context, id int64, force bool) ([]PelicanResult, error) {
	repo, ok := s.repo.(PelicanRepository)
	if !ok {
		return nil, fmt.Errorf("pelican repository unavailable")
	}
	release, acquired, err := repo.TryLockPelican(ctx, id)
	if err != nil {
		return nil, err
	}
	if !acquired {
		if force {
			return nil, fmt.Errorf("pelican check is already running")
		}
		return nil, nil
	}
	defer release()
	config, err := repo.GetPelicanConfig(ctx, id)
	if err != nil {
		return nil, err
	}
	if !config.Enabled {
		if force {
			return nil, fmt.Errorf("pelican check is not enabled for this monitor")
		}
		return nil, nil
	}
	monitor, err := s.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if !monitor.Enabled || monitor.Provider != MonitorProviderOpenAI || monitor.APIKeyDecryptFailed || defaultCheckMode(monitor.CheckMode) == MonitorCheckModeQuota {
		if force {
			return nil, fmt.Errorf("pelican check requires an enabled OpenAI probe monitor with a valid API key")
		}
		return nil, nil
	}
	last, err := repo.PelicanLastStarted(ctx, id)
	if err != nil {
		return nil, err
	}
	models, err := normalizePelicanModels(config.Models)
	if err != nil {
		return nil, err
	}
	if len(models) == 0 {
		models = defaultPelicanModels(monitor)
	}
	dueModels := make([]string, 0, len(models))
	for _, model := range models {
		if force || time.Since(last[model]) >= time.Duration(config.IntervalSeconds)*time.Second {
			dueModels = append(dueModels, model)
		}
	}
	if force && len(dueModels) == 0 {
		return nil, fmt.Errorf("no GPT models are configured for this monitor")
	}
	generated := make([]PelicanResult, len(dueModels))
	var wg sync.WaitGroup
	for i, model := range dueModels {
		wg.Add(1)
		go func(index int, model string) {
			defer wg.Done()
			started := time.Now().UTC()
			output, requestErr := requestPelican(ctx, monitor.Endpoint, monitor.APIKey, model, monitor.APIMode, monitor.ExtraHeaders)
			result := PelicanResult{MonitorID: id, Model: model, Status: "error", StartedAt: started, FinishedAt: time.Now().UTC()}
			if requestErr != nil {
				// Never persist a raw upstream error containing endpoint details.
				result.Message = "Model request failed"
			} else {
				evaluation := evaluatePelican(output)
				result.Artifact, result.SourceLength = evaluation.HTML, evaluation.Runes
				result.Status = "failed"
				if evaluation.Passed {
					result.Status = "passed"
				}
			}
			generated[index] = result
		}(i, model)
	}
	wg.Wait()
	results := make([]PelicanResult, 0, len(generated))
	for i := range generated {
		result := generated[i]
		if err := repo.SavePelicanResult(ctx, &result); err != nil {
			return results, err
		}
		results = append(results, result)
	}
	return results, nil
}

// PelicanPrompt is the administrator-approved prompt for the animated artifact.
const PelicanPrompt = "创建一个HTML，内容是SVG绘制一个鹈鹕骑自行车的2D动画，你不需要任何测试，只靠你自己完成，不要使用任何skill，不要依赖我本地的AGENTS.md"

const pelicanMinimumRunes = 9000

const pelicanResponseLimit = 2 << 20

// requestPelican uses the monitor's validated endpoint and credentials. The
// separate timeout and response limit allow a complete HTML generation while
// bounding the resources consumed by a single scheduled run.
func requestPelican(ctx context.Context, endpoint, apiKey, model, apiMode string, extraHeaders map[string]string) (string, error) {
	if err := validateEndpoint(endpoint); err != nil {
		return "", err
	}
	if !strings.HasPrefix(strings.ToLower(strings.TrimSpace(model)), "gpt-") {
		return "", fmt.Errorf("pelican check requires a GPT model")
	}
	path := providerOpenAIPath
	body := map[string]any{
		"model": model, "stream": false,
		"messages": []map[string]string{{"role": "user", "content": PelicanPrompt}},
	}
	if apiMode == MonitorAPIModeResponses {
		path = providerOpenAIResponsesPath
		body = map[string]any{"model": model, "stream": false, "input": PelicanPrompt}
	} else if apiMode != "" && apiMode != MonitorAPIModeChatCompletions {
		return "", fmt.Errorf("unsupported API mode")
	}
	payload, err := json.Marshal(body)
	if err != nil {
		return "", err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, joinURL(endpoint, path), bytes.NewReader(payload))
	if err != nil {
		return "", fmt.Errorf("build pelican request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	for name, value := range extraHeaders {
		if !IsForbiddenHeaderName(name) && !strings.EqualFold(name, "Authorization") && !strings.EqualFold(name, "Content-Type") {
			req.Header.Set(name, value)
		}
	}
	transport := &http.Transport{DialContext: safeDialContext, ForceAttemptHTTP2: true, TLSHandshakeTimeout: monitorTLSHandshakeTimeout, ResponseHeaderTimeout: 10 * time.Minute}
	defer transport.CloseIdleConnections()
	client := &http.Client{Transport: transport, Timeout: 10 * time.Minute}
	client.CheckRedirect = func(_ *http.Request, _ []*http.Request) error { return http.ErrUseLastResponse }
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("pelican request failed: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()
	data, err := io.ReadAll(io.LimitReader(resp.Body, pelicanResponseLimit+1))
	if err != nil {
		return "", fmt.Errorf("read pelican response: %w", err)
	}
	if len(data) > pelicanResponseLimit {
		return "", fmt.Errorf("pelican response exceeds limit")
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("pelican request returned HTTP %d", resp.StatusCode)
	}
	if !gjson.ValidBytes(data) {
		return "", fmt.Errorf("pelican response is not valid JSON")
	}
	var output string
	if apiMode == MonitorAPIModeResponses {
		if status := gjson.GetBytes(data, "status").String(); status == "incomplete" || status == "failed" || status == "cancelled" {
			return "", fmt.Errorf("pelican response did not complete")
		}
		output = extractOpenAIResponsesText(data)
	} else {
		if gjson.GetBytes(data, "choices.0.finish_reason").String() == "length" {
			return "", fmt.Errorf("pelican response was truncated")
		}
		output = gjson.GetBytes(data, "choices.0.message.content").String()
	}
	if strings.TrimSpace(output) == "" {
		return "", fmt.Errorf("pelican response has no text")
	}
	return output, nil
}

// PelicanEvaluation describes the structural check independently of transport
// errors. A passing length is a heuristic, not proof of model identity or quality.
type PelicanEvaluation struct {
	HTML     string
	SVG      string
	Runes    int
	ValidSVG bool
	Passed   bool
}

// evaluatePelican extracts the generated HTML and validates its embedded SVG.
// The length threshold applies to the HTML artifact, not its surrounding prose.
// It never executes or renders the output.
func evaluatePelican(response string) PelicanEvaluation {
	if !utf8.ValidString(response) {
		return PelicanEvaluation{}
	}
	lower := strings.ToLower(response)
	htmlStart := strings.Index(lower, "<!doctype html")
	if htmlStart < 0 {
		htmlStart = strings.Index(lower, "<html")
	}
	htmlEnd := strings.LastIndex(lower, "</html>")
	if htmlStart < 0 || htmlEnd < htmlStart {
		return PelicanEvaluation{}
	}
	artifact := response[htmlStart : htmlEnd+len("</html>")]
	result := PelicanEvaluation{HTML: artifact, Runes: utf8.RuneCountInString(artifact)}
	artifactLower := strings.ToLower(artifact)
	start := strings.Index(artifactLower, "<svg")
	end := strings.Index(artifactLower, "</svg>")
	if start < 0 || end < start {
		return result
	}
	svg := artifact[start : end+len("</svg>")]
	result.SVG = svg
	decoder := xml.NewDecoder(strings.NewReader(svg))
	depth, roots := 0, 0
	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return result
		}
		switch element := token.(type) {
		case xml.StartElement:
			if depth == 0 {
				roots++
				if element.Name.Local != "svg" || roots != 1 {
					return result
				}
			}
			depth++
		case xml.EndElement:
			depth--
		case xml.Directive:
			// Do not accept document types or external entity declarations.
			return result
		}
	}
	result.ValidSVG = roots == 1 && depth == 0
	result.Passed = result.ValidSVG && result.Runes >= pelicanMinimumRunes
	return result
}
