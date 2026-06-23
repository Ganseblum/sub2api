<template>
  <BaseDialog
    :show="show"
    :title="t('admin.users.createUser')"
    width="normal"
    @close="$emit('close')"
  >
    <form id="create-user-form" @submit.prevent="submit" class="space-y-5">
      <FormField :label="t('admin.users.email')">
        <input v-model="form.email" type="email" required class="input" :placeholder="t('admin.users.enterEmail')" />
      </FormField>
      <div>
        <label class="input-label">{{ t('admin.users.password') }}</label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <input v-model="form.password" type="text" required class="input pr-10" :placeholder="t('admin.users.enterPassword')" />
          </div>
          <button type="button" @click="generateRandomPassword" class="btn btn-secondary px-3">
            <Icon name="refresh" size="md" />
          </button>
        </div>
      </div>
      <FormField :label="t('admin.users.username')">
        <input v-model="form.username" type="text" class="input" :placeholder="t('admin.users.enterUsername')" />
      </FormField>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField :label="t('admin.users.columns.balance')">
          <input v-model="form.balance" type="number" step="any" class="input" />
        </FormField>
        <FormField :label="t('admin.users.columns.concurrency')">
          <input v-model.number="form.concurrency" type="number" class="input" />
        </FormField>
      </div>
      <FormField
        :label="t('admin.users.form.rpmLimit')"
        :hint="t('admin.users.form.rpmLimitHint')"
      >
        <input
          v-model.number="form.rpm_limit"
          type="number"
          min="0"
          step="1"
          class="input"
          :placeholder="t('admin.users.form.rpmLimitPlaceholder')"
        />
      </FormField>
    </form>
    <template #footer>
      <DialogFooter
        :loading="loading"
        :loading-text="t('admin.users.creating')"
        :confirm-text="t('common.create')"
        confirm-form="create-user-form"
        @cancel="$emit('close')"
      />
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'; import { adminAPI } from '@/api/admin'
import { useForm } from '@/composables/useForm'
import BaseDialog from '@/components/common/BaseDialog.vue'
import DialogFooter from '@/components/common/DialogFooter.vue'
import FormField from '@/components/common/FormField.vue'
import Icon from '@/components/icons/Icon.vue'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close', 'success']); const { t } = useI18n()

const form = reactive({ email: '', password: '', username: '', notes: '', balance: '', concurrency: 1, rpm_limit: 0 })

const { loading, submit } = useForm({
  form,
  submitFn: async (data) => {
    const { balance: rawBalance, ...rest } = data
    const balance = String(rawBalance).trim()
    const payload: typeof rest & { balance?: number } = { ...rest }
    if (balance !== '') {
      payload.balance = Number(balance)
    }
    await adminAPI.users.create(payload)
    emit('success'); emit('close')
  },
  successMsg: t('admin.users.userCreated')
})

watch(() => props.show, (v) => { if(v) Object.assign(form, { email: '', password: '', username: '', notes: '', balance: '', concurrency: 1, rpm_limit: 0 }) })

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*'
  let p = ''; for (let i = 0; i < 16; i++) p += chars.charAt(Math.floor(Math.random() * chars.length))
  form.password = p
}
</script>
