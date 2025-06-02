<script setup lang="ts">
import { NCard, NGrid, NGridItem, NButton, NTag, NModal, NButtonGroup, NSkeleton, useMessage } from 'naive-ui'
import { ref, onMounted, computed } from 'vue'
import { purchasePackage, getUserGroup, type UserGroupResponseData } from '../../api/auth'
import { getVNetList, type VNetData } from '../../api/vnet'

const message = useMessage()
const purchasing = ref(false)
const userGroup = ref<UserGroupResponseData | null>(null)
const loading = ref(false)

// 购买对话框相关状态
const showPurchaseModal = ref(false)
const selectedProduct = ref<any>(null)
const selectedDuration = ref(1) // 默认选择1个月

// 二级确认对话框状态
const showConfirmModal = ref(false)
const pendingPurchase = ref<any>(null)

// 时长选项配置
const durationOptions = [
  { value: 1, label: '1个月', discount: 0 },
  { value: 3, label: '3个月', discount: 0.1 },
  { value: 6, label: '半年', discount: 0.2 },
  { value: 12, label: '1年', discount: 0.3 }
]

const products = ref([
  {
    id: 0,
    packageType: 1, // 对应后端的普通用户
    name: '免费套餐',
    price: '免费',
    features: ['1个虚拟网络', '最大3人同时在线', '5GB流量/月', '无技术支持'],
    popular: false,
    isFree: true
  },
  {
    id: 1,
    packageType: 2, // 对应后端的青铜用户
    name: '青铜套餐',
    price: '￥19.99/月',
    features: ['3个虚拟网络', '最大5人同时在线', '50GB流量/月', '基础技术支持'],
    popular: false
  }, {
    id: 2,
    packageType: 3, // 对应后端的白银用户
    name: '白银套餐',
    price: '￥49.99/月',
    features: ['5个虚拟网络', '最大10人同时在线', '200GB流量/月', '高级技术支持'],
    popular: true
  },
  {
    id: 3,
    packageType: 4, // 对应后端的黄金用户
    name: '黄金套餐',
    price: '￥99.99/月',
    features: ['10个虚拟网络', '无限制同时在线', '1TB流量/月', '优先技术支持'],
    popular: false
  }
])

// 获取用户当前套餐
const fetchUserGroup = async () => {
  try {
    userGroup.value = null // 重置为 null，防止颜色跳变
    loading.value = true
    const response = await getUserGroup()
    if (response.code === 0) {
      userGroup.value = response.data
    }
  } catch (error) {
    console.error('获取用户组信息失败:', error)
    message.error('获取用户组信息失败')
  } finally {
    loading.value = false
  }
}

// 检查是否是当前套餐
const isCurrentPackage = computed(() => {
  return (packageType: number) => {
    return userGroup.value?.userGroup === packageType
  }
})

// 检查是否允许购买（现在允许降级）
const canPurchase = computed(() => {
  return (packageType: number) => {
    // 免费套餐不显示购买按钮
    if (packageType === 1) return false
    // 允许购买任何非免费套餐
    return true
  }
})

// 打开购买对话框
const openPurchaseModal = (product: any) => {
  // 如果用户当前有非免费套餐，且不是购买同样的套餐，显示确认对话框
  if (userGroup.value && userGroup.value.userGroup !== 1 && userGroup.value.userGroup !== product.packageType) {
    pendingPurchase.value = product
    showConfirmModal.value = true
  } else {
    // 直接打开购买对话框
    selectedProduct.value = product
    selectedDuration.value = 1 // 重置为默认选择
    showPurchaseModal.value = true
  }
}

// 确认覆盖购买
const confirmOverride = () => {
  showConfirmModal.value = false
  if (pendingPurchase.value) {
    selectedProduct.value = pendingPurchase.value
    selectedDuration.value = 1
    showPurchaseModal.value = true
    pendingPurchase.value = null
  }
}

// 取消覆盖购买
const cancelOverride = () => {
  showConfirmModal.value = false
  pendingPurchase.value = null
}

// 计算实际价格（应用折扣）
const calculatePrice = computed(() => {
  if (!selectedProduct.value) return 0

  // 提取基础价格（去掉符号和单位）
  const priceStr = selectedProduct.value.price
  const basePrice = parseFloat(priceStr.replace(/[^\d.]/g, ''))

  // 如果是免费套餐或价格解析失败，返回0
  if (isNaN(basePrice)) return 0

  const selectedOption = durationOptions.find(opt => opt.value === selectedDuration.value)
  if (!selectedOption) return 0

  const totalPrice = basePrice * selectedDuration.value
  const discountAmount = totalPrice * selectedOption.discount
  return totalPrice - discountAmount
})

