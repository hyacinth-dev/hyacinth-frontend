<script setup lang="ts">
import { NDataTable, NButton, NSpace, NCard, NModal, NForm, NFormItem, NInput, NInputNumber, NSwitch, NText, NInputGroup, useMessage, FormRules, FormInst } from 'naive-ui'
import { h, ref, onMounted } from 'vue'
import { getVNetList, createVNet, updateVNet, deleteVNet, getVNetLimitInfo, type VNetData, type CreateVNetRequest, type UpdateVNetRequest, type VNetLimitInfo } from '../../api/vnet'
import TrafficChart from '../../components/TrafficChart.vue'

const message = useMessage()

const vnetworks = ref<VNetData[]>([])
const loading = ref(false)
const limitInfo = ref<VNetLimitInfo | null>(null)

// 统计展示相关状态
const expandedStats = ref<Record<string, boolean>>({})

// IP地址格式验证
const validateIpAddress = (ip: string): boolean => {
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipRegex.test(ip)
}

const columns = [
  { title: '网络名称', key: 'token' },
  { title: '网络密码', key: 'password' },
  { title: '备注', key: 'comment' },
  {
    title: '状态',
    key: 'enabled',
    render: (row: VNetData) => row.enabled ? '运行中' : '已停止'
  },
  { title: '在线连接数', key: 'clientsOnline' },
  { title: '最大连接数', key: 'clientsLimit' },
  {
    title: 'IP 范围（若开启 DHCP)', key: 'ipRange',
    render: (row: VNetData) => row.enableDHCP ? row.ipRange : '已禁用'
  },
  {
    title: '操作',
    key: 'actions',
    render: (row: VNetData) => h(NSpace, null, {
      default: () => [h(NButton, {
        size: 'small',
        type: 'primary',
        onClick: () => openEditModal(row)
      }, { default: () => '编辑' }),
      h(NButton, {
        size: 'small',
        type: expandedStats.value[row.vnetId] ? 'warning' : 'info',
        onClick: () => toggleStats(row.vnetId)
      }, { default: () => '统计' }),
      h(NButton, {
        size: 'small',
        type: 'error',
        onClick: () => handleDeleteNetwork(row.vnetId)
      }, { default: () => '删除' })
      ]
    })
  }
]

// 添加新虚拟网络相关的数据和函数
const showNetworkModal = ref(false)
const isEditing = ref(false)
const editingVnetId = ref('')
const networkFormRef = ref<FormInst | null>(null)
// 创建/更新虚拟网络按钮加载状态，防止重复点击
const networkOperationLoading = ref(false)

const networkForm = ref({
  comment: '',
  token: '',
  password: '',
  ipAddress: '',
  cidr: 24,
  enableDHCP: true,
  clientsLimit: 10,
  enabled: true
})

// 表单验证规则
const networkFormRules: FormRules = {
  token: {
    key: 'token',
    required: true,
    message: '请输入名称（3-50位字母、数字或下划线）',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      if (!value) return false
      const tokenRegex = /^[a-zA-Z0-9_]{3,50}$/
      return tokenRegex.test(value)
    }
  },
  password: {
    key: 'password',
    required: true,
    message: '请输入密码（3-50位字母、数字或下划线）',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      if (!value) return false
      const passwordRegex = /^[a-zA-Z0-9_]{3,50}$/
      return passwordRegex.test(value)
    }
  },
  comment: {
    message: '备注长度不能超过100个字符',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      if (!value) return true // 可选字段
      return value.length <= 100
    }
  },
  ipAddress: {
    required: true,
    message: '请输入有效的IP地址',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      if (!networkForm.value.enableDHCP) return true // DHCP关闭时不验证
      if (!value) return false
      return validateIpAddress(value)
    }
  },
  cidr: {
    required: true,
    message: 'CIDR值必须在8-30之间',
    trigger: ['blur', 'change'],
    validator: (_rule: any, value: number) => {
      if (!networkForm.value.enableDHCP) return true // DHCP关闭时不验证
      return value >= 8 && value <= 30
    }
  },
  clientsLimit: {
    required: true,
    message: '最大连接数必须大于0且不大于用户组限制',
    trigger: ['blur', 'change'],
    validator: (_rule: any, value: number) => {
      if (!value || value <= 0 || !Number.isSafeInteger(value)) return false
      return true
    }
  }
}

// 获取虚拟网络列表
const fetchVNetworks = async () => {
  try {
    loading.value = true
    const response = await getVNetList()
    vnetworks.value = response.data.vnets || []
  } catch (error) {
    console.error('获取虚拟网络列表失败:', error)
    message.error('获取虚拟网络列表失败')
  } finally {
    loading.value = false
  }
}

