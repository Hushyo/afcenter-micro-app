<template>
  <div class="setting-container pb-24 p-16-24 ">
    <el-row class="setting-content">
      <el-col :span="24" class="save-publish flex justify-end"><el-button type="primary">保存并发布</el-button></el-col>
      <el-col :span="10">
        <div class="p-24 pb-0 mb-16 ">
          <h4>应用信息</h4>
        </div>
        <el-scrollbar style="height: 568px;">
          <el-form ref="appForm" :rules="appRules" :model="app" class="p-0-24" label-position="top">
            <!-- 应用名称 -->
            <el-form-item label="应用名称" prop="name">
              <el-input v-model="app.name" :show-word-limit="true" :maxlength="64" />
            </el-form-item>

            <!-- 应用描述 -->
            <el-form-item label="应用描述" prop="description">
              <el-input v-model="app.desc" type="textarea" rows="3" resize="none" :show-word-limit="true" :maxlength="256" placeholder="描述该应用的场景及用途，如：XXX 小助手回答用户提出的 XXX 产品使用问题" />
            </el-form-item>

            <!-- AI模型 -->
            <el-form-item>
              <template #label>
                <div style="display: flex;align-items: center;gap: 4px;">
                  AI模型
                  <el-button type="text" class="fs-14" :disabled="!app.model.name" :underline="false">参数设置</el-button>
                </div>
              </template>
              <el-select v-model="app.model.name" style="width: 100%;" clearable placeholder="请选择AI模型">
                <el-option-group v-for="p in modelProvider" :key="p.provider" :label="p.name">
                  <el-option v-for="m in models(p.provider)" :key="m.name" :value="m.name">
                    <template>
                      <div class="flex align-center">
                        <span v-html="p.icon" class="model-icon"></span> <span class="m-0-4">{{ m.name }}</span> <el-tag>
                          {{ m.permission_type | filtersPermissionType }}
                        </el-tag>
                      </div>
                    </template>
                  </el-option>
                  <div class="flex align-center select-footer p-10"><i class="el-icon-plus" />添加模型</div>
                </el-option-group>
              </el-select>
            </el-form-item>

            <!-- 角色设定 -->
            <el-form-item label="角色设定">
              <div class="editor flex align-center">
                <textarea v-model="app.roleSetting" placeholder="你是 XXX 小助手" class="editor-input p-12" />
                <div class="editor-footer flex justify-end">
                  <el-button circle style="border: none;"><i class="el-icon-full-screen" /> </el-button>
                </div>
              </div>
            </el-form-item>

            <!-- 提示词(无引用知识库) -->
            <el-form-item prop="promptNoKnowledgeBase">
              <template #label>提示词(无引用知识库)<el-tooltip content="通过调整提示词内容，可以引导大模型聊天方向，该提示词会被固定在上下文的开头。可以使用变量：{question} 是用户提出问题的占位符。" :visible-arrow="true" placement="top"><i class="el-icon-warning-outline" /> </el-tooltip></template>
              <div class="editor flex align-center">
                <textarea v-model="app.promptNoKnowledgeBase" :placeholder="knowledgeBase.model_setting.no_references_prompt" class="editor-input p-12" />
                <div class="editor-footer flex justify-end">
                  <el-button circle style="border: none;"><i class="el-icon-full-screen" /> </el-button>
                </div>
              </div>
            </el-form-item>

            <!-- 历史聊天记录 -->
            <el-form-item label="历史聊天记录">
              <el-input-number v-model="app.historyChatNumber" style="width: 100%;" controls-position="right" :min="0" />
            </el-form-item>

            <!-- 关联知识库 -->
            <el-form-item>
              <template #label>关联知识库</template>
            </el-form-item>

            <!-- 提示词(引用知识库) -->
            <el-form-item prop="promptWithKnowledgeBase">
              <template #label>提示词(引用知识库)<el-tooltip content="通过调整提示词内容，可以引导大模型聊天方向，该提示词会被固定在上下文的开头。可以使用变量：{data} 是引用知识库中分段的占位符；{question} 是用户提出问题的占位符。" :visible-arrow="true" placement="top"><i class="el-icon-warning-outline" /> </el-tooltip></template>
              <div class="editor flex align-center">
                <textarea v-model="app.promptWithKnowledgeBase" :placeholder="knowledgeBase.model_setting.prompt" class="editor-input p-12" />
                <div class="editor-footer flex justify-end">
                  <el-button circle style="border: none;"><i class="el-icon-full-screen" /> </el-button>
                </div>
              </div>
            </el-form-item>

            <!-- 开场白 -->
            <el-form-item label="开场白">
              <div class="editor flex align-center">
                <textarea v-model="app.prologue" class="editor-input p-12" />
                <div class="editor-footer flex justify-end">
                  <el-button circle style="border: none;"><i class="el-icon-full-screen" /> </el-button>
                </div>
              </div>
            </el-form-item>

            <!-- 语音输入 自动发送 -->
            <el-form-item>语音输入 自动发送</el-form-item>
            <el-form-item>语音播放 自动播放</el-form-item>
          </el-form>
        </el-scrollbar>
      </el-col>

      <el-col :span="14" class="p-24 border-l">
        <h4 class="mb-16">调试预览</h4>
        <div class="dialog">
          <div class="dialog-header p-24 flex align-center">
            <el-avatar :style="{backgroundColor:getBackgroundColor(app.name),color:getTextColor(getBackgroundColor(app.name)) }">
              <template>{{ app.name[0] }}</template>
            </el-avatar>
            <h4>{{ app.name }}</h4>
          </div>
          <div class="chat-window">
            <el-scrollbar :ref="scrollBarRef" class="chat-content" :style="{ height: chatContentHeight }">
              <div class="message-container">
                <div class="message">
                  <el-avatar class="avatar" src="http://192.168.1.252:4399/assets/logo-f2ae0f62.png" />
                  <el-card class="card m-0-8">
                    <div class="m-8-0 fs-14">{{ prologue }}</div>
                    <div v-for="demoQuestion in demoQuestions" :key="demoQuestion" class="m-4-0 p-0-12 demo-question cursor-pointer fs-14" @click.stop="handleQuestion(demoQuestion)">{{ demoQuestion }}</div>
                  </el-card>
                </div>
                <div v-for="(message, index) in messages" :key="index" :class="['message',message.role]">
                  <el-avatar v-if="message.role === 'ai'" class="avatar" src="http://192.168.1.252:4399/assets/logo-f2ae0f62.png" />
                  <el-avatar v-if="message.role === 'user'" class="avatar"><i class="el-icon-user-solid user fs-24" /> </el-avatar>
                  <el-card class="card m-0-8">
                    {{ message.content }}
                    <el-button icon="el-icon-copy-document" circle style="border: none;" @click.stop="handleCopy(message.content)" />
                  </el-card>
                </div>
              </div>
            </el-scrollbar>

            <div class="chat-window-operate p-16-24">
              <el-input
                v-model="message"
                type="textarea"
                :autosize="{minRows: 3,maxRows: 10}"
                resize="none"
                class="upward-textarea"
                placeholder="输入消息内容，Ctrl+Enter 发送"
                @input="handleInput"
                @keydown.ctrl.enter="sendMessage"
              />
              <div class="send-button-container flex justify-end m-0">
                <el-button
                  class="send-button m-0 p-4 fs-20"
                  icon="el-icon-microphone"
                  size="medium"
                  circle
                  @click="sendMessage"
                />
                <el-button
                  class="send-button m-0 p-4 fs-20"
                  icon="el-icon-s-promotion"
                  :disabled="!message.trim()"
                  size="medium"
                  circle
                  @click="sendMessage"
                />
              </div>

            </div>

          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getBackgroundColor, getTextColor } from '@/utils/color'
