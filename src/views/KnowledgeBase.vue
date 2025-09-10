<template>
  <div class="knowledge-base-container p-16-24 pb-24">
    <div class="knowledge-base-header mb-16">

      <div class="el-input-wrapper">
        <el-input v-model="knowledgeBaseName" clearable prefix-icon="el-icon-search" placeholder="按名称搜索" size="medium" @change="searchKnowledgeBaseByName($event)" />
      </div>

      <div class="knowledge-base-header-buttons flex">
        <el-button type="primary" size="medium" class="header-button">创建应用</el-button>
        <el-button size="medium" class="header-button">导入应用</el-button>
      </div>

    </div>

    <el-row :gutter="15" class="row">
      <el-col v-for="(knowledgeBase,index) in displayedKnowledgeBaseList" :key="knowledgeBase.name" :span="6" class="col mb-16">
        <el-card shadow="always" :body-style="{height:'100%'}" class="card" @click.native="selectKnowledgeBase(knowledgeBase)">
          <div class="card-header flex">
            <el-avatar
              :size="32"
              :style="{ flexShrink:0,
                        backgroundColor:getBackgroundColor(knowledgeBase.name),
                        color:getTextColor(getBackgroundColor(knowledgeBase.name)) }"
            >
              <template>{{ knowledgeBase.name[0] }}</template>
            </el-avatar>

            <div class="card-header-title ml-8">
              <el-tooltip :content="knowledgeBase.name" placement="bottom" :disabled="!knowledgeBase.isTruncated">
                <div :ref="`titleText${index}`" class="card-header-title-text fs-16">{{ knowledgeBase.name }}</div>
              </el-tooltip>
              <div class="card-header-title-role fs-12">admin</div>
            </div>

          </div>

          <div class="card-content fs-14">
            {{ knowledgeBase.desc }}
          </div>

          <el-divider />

          <div class="card-footer p-0-16">
            <el-tooltip content="开启对话" placement="top">
              <el-button size="medium" icon="el-icon-chat-dot-round" circle @click.stop />
            </el-tooltip>
            <el-tooltip content="设置" placement="top">
              <el-button size="medium" icon="el-icon-setting" circle />
            </el-tooltip>
            <el-dropdown size="medium" trigger="click">
              <el-button size="medium" icon="el-icon-more" circle @click.stop /> <!-- 防止冒泡触发卡片选择 -->
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item><i class="el-icon-copy-document" /> 复制</el-dropdown-item>
                <el-dropdown-item><i class="el-icon-download" /> 导出</el-dropdown-item>
                <el-dropdown-item><i class="el-icon-delete" /> 删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <div class="status">
            <el-tag :type="dialogueType(knowledgeBase.dialogue_number).type" effect="light" size="small">{{ dialogueType(knowledgeBase.dialogue_number).version }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div class="flex justify-center">
      <Pagination :total="total" :page-index="pageIndex" :limit="pageSize" @pagination="pageChange" />
    </div>
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import { getBackgroundColor, getTextColor } from '@/utils/color.js'
import knowledgeBaseApi from '@/api/knowledgeBase'

export default {
  name: 'knowledge-base',
  components: {
    Pagination
  },
  props: {
    routes: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      knowledgeBaseList: { records: [] },
      knowledgeBaseName: '',
      total: 0,
      pageIndex: 1,
      pageSize: 12
    }
  },
  computed: {
    displayedKnowledgeBaseList() { // 用于分页显示知识库列表
      return this.knowledgeBaseList.records.filter((knowledgeBase, index) => { return index >= this.pageSize * (this.pageIndex - 1) - 1 && index <= this.pageSize * this.pageIndex - 1 })
    }
  },
  created() {
    this.getKnowledgeBaseList()
  },
  mounted() {
    window.addEventListener('resize', this.checkTextTruncation)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkTextTruncation)
  },
  methods: {
    getBackgroundColor,
    getTextColor,
    selectKnowledgeBase(knowledgeBase) {
      this.$emit('navigateTo', this.routes.settingPage)
      this.$emit('selectKnowledgeBase', knowledgeBase)
    },
    searchKnowledgeBaseByName(knowledgeBaseName) {
      this.getKnowledgeBaseList(knowledgeBaseName)
    },
    dialogueType(dialogueNumber) {
      return dialogueNumber === 1 ? { type: 'success', version: '标准版' } : { type: 'warning', version: '自定义' }
    },
    checkTextTruncation() {
      if (this.knowledgeBaseList.records) {
        this.knowledgeBaseList.records.forEach((item, index) => {
          const element = this.$refs[`titleText${index}`]
          if (element && element[0]) {
            const isTruncated = element[0].scrollWidth > element[0].clientWidth
            this.$set(item, 'isTruncated', isTruncated)
          }
        })
      }
    },
    getKnowledgeBaseList(name) {
      knowledgeBaseApi.getKnowledgeBaseList({ name }).then(res => {
        this.knowledgeBaseList = res
        this.total = res.total

        if (!name) {
          this.$emit('SET_KNOWLEDGE_BASE_LIST', this.knowledgeBaseList)
        }
      })
    },
    pageChange(pageIndex) {
      this.pageIndex = pageIndex
      this.getKnowledgeBaseList()
    },
  }
}
</script>
<style scoped lang="scss">
.knowledge-base-container {
  width: 100%;
  height: 100%;
  border-radius: 20px;

  .knowledge-base-header {
    display: flex;
    align-items: start;
    justify-content: space-between;

    .el-input-wrapper {
    min-width: 240px;
    height: 32px;
    }
    .knowledge-base-header-buttons{
      flex-wrap: nowrap;
      margin-left: auto;
      .header-button{
        border-radius: 10px;
      }
    }
  }
  .card-header{
    width: 100%;
    height: 20px;
    .card-header-title{

      width: 90%;
      .card-header-title-text{
        width: 65%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: 25px;
      }
      .card-header-title-role{
        font-weight: 400;
        height: 16px;
        color: rgb(100,106,115);
      }
    }
  }
  .row{
    height: 600px;
  }
  .col{
    height: 180px;
    box-sizing: border-box;
  }
  .card{
    height:100%;
    min-height: 166px;
    min-width: 220px;
    cursor: pointer;
    border-radius: 16px;
    position: relative;
  }
  .card-content{
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    line-height: 22px;
    margin-top: 33px;
    height: 42px;
    font-weight: 400;
    color: rgb(31,35,41);
  }
  .card-footer{
    position: absolute;
    min-height: 30px;
    left: 0;
    bottom: 4px;
    display: flex;
    justify-content: flex-end;
    width: 100%;
    .el-button + .el-button {
      margin: 0 5px;
    }
  }
  .status{
    position: absolute;
    right: 16px;
    top: -1px;
  }
}
</style>
