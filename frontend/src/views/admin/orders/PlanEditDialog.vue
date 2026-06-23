<template>
  <BaseDialog :show="show" :title="plan ? t('payment.admin.editPlan') : t('payment.admin.createPlan')" width="wide" @close="emit('close')">
    <form id="plan-form" @submit.prevent="handleSavePlan" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField :label="t('payment.admin.planName')" :required="true">
          <input v-model="planForm.name" type="text" class="input" required />
        </FormField>
        <FormField :label="t('payment.admin.group')" :required="true">
          <Select v-model="planForm.group_id" :options="groupOptions" :placeholder="t('payment.admin.selectGroup')" class="w-full">
            <template #selected="{ option }">
              <span v-if="option?.platform" :class="platformTextClass(String(option.platform))">{{ option.label }}</span>
              <span v-else>{{ option?.label || t('payment.admin.selectGroup') }}</span>
            </template>
            <template #option="{ option, selected }">
              <span class="flex-1 truncate text-left" :class="option.platform ? platformTextClass(String(option.platform)) : ''">{{ option.label }}</span>
              <Icon v-if="selected" name="check" size="sm" class="text-primary-500" :stroke-width="2" />
            </template>
          </Select>
        </FormField>
      </div>

      <!-- Group Info Preview -->
      <div v-if="selectedGroupInfo" class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-dark-600 dark:bg-dark-800">
        <div class="mb-2 flex items-center gap-2">
          <GroupBadge :name="selectedGroupInfo.name" :platform="selectedGroupInfo.platform" :rate-multiplier="selectedGroupInfo.rate_multiplier" />
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div><span class="text-gray-500">{{ t('payment.admin.dailyLimit') }}:</span> <span class="ml-1 font-medium text-gray-700 dark:text-gray-300">{{ selectedGroupInfo.daily_limit_usd != null ? '$' + selectedGroupInfo.daily_limit_usd : t('payment.admin.unlimited') }}</span></div>
          <div><span class="text-gray-500">{{ t('payment.admin.weeklyLimit') }}:</span> <span class="ml-1 font-medium text-gray-700 dark:text-gray-300">{{ selectedGroupInfo.weekly_limit_usd != null ? '$' + selectedGroupInfo.weekly_limit_usd : t('payment.admin.unlimited') }}</span></div>
          <div><span class="text-gray-500">{{ t('payment.admin.monthlyLimit') }}:</span> <span class="ml-1 font-medium text-gray-700 dark:text-gray-300">{{ selectedGroupInfo.monthly_limit_usd != null ? '$' + selectedGroupInfo.monthly_limit_usd : t('payment.admin.unlimited') }}</span></div>
        </div>
      </div>

      <FormField :label="t('payment.admin.planDescription')" :required="true">
        <textarea v-model="planForm.description" rows="2" class="input" required></textarea>
      </FormField>
      <div class="grid grid-cols-2 gap-4">
        <FormField :label="t('payment.admin.price')" :required="true">
          <input v-model.number="planForm.price" type="number" step="0.01" min="0.01" class="input" required />
        </FormField>
        <FormField :label="t('payment.admin.originalPrice')">
          <input v-model.number="planForm.original_price" type="number" step="0.01" min="0" class="input" />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField :label="t('payment.admin.validityDays')" :required="true">
          <input v-model.number="planForm.validity_days" type="number" min="1" class="input" required />
        </FormField>
        <FormField :label="t('payment.admin.validityUnit')" :required="true">
          <Select v-model="planForm.validity_unit" :options="validityUnitOptions" />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField :label="t('payment.admin.sortOrder')">
          <input v-model.number="planForm.sort_order" type="number" min="0" class="input" />
        </FormField>
      </div>
      <FormField :label="t('payment.admin.features')" :hint="t('payment.admin.featuresHint')">
        <textarea v-model="planFeaturesText" rows="3" class="input" :placeholder="t('payment.admin.featuresPlaceholder')"></textarea>
      </FormField>
      <SettingToggleRow
        v-model="planForm.for_sale"
        :label="t('payment.admin.forSale')"
      />
    </form>
    <template #footer>
      <DialogFooter
        :loading="saving"
        :loading-text="t('common.saving')"
        @cancel="emit('close')"
        @confirm="handleSavePlan"
      />
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { adminPaymentAPI } from '@/api/admin/payment'
import { extractApiErrorMessage } from '@/utils/apiError'
import type { SubscriptionPlan } from '@/types/payment'
import type { AdminGroup } from '@/types'
import BaseDialog from '@/components/common/BaseDialog.vue'
import DialogFooter from '@/components/common/DialogFooter.vue'
import FormField from '@/components/common/FormField.vue'
import Select from '@/components/common/Select.vue'
import SettingToggleRow from '@/components/common/SettingToggleRow.vue'
import Icon from '@/components/icons/Icon.vue'
import GroupBadge from '@/components/common/GroupBadge.vue'
import { platformTextClass } from '@/utils/platformColors'

