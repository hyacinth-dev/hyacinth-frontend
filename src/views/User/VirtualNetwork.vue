<script setup lang="ts">
import { NDataTable, NButton, NSpace, NCard, NModal, NForm, NFormItem, NInput, NSwitch } from 'naive-ui'
import { h, ref } from 'vue'

const vnetworks = ref([
  {
    id: 1,
    name: '隧道1',
    online: 5,
    status: '运行中',
    traffic: '1.2GB'
  },
  {
    id: 2,
    name: '隧道2',
    online: 0,
    status: '已停止',
    traffic: '500MB'
  }
])

const columns = [
  { title: '名称', key: 'name' },
  { title: '状态', key: 'status' },
  { title: '连接数', key: 'online' },
  { title: '流量', key: 'traffic' },
  {
    title: '操作',
    key: 'actions',
    render: () => h(NSpace, null, {
      default: () => [
        h(NButton, { size: 'small', type: 'primary' }, { default: () => '编辑' }),
        h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' })
      ]
    })
  }
]

// 添加新虚拟网络相关的数据和函数
const showNetworkModal = ref(false)
const networkForm = ref({
  name: '',
  roomId: '',
  ipRange: '',
  enableDhcp: true
})

const handleCreateNetwork = () => {
  // 实现创建虚拟网络的逻辑
  console.log('创建新的虚拟网络:', networkForm.value)
  showNetworkModal.value = false
}

const openNetworkModal = () => {
  // 重置表单
  networkForm.value = {
    name: '',
    roomId: '',
    ipRange: '',
    enableDhcp: true
  }
  showNetworkModal.value = true
}
</script>

<template>
  <div class="tunnels">
    <div class="tunnels-header">
      <h2>隧道列表</h2>
      <NButton type="primary" @click="openNetworkModal">新建虚拟网络</NButton>
    </div>
    <NCard>
      <NDataTable :columns="columns" :data="vnetworks" :bordered="false" />
    </NCard>

    <!-- 新建虚拟网络配置窗口 -->
    <NModal v-model:show="showNetworkModal" title="新建虚拟网络" preset="dialog" :mask-closable="false">
      <NForm :model="networkForm" label-placement="left" label-width="120px">
        <NFormItem label="网络名称" required>
          <NInput v-model:value="networkForm.name" placeholder="请输入网络名称" />
        </NFormItem>
        <NFormItem label="网络房间号" required>
          <NInput v-model:value="networkForm.roomId" placeholder="请输入网络房间号" />
        </NFormItem>
        <NFormItem label="分配IP段" required>
          <NInput v-model:value="networkForm.ipRange" placeholder="例如: 192.168.1.0/24" />
        </NFormItem>
        <NFormItem label="开启DHCP">
          <NSwitch v-model:value="networkForm.enableDhcp" />
        </NFormItem>
      </NForm>
      <template #action>
        <NButton type="primary" @click="handleCreateNetwork">确认</NButton>
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
</style>