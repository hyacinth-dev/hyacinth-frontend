<script setup lang="ts">
import { NCard, NSpace, NText } from 'naive-ui'
</script>

<template>
  <div class="about">
    <h2>关于</h2>
    <NSpace vertical size="large">
      <NCard title="系统介绍">
        <NText>Hyacinth 是一个基于 Easytier 的组网管理系统，为用户提供安全、稳定、高效的组网服务。</NText>
      </NCard>

      <NCard title="功能特点">
        <ul class="feature-list">
          <li>高效的组网性能</li>
          <li>实时流量监控和统计</li>
          <li>灵活的套餐选择</li>
          <li>完善的技术支持</li>
          <li>安全的数据传输</li>
        </ul>
      </NCard>
      <NCard title="使用指南">
        <NText>
          详细的使用指南和文档请访问：
          <a href="https://github.com/hyacinth-dev/hyacinth-docs" target="_blank" rel="noopener noreferrer">
            https://github.com/hyacinth-dev/hyacinth-docs
          </a>
        </NText>
      </NCard>

      <NCard title="联系我们">
        <div class="contact-info">
          <p>邮箱：support@hyacinth.com</p>
          <p>技术支持：工作日 9:00-18:00</p>
        </div>
      </NCard>

      <NCard title="版本信息">
        <p>当前版本：v1.0.0</p>
        <p>更新日期：2025-06-01</p>
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