const props = defineProps<{
  show: boolean
  plan: SubscriptionPlan | null
  groups: AdminGroup[]
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { t } = useI18n()
const appStore = useAppStore()

const saving = ref(false)
const planForm = reactive({ name: '', group_id: null as number | null, description: '', price: 0, original_price: 0, validity_days: 30, validity_unit: 'days', sort_order: 0, for_sale: true })
const planFeaturesText = ref('')

const validityUnitOptions = computed(() => [
  { value: 'days', label: t('payment.admin.days') },
  { value: 'weeks', label: t('payment.admin.weeks') },
  { value: 'months', label: t('payment.admin.months') },
])

const groupOptions = computed(() =>
  props.groups
    .filter(g => g.subscription_type === 'subscription')
    .map(g => ({
      value: g.id,
      label: `${g.name} — ${g.platform} (${g.rate_multiplier}x)`,
      platform: g.platform,
    })),
)

const selectedGroupInfo = computed(() => {
  if (!planForm.group_id) return null
  return props.groups.find(g => g.id === planForm.group_id) || null
})

// Reset form when dialog opens
watch(() => props.show, (visible) => {
  if (!visible) return
  if (props.plan) {
    Object.assign(planForm, { name: props.plan.name, group_id: props.plan.group_id, description: props.plan.description, price: props.plan.price, original_price: props.plan.original_price || 0, validity_days: props.plan.validity_days, validity_unit: props.plan.validity_unit || 'days', sort_order: props.plan.sort_order || 0, for_sale: props.plan.for_sale })
    planFeaturesText.value = (props.plan.features || []).join('\n')
  } else {
    Object.assign(planForm, { name: '', group_id: null, description: '', price: 0, original_price: 0, validity_days: 30, validity_unit: 'days', sort_order: 0, for_sale: true })
    planFeaturesText.value = ''
  }
})

/** Build request payload with snake_case keys matching backend JSON tags */
function buildPlanPayload() {
  const features = planFeaturesText.value.split('\n').map(f => f.trim()).filter(Boolean).join('\n')
  return {
    name: planForm.name,
    group_id: planForm.group_id,
    description: planForm.description,
    price: planForm.price,
    original_price: planForm.original_price || 0,
    validity_days: planForm.validity_days,
    validity_unit: planForm.validity_unit,
    sort_order: planForm.sort_order,
    for_sale: planForm.for_sale,
    features,
  }
}

async function handleSavePlan() {
  if (!planForm.group_id) {
    appStore.showError(t('payment.admin.groupRequired'))
    return
  }
  if (!planForm.price || planForm.price <= 0) {
    appStore.showError(t('payment.admin.priceRequired'))
    return
  }
  if (!planForm.validity_days || planForm.validity_days < 1) {
    appStore.showError(t('payment.admin.validityDaysRequired'))
    return
  }
  saving.value = true
  try {
    const data = buildPlanPayload()
    if (props.plan) { await adminPaymentAPI.updatePlan(props.plan.id, data) }
    else { await adminPaymentAPI.createPlan(data) }
    appStore.showSuccess(t('common.saved'))
    emit('close')
    emit('saved')
  } catch (err: unknown) { appStore.showError(extractApiErrorMessage(err, t('common.error'))) }
  finally { saving.value = false }
}
</script>
