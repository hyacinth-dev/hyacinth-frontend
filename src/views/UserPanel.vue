<script setup lang="ts">
import { NLayout, NLayoutContent, NLayoutSider, NMenu, NAvatar, NDropdown, NSpace } from 'naive-ui'
import { h, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { MenuOption, DropdownOption } from 'naive-ui'
import { StatsChartOutline, SwapHorizontalOutline, CartOutline, InformationCircleOutline } from '@vicons/ionicons5'
import { getUserInfo } from '../api/auth'

const router = useRouter()

// 用户信息数据，从API获取真实数据
const userInfo = ref({
  email: '',
  username: '',
  avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
})

/**
 * 获取用户信息
 */
const fetchUserInfo = async () => {
  try {
    const response = await getUserInfo()
    userInfo.value.email = response.data.email
    userInfo.value.username = response.data.username
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

/**
 * 监听用户信息更新事件
 */
const handleUserInfoUpdate = (event: CustomEvent) => {
  if (event.detail && event.detail.username) {
    userInfo.value.username = event.detail.username
  }
  if (event.detail && event.detail.email) {
    userInfo.value.email = event.detail.email
  }
}

/**
 * 组件挂载时执行的操作
 * 1. 检查用户登录状态
 * 2. 根据用户角色设置不同的导航菜单
 * 3. 获取用户信息
 */
onMounted(() => {
  // 检查用户是否登录，如果未登录则跳转到登录页
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  // 获取用户信息
  fetchUserInfo()

  // 监听用户信息更新事件
  window.addEventListener('userInfoUpdated', handleUserInfoUpdate as EventListener)

  // 设置普通用户菜单选项
  menuOptions = [
    {
      label: '仪表盘',
      key: '/user/dashboard',
      icon: () => h(StatsChartOutline)
    },
    {
      label: '虚拟网络',
      key: '/user/vnetwork',
      icon: () => h(SwapHorizontalOutline)
    },
    {
      label: '商城',
      key: '/user/store',
      icon: () => h(CartOutline)
    },
    {
      label: '关于',
      key: '/user/about',
      icon: () => h(InformationCircleOutline)
    }
  ]
  // 根据当前路由动态设置激活的菜单项
  const currentRoute = router.currentRoute.value.path
  const menuKeys = menuOptions.map(option => option.key)
  if (menuKeys.includes(currentRoute)) {
    activeKey.value = currentRoute
  } else {
    // 如果当前路由不在菜单中，设置默认值
    activeKey.value = '/user/dashboard'
  }
})

/**
 * 组件卸载时清理事件监听器
 */
onUnmounted(() => {
  window.removeEventListener('userInfoUpdated', handleUserInfoUpdate as EventListener)
})

// 导航菜单选项，将根据用户角色动态设置
let menuOptions: MenuOption[] = []

// 用户头像下拉菜单选项
const dropdownOptions: DropdownOption[] = [
  {
    label: '个人中心',
    key: 'profile'
  },
  {
    label: '退出登录',
    key: 'logout'
  }
]

/**
 * 处理用户头像下拉菜单选择事件
 * @param key - 所选菜单项的key
 */
const handleSelect = (key: string) => {
  if (key === 'profile') {
    // 跳转到个人中心页面
    router.push('/user/profile')
  } else if (key === 'logout') {
    // 退出登录，清除token并跳转到登录页
    localStorage.removeItem('token')
    router.push('/login')
  }
}

// 当前激活的导航菜单项，用于高亮显示当前页面
const activeKey = ref('')

// 侧边栏折叠状态
const collapsed = ref(false)

// 控制用户名显示，只在动画完成后显示
const showUsername = ref(true)

// 监听侧边栏折叠状态变化，控制用户名显示时机
watch(collapsed, (newCollapsed) => {
  if (newCollapsed) {
    // 折叠时立即隐藏用户名
    showUsername.value = false
  } else {
    // 展开时延迟显示用户名，等待动画完成
    setTimeout(() => {
      showUsername.value = true
    }, 100)
  }
})

/**
 * 处理导航菜单项点击事件
 * @param key - 所选导航项的路由路径
 */
const handleUpdateValue = (key: string) => {
  router.push(key)
}
</script>

<template>
  <!-- 整体布局容器，包含侧边栏和内容区 -->
  <NLayout style="width: 100%; height: 100%;" has-sider> <!-- 侧边导航栏 -->
    <NLayoutSider bordered collapse-mode="width" :collapsed-width="64" :width="240" show-trigger
      v-model:collapsed="collapsed">
      <div class="sider-content">
        <!-- 导航菜单 -->
        <NMenu v-model:value="activeKey" :options="menuOptions" :collapsed-width="64" :collapsed-icon-size="22"
          @update:value="handleUpdateValue" />

        <!-- 用户信息区域，显示在侧边栏底部 -->
        <div class="user-profile">
          <NDropdown :options="dropdownOptions" @select="handleSelect">
            <NSpace align="center">
              <NAvatar round :size="32" :src="userInfo.avatar" />
              <span class="username" v-if="!collapsed && showUsername">{{ userInfo.username }}</span>
            </NSpace>
          </NDropdown>
        </div>
      </div>
    </NLayoutSider>

    <!-- 主内容区域 -->
    <NLayout>
      <NLayoutContent content-style="padding: 24px;">
        <!-- 路由视图，根据当前路由显示对应组件 -->
        <router-view />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
/* 侧边栏内容样式，使用flex布局实现顶部菜单+底部用户信息的结构 */
.sider-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 用户信息区域样式，固定在侧边栏底部 */
.user-profile {
  margin-top: auto;
  /* 将用户信息推到底部 */
  padding: 16px;
  border-top: 1px solid var(--n-border-color);
  /* 顶部分隔线 */
  cursor: pointer;
}

/* 用户名称文本样式 */
.username {
  font-size: 14px;
  color: var(--n-text-color);
  /* 使用主题变量，支持暗黑模式 */
}
</style>