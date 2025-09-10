<template>
  <el-dialog
    v-if="dialogTypeKey"
    :title="dialogType[dialogTypeKey].title"
    :width="dialogType[dialogTypeKey].width"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
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
        <el-button @click="handleClose">取消</el-button>
        <el-button type="danger" class="pt-8" @click="handleDelete">删除</el-button>
      </div>
    </template>

    <template v-else-if="dialogTypeKey !== 'embeddingThirdParty'" #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>

  </el-dialog>
</template>
<script>
export default {
  name: 'basic-info-dialog',
  props: {
    dialogTypeKey: {
      type: String,
      required: true
    },
    accessToken: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
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
        this.$emit('update:accessToken', { ...this.accessToken, white_list: value.split('\n') })
      }
    }
  },
  methods: {
    handleSave() {
      this.$emit('save')
    },
    handleClose() {
      this.$emit('close')
    },
    handleDelete() {
      this.$emit('delete')
    }
  }
}
</script>
