<script setup lang="ts">
import { NSpace, NRadioGroup, NRadio, NCard } from 'naive-ui'
import { ref, watch, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { getUsage, UsageData } from '../api/service'

use([
	CanvasRenderer,
	LineChart,
	GridComponent,
	TooltipComponent,
	LegendComponent
])

interface Props {
	vnetId?: string  // 虚拟网络ID，可选，空值表示所有虚拟网络
	title?: string   // 图表标题，默认为"流量统计"
	height?: string  // 图表高度，默认为"300px"
}

const props = withDefaults(defineProps<Props>(), {
	vnetId: '',
	title: '流量统计',
	height: '300px'
})

const timeRange = ref('7d')
let trafficData: { date: string, value: number }[] = []
let currentUnit = ref('Bytes')

// 格式化字节数据，返回格式化后的数据和单位
const formatBytes = (bytes: number[]): { values: number[], unit: string } => {
	if (bytes.length === 0) return { values: [], unit: 'Bytes' }
	
	const maxBytes = Math.max(...bytes)
	
	if (maxBytes >= 1024 * 1024 * 1024) {
		// GiB
		return {
			values: bytes.map(b => Number((b / (1024 * 1024 * 1024)).toFixed(2))),
			unit: 'GiB'
		}
	} else if (maxBytes >= 1024 * 1024) {
		// MiB
		return {
			values: bytes.map(b => Number((b / (1024 * 1024)).toFixed(2))),
			unit: 'MiB'
		}
	} else if (maxBytes >= 1024) {
		// KiB
		return {
			values: bytes.map(b => Number((b / 1024).toFixed(2))),
			unit: 'KiB'
		}
	} else {
		// Bytes
		return {
			values: bytes,
			unit: 'Bytes'
		}
	}
}

const chartOption = ref({
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'cross',
			label: {
				backgroundColor: '#6a7985'
			}
		},
		formatter: (params: any) => {
			const param = params[0]
			return `${param.axisValue}<br/>
			<span style="color: ${param.color};">●</span> ${param.seriesName} <strong>${param.value} ${currentUnit.value}</strong>`
		}
	},
	grid: {
		left: '3%',
		right: '4%',
		bottom: '3%',
		containLabel: true
	},
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: [] as string[],
	},	yAxis: {
		type: 'value',
		name: currentUnit.value
	},
	series: [
		{
			name: '流量',
			type: 'line',
			data: [] as number[],
			smooth: true,
			showSymbol: false,
			itemStyle: {
				color: '#18a058'
			},
			areaStyle: {
				color: '#18a058',
				opacity: 0.1
			}
		}
	]
})

const updateChart = () => {
	const rawValues = trafficData.map(item => item.value)
	const formatted = formatBytes(rawValues)
	
	currentUnit.value = formatted.unit
	chartOption.value.xAxis.data = trafficData.map(item => item.date)
	chartOption.value.series[0].data = formatted.values
	chartOption.value.yAxis.name = formatted.unit
}

const fetchUsageData = async (newRange: string) => {
	try {
		const params: any = { range: newRange }
		if (props.vnetId) {
			params.vnetId = props.vnetId
		}
		
		const usage = await getUsage(params)
		if (usage.code !== 0) {
			return
		}
		
		trafficData = usage.data.usages.map((item: UsageData) => ({
			date: item.date,
			value: item.usage
		}))
		updateChart()
	} catch (error) {
		console.error('获取流量数据失败:', error)
	}
}

watch(timeRange, fetchUsageData)

// 监听 vnetId 变化，重新获取数据
watch(() => props.vnetId, () => {
	fetchUsageData(timeRange.value)
})

onMounted(() => {
	fetchUsageData(timeRange.value)
})
</script>

<template>
	<NSpace vertical class="traffic-chart">
		<div class="chart-header">
			<h3>{{ title }}</h3>
			<NRadioGroup v-model:value="timeRange" size="small">
				<NRadio value="24h">24时</NRadio>
				<NRadio value="7d">7日</NRadio>
				<NRadio value="30d">30日</NRadio>
				<NRadio value="month">月</NRadio>
			</NRadioGroup>
		</div>
		<NCard>
			<div class="chart-container" :style="{ height: height }">
				<v-chart class="chart" :option="chartOption" autoresize />
			</div>
		</NCard>
	</NSpace>
</template>

<style scoped>
.traffic-chart {
	margin-top: 24px;
}

.chart-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.chart-header h3 {
	margin: 0;
	font-size: 16px;
}

.chart-container {
	width: 100%;
	margin-bottom: 16px;
}

.chart {
	width: 100%;
	height: 100%;
}
</style>
