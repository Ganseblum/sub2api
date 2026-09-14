package apicompat

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
)

type responsesDiscoveredToolIdentity struct {
	typ       string
	name      string
	namespace string
	custom    bool
	encoded   string
	ambiguous bool
}

// liftResponsesAdditionalClientTools promotes private input carriers only when
// they contain a client-executable custom tool. It preserves top-level-first
// ordering, removes the carrier from input, and rejects conflicting duplicate
// definitions instead of silently choosing one.
func liftResponsesAdditionalClientTools(req map[string]any) (bool, error) {
	input, ok := req["input"].([]any)
	if !ok || len(input) == 0 {
		return false, nil
	}
	type carrier struct {
		tools []any
	}
	var carriers []carrier
	filtered := make([]any, 0, len(input))
	current, _ := req["tools"].([]any)
	needsAdapter := responsesAdditionalToolsNeedClientAdapter(current)
	for _, raw := range input {
		item, ok := raw.(map[string]any)
		if !ok || strings.TrimSpace(stringValue(item["type"])) != "additional_tools" {
			filtered = append(filtered, raw)
			continue
		}
		tools, exists := item["tools"]
		if !exists || tools == nil {
			continue
		}
		additional, ok := tools.([]any)
		if !ok {
			return false, fmt.Errorf("responses input.additional_tools tools must be an array")
		}
		carriers = append(carriers, carrier{tools: additional})
		if responsesAdditionalToolsNeedClientAdapter(additional) {
			needsAdapter = true
		}
	}
	if !needsAdapter {
		for _, raw := range input {
			item, ok := raw.(map[string]any)
			if !ok || strings.TrimSpace(stringValue(item["type"])) != "additional_tools" {
				continue
			}
			if tools, exists := item["tools"]; !exists || tools == nil {
				filtered = append(filtered, raw)
			} else {
				filtered = append(filtered, raw)
			}
		}
		return false, nil
	}

	var moved []any
	for _, carrier := range carriers {
		moved = append(moved, carrier.tools...)
	}
	merged, err := mergeResponsesClientToolDeclarations(current, moved)
	if err != nil {
		return false, err
	}
	req["tools"] = merged
	req["input"] = filtered
	return true, nil
}

func responsesAdditionalToolsNeedClientAdapter(tools []any) bool {
	for _, raw := range tools {
		tool, ok := raw.(map[string]any)
		if !ok {
			continue
		}
		switch strings.TrimSpace(stringValue(tool["type"])) {
		case "custom":
			return true
		case "tool_search":
			return true
		case "namespace":
			for _, childRaw := range namespaceChildren(tool) {
				child, ok := childRaw.(map[string]any)
				if ok && strings.TrimSpace(stringValue(child["type"])) == "custom" {
					return true
				}
			}
		}
	}
	return false
}

func mergeResponsesClientToolDeclarations(existing, moved []any) ([]any, error) {
	merged := append([]any(nil), existing...)
	seen := make(map[string]string, len(existing)+len(moved))
	for _, raw := range existing {
		key, encoded := responsesClientToolDeclarationIdentity(raw)
		if previous, exists := seen[key]; exists && previous != encoded {
			return nil, fmt.Errorf("responses additional_tools conflicts with an existing declaration")
		}
		seen[key] = encoded
	}
	for _, raw := range moved {
		key, encoded := responsesClientToolDeclarationIdentity(raw)
		if previous, exists := seen[key]; exists {
			if previous == encoded {
				continue
			}
			return nil, fmt.Errorf("responses additional_tools conflicts with an existing declaration")
		}
		seen[key] = encoded
		merged = append(merged, raw)
	}
	return merged, nil
}

func responsesClientToolDeclarationIdentity(raw any) (string, string) {
	tool, ok := raw.(map[string]any)
	if !ok {
		encoded, _ := json.Marshal(raw)
		return "json:" + string(encoded), string(encoded)
	}
	typ := strings.TrimSpace(stringValue(tool["type"]))
	name := strings.TrimSpace(stringValue(tool["name"]))
	key := typ + "\x00" + name
	if typ == "namespace" {
		key += "\x00namespace"
	}
	encoded, _ := json.Marshal(raw)
	return key, string(encoded)
}

// promoteResponsesToolSearchDiscoveries makes successfully discovered client
// tools callable for function-only upstreams. The original tool_search_output
// remains request history and is normalized separately; declarations are
// appended after static tools so the client's declaration order stays stable.
func promoteResponsesToolSearchDiscoveries(req map[string]any) (bool, error) {
	tools, ok := req["tools"].([]any)
	if !ok || len(tools) == 0 || !hasResponsesToolSearchDeclaration(tools) {
		return false, nil
	}
	input, ok := req["input"].([]any)
	if !ok || len(input) == 0 {
		return false, nil
	}
	promoted, err := promotedResponsesToolSearchDiscoveries(tools, input)
	if err != nil {
		return false, err
	}
	if len(promoted) == 0 {
		return false, nil
	}
	req["tools"] = append(tools, promoted...)
	return true, nil
}

