<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NButton,
  NSpace,
  NGrid,
  NGridItem,
  NStatistic,
  NCard,
  NIcon
} from 'naive-ui'
import {
  GameControllerOutline,
  GitNetworkOutline,
  ServerOutline,
  GlobeOutline,
  ShieldCheckmarkOutline,
  SpeedometerOutline,
  HeartOutline,
  TrophyOutline
} from '@vicons/ionicons5'

const router = useRouter()

const statistics = ref([
  { label: '节点数', value: '29' },
  { label: '用户数', value: '30878' },
  { label: '链接数', value: '9128' },
  { label: '流量总量', value: '52.53 TB' }
])

const features = ref([
  {
    title: '高速稳定',
    description: '基于 Rust + Golang 技术, 实现高性能, 内存高效的网络服务',
    icon: SpeedometerOutline
  },
  {
    title: '安全加密',
    description: 'BGP 加密协议, 多重认证, 包加密等, 等级保密',
    icon: ShieldCheckmarkOutline
  },
  {
    title: '简单易用',
    description: '所有设备均可一键连接, 无需复杂设置',
    icon: HeartOutline
  },
  {
    title: '优质服务',
    description: '多年技术沉淀, 稳定, 成熟的服务',
    icon: TrophyOutline
  }
])

const services = ref([
  {
    title: '游戏加速',
    description: '专业游戏加速服务，为您提供流畅稳定的游戏体验',
    icon: GameControllerOutline
  },
  {
    title: '内网穿透',
    description: '高效的内网穿透服务，轻松实现远程访问和管理',
    icon: GitNetworkOutline
  },
  {
    title: '安全组网',
    description: '企业级安全组网方案，数据传输加密，访问权限可控',
    icon: ServerOutline
  },
  {
    title: '跨平台访问',
    description: '支持各类设备接入，随时随地安全访问网络资源',
    icon: GlobeOutline
  }
])
</script>

<template>
  <NLayout style="width: 100%; height: 100%;">
    <NLayoutHeader class="header">
      <div class="header-content">
        <div class="logo">Hyacinth</div>
        <NSpace>
          <NButton @click="router.push('/login')">登录</NButton>
          <NButton type="primary" @click="router.push('/register')">注册</NButton>
        </NSpace>
      </div>
    </NLayoutHeader>
    <NLayoutContent content-style="padding: 24px;">
      <!-- 统计数据 -->
      <div class="statistics-section">
        <NGrid :x-gap="24" :y-gap="24" :cols="4">
          <NGridItem v-for="stat in statistics" :key="stat.label">
            <NStatistic :label="stat.label" :value="stat.value" />
          </NGridItem>
        </NGrid>
      </div>

      <!-- 为什么选择我们 -->
      <div class="section">
        <h2 class="section-title">为什么选择我们？</h2>
        <NGrid :x-gap="24" :y-gap="24" :cols="4">
          <NGridItem v-for="feature in features" :key="feature.title">
            <NCard class="feature-card">
              <div class="feature-icon">
                <NIcon :component="feature.icon" size="24" />
              </div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </NCard>
          </NGridItem>
        </NGrid>
      </div>

      <!-- 主要功能 -->
      <div class="section">
        <h2 class="section-title">主要功能</h2>
        <NGrid :x-gap="24" :y-gap="24" :cols="4">
          <NGridItem v-for="service in services" :key="service.title">
            <NCard class="service-card">
              <div class="service-icon">
                <NIcon :component="service.icon" size="24" />
              </div>
              <h3 class="service-title">{{ service.title }}</h3>
              <p class="service-description">{{ service.description }}</p>
            </NCard>
          </NGridItem>
        </NGrid>
      </div>

      <!-- 准备好开始了吗 -->
      <div class="cta-section">
        <h2 class="cta-title">准备好开始了吗？</h2>
        <p class="cta-description">加入我们，体验高速稳定的网络连接服务</p>
        <NButton type="primary" size="large" @click="router.push('/register')">立即注册</NButton>
      </div>
    </NLayoutContent>
  </NLayout>
</template>

<style scoped>
.header {
  height: 64px;
  padding: 0 24px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  width: 100%;
}

.header-content {
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.statistics-section {
  max-width: 1200px;
  margin: 24px auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 32px;
  color: #333;
}

.feature-card,
.service-card {
  text-align: center;
  padding: 24px;
  height: 100%;
  transition: all 0.3s ease;
}

.feature-card:hover,
.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.feature-icon,
.service-icon {
  margin-bottom: 16px;
  color: #6366f1;
}

.feature-title,
.service-title {
  font-size: 18px;
  margin: 12px 0;
  color: #333;
}

.feature-description,
.service-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.cta-section {
  text-align: center;
  margin: 64px 0;
  padding: 48px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  color: white;
}

.cta-title {
  font-size: 32px;
  margin: 0 0 16px;
}

.cta-description {
  font-size: 16px;
  margin: 0 0 32px;
  opacity: 0.9;
}
</style>