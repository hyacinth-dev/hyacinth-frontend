<script setup lang="ts">
import { NLayout, NLayoutContent, NLayoutSider, NMenu, NAvatar, NDropdown, NSpace } from 'naive-ui'
import { h, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { MenuOption, DropdownOption } from 'naive-ui'
import { StatsChartOutline, SwapHorizontalOutline, CartOutline, InformationCircleOutline } from '@vicons/ionicons5'

const router = useRouter()

// 用户信息数据，后续可从API获取真实数据
const userInfo = ref({
  email: 'user@example.com',
  nickname: '用户123',
  avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
})

/**
 * 组件挂载时执行的操作
 * 1. 检查用户登录状态
 * 2. 根据用户角色设置不同的导航菜单
 */
onMounted(() => {
  // 检查用户是否登录，如果未登录则跳转到登录页
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
  }

  // 根据用户角色（管理员/普通用户）设置不同的导航菜单
  const isAdmin = localStorage.getItem('isAdmin')
  if (isAdmin === 'true') {
    // 管理员菜单选项
    menuOptions = [
      {
        label: '仪表盘',
        key: '/admin/dashboard',
        icon: () => h(StatsChartOutline)
      },
      {
        label: '用户管理',
        key: '/admin/user-control',
        icon: () => h(CartOutline)
      },
    ]
    activeKey.value = '/admin/dashboard'
  }
  else {
    // 普通用户菜单选项
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
    activeKey.value = '/user/dashboard'
  }
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
  <NLayout style="width: 100%; height: 100%;" has-sider>
    <!-- 侧边导航栏 -->
    <NLayoutSider bordered collapse-mode="width" :collapsed-width="64" :width="240" show-trigger>
      <div class="sider-content">
        <!-- 导航菜单 -->
        <NMenu v-model:value="activeKey" :options="menuOptions" :collapsed-width="64" :collapsed-icon-size="22"
          @update:value="handleUpdateValue" />

        <!-- 用户信息区域，显示在侧边栏底部 -->
        <div class="user-profile">
          <NDropdown :options="dropdownOptions" @select="handleSelect">
            <NSpace align="center">
              <NAvatar round :size="32" :src="userInfo.avatar" />
              <span class="username">{{ userInfo.nickname }}</span>
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
  /* 顶部分隔线 */  cursor: pointer;
}

/* 用户名称文本样式 */
.username {
  font-size: 14px;
  color: var(--n-text-color); /* 使用主题变量，支持暗黑模式 */
}
</style>