/**
 * TrafficChart.vue 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TrafficChart from '../../components/TrafficChart.vue'

// Mock ECharts 和 vue-echarts
vi.mock('echarts/core', () => ({
	use: vi.fn(),
}))

vi.mock('echarts/renderers', () => ({
	CanvasRenderer: {}
}))

vi.mock('echarts/charts', () => ({
	LineChart: {}
}))

vi.mock('echarts/components', () => ({
	GridComponent: {},
	TooltipComponent: {},
	LegendComponent: {}
}))

vi.mock('vue-echarts', () => ({
	default: {
		name: 'VChart',
		template: '<div class="v-chart"></div>',
		props: ['option', 'autoresize'],
		setup(props: any) {
			return { props }
		}
	}
}))

// Mock Naive UI 组件
vi.mock('naive-ui', () => ({
	NSpace: {
		name: 'NSpace',
		template: '<div class="n-space" :class="{ vertical: vertical }"><slot /></div>',
		props: ['vertical']
	}, NRadioGroup: {
		name: 'NRadioGroup',
		template: '<div class="n-radio-group" @click="handleClick"><slot /></div>',
		props: ['value', 'size'],
		emits: ['update:value'],
		setup(props: any, { emit }: any) {
			const handleClick = (event: Event) => {
				const target = event.target as HTMLElement
				const radio = target.closest('[data-value]') as HTMLElement
				if (radio) {
					const value = radio.getAttribute('data-value')
					if (value) {
						emit('update:value', value)
					}
				}
			}
			return { handleClick }
		}
	},
	NRadio: {
		name: 'NRadio',
		template: '<div class="n-radio" :data-value="value" @click="$emit(\'click\')"><slot /></div>',
		props: ['value'],
		emits: ['click']
	},
	NCard: {
		name: 'NCard',
		template: '<div class="n-card"><slot /></div>'
	}
}))

// Mock service API
vi.mock('../../api/service', () => ({
	getUsage: vi.fn()
}))

import { getUsage } from '../../api/service'

describe('TrafficChart.vue', () => {
	beforeEach(() => {
		// 默认提供成功的 mock 返回值
		vi.mocked(getUsage).mockResolvedValue({
			code: 0,
			message: 'success',
			data: {
				usages: [
					{ date: '2024-01-01', usage: 1024 },
					{ date: '2024-01-02', usage: 2048 },
					{ date: '2024-01-03', usage: 4096 },
					{ date: '2024-01-04', usage: 8192 },
					{ date: '2024-01-05', usage: 16384 }
				]
			}
		})

		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	describe('组件渲染', () => {
		it('应该正确渲染组件', () => {
			const wrapper = mount(TrafficChart)

			expect(wrapper.exists()).toBe(true)
			expect(wrapper.find('.traffic-chart').exists()).toBe(true)
		})

		it('应该显示默认标题', () => {
			const wrapper = mount(TrafficChart)

			const title = wrapper.find('.chart-header h3')
			expect(title.exists()).toBe(true)
			expect(title.text()).toBe('流量统计')
		})

		it('应该显示自定义标题', () => {
			const customTitle = '网络流量分析'
			const wrapper = mount(TrafficChart, {
				props: {
					title: customTitle
				}
			})

			const title = wrapper.find('.chart-header h3')
			expect(title.text()).toBe(customTitle)
		})

		it('应该包含时间范围选择器', () => {
			const wrapper = mount(TrafficChart)

			const radioGroup = wrapper.findComponent({ name: 'NRadioGroup' })
			expect(radioGroup.exists()).toBe(true)

			const radios = wrapper.findAllComponents({ name: 'NRadio' })
			expect(radios.length).toBe(4)

			// 验证时间范围选项
			const radioValues = radios.map(radio => radio.props('value'))
			expect(radioValues).toEqual(['24h', '7d', '30d', 'month'])

			const radioTexts = radios.map(radio => radio.text())
			expect(radioTexts).toEqual(['24时', '7日', '30日', '月'])
		})

		it('应该包含图表容器', () => {
			const wrapper = mount(TrafficChart)

			const chartContainer = wrapper.find('.chart-container')
			expect(chartContainer.exists()).toBe(true)

			const vChart = wrapper.findComponent({ name: 'VChart' })
			expect(vChart.exists()).toBe(true)
		})

		it('应该设置自定义高度', () => {
			const customHeight = '500px'
			const wrapper = mount(TrafficChart, {
				props: {
					height: customHeight
				}
			})

			const chartContainer = wrapper.find('.chart-container')
			expect(chartContainer.attributes('style')).toContain(`height: ${customHeight}`)
		})
	})

	describe('数据获取', () => {
		it('组件挂载时应该获取流量数据', async () => {
			mount(TrafficChart)
			await nextTick()

			expect(getUsage).toHaveBeenCalledWith({ range: '7d' })
		})

		it('应该根据 vnetId 参数获取数据', async () => {
			const vnetId = 'vnet-123'
			mount(TrafficChart, {
				props: {
					vnetId
				}
			})
			await nextTick()

			expect(getUsage).toHaveBeenCalledWith({
				range: '7d',
				vnetId
			})
		})

		it('获取数据失败时应该正常处理', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
			vi.mocked(getUsage).mockRejectedValue(new Error('Network error'))

			mount(TrafficChart)
			await nextTick()

			expect(consoleSpy).toHaveBeenCalledWith('获取流量数据失败:', expect.any(Error))
			consoleSpy.mockRestore()
		})

		it('API 返回错误代码时应该正常处理', async () => {
			vi.mocked(getUsage).mockResolvedValue({
				code: 1,
				message: 'error',
				data: { usages: [] }
			})

			const wrapper = mount(TrafficChart)
			await nextTick()

			// 应该不会抛出错误，组件应该正常渲染
			expect(wrapper.exists()).toBe(true)
		})
	})

	describe('时间范围切换', () => {
		it('切换时间范围时应该重新获取数据', async () => {
			const wrapper = mount(TrafficChart)
			await nextTick()

			// 清除初始调用
			vi.clearAllMocks()

			// 模拟点击30日选项
			const radios = wrapper.findAllComponents({ name: 'NRadio' })
			const thirtyDayRadio = radios.find(radio => radio.props('value') === '30d')

			if (thirtyDayRadio) {
				await thirtyDayRadio.trigger('click')
				await nextTick()

				expect(getUsage).toHaveBeenCalledWith({ range: '30d' })
			}
		})

		it('vnetId 变化时应该重新获取数据', async () => {
			const wrapper = mount(TrafficChart, {
				props: { vnetId: 'vnet-1' }
			})
			await nextTick()

			// 清除初始调用
			vi.clearAllMocks()

			// 更新 vnetId
			await wrapper.setProps({ vnetId: 'vnet-2' })
			await nextTick()

			expect(getUsage).toHaveBeenCalledWith({
				range: '7d',
				vnetId: 'vnet-2'
			})
		})
	})

	describe('数据格式化', () => {
		it('应该正确格式化字节数据 - Bytes', async () => {
			vi.mocked(getUsage).mockResolvedValue({
				code: 0,
				message: 'success',
				data: {
					usages: [
						{ date: '2024-01-01', usage: 100 },
						{ date: '2024-01-02', usage: 200 }
					]
				}
			})

			const wrapper = mount(TrafficChart)
			await nextTick()

			const vChart = wrapper.findComponent({ name: 'VChart' })
			const option = vChart.props('option')

			expect(option.yAxis.name).toBe('Bytes')
			expect(option.series[0].data).toEqual([100, 200])
		})

		it('应该正确格式化字节数据 - KiB', async () => {
			vi.mocked(getUsage).mockResolvedValue({
				code: 0,
				message: 'success',
				data: {
					usages: [
						{ date: '2024-01-01', usage: 1024 },
						{ date: '2024-01-02', usage: 2048 }
					]
				}
			})

			const wrapper = mount(TrafficChart)
			await nextTick()

			const vChart = wrapper.findComponent({ name: 'VChart' })
			const option = vChart.props('option')

			expect(option.yAxis.name).toBe('KiB')
			expect(option.series[0].data).toEqual([1, 2])
		})

		it('应该正确格式化字节数据 - MiB', async () => {
			vi.mocked(getUsage).mockResolvedValue({
				code: 0,
				message: 'success',
				data: {
					usages: [
						{ date: '2024-01-01', usage: 1024 * 1024 },
						{ date: '2024-01-02', usage: 2 * 1024 * 1024 }
					]
				}
			})

			const wrapper = mount(TrafficChart)
			await nextTick()

			const vChart = wrapper.findComponent({ name: 'VChart' })
			const option = vChart.props('option')

			expect(option.yAxis.name).toBe('MiB')
			expect(option.series[0].data).toEqual([1, 2])
		})

		it('应该正确格式化字节数据 - GiB', async () => {
			vi.mocked(getUsage).mockResolvedValue({
				code: 0,
				message: 'success',
				data: {
					usages: [
						{ date: '2024-01-01', usage: 1024 * 1024 * 1024 },
						{ date: '2024-01-02', usage: 2 * 1024 * 1024 * 1024 }
					]
				}
			})

			const wrapper = mount(TrafficChart)
			await nextTick()

			const vChart = wrapper.findComponent({ name: 'VChart' })
			const option = vChart.props('option')

			expect(option.yAxis.name).toBe('GiB')
			expect(option.series[0].data).toEqual([1, 2])
		})

		it('应该处理空数据', async () => {
			vi.mocked(getUsage).mockResolvedValue({
				code: 0,
				message: 'success',
				data: {
					usages: []
				}
			})

			const wrapper = mount(TrafficChart)
			await nextTick()

			const vChart = wrapper.findComponent({ name: 'VChart' })
			const option = vChart.props('option')

			expect(option.xAxis.data).toEqual([])
			expect(option.series[0].data).toEqual([])
		})
	})

	describe('图表配置', () => {
		it('应该有正确的图表配置', async () => {
			const wrapper = mount(TrafficChart)
			await nextTick()

			const vChart = wrapper.findComponent({ name: 'VChart' })
			const option = vChart.props('option')

			// 验证基本配置
			expect(option.tooltip).toBeDefined()
			expect(option.grid).toBeDefined()
			expect(option.xAxis).toBeDefined()
			expect(option.yAxis).toBeDefined()
			expect(option.series).toBeDefined()

			// 验证系列配置
			const series = option.series[0]
			expect(series.name).toBe('流量')
			expect(series.type).toBe('line')
			expect(series.smooth).toBe(true)
			expect(series.showSymbol).toBe(false)
			expect(series.itemStyle.color).toBe('#18a058')
			expect(series.areaStyle.color).toBe('#18a058')
			expect(series.areaStyle.opacity).toBe(0.1)
		})

		it('应该设置正确的日期数据', async () => {
			const wrapper = mount(TrafficChart)
			await nextTick()

			const vChart = wrapper.findComponent({ name: 'VChart' })
			const option = vChart.props('option')

			expect(option.xAxis.data).toEqual([
				'2024-01-01',
				'2024-01-02',
				'2024-01-03',
				'2024-01-04',
				'2024-01-05'
			])
		})
	})

	describe('样式类', () => {
		it('应该应用正确的样式类', () => {
			const wrapper = mount(TrafficChart)

			expect(wrapper.find('.traffic-chart').exists()).toBe(true)
			expect(wrapper.find('.chart-header').exists()).toBe(true)
			expect(wrapper.find('.chart-container').exists()).toBe(true)
		})
	})

	describe('Props 验证', () => {
		it('应该接受所有可选的 props', () => {
			const props = {
				vnetId: 'vnet-123',
				title: '自定义标题',
				height: '400px'
			}

			const wrapper = mount(TrafficChart, { props })

			expect(wrapper.find('h3').text()).toBe(props.title)
			expect(wrapper.find('.chart-container').attributes('style')).toContain(`height: ${props.height}`)
		})

		it('应该使用默认值', () => {
			const wrapper = mount(TrafficChart)

			expect(wrapper.find('h3').text()).toBe('流量统计')
			expect(wrapper.find('.chart-container').attributes('style')).toContain('height: 300px')
		})
	})
})
