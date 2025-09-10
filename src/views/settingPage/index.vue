<template>
  <div class="container">

    <div class="sidebar">
      <div class="menu-container">
        <el-scrollbar style="border-radius: 14px;">
          <el-menu default-active="1" mode="vertical" style="border:0" @select="handleSelectPage">
            <el-menu-item class="menu-item" index="1"><i class="el-icon-notebook-1 sidebar-icon" />基本信息</el-menu-item>
            <el-menu-item class="menu-item" index="2"><i class="el-icon-setting sidebar-icon" />设置</el-menu-item>
            <el-menu-item v-if="knowledgeBase.dialogue_number === 1" class="menu-item" index="3"><i class="el-icon-aim sidebar-icon" />命中测试</el-menu-item>
            <el-menu-item class="menu-item" index="4"><i class="el-icon-document sidebar-icon" />使用记录</el-menu-item>
          </el-menu>
        </el-scrollbar>
      </div>

      <el-dropdown trigger="click" placement="top" class="knowledge-base-dropdown" @command="handleDropdownCommand">
        <el-button size="medium" class="dropdown-trigger">
          <div class="btn">
            <span>{{ knowledgeBase.name }}</span>
            <i class="el-icon-arrow-up"></i>
          </div>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="record in knowledgeBaseList.records" :key="record.name" :command="record.name" :style="{ backgroundColor: record.name === knowledgeBase.name ? 'rgb(236,245,255)' : '' }">
            {{ record.name }}
          </el-dropdown-item>
          <el-dropdown-item><i class="el-icon-plus" />创建应用</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <div class="main">
      <component :is="currentSelectedPage" v-bind="{knowledgeBase}"/>
    </div>

  </div>
</template>
<script>
import BasicInfo from '@/views/basicInfo/index.vue'
import Setting from './Setting.vue'
import HitTesting from '@/views/hitTesting/index.vue'
import UseHistory from '@/views/useHistory/index.vue'
export default {
  name: 'setting-page',
  components: {
    BasicInfo,
    Setting,
    HitTesting,
    UseHistory
  },
  props: {
    knowledgeBase: {
      type: Object,
      required: true
    },
    knowledgeBaseList: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentSelectedPage: 'basicInfo'
    }
  },
  methods: {
    handleSelectPage(index) {
      // index 应该是路由
      this.currentSelectedPage = index === '1' ? 'basicInfo' : index === '2' ? 'Setting' : index === '3' ? 'HitTesting' : 'UseHistory'
    },
    handleDropdownCommand(command) {
      this.knowledgeBase = this.knowledgeBaseList.records.find(item => item.name === command)
    }
  }
}
</script>
<style scoped lang="scss">
::v-deep .el-dropdown-menu__item{
  width: 232px;
  height: 32px;
  font-size: 14px;
  padding: 5px 11px;
  &:last-of-type{
    border-top: 1px solid #E5E5E5;
  }
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  .sidebar {
    box-sizing: border-box;
    padding: 0; // 可以用 .p-0 替代
    width: 240px;
    flex-shrink: 0;
    position: relative;
    .knowledge-base-dropdown{
      padding: 0 4px; // 可以用 .pl-4 和 .pr-4 组合替代
      width:100%;
      position: absolute;
      bottom: 40px;
      .dropdown-trigger {
        border: 0px;
        border-radius: 14px;
        width: 100%;
        &:hover{
          border-radius: 0;
        }
        .btn{
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
      }
    }
    .menu-container{
      box-sizing: border-box;
      padding: 0 8px; // 可以用 .pl-8 和 .pr-8 组合替代
      .is-active{
        background-color: #3A3C50;
        color: white;
      }
      .menu-item{
        box-sizing: border-box;
        height: 45px;
        font-size: 14px;
        line-height: 45px;
        padding: 13px 12px 13px 16px; // 可以用 .pt-12 .pr-12 .pb-12 .pl-16 组合替代
        display: flex;
        align-items: center;
        .sidebar-icon{
          margin-left: -5px; // 可以用 .ml-4 替代（最接近的值，但需要调整）
        }
      }
    }
  }
  .main {
    flex-grow: 1;
    margin: 0 30px 30px 0; // 可以用 .mr-24 .mb-24 组合替代（最接近的值）
    border-radius: 20px;
    background-color: #fff;
  }
}
</style>
