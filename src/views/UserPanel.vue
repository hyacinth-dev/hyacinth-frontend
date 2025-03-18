<script setup lang="ts">
import { NLayout, NLayoutContent, NLayoutSider, NMenu, NAvatar, NDropdown, NSpace } from 'naive-ui'
import { h, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { MenuOption, DropdownOption } from 'naive-ui'
import { StatsChartOutline, SwapHorizontalOutline, CartOutline, InformationCircleOutline } from '@vicons/ionicons5'

const router = useRouter()

const userInfo = ref({
  email: 'user@example.com',
  nickname: '用户123',
  avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
})

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
  }
})

const menuOptions: MenuOption[] = [
  {
    label: '仪表盘',
    key: '/user/dashboard',
    icon: () => h(StatsChartOutline)
  },
  {
    label: '隧道列表',
    key: '/user/tunnels',
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

const handleSelect = (key: string) => {
  if (key === 'profile') {
    router.push('/user/profile')
  } else if (key === 'logout') {
    localStorage.removeItem('token')
    router.push('/login')
  }
}

const activeKey = ref('/user/dashboard')

const handleUpdateValue = (key: string) => {
  router.push(key)
}
</script>

<template>
  <NLayout style="width: 100%; height: 100%;" has-sider>
    <NLayoutSider bordered collapse-mode="width" :collapsed-width="64" :width="240" show-trigger>
      <div class="sider-content">
        <NMenu v-model:value="activeKey" :options="menuOptions" :collapsed-width="64" :collapsed-icon-size="22" @update:value="handleUpdateValue" />
        <div class="user-profile">
          <NDropdown :options="dropdownOptions" @select="handleSelect">
            <NSpace align="center">
              <NAvatar
                round
                :size="32"
                :src="userInfo.avatar"
              />
              <span class="username">{{ userInfo.nickname }}</span>
            </NSpace>
          </NDropdown>
        </div>
      </div>
    </NLayoutSider>
    <NLayout>
      <NLayoutContent content-style="padding: 24px;">
        <router-view />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
.sider-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-profile {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid var(--n-border-color);
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: var(--n-text-color);
}
</style>