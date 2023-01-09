import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const constantRoutes = [
  {
    path: '/',
    redirect: '/integralCalculation'
  },
  {
    path: '/integralCalculation',
    meta: { title: '桌球积分赛计算' },
    component: () => import('@/views/integralCalculation')
  },
  {
    path: '/integralDisplay',
    meta: { title: '桌球积分赛展示' },
    component: () => import('@/views/integralDisplay')
  }
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// 重置路由
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