func promotedResponsesToolSearchDiscoveries(tools, input []any) ([]any, error) {
	if len(tools) == 0 || !hasResponsesToolSearchDeclaration(tools) || len(input) == 0 {
		return nil, nil
	}

	known := make(map[string]responsesDiscoveredToolIdentity)
	for _, raw := range tools {
		registerExistingResponsesToolIdentity(known, raw)
	}

	promoted := make([]any, 0)
	for _, rawItem := range input {
		item, ok := rawItem.(map[string]any)
		if !ok || strings.TrimSpace(stringValue(item["type"])) != "tool_search_output" || !usableResponsesToolSearchOutput(item) {
			continue
		}
		discoveries, ok := item["tools"].([]any)
		if !ok || len(discoveries) == 0 {
			continue
		}
		if _, err := json.Marshal(discoveries); err != nil {
			continue
		}
		for _, rawDiscovery := range discoveries {
			discovery, ok := rawDiscovery.(map[string]any)
			if !ok {
				continue
			}
			typ := strings.TrimSpace(stringValue(discovery["type"]))
			switch typ {
			case "function", "custom":
				copy, identity, ok := responsesDirectToolDiscovery(discovery, typ)
				if !ok {
					continue
				}
				appendTool, err := admitResponsesDiscoveredTool(known, identity.name, identity)
				if err != nil {
					return nil, err
				}
				if appendTool {
					promoted = append(promoted, copy)
				}
			case "namespace":
				copy, identities, ok := responsesNamespaceToolDiscovery(discovery)
				if !ok {
					continue
				}
				children := make([]any, 0, len(identities))
				for _, candidate := range identities {
					appendTool, err := admitResponsesDiscoveredTool(known, candidate.flat, candidate.identity)
					if err != nil {
						return nil, err
					}
					if appendTool {
						children = append(children, candidate.child)
					}
				}
				if len(children) > 0 {
					copy["tools"] = children
					delete(copy, "children")
					promoted = append(promoted, copy)
				}
			}
		}
	}
	return promoted, nil
}

func hasResponsesToolSearchDeclaration(tools []any) bool {
	for _, raw := range tools {
		tool, ok := raw.(map[string]any)
		if ok && strings.TrimSpace(stringValue(tool["type"])) == "tool_search" {
			return true
		}
	}
	return false
}

func usableResponsesToolSearchOutput(item map[string]any) bool {
	status, present := item["status"]
	if !present {
		return true
	}
	text, ok := status.(string)
	return ok && strings.TrimSpace(text) == "completed"
}

func registerExistingResponsesToolIdentity(known map[string]responsesDiscoveredToolIdentity, raw any) {
	tool, ok := raw.(map[string]any)
	if !ok {
		return
	}
	typ := strings.TrimSpace(stringValue(tool["type"]))
	switch typ {
	case "function", "custom":
		_, identity, ok := responsesDirectToolDiscovery(tool, typ)
		if ok {
			registerExistingResponsesIdentity(known, identity.name, identity)
		}
	case "namespace":
		_, identities, ok := responsesNamespaceToolDiscovery(tool)
		if !ok {
			return
		}
		for _, candidate := range identities {
			registerExistingResponsesIdentity(known, candidate.flat, candidate.identity)
		}
	}
}

func registerExistingResponsesIdentity(known map[string]responsesDiscoveredToolIdentity, key string, identity responsesDiscoveredToolIdentity) {
	previous, exists := known[key]
	if !exists {
		known[key] = identity
		return
	}
	if !sameResponsesDiscoveredTool(previous, identity) {
		previous.ambiguous = true
		known[key] = previous
	}
}

func admitResponsesDiscoveredTool(known map[string]responsesDiscoveredToolIdentity, key string, identity responsesDiscoveredToolIdentity) (bool, error) {
	previous, exists := known[key]
	if !exists {
		known[key] = identity
		return true, nil
	}
	if !previous.ambiguous && sameResponsesDiscoveredTool(previous, identity) {
		return false, nil
	}
	return false, fmt.Errorf("discovered tool %q conflicts with an existing declaration; this upstream cannot safely disambiguate different names, namespaces, or schemas", key)
}

func sameResponsesDiscoveredTool(left, right responsesDiscoveredToolIdentity) bool {
	return left.typ == right.typ && left.name == right.name && left.namespace == right.namespace && left.custom == right.custom && left.encoded == right.encoded
}

func responsesDirectToolDiscovery(tool map[string]any, typ string) (map[string]any, responsesDiscoveredToolIdentity, bool) {
	name := strings.TrimSpace(stringValue(tool["name"]))
	if name == "" {
		return nil, responsesDiscoveredToolIdentity{}, false
	}
	copy := copyClientTool(tool)
	copy["type"] = typ
	copy["name"] = name
	identityCopy := copy
	if typ == "custom" {
		identityCopy = copyClientTool(copy)
		identityCopy["type"] = "function"
		identityCopy["parameters"] = json.RawMessage(customToolInputSchema)
		delete(identityCopy, "format")
	}
	encoded, err := json.Marshal(identityCopy)
	if err != nil {
		return nil, responsesDiscoveredToolIdentity{}, false
	}
	return copy, responsesDiscoveredToolIdentity{typ: typ, name: name, encoded: string(encoded)}, true
}

