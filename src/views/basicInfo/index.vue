<template>
  <div>
    <basic-info-dialog
      :dialog-type-key="dialogTypeKey"
      :dialog-visible="dialogVisible"
      :access-token.sync="accessToken"
      @save="handleSave"
      @close="closeDialog"
      @delete="confirmDeleteApiKey"
    />
  </div>
</template>
<script>
import BasicInfoDialog from './components/BasicInfoDialog.vue'
import knowledgeBaseApi from '@/api/knowledgeBase'
export default {
  name: 'basic-info-index',
  components: {
    BasicInfoDialog
  },
  props: {
    knowledgeBase: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialogTypeKey: '',
      dialogVisible: false,
      accessToken: {
        application_id: '',
        access_token: '',
        access_num: 9999,
        is_active: false,
        show_source: false,
        white_active: false,
        white_list: []
      },
      apiKeys: [],
      selectedApiKeyId: '',
      dialogType: {
        deleteApiKey: {
          title: ''
        }
      }
    }
  },
  computed: {
    selectedApiKey() {
      return this.apiKeys.find(item => item.id === this.selectedApiKeyId)
    },
    apiAddress() {
      return `http://192.168.1.252:4399/api/app/${this.accessToken.application_id}`
    },
    visitAddress() {
      return `http://192.168.1.252:4399/#/chat/${this.accessToken.access_token}`
    }
  },
  watch: {
    knowledgeBase: {
      handler() {
        this.getAccessToken()
        this.getApiKey()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    getAccessToken() {
      knowledgeBaseApi.getAccessToken(this.knowledgeBase.id).then(res => {
        this.accessToken = res
      })
    },
    getApiKey() {
      knowledgeBaseApi.getApiKey(this.knowledgeBase.id).then(res => {
        this.apiKeys = res
      })
    },
    handleDeleteApiKey(api_key_id) {
      this.selectedApiKeyId = api_key_id
      this.dialogType.deleteApiKey.title = `确认删除API Key?:${this.selectedApiKey.secret_key}`
      this.openDialog('deleteApiKey')
    },
    confirmDeleteApiKey() {
      knowledgeBaseApi.deleteApiKey(this.knowledgeBase.id, this.selectedApiKeyId).then(res => {
        this.$message.success('删除成功')
        this.selectedApiKeyId = ''
        this.getApiKey()
        this.closeDialog()
      })
    },
    handleChangeApiKeyActivity(api_key_id, is_active) {
      knowledgeBaseApi.updateApiKey(this.knowledgeBase.id, api_key_id, { is_active }).then(res => {
        this.$message.success('修改成功')
        this.getApiKey()
      })
    },
    handleCopy(code) {
      this.$copyText(code)
      this.$message.success('复制成功')
    },
    handleChangeKnowledgeBaseIsActive() {
      knowledgeBaseApi.putAccessToken(this.knowledgeBase.id, { is_active: this.accessToken.is_active }).then(res => {
        if (res.is_active) {
          this.$message.success('启用成功')
        } else {
          this.$message.success('禁用成功')
        }
      })
    },
    handleSave() {
      knowledgeBaseApi.putAccessToken(this.knowledgeBase.id, this.accessToken).then(res => {
        this.$message.success('设置成功')
        this.getAccessToken()
        this.$nextTick(() => {
          this.closeDialog()
        })
      })
    },
    handleCreateApiKey() {
      knowledgeBaseApi.createApiKey(this.knowledgeBase.id).then(res => {
        this.$message.success('创建成功')
        this.getApiKey()
      })
    },
    openDialog(dialogTypeKey) {
      this.dialogTypeKey = dialogTypeKey
      this.dialogVisible = true
    },
    closeDialog() {
      this.dialogTypeKey = ''
      this.dialogVisible = false
    }
  }
}
</script>
