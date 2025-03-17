import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import UserPanel from '../views/UserPanel.vue'
import Dashboard from '../views/Dashboard.vue'
import Tunnels from '../views/Tunnels.vue'
import Store from '../views/Store.vue'
import Profile from '../views/Profile.vue'
import About from '../views/About.vue'

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
          name: 'dashboard',
          component: Dashboard
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
    }
  ]
})

export default router