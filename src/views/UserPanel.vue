<script setup lang="ts">
import { NLayout, NLayoutContent, NLayoutSider, NMenu } from 'naive-ui'
import { h, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { StatsChartOutline, SwapHorizontalOutline, CartOutline, PersonOutline, InformationCircleOutline } from '@vicons/ionicons5'

const router = useRouter()

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
    label: '个人中心',
    key: '/user/profile',
    icon: () => h(PersonOutline)
  },
  {
    label: '关于',
    key: '/user/about',
    icon: () => h(InformationCircleOutline)
  }
]

const activeKey = ref('/user/dashboard')

const handleUpdateValue = (key: string) => {
  router.push(key)
}
</script>

<template>
  <NLayout style="width: 100%; height: 100%;" has-sider>
    <NLayoutSider bordered collapse-mode="width" :collapsed-width="64" :width="240" show-trigger>
      <NMenu v-model:value="activeKey" :options="menuOptions" :collapsed-width="64" :collapsed-icon-size="22" @update:value="handleUpdateValue" />
    </NLayoutSider>
    <NLayout>
      <NLayoutContent content-style="padding: 24px;">
        <router-view />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
.user-panel {
  padding: 24px;
}

.user-panel h1 {
  font-size: 24px;
  margin-bottom: 24px;
}
</style>