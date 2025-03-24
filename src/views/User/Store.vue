<script setup lang="ts">
import { NCard, NGrid, NGridItem, NButton, NTag } from 'naive-ui'
import { ref } from 'vue'

const products = ref([
  {
    id: 1,
    name: '基础套餐',
    price: '￥19.99/月',
    features: ['5个隧道', '10GB流量/月', '基础技术支持'],
    popular: false
  },
  {
    id: 2,
    name: '专业套餐',
    price: '￥49.99/月',
    features: ['15个隧道', '50GB流量/月', '24/7技术支持', '自定义域名'],
    popular: true
  },
  {
    id: 3,
    name: '企业套餐',
    price: '￥99.99/月',
    features: ['无限隧道', '200GB流量/月', '优先技术支持', '自定义域名', 'API访问'],
    popular: false
  }
])
</script>

<template>
  <div class="store">
    <h2>商城</h2>
    <NGrid :cols="3" :x-gap="12">
      <NGridItem v-for="product in products" :key="product.id">
        <NCard class="product-card">
          <div class="product-header">
            <h3>{{ product.name }}</h3>
            <NTag v-if="product.popular" type="success">最受欢迎</NTag>
          </div>
          <div class="product-price">{{ product.price }}</div>
          <ul class="product-features">
            <li v-for="feature in product.features" :key="feature">{{ feature }}</li>
          </ul>
          <template #footer>
            <NButton type="primary" block>立即购买</NButton>
          </template>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped>
.store {
  padding: 24px;
}

.store h2 {
  margin-bottom: 24px;
  font-size: 20px;
}

.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.product-header h3 {
  margin: 0;
  font-size: 18px;
}

.product-price {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.product-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.product-features li {
  margin-bottom: 8px;
  color: #666;
}

.n-button {
  margin: auto;
}
</style>