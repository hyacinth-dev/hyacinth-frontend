<script setup lang="ts">
import { NCard, NSpace, NText } from 'naive-ui'
</script>

<template>
  <div class="about">
    <h2>关于</h2>
    <NSpace vertical size="large">
      <NCard title="系统介绍">
        <NText>Hyacinth 是一个现代化的隧道管理系统，为用户提供安全、稳定、高效的网络隧道服务。</NText>
      </NCard>

      <NCard title="功能特点">
        <ul class="feature-list">
          <li>支持多种隧道类型（TCP、HTTP等）</li>
          <li>实时流量监控和统计</li>
          <li>灵活的套餐选择</li>
          <li>完善的技术支持</li>
          <li>安全的数据传输</li>
        </ul>
      </NCard>

      <NCard title="联系我们">
        <div class="contact-info">
          <p><strong>邮箱：</strong>support@hyacinth.com</p>
          <p><strong>技术支持：</strong>工作日 9:00-18:00</p>
        </div>
      </NCard>

      <NCard title="版本信息">
        <p>当前版本：v1.0.0</p>
        <p>更新日期：2024-01-01</p>
      </NCard>
    </NSpace>
  </div>
</template>

<style scoped>
.about {
  padding: 24px;
}

.about h2 {
  margin-bottom: 24px;
  font-size: 20px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  margin-bottom: 12px;
  position: relative;
  padding-left: 20px;
}

.feature-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #18a058;
}

.contact-info p {
  margin: 8px 0;
}
</style>