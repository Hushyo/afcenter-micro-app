<template>
  <div class="basic-info p-0-24">
    <el-scrollbar>
      <div class="main p-24">

        <div class="main-header mb-20">
          <div class="title">
            <el-avatar size="medium" :style="{backgroundColor:getBackgroundColor(knowledgeBase.name),color:getTextColor(getBackgroundColor(knowledgeBase.name)) }">
              <template #default>{{ knowledgeBase.name[0] }}</template>
            </el-avatar>
            <div class="title-text ml-12">
              <h4>{{ knowledgeBase.name }}</h4>
              <span class="fs-14"> {{ knowledgeBase.desc }}</span>
            </div>
          </div>
          <div class="button-group">
            <el-button :disabled="!accessToken.is_active" type="primary">开始对话</el-button>
            <el-button :disabled="!accessToken.is_active" @click="openDialog('embeddingThirdParty')">嵌入第三方</el-button>
            <el-button @click="openDialog('accessRestriction')">访问限制</el-button>
            <el-button @click="openDialog('displaySetting')">显示设置</el-button>
          </div>
        </div>

        <el-form label-position="top">
          <el-form-item>
            <template #label>
              <span>访问地址</span>
              <el-switch v-model="accessToken.is_active" @change="handleChangeKnowledgeBaseActivity" />
            </template>
            <div class="visit-link-container">
              <a class="visit-link">{{ visitUrl }}</a>
            </div>
          </el-form-item>
          <el-form-item>
            <template #label>
              <span>API地址</span>
            </template>
            <div class="visit-link-container">
              {{ apiUrl }}
              <el-button style="border:none;" icon="el-icon-copy-document" circle @click="handleCopy(apiUrl)" />
            </div>
          </el-form-item>
        </el-form>

        <div class="api-container">
          <h2>API <el-button type="primary" @click="handleCreateApiKey">创建</el-button></h2>
          <el-table fit height="100%" :data="apiKeys">
            <el-table-column min-width="600" prop="secret_key" label="API Key">
              <template slot-scope="scope">
                {{ scope.row.secret_key }}
                <el-button style="border:none;" icon="el-icon-copy-document" circle @click="handleCopy(scope.row.secret_key)" />
              </template>
            </el-table-column>

            <el-table-column prop="is_active" label="状态" width="80">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.is_active" @change="handleChangeApiKeyActivity(scope.row.id, scope.row.is_active)" />
              </template>
            </el-table-column>

            <el-table-column prop="create_time" label="创建日期" width="170">
              <template slot-scope="scope">
                {{ scope.row.create_time | formatTime }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button style="border:none;" class="fs-16" icon="el-icon-setting" circle @click="handleSetApiKey(scope.row.id)" />
                <el-button style="border:none;" class="m-0 fs-16" icon="el-icon-delete" circle @click="handleDeleteApiKey(scope.row.id)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-scrollbar>

    <basic-info-dialog
      :dialog-type-key="dialogTypeKey"
      :dialog-visible="dialogVisible"
      :access-token.sync="accessToken"
      :selected-api-key.sync="selectedApiKey"
      @save="handleSave"
      @close="closeDialog"
      @delete="confirmDeleteApiKey"
    />
  </div>
</template>
<script>
import { getBackgroundColor, getTextColor } from '@/utils/color.js'
import knowledgeBaseApi from '@/api/knowledgeBase'
import BasicInfoDialog from './components/BasicInfoDialog.vue'
export default {
  name: 'basic-info',
  components: {
    BasicInfoDialog
  },
  filters: {
    formatTime(time) {
      return time.replace('T', ' ').slice(0, time.indexOf('.'))
    }
  },
  props: {
    knowledgeBase: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      accessToken: {},
      apiKeys: [],
      selectedApiKey: {},
      dialogVisible: false,
      dialogTypeKey: ''
    }
  },
  computed: {
    corsAddress: {
      get() {
        return this.selectedApiKey.cross_domain_list.join('\n')
      }
    },
    apiUrl() {
      return `http://192.168.1.252:4399/api/app/${this.accessToken.application_id}`
    },
    visitUrl() {
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
    getBackgroundColor,
    getTextColor,
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
    handleSave() {
      Promise.all([
        knowledgeBaseApi.updateApiKey(this.knowledgeBase.id, this.selectedApiKey.id, this.selectedApiKey),
        knowledgeBaseApi.updateAccessToken(this.knowledgeBase.id, this.accessToken)
      ]).then(([apiKeyRes, accessTokenRes]) => {
        this.$message.success('设置成功')
        this.selectedApiKey = {}
        this.getApiKey()
        this.getAccessToken()
        this.closeDialog()
      })
    },
    handleSetApiKey(apiKeyId) {
      this.selectedApiKey = this.apiKeys.find(item => item.id === apiKeyId)
      this.openDialog('setApiKey')
    },
    handleCreateApiKey() {
      knowledgeBaseApi.createApiKey(this.knowledgeBase.id).then(res => {
        this.$message.success('创建成功')
        this.getApiKey()
      })
    },
    handleDeleteApiKey(apiKeyId) {
      this.selectedApiKey = this.apiKeys.find(item => item.id === apiKeyId)
      this.openDialog('deleteApiKey')
    },
    confirmDeleteApiKey() {
      knowledgeBaseApi.deleteApiKey(this.knowledgeBase.id, this.selectedApiKey.id).then(res => {
        this.$message.success('删除成功')
        this.selectedApiKey = {}
        this.getApiKey()
        this.closeDialog()
      })
    },
    handleChangeApiKeyActivity(apiKeyId, is_active) {
      knowledgeBaseApi.updateApiKey(this.knowledgeBase.id, apiKeyId, { is_active }).then(res => {
        this.$message.success('修改成功')
        this.getApiKey()
      })
    },
    handleChangeKnowledgeBaseActivity() {
      knowledgeBaseApi.updateAccessToken(this.knowledgeBase.id, { is_active: this.accessToken.is_active }).then(res => {
        if (res.is_active) {
          this.$message.success('启用成功')
        } else {
          this.$message.success('禁用成功')
        }
      })
    },
    openDialog(dialogTypeKey) {
      this.dialogTypeKey = dialogTypeKey
      this.dialogVisible = true
    },
    closeDialog() {
      this.dialogTypeKey = ''
      this.dialogVisible = false
    },
    handleCopy(text) {
      this.$copyText(text)
      this.$message.success('复制成功')
    }
  }
}
</script>
<style scoped>
.basic-info {
  .main {
    .main-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        flex-shrink: 0;
        min-width: 400px;
        display: flex;
        .title-text{
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
      }
      .button-group {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
  .api-container {
    height: 420px;
    h2 {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  .visit-link-container {
    display: flex;
    align-items: center;
    .visit-link {
        position: relative;
        text-decoration: none;
        &:hover::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 100%;
          height: 1px;
          background-color: #b6bfc7;
        }
    }
  }
  ::v-deep .el-table__header-wrapper {
    .el-table__header {
      th {
        background: transparent !important;
        font-weight: bold !important;
        border-top: 1px solid #E5E5E5;
        padding: 12px 0;
        .cell {
          font-weight: bold !important;
        }
      }
    }
  }
  ::v-deep .el-form-item {
    margin-bottom: 16px !important;
  }
}
</style>
