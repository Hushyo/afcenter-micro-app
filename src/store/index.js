export default {
  state: {
    testmessage: 'testmessage',
  },
  mutations: {
    'SET_TESTMESSAGE': (state, testmessage) => {
      state.testmessage = testmessage
    }
  },
  actions: {
    setTestmessage({ commit }, testmessage) {
      testmessage = testmessage + Math.random()
      commit('SET_TESTMESSAGE', testmessage)
    }
  }
}

// const store = {

// }
// export default store
