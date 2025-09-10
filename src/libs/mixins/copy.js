import VueClipboard from 'vue-clipboard2'
import Vue from 'vue'
Vue.use(VueClipboard)
export default {
  methods: {
    handleCopy(text) {
      this.$copyText(text)
      this.$message.success('复制成功')
    }
  }
}