// 格式化价格显示
const formatPrice = (price: number) => {
  return `￥${price.toFixed(2)}`
}

const handlePurchase = async (packageType: number) => {
  if (purchasing.value) return

  try {
    purchasing.value = true

    // 降级套餐检查：如果是降级，需要验证当前虚拟网络的在线人数是否超过新套餐限制
    if (userGroup.value && userGroup.value.userGroup > packageType) {
      try {
        const vnetResponse = await getVNetList()
        const vnets: VNetData[] = vnetResponse.data.vnets || []

        let newMaxVNetCount = 1 // 默认普通用户限制
        switch (packageType) {
          case 1: newMaxVNetCount = 1; break
          case 2: newMaxVNetCount = 3; break
          case 3: newMaxVNetCount = 5; break
          case 4: newMaxVNetCount = 10; break
        }

        let enabledVnets = vnets.filter(vnet => vnet.enabled)
        if (enabledVnets.length > newMaxVNetCount) {
          message.error(`无法降级：当前已启用的虚拟网络数量 (${enabledVnets.length}) 超过了目标套餐的限制(${newMaxVNetCount})。请先禁用一些虚拟网络后再购买。`)
          return
        }

        // 获取新套餐的最大在线人数限制
        let newMaxClientsLimit = 3 // 默认普通用户限制
        switch (packageType) {
          case 1: newMaxClientsLimit = 3; break
          case 2: newMaxClientsLimit = 5; break
          case 3: newMaxClientsLimit = 10; break
          case 4: newMaxClientsLimit = 999999; break
        }

        // 检查是否有虚拟网络超过新套餐的在线人数限制
        const exceededVnets = vnets.filter(vnet => vnet.clientsLimit > newMaxClientsLimit)
        if (exceededVnets.length > 0) {
          const vnetNames = exceededVnets.map(vnet => vnet.comment || vnet.token).join('、')
          message.error(`无法降级：虚拟网络 [${vnetNames}] 的最大连接数设置超过了目标套餐限制(${newMaxClientsLimit})。请先调整这些虚拟网络的最大连接数后再购买。`)
          return
        }
      } catch (vnetError) {
        console.error('获取虚拟网络信息失败:', vnetError)
        message.error('无法验证虚拟网络设置，请稍后重试')
        return
      }
    }

    // 传递套餐类型和购买时长
    const response = await purchasePackage({
      packageType,
      duration: selectedDuration.value
    })

    if (response.code === 0) {
      message.success('购买成功！套餐已生效')
      showPurchaseModal.value = false // 关闭对话框
      // 刷新用户组信息
      await fetchUserGroup()
    } else {
      message.error('购买失败：' + response.message)
    }
  } catch (error) {
    console.error('购买套餐失败:', error)
    message.error('购买失败：' + ((error as any).response?.data?.message || '网络错误'))
  } finally {
    purchasing.value = false
  }
}

// 确认购买
const confirmPurchase = () => {
  if (selectedProduct.value) {
    handlePurchase(selectedProduct.value.packageType)
  }
}

// 组件挂载时获取用户组信息
onMounted(() => {
  fetchUserGroup()
})
</script>

<template>
  <div class="store">
    <h2>商城</h2>
    <NGrid :cols="4" :x-gap="12">
      <NGridItem v-for="product in products" :key="product.id">
        <NCard class="product-card">
          <div class="product-header">
            <h3>{{ product.name }}</h3>
            <NTag v-if="product.popular && !isCurrentPackage(product.packageType)" type="success">最受欢迎</NTag>
            <NTag v-if="isCurrentPackage(product.packageType)" type="warning">当前套餐</NTag>
          </div>
          <div class="product-price">{{ product.price }}</div>
          <ul class="product-features">
            <li v-for="feature in product.features" :key="feature">{{ feature }}</li>
          </ul> <template #footer>
            <!-- 加载中状态 -->
            <NButton v-if="loading" block disabled :loading="true">

            </NButton> <!-- 用户组信息加载完成后再渲染按钮 -->
            <template v-else-if="userGroup !== null">
              <!-- 免费套餐不显示按钮 -->
              <template v-if="product.packageType === 1">
                <!-- 不显示任何按钮 -->
              </template>
              <!-- 当前套餐显示续费 -->
              <NButton v-else-if="isCurrentPackage(product.packageType)" type="primary" block :loading="purchasing"
                @click="openPurchaseModal(product)">
                {{ purchasing ? '购买中...' : '续费' }}
              </NButton>
              <!-- 可以购买的套餐 -->
              <NButton v-else-if="canPurchase(product.packageType)" type="primary" block :loading="purchasing"
                @click="openPurchaseModal(product)">
                {{ purchasing ? '购买中...' : '立即购买' }}
              </NButton>
            </template>
          </template>
        </NCard>
      </NGridItem>
    </NGrid>

    <!-- 购买对话框 -->
    <NModal v-model:show="showPurchaseModal" :mask-closable="false">
      <div class="purchase-modal">
        <div class="modal-header">
          <h3>购买 {{ selectedProduct?.name }}</h3>
        </div>

        <div class="modal-content">
          <!-- 左侧：二维码占位符 -->
          <div class="payment-qr">
            <NSkeleton height="200px" width="200px" />
            <p>支付二维码</p>
          </div>

          <!-- 右侧：价格和选项 -->
          <div class="payment-options"> <!-- 动态价格显示 -->
            <div class="price-display">
              <div class="original-price"
                v-if="selectedDuration > 1 && !isNaN(parseFloat(selectedProduct?.price?.replace(/[^\d.]/g, '') || '0'))">
                原价：{{ formatPrice(parseFloat(selectedProduct?.price?.replace(/[^\d.]/g, '') || '0') * selectedDuration)
                }}
              </div>
              <div class="final-price">
                {{ formatPrice(calculatePrice) }}
              </div>
              <div class="discount-info"
                v-if="selectedDuration > 1 && !isNaN(parseFloat(selectedProduct?.price?.replace(/[^\d.]/g, '') || '0'))">
                已优惠：{{ formatPrice(parseFloat(selectedProduct?.price?.replace(/[^\d.]/g, '') || '0') * selectedDuration
                  -
                  calculatePrice) }}
              </div>
            </div>

            <!-- 时长选择按钮组 -->
            <div class="duration-selector">
              <h4>选择时长</h4>
              <NButtonGroup>
                <NButton v-for="option in durationOptions" :key="option.value"
                  :type="selectedDuration === option.value ? 'primary' : 'default'"
                  @click="selectedDuration = option.value">
                  {{ option.label }}
                  <span v-if="option.discount > 0" class="discount-tag">
                    {{ Math.round(option.discount * 100) }}%优惠
                  </span>
                </NButton>
              </NButtonGroup>
            </div>

            <!-- 购买按钮 -->
            <div class="purchase-actions">
              <NButton type="primary" size="large" block :loading="purchasing" @click="confirmPurchase">
                {{ purchasing ? '购买中...' : '确认购买' }}
              </NButton>
              <NButton size="large" block style="margin-top: 12px" @click="showPurchaseModal = false"
                :disabled="purchasing">
                取消
              </NButton>
            </div>
          </div>
        </div>
      </div>
    </NModal>

    <!-- 二级确认对话框 -->
    <NModal v-model:show="showConfirmModal" :mask-closable="false">
      <div class="confirm-modal">
        <div class="modal-header">
          <h3>确认购买</h3>
        </div>
        <div class="modal-content">
          <p>您当前已有有效套餐，购买新套餐将覆盖原有服务。确定要继续购买 <strong>{{ pendingPurchase?.name }}</strong> 吗？</p>
        </div>
        <div class="modal-actions">
          <NButton type="primary" @click="confirmOverride">
            确认购买
          </NButton>
          <NButton @click="cancelOverride" style="margin-left: 12px">
            取消
          </NButton>
        </div>
      </div>
    </NModal>
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

/* 购买对话框样式 */
.purchase-modal {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 700px;
  width: 90vw;
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.modal-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.payment-qr {
  flex: 0 0 200px;
  text-align: center;
}

.payment-qr p {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
}

.payment-options {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.price-display {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-bottom: 8px;
}

.final-price {
  font-size: 28px;
  font-weight: bold;
  color: #18a058;
  margin-bottom: 8px;
}

.discount-info {
  font-size: 14px;
  color: #f0a020;
}

.duration-selector h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.duration-selector .n-button-group {
  display: flex;
  flex-wrap: wrap;
  /* gap: 8px; */
}

.duration-selector .n-button-group .n-button {
  flex: 1;
  min-width: 0;
  margin: 0;
}

.discount-tag {
  margin-left: 8px;
  font-size: 12px;
  color: #f0a020;
  display: block;
  margin-top: 2px;
}

.purchase-actions {
  margin-top: 8px;
}

/* 二级确认对话框样式 */
.confirm-modal {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 90vw;
}

.confirm-modal .modal-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.confirm-modal .modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.confirm-modal .modal-content {
  margin-bottom: 24px;
  line-height: 1.6;
  color: #666;
}

.confirm-modal .modal-content p {
  margin: 0 0 12px 0;
}

.confirm-modal .modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    flex-direction: column;
    align-items: center;
  }

  .payment-qr {
    flex: none;
  }

  .purchase-modal {
    padding: 16px;
    width: 95vw;
  }
}
</style>
