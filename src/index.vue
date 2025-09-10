<template>
  <div style="width:100%;height:100%;background-color: #639df4;">
    <component :is="currentRoutePath" v-bind="{routes,knowledgeBase,knowledgeBaseList}" v-on="eventListener" />
  </div>
</template>
<script>
import knowledgeBaseComponent from './views/KnowledgeBase.vue'
import settingPage from './views/settingPage/index.vue'
export default {
  name: 'index',
  components: {
    knowledgeBaseComponent,
    settingPage
  },
  data() {
    return {
      currentRoutePath: 'knowledgeBaseComponent',
      routes: {
        knowledgeBaseComponent: {
          path: 'knowledgeBaseComponent',
          label: '知识库列表'
        },
        settingPage: {
          path: 'settingPage',
          label: '设置页面'
        }
      },
      knowledgeBase: {},
      knowledgeBaseList: [],
      eventListener: {
        'navigateTo': this.navigateTo,
        'selectKnowledgeBase': this.selectKnowledgeBase,
        'SET_KNOWLEDGE_BASE_LIST': this.setKnowledgeBaseList
      }
    }
  },
  methods: {
    navigateTo(route) {
      this.currentRoutePath = route.path
    },
    selectKnowledgeBase(knowledgeBase) {
      this.knowledgeBase = knowledgeBase
    },
    setKnowledgeBaseList(knowledgeBaseList) {
      this.knowledgeBaseList = knowledgeBaseList
    }
  }
}
</script>
<style lang="scss">
@import './style/index.scss';
</style>
