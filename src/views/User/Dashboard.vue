<script setup lang="ts">
import { NCard, NGrid, NGridItem, NStatistic } from 'naive-ui'
import { ref, onMounted } from 'vue'
import { getUserInfo, UserInfoResponseData } from '../../api/auth'
import TrafficChart from '../../components/TrafficChart.vue'

const userInfo = ref<UserInfoResponseData | null>(null)
const stats = ref([
	{ label: '活跃隧道', value: 0 },
	{ label: '可用流量', value: '加载中...' },
	{ label: '在线设备', value: 0 },
	{ label: '用户组', value: '加载中...' }
])

// 格式化流量显示，使用二进制单位 (KiB/MiB/GiB/TiB)
const formatTrafficFromString = (trafficStr: string): string => {
	// 解析后端返回的格式化字符串，如 "1.23 GB" 或 "2.45 TB"
	const match = trafficStr.match(/^([\d.]+)\s*(GB|TB|MB|KB)$/)
	if (!match) {
		return trafficStr // 如果无法解析，返回原字符串
	}
	
	const value = parseFloat(match[1])
	const unit = match[2]
	
	// 将值转换为字节数（注意：后端实际使用的是二进制计算但显示为十进制单位）
	let bytes: number
	switch (unit) {
		case 'TB':
			bytes = value * 1024 * 1024 * 1024 * 1024 // TiB
			break
		case 'GB':
			bytes = value * 1024 * 1024 * 1024 // GiB
			break
		case 'MB':
			bytes = value * 1024 * 1024 // MiB
			break
		case 'KB':
			bytes = value * 1024 // KiB
			break
		default:
			return trafficStr
	}
	
	// 重新格式化为适合的单位
	if (bytes >= 1024 * 1024 * 1024 * 1024) {
		return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TiB`
	} else if (bytes >= 1024 * 1024 * 1024) {
		return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GiB`
	} else if (bytes >= 1024 * 1024) {
		return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`
	} else if (bytes >= 1024) {
		return `${(bytes / 1024).toFixed(2)} KiB`
	} else {
		return `${bytes.toFixed(0)} Bytes`
	}
}

const fetchUserInfo = async () => {
	try {
		const response = await getUserInfo()
		if (response.code === 0) {
			userInfo.value = response.data
			
			// 处理用户组显示：如果是VIP用户且有到期时间，则显示到期时间
			let userGroupDisplay = response.data.userGroupName
			if (response.data.isVip && response.data.privilegeExpiry) {
				const expiryDate = new Date(response.data.privilegeExpiry)
				const formattedDate = expiryDate.toLocaleDateString('zh-CN', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit'
				})
				userGroupDisplay = `${response.data.userGroupName}（${formattedDate}到期）`
			}
			// 更新stats数据
			stats.value = [
				{ label: '活跃隧道', value: response.data.activeTunnels },
				{ label: '可用流量', value: formatTrafficFromString(response.data.availableTraffic) },
				{ label: '在线设备', value: response.data.onlineDevices },
				{ label: '用户组', value: userGroupDisplay }
			]
		}
	} catch (error) {
		console.error('获取用户信息失败:', error)
	}
}

onMounted(() => {
	fetchUserInfo()
})
</script>

<template>
	<div class="dashboard">
		<h2>仪表盘</h2>
		<NGrid :cols="4" :x-gap="12" :y-gap="8">
			<NGridItem v-for="stat in stats" :key="stat.label">
				<NCard>
					<NStatistic :label="stat.label" :value="stat.value" />
				</NCard>
			</NGridItem>
		</NGrid>

		<!-- 使用新的流量统计组件 -->
		<TrafficChart title="总流量统计" />
	</div>
</template>

<style scoped>
.dashboard {
	padding: 24px;
}

.dashboard h2 {
	margin-bottom: 24px;
	font-size: 20px;
}
</style>