// restoreInheritedResponsesClientToolDeclarations reverses only the declaration
// identities recorded by ResponsesClientToolMapping. It is used when a WS
// continuation omits tools but the HTTP function upstream still needs the
// effective session declarations on every request.
func restoreInheritedResponsesClientToolDeclarations(lowered []any, mapping ResponsesClientToolMapping) []any {
	restored := make([]any, 0, len(lowered))
	for _, raw := range lowered {
		tool, ok := raw.(map[string]any)
		if !ok {
			restored = append(restored, raw)
			continue
		}
		name := strings.TrimSpace(stringValue(tool["name"]))
		switch {
		case mapping.ToolSearch && name == toolSearchProxyName:
			restored = append(restored, map[string]any{"type": "tool_search"})
		case mapping.CustomTools[name]:
			copy := copyClientTool(tool)
			copy["type"] = "custom"
			restored = append(restored, copy)
		case mapping.NamespaceTools[name].Namespace != "":
			identity := mapping.NamespaceTools[name]
			child := copyClientTool(tool)
			child["type"] = "function"
			child["name"] = identity.Name
			if identity.Custom {
				child["type"] = "custom"
				child["parameters"] = json.RawMessage(customToolInputSchema)
				delete(child, "format")
			}
			restored = append(restored, map[string]any{
				"type": "namespace", "name": identity.Namespace, "tools": []any{child},
			})
		default:
			restored = append(restored, copyClientTool(tool))
		}
	}
	return restored
}

// inheritedResponsesClientToolDeclarations reconstructs the declarations that
// can be recovered from a session mapping when a continuation did not retain
// the lowered declaration list. Prefer the exact lowered list when available;
// the mapping-only fallback covers all client-tool kinds recorded by this
// adapter (custom, tool_search, and namespace children).
func inheritedResponsesClientToolDeclarations(mapping ResponsesClientToolMapping, lowered ...[]any) []any {
	if len(lowered) > 0 && len(lowered[0]) > 0 {
		return restoreInheritedResponsesClientToolDeclarations(lowered[0], mapping)
	}

	var declarations []any
	customNames := make([]string, 0, len(mapping.CustomTools))
	for name := range mapping.CustomTools {
		customNames = append(customNames, name)
	}
	sort.Strings(customNames)
	for _, name := range customNames {
		declarations = append(declarations, map[string]any{"type": "custom", "name": name})
	}
	if mapping.ToolSearch {
		declarations = append(declarations, map[string]any{"type": "tool_search"})
	}
	namespaceNames := make([]string, 0, len(mapping.NamespaceTools))
	for name := range mapping.NamespaceTools {
		namespaceNames = append(namespaceNames, name)
	}
	sort.Strings(namespaceNames)
	for _, flat := range namespaceNames {
		identity := mapping.NamespaceTools[flat]
		childType := "function"
		if identity.Custom {
			childType = "custom"
		}
		declarations = append(declarations, map[string]any{
			"type":  "namespace",
			"name":  identity.Namespace,
			"tools": []any{map[string]any{"type": childType, "name": identity.Name}},
		})
	}
	return declarations
}

type responsesNamespaceToolCandidate struct {
	flat     string
	child    map[string]any
	identity responsesDiscoveredToolIdentity
}

func responsesNamespaceToolDiscovery(tool map[string]any) (map[string]any, []responsesNamespaceToolCandidate, bool) {
	namespace := strings.TrimSpace(stringValue(tool["name"]))
	children := namespaceChildren(tool)
	if namespace == "" || len(children) == 0 {
		return nil, nil, false
	}
	copy := copyClientTool(tool)
	copy["type"] = "namespace"
	copy["name"] = namespace
	identities := make([]responsesNamespaceToolCandidate, 0, len(children))
	for _, rawChild := range children {
		child, ok := rawChild.(map[string]any)
		if !ok {
			continue
		}
		childType := strings.TrimSpace(stringValue(child["type"]))
		if childType != "function" && childType != "custom" {
			continue
		}
		childCopy, direct, ok := responsesDirectToolDiscovery(child, childType)
		if !ok {
			continue
		}
		if childType == "custom" {
			childCopy["parameters"] = json.RawMessage(customToolInputSchema)
			delete(childCopy, "format")
		}
		flat := flattenNamespaceToolName(namespace, direct.name)
		identities = append(identities, responsesNamespaceToolCandidate{
			flat:  flat,
			child: childCopy,
			identity: responsesDiscoveredToolIdentity{
				typ: "namespace", name: direct.name, namespace: namespace, custom: childType == "custom", encoded: direct.encoded,
			},
		})
	}
	if len(identities) == 0 {
		return nil, nil, false
	}
	return copy, identities, true
}