import knowledgeBaseApi from '@/api/knowledgeBase'
import _ from 'lodash'
export default {
  name: 'setting',
  filters: {
    filtersPermissionType(permissionType) {
      if (permissionType === 'PUBLIC') {
        return '公开'
      } else if (permissionType === 'PRIVATE') {
        return '私有'
      }
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
      app: {
        name: '',
        desc: '',
        model: {
          name: '',
          provider: ''
        },
        roleSetting: '',
        promptNoKnowledgeBase: '',
        knowledgeBase: '',
        promptWithKnowledgeBase: '',
        prologue: '',
        historyChatNumber: 1,
      },
      appRules: {
        'name': [
          { required: true, message: '请输入应用名称', trigger: 'blur' },
          { max: 64, message: '应用名称不能超过64个字符', trigger: 'blur' }
        ],
        'promptNoKnowledgeBase': [
          { required: true, message: '请输入提示词', trigger: 'blur' },
          { max: 256, message: '提示词不能超过256个字符', trigger: 'blur' }
        ],
        'promptWithKnowledgeBase': [
          { required: true, message: '请输入提示词', trigger: 'blur' },
          { max: 256, message: '提示词不能超过256个字符', trigger: 'blur' }
        ]
      },
      list_dataset: [],
      provider: [],
      model: [],
      message: '',
      messages: [],
      textareaHeight: 3, // 初始行数
      scrollBarRef: 'scrollBarRef'
    }
  },
  computed: {
    chatContentHeight() {
      // 动态计算聊天内容区域的高度
      const baseHeight = 480 // 总高度
      const operateHeight = 100 + (this.textareaHeight - 3) * 20 // 估算输入区域高度
      return `${baseHeight - operateHeight}px`
    },
    prologue() {
      return `${this.app.prologue}`.indexOf('\n-') > 0 ? `${this.app.prologue}`.slice(0, `${this.app.prologue}`.indexOf('\n-')) : `${this.app.prologue}`
    },
    demoQuestions() {
      return `${this.app.prologue}`
        .slice(`${this.app.prologue}`.indexOf('\n-'))
        .split('\n-')
        .splice(1)
    },
    modelProvider() {
      return this.provider.filter(p => {
        return this.model.some(m => m.provider === p.provider)
      })
    },
    models() {
      return (provider) => {
        return this.model.filter(m => m.provider === provider)
      }
    }
  },
  watch: {
    messages: {
      handler(newVal) {
        this.scrollToBottom()
      }
    },
    knowledgeBase: {
      immediate: true,
      handler(newVal) {
        this.app.name = newVal.name
        this.app.desc = newVal.desc
        this.app.roleSetting = newVal.model_setting.system
        this.app.promptNoKnowledgeBase = newVal.model_setting.no_references_prompt
        this.app.promptWithKnowledgeBase = newVal.model_setting.prompt
        this.app.prologue = newVal.prologue
        knowledgeBaseApi.getAccessToken(newVal.id).then(accessToken => {
          knowledgeBaseApi.getModel(accessToken.application_id).then(model => {
            this.app.model.name = model[0].name
            this.model = model
          })
          knowledgeBaseApi.getListDataSet(accessToken.application_id).then(list_dataset => {
            this.list_dataset = list_dataset
          })
        })
        knowledgeBaseApi.getProvider().then(provider => {
          this.provider = provider
        })
      }
    }
  },
  methods: {
    getBackgroundColor,
    getTextColor,
    handleInput() {
      // 根据内容估算当前行数
      const lines = this.message.split('\n').length
      this.textareaHeight = Math.min(Math.max(lines, 3), 10)
    },
    handleQuestion(question) {
      this.messages.push({ role: 'user', content: question })
    },
    handleCopy(content) {
      this.$copyText(content)
      this.$message.success('复制成功')
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const scrollbar = this.$refs[this.scrollBarRef]
        if (scrollbar && scrollbar.wrap) {
          scrollbar.wrap.scrollTop = scrollbar.wrap.scrollHeight
        }
      })
    },
    sendMessage() {
      if (this.message.trim()) {
        this.messages.push({
          role: 'user',
          content: this.message.trim()
        })

        this.message = ''

        setTimeout(() => {
          this.messages.push({
            role: 'ai',
            content: '这是 AI 的回复'
          })
        }, 1000)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.model-icon{
  width: 30px;
  height: 34px;
}
.select-footer{
  height: 34px;
  line-height: 34px;
  cursor: pointer;
  border-top: 1px solid #e5e5e5;
  &:hover{
    background-color: #e5e5e5;
  }
}
.setting-container {
  width: 100%;
  min-width: 847px;
  height: 100%;
  border-radius: 20px;

  .save-publish {
    width: 100%;
    background-color: #fff;
  }
  .setting-content {
    height: 100%;
    border-radius: 10px;
    .editor {
      flex-wrap:wrap;
      border: 1px solid #e5e5e5;
      .editor-input {
        border: none !important;
        outline: none !important;
        margin: 0 !important;
        background: none !important;
        box-shadow: none !important;
        width: 100%;
        height: 120px;
        box-sizing: border-box;
        resize: none; /* 防止textarea被调整大小 */
      }
      .editor-footer{
        width: 100%;
      }
    }
    .dialog {
      border-radius: 8px;
      background-color: rgb(169, 221, 243);
      .dialog-header {
        gap: 12px;
        font-weight: 500;
      }
      .chat-window {
        height: 480px;
        display: flex;
        flex-direction: column;
        ::v-deep .el-scrollbar__wrap {
          box-sizing: border-box;
          margin-bottom: 0 !important;
          overflow: auto;
          padding: 16px;
        }
        .chat-content {
          flex: 1;
          min-height: 0;
        }
        .chat-window-operate {
          position:relative;
          .upward-textarea {
            ::v-deep .el-textarea__inner {
              border-radius: 8px;
              border: 1px solid #000000;
              resize: none;
              transition: height 0.2s ease;
              min-height: 60px;
              max-height: 200px;
            }
          }
          .send-button-container {
            position: absolute;
            right: 30px;
            bottom: 20px;
            .send-button {
              border: none;
              color: black;
            }
          }
        }
      }
    }
  }
}

// 添加消息样式
.message-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  .message {
    display: flex;
    align-items: start;
    word-break: break-all;
    .avatar {
      background-color: transparent;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      .user {
        color: #3A3C50;
      }
    }
    .card {
      flex:1;
      min-width:220px;
    }
  }
  .user {
    flex-direction: row-reverse;
  }
  .demo-question{
    height: 46px;
    line-height: 46px;
    border-radius: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover {
      background-color: rgb(236, 245, 255);
    }
  }
}
</style>
