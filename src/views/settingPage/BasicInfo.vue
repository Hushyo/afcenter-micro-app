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
              <el-switch v-model="accessToken.is_active" @change="handleChangeKnowledgeBaseIsActive" />
            </template>
            <div class="visit-link-container">
              <a class="visit-link">{{ visitAddress }}</a>
            </div>
          </el-form-item>
          <el-form-item>
            <template #label>
              <span>API地址</span>
            </template>
            <div class="visit-link-container">
              {{ apiAddress }}
              <el-button style="border:none;" icon="el-icon-copy-document" circle @click="handleCopy(apiAddress)" />
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
                <el-button style="border:none;" class="fs-16" icon="el-icon-setting" circle />
                <el-button style="border:none;" class="m-0 fs-16" icon="el-icon-delete" circle @click="handleDeleteApiKey(scope.row.id)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-scrollbar>

    <el-dialog
      v-if="dialogTypeKey"
      :title="dialogType[dialogTypeKey].title"
      :width="dialogType[dialogTypeKey].width"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="closeDialog"
    >

      <el-checkbox
        v-if="dialogTypeKey === 'displaySetting'"
        v-model="accessToken.show_source"
      >
        显示知识来源
      </el-checkbox>

      <el-form v-if="dialogTypeKey === 'accessRestriction'" v-model="accessToken" label-position="top">
        <el-form-item label="每客户端提问限制">
          <el-input-number v-model="accessToken.access_num" style="width: 50%;" :max="10000" :min="0" controls-position="right" /> 次/天
        </el-form-item>
        <el-form-item label="允许白名单">
          <el-switch v-model="accessToken.white_active" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="whiteListText"
            type="textarea"
            :rows="14"
            :placeholder="`请输入允许嵌入的源地址，一行一个，如:\nhttp://127.0.0.1:9527\nhttp://www.xxxx.com`"
          />
        </el-form-item>
      </el-form>

      <el-row v-if="dialogTypeKey === 'embeddingThirdParty'" :gutter="12">
        <el-col v-for="thirdParty in embeddingThirdParty" :key="thirdParty.title" :span="12">
          <div class="flex flex-column align-start border">
            <p class="m-0 p-16 bold">{{ thirdParty.title }}</p>
            <img style="height: 150px;object-fit: contain;" class="ml-8" :src="thirdParty.imgSrc" alt="">
            <div class="border-t p-8" style="width: 100%; height:200px;">
              <div class="flex justify-between align-center p-8">
                <span class="bold">复制以下代码进行嵌入</span>
                <el-button style="border:none;color:black" class="fs-14" icon="el-icon-copy-document" circle @click="handleCopy(thirdParty.code)" />
              </div>
              <el-scrollbar>
                <div class="p-8 pt-0 code fs-14">
{{ thirdParty.code }}
                </div>
              </el-scrollbar>
            </div>
          </div>
        </el-col>
      </el-row>

      <template v-if="dialogTypeKey === 'deleteApiKey'"> 删除后无法恢复，请确认是否删除？ </template>

      <template v-if="dialogTypeKey === 'deleteApiKey'" #footer>
        <div class="flex justify-end align-center">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="danger" class="pt-8" @click="confirmDeleteApiKey">删除</el-button>
        </div>
      </template>

      <template v-else-if="dialogTypeKey !== 'embeddingThirdParty'" #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>

    </el-dialog>
  </div>
</template>
<script>
import { getBackgroundColor, getTextColor } from '@/utils/color.js'
import knowledgeBaseApi from '@/api/knowledgeBase'
export default {
  name: 'basic-info',
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
      accessToken: {
        access_token: '',
        access_num: 9999,
        white_active: false,
        is_active: false,
        white_list: [],
        show_source: false
      },
      apiKeys: [],
      selectedApiKeyId: '',
      dialogVisible: false,
      dialogTypeKey: '',
      dialogType: {
        displaySetting: {
          title: '显示设置',
          width: '50%'
        },
        accessRestriction: {
          title: '访问限制',
          width: '50%'
        },
        embeddingThirdParty: {
          title: '嵌入第三方',
          width: '890px'
        },
        deleteApiKey: {
          title: '',
          width: '30%'
        }
      },
      embeddingThirdParty: [
        {
          title: '全屏模式',
          imgSrc: 'http://192.168.1.252:4399/assets/window1-b13220c7.png',
          code: `<iframe\nsrc="http://192.168.1.252:4399/#/chat/${this.accessToken.access_token}"\nstyle="width: 100%; height: 100%;"\nframeborder="0"\nallow="microphone">\n<\/iframe>`
        },
        {
          title: '浮窗模式',
          imgSrc: 'http://192.168.1.252:4399/assets/window2-6d9fe74f.png',
          code: `<script\nasync\ndefer\nsrc="http://192.168.1.252:4399/api/app/assistant-embed?protocol=http&host=192.168.1.252:4399&token=${this.accessToken.access_token}">\n<\/script>`
        }
      ]
    }
  },
  computed: {
    whiteListText: {
      get() {
        return this.accessToken.white_list.join('\n')
      },
      set(value) {
        this.accessToken.white_list = value.split('\n')
      }
    },
    selectedApiKey() {
      return this.apiKeys.find(item => item.id === this.selectedApiKeyId)
    },
    corsAddress: {
      get() {
        return this.selectedApiKey.cross_domain_list.join('\n')
      }
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
      console.log(dialogTypeKey)
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
<style scoped>
.code {
  white-space: pre-wrap;
}
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
