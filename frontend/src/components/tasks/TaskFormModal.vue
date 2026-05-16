<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold">{{ task ? 'Edit Task' : 'New Task' }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <AppIcon name="close" size="md" />
          </button>
        </div>

        <!-- Body -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input v-model="form.title" type="text" class="input-field"
              placeholder="Task title" required maxlength="200" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="form.description" class="input-field resize-none" rows="3"
              placeholder="Optional description..." maxlength="2000" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select v-model="form.status" class="input-field">
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select v-model="form.priority" class="input-field">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input v-model="form.dueDate" type="datetime-local" class="input-field" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tags <span class="text-gray-400 font-normal">(comma separated)</span>
            </label>
            <input v-model="tagsInput" type="text" class="input-field"
              placeholder="frontend, api, bug" />
          </div>

          <div v-if="submitError"
            class="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
            {{ submitError }}
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="flex items-center gap-2">
                <AppSpinner size="sm" color="white" />
                Saving...
              </span>
              <span v-else>{{ task ? 'Save Changes' : 'Create Task' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useTaskStore } from '@/stores/task.store'
import { useUiStore } from '@/stores/ui.store'
import AppSpinner from '@/components/common/AppSpinner.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  task: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const taskStore = useTaskStore()
const uiStore = useUiStore()

const isSubmitting = ref(false)
const submitError = ref('')

const form = reactive({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  tags: [],
})

const tagsInput = ref('')

// Populate form when editing
watch(() => props.task, (task) => {
  if (task) {
    form.title = task.title
    form.description = task.description || ''
    form.status = task.status
    form.priority = task.priority
    form.dueDate = task.dueDate
      ? new Date(task.dueDate).toISOString().slice(0, 16)
      : ''
    tagsInput.value = task.tags?.join(', ') || ''
  }
}, { immediate: true })

const handleSubmit = async () => {
  isSubmitting.value = true
  submitError.value = ''

  const payload = {
    ...form,
    tags: tagsInput.value
      ? tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
      : [],
    dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
  }

  const result = props.task
    ? await taskStore.updateTask(props.task.id, payload)
    : await taskStore.createTask(payload)

  if (result.success) {
    uiStore.toast.success(props.task ? 'Task updated!' : 'Task created!')
    emit('saved')
  } else {
    submitError.value = result.error
  }

  isSubmitting.value = false
}
</script>