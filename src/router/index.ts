import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import UserPanel from '../views/UserPanel.vue'
import UserDashboard from '../views/User/Dashboard.vue'
import Tunnels from '../views/User/Tunnels.vue'
import Store from '../views/User/Store.vue'
import Profile from '../views/User/Profile.vue'
import About from '../views/User/About.vue'
import AdminDashboard from '../views/Admin/Dashboard.vue'
import UserControl from '../views/Admin/UserControl.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
    {
      path: '/user',
      name: 'user',
      component: UserPanel,
      redirect: '/user/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'user-dashboard',
          component: UserDashboard
        },
        {
          path: 'tunnels',
          name: 'tunnels',
          component: Tunnels
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
    },
    {
      path: '/admin',
      name: 'admin',
      component: UserPanel,
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboard
        },

        {
          path: 'user-control',
          name: 'user-control',
          component: UserControl
        }
      ]
    }
  ]
})

export default router