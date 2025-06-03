/**
 * 路由配置文件
 * 定义应用的路由结构，包括公共页面和用户页面
 */

import { createRouter, createWebHistory } from 'vue-router'

// 页面组件导入
// 公共页面
import Home from '../views/Home.vue'          // 首页组件
import Login from '../views/Login.vue'         // 登录页组件
import Register from '../views/Register.vue'   // 注册页组件
import UserPanel from '../views/UserPanel.vue' // 用户面板组件

// 普通用户页面
import UserDashboard from '../views/User/Dashboard.vue' // 用户仪表盘
import VirtualNetwork from '../views/User/VirtualNetwork.vue'         // 隧道管理页面
import Store from '../views/User/Store.vue'             // 商城页面
import Profile from '../views/User/Profile.vue'         // 个人资料页面
import About from '../views/User/About.vue'             // 关于页面



/**
 * 创建路由实例
 * 使用HTML5 History API实现路由
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 公共路由 - 不需要登录即可访问
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },

    // 普通用户路由 - 需要用户权限
    {
      path: '/user',
      name: 'user',
      component: UserPanel, // 用户面板作为父级容器
      redirect: '/user/dashboard', // 默认重定向到用户仪表盘
      children: [
        {
          path: 'dashboard',
          name: 'user-dashboard',
          component: UserDashboard
        },
        {
          path: 'vnetwork',
          name: 'vnetwork',
          component: VirtualNetwork
        },
        {
          path: 'store',
          name: 'store',
          component: Store
        },
        {
          path: 'profile',
          name: 'profile',
          component: Profile
        },
        {
          path: 'about',
          name: 'about',
          component: About
        }
      ]
    }
  ]
})

// 路由守卫：已登录用户访问 login 页时自动跳转到 /user
router.beforeEach((to, _, next) => {
  // 假设本地存储有 token 表示已登录，可根据实际项目调整
  const isLoggedIn = !!localStorage.getItem('token');
  if (to.name === 'login' && isLoggedIn) {
    next({ path: '/user' });
  } else {
    next();
  }
});

export default router