import VueRouter from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'index',
        component: () => import('@/index.vue')
      },
    ]
  }
]
const router = new VueRouter({
  routes
})

export default router
