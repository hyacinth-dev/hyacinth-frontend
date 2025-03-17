<script setup lang="ts">
import { NDataTable, NButton, NSpace, NCard } from 'naive-ui'
import { h, ref } from 'vue'

const tunnels = ref([
  {
    id: 1,
    name: '隧道1',
    type: 'TCP',
    localPort: 8080,
    remotePort: 80,
    status: '运行中',
    traffic: '1.2GB'
  },
  {
    id: 2,
    name: '隧道2',
    type: 'HTTP',
    localPort: 3000,
    remotePort: 8000,
    status: '已停止',
    traffic: '500MB'
  }
])

const columns = [
  { title: '名称', key: 'name' },
  { title: '类型', key: 'type' },
  { title: '本地端口', key: 'localPort' },
  { title: '远程端口', key: 'remotePort' },
  { title: '状态', key: 'status' },
  { title: '流量', key: 'traffic' },
  {
    title: '操作',
    key: 'actions',
    render: (row: any) => h(NSpace, null, {
      default: () => [
        h(NButton, { size: 'small', type: 'primary' }, { default: () => '编辑' }),
        h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' })
      ]
    })
  }
]
</script>

<template>
  <div class="tunnels">
    <div class="tunnels-header">
      <h2>隧道列表</h2>
      <NButton type="primary">新建隧道</NButton>
    </div>
    <NCard>
      <NDataTable :columns="columns" :data="tunnels" :bordered="false" />
    </NCard>
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
</style>