// 获取虚拟网络限制信息
const fetchVNetLimitInfo = async () => {
  try {
    const response = await getVNetLimitInfo()
    console.log('API Response:', response)
    console.log('Response Data:', response.data)
    limitInfo.value = response.data
  } catch (error) {
    console.error('获取虚拟网络限制信息失败:', error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchVNetworks()
  fetchVNetLimitInfo()
})

// 表单验证函数
const validateForm = (): boolean => {
  // 根据用户权限验证最大连接数
  if (limitInfo.value) {
    const maxAllowed = limitInfo.value.maxClientsLimitPerVNet
    if (maxAllowed !== 999999 && networkForm.value.clientsLimit > maxAllowed) {
      message.error(`最大连接数不能超过 ${maxAllowed}，请升级套餐以支持更多连接`)
      return false
    }
  }
  return true
}

const handleCreateNetwork = async () => {
  // 防止重复点击 - 立即设置加载状态
  if (networkOperationLoading.value) return
  networkOperationLoading.value = true

  try {
    // 表单验证
    await networkFormRef.value?.validate()
  }
  catch (error) {
    console.error('表单验证失败:', error)
    message.error('请检查表单输入是否正确')
    networkOperationLoading.value = false // 验证失败时重置状态
    return
  }

  try {
    if (!validateForm()) {
      networkOperationLoading.value = false // validateForm失败时重置状态
      return
    }

    // 合并IP地址和CIDR，当DHCP关闭时使用默认值
    const ipRange = networkForm.value.enableDHCP
      ? `${networkForm.value.ipAddress}/${networkForm.value.cidr}`
      : '192.168.100.0/24';
    const requestData: CreateVNetRequest | UpdateVNetRequest = {
      comment: networkForm.value.comment,
      token: networkForm.value.token,
      password: networkForm.value.password,
      ipRange: ipRange,
      enableDHCP: networkForm.value.enableDHCP,
      clientsLimit: networkForm.value.clientsLimit,
      enabled: networkForm.value.enabled
    }

    if (isEditing.value) {
      // 更新现有虚拟网络
      await updateVNet(editingVnetId.value, requestData)
      message.success('更新虚拟网络成功，服务器可能需要一段时间来应用更改')
      await fetchVNetworks() // 重新获取列表
      await fetchVNetLimitInfo() // 重新获取限制信息
    } else {
      // 创建新的虚拟网络
      await createVNet(requestData)
      message.success('创建虚拟网络成功')
      await fetchVNetworks() // 重新获取列表
      await fetchVNetLimitInfo() // 重新获取限制信息
    }
    showNetworkModal.value = false
  } catch (error) {
    console.error('操作虚拟网络失败:', error)
    message.error('操作失败：' + (error as any).response?.data?.message || '未知错误')
  } finally {
    // 延迟恢复按钮状态，防止重复点击
    setTimeout(() => {
      networkOperationLoading.value = false
    }, 1000)
  }
}

const openNetworkModal = () => {  // 重置表单
  isEditing.value = false;
  editingVnetId.value = '';

  // 根据用户权限设置默认最大连接数
  const defaultClientsLimit = limitInfo.value?.maxClientsLimitPerVNet || 10;

  networkForm.value = {
    comment: '',
    token: '',
    password: '',
    ipAddress: '192.168.100.0',
    cidr: 24,
    enableDHCP: true,
    clientsLimit: defaultClientsLimit,
    enabled: true
  }
  showNetworkModal.value = true
}

const openEditModal = (vnet: VNetData) => {
  isEditing.value = true
  editingVnetId.value = vnet.vnetId

  // 解析IP范围
  const [ipAddress, cidrStr] = vnet.ipRange.split('/')
  const cidr = parseInt(cidrStr) || 24
  networkForm.value = {
    comment: vnet.comment,
    token: vnet.token,
    password: vnet.password,
    ipAddress: ipAddress,
    cidr: cidr,
    enableDHCP: vnet.enableDHCP,
    clientsLimit: vnet.clientsLimit,
    enabled: vnet.enabled
  }
  showNetworkModal.value = true
}

const handleDeleteNetwork = async (vnetId: string) => {
  try {
    await deleteVNet(vnetId)
    message.success('删除虚拟网络成功')
    await fetchVNetworks() // 重新获取列表
    await fetchVNetLimitInfo() // 重新获取限制信息
  } catch (error) {
    console.error('删除虚拟网络失败:', error)
    message.error('删除失败')
  }
}

// 切换统计展示状态
const toggleStats = (vnetId: string) => {
  // 如果当前vnet已经展开，则关闭它
  if (expandedStats.value[vnetId]) {
    expandedStats.value[vnetId] = false
  } else {
    // 如果当前vnet未展开，先关闭所有其他已展开的统计，然后展开当前的
    // 重置所有展开状态
    Object.keys(expandedStats.value).forEach(key => {
      expandedStats.value[key] = false
    })
    // 展开当前虚拟网络的统计
    expandedStats.value[vnetId] = true
  }
}

// 生成随机字符串
const generateRandomToken = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  networkForm.value.token = result

  await networkFormRef.value?.validate((_) => { }, (rule) => { return rule?.key === 'token' })
}

// 生成随机密码
const generateRandomPassword = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  networkForm.value.password = result

  await networkFormRef.value?.validate((_) => { }, (rule) => { return rule?.key === 'password' })
}
</script>

<template>
  <div class="tunnels">
    <div class="tunnels-header">
      <h2>虚拟网络</h2>
      <div>
        <!-- 显示虚拟网络限制信息 -->
        <NText v-if="limitInfo" style="margin-right: 16px;">
          虚拟网络使用情况: {{ limitInfo.currentCount }} / {{ limitInfo.maxLimit }}
        </NText>
        <NButton type="primary" @click="openNetworkModal">新建虚拟网络</NButton>
      </div>
    </div>
    <NCard>
      <NDataTable :columns="columns" :data="vnetworks" :bordered="false" :loading="loading" :pagination="false" />

      <!-- 虚拟网络统计展示 -->
      <template v-for="vnet in vnetworks" :key="vnet.vnetId">
        <div v-if="expandedStats[vnet.vnetId]" class="vnet-stats">
          <TrafficChart :vnet-id="vnet.vnetId" :title="`${vnet.token} 流量统计`" height="250px" />
        </div>
      </template>
    </NCard>

    <!-- 新建/编辑虚拟网络配置窗口 -->
    <NModal v-model:show="showNetworkModal" :title="isEditing ? '编辑虚拟网络' : '新建虚拟网络'" preset="dialog"
      :mask-closable="false">
      <NForm ref="networkFormRef" :model="networkForm" :rules="networkFormRules" label-placement="left"
        label-width="100px">
        <NFormItem label="网络名称" path="token" required>
          <NInputGroup>
            <NInput v-model:value="networkForm.token" maxlength="50" show-count clearable placeholder="需唯一且不与他人重复" />
            <NButton @click="generateRandomToken">随机</NButton>
          </NInputGroup>
        </NFormItem>
        <NFormItem label="网络密码" path="password" required>
          <NInputGroup>
            <NInput v-model:value="networkForm.password" maxlength="50" show-count clearable placeholder="请输入密码" />
            <NButton @click="generateRandomPassword">随机</NButton>
          </NInputGroup>
        </NFormItem>
        <NFormItem label="备注" path="comment">
          <NInput v-model:value="networkForm.comment" placeholder="请输入备注（可选）" maxlength="100" show-count clearable />
        </NFormItem>
        <NFormItem label="开启DHCP">
          <NSwitch v-model:value="networkForm.enableDHCP" />
        </NFormItem>
        <NFormItem :label="'分配IP段'" path="ipAddress" :required="networkForm.enableDHCP">
          <NSpace align="center" :wrap="false">
            <NInput v-model:value="networkForm.ipAddress" :disabled="!networkForm.enableDHCP"
              placeholder="例如: 192.168.1.0" style="flex: 1" />
            <NText>/</NText>
            <NInputNumber v-model:value="networkForm.cidr" :disabled="!networkForm.enableDHCP" :min="8" :max="30"
              :step="1" style="width: 80px" />
          </NSpace>
        </NFormItem>
        <NFormItem label="最大连接数" path="clientsLimit" required>
          <NInputNumber v-model:value="networkForm.clientsLimit" />
        </NFormItem>
        <NFormItem label="启用状态">
          <NSwitch v-model:value="networkForm.enabled" />
        </NFormItem>
      </NForm> <template #action>
        <NButton type="primary" :loading="networkOperationLoading" @click="handleCreateNetwork">
          {{ networkOperationLoading ? (isEditing ? '更新中...' : '创建中...') : (isEditing ? '更新' : '确认') }}
        </NButton>
        <NButton class="ml-4" @click="showNetworkModal = false">取消</NButton>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.tunnels {
  padding: 24px;
}

.tunnels-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.tunnels-header h2 {
  font-size: 20px;
  margin: 0;
}

.ml-4 {
  margin-left: 16px;
}

.vnet-stats {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #e0e0e6;
  border-radius: 6px;
  background-color: #fafafa;
}
</style>