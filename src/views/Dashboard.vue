<script setup lang="ts">
import { NCard, NGrid, NGridItem, NStatistic, NSpace, NRadioGroup, NRadio, NDataTable } from 'naive-ui'
import { ref, computed, watch, onMounted } from 'vue'
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

const stats = [
	{ label: '活跃隧道', value: 5 },
	{ label: '总流量', value: '1.2GB' },
	{ label: '在线设备', value: 3 },
	{ label: '账户余额', value: '￥100.00' }
]

const timeRange = ref('')
let trafficData: { date: string, value: number }[] = []

const columns = [
	{ title: '时间', key: 'date' },
	{ title: '流量 (GiB)', key: 'value' }
]

const chartOption = ref({
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'cross',
			label: {
				backgroundColor: '#6a7985'
			}
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
	},
	yAxis: {
		type: 'value',
		name: 'GiB'
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
	chartOption.value.xAxis.data = trafficData.map(item => item.date)
	chartOption.value.series[0].data = trafficData.map(item => item.value)
}

watch(timeRange, async (newRange) => {
	let usage = await getUsage({ range: newRange })
	if (usage.code !== 0) {
		return
	}
	console.log(usage)
	trafficData = usage.data.data.map((item: UsageData) =>
	({
		date: item.date,
		value: item.usage
	}))
	updateChart()
})
onMounted(() => timeRange.value = '7d')
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

		<NSpace vertical class="traffic-chart">
			<div class="chart-header">
				<h3>流量统计</h3>
				<NRadioGroup v-model:value="timeRange" size="small">
					<NRadio value="24h">24时</NRadio>
					<NRadio value="7d">7日</NRadio>
					<NRadio value="30d">30日</NRadio>
					<NRadio value="month">月</NRadio>
				</NRadioGroup>
			</div>
			<NCard>
				<div class="chart-container">
					<v-chart class="chart" :option="chartOption" autoresize />
				</div>
				<!-- <NDataTable :columns="columns" :data="trafficData" :bordered="false" :pagination="false" /> -->
			</NCard>
		</NSpace>
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
	height: 300px;
	margin-bottom: 16px;
}

.chart {
	width: 100%;
	height: 100%;
}
</style>