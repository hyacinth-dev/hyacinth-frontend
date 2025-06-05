/**
 * Dashboard.vue 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Dashboard from '../../../views/User/Dashboard.vue'
import { getUserInfo } from '../../../api/auth'
import type { ApiResult } from '../../../api/api'
import type { UserInfoResponseData } from '../../../api/auth'

// Mock API 模块
vi.mock('../../../api/auth', () => ({
	getUserInfo: vi.fn()
}))

// Mock TrafficChart 组件
vi.mock('../../../components/TrafficChart.vue', () => ({
	default: {
		name: 'TrafficChart',
		template: '<div class="traffic-chart-mock">{{ title }}</div>',
		props: ['title']
	}
}))

// Mock Naive UI 组件
vi.mock('naive-ui', () => ({
	NCard: {
		name: 'NCard',
		template: '<div class="n-card"><slot /></div>'
	},
	NGrid: {
		name: 'NGrid',
		template: '<div class="n-grid"><slot /></div>',
		props: ['cols', 'x-gap', 'y-gap']
	},
	NGridItem: {
		name: 'NGridItem',
		template: '<div class="n-grid-item"><slot /></div>'
	},
	NStatistic: {
		name: 'NStatistic',
		template: '<div class="n-statistic"><span class="label">{{ label }}</span><span class="value">{{ value }}</span></div>',
		props: ['label', 'value']
	}
}))

describe('Dashboard.vue', () => {
	const mockGetUserInfo = vi.mocked(getUserInfo)

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})
	const createMockUserInfo = (overrides?: Partial<UserInfoResponseData>): UserInfoResponseData => ({
		userId: 'user-123',
		username: 'testuser',
		email: 'test@example.com',
		userGroup: 1,
		userGroupName: '免费用户',
		privilegeExpiry: null,
		isVip: false,
		activeTunnels: 3,
		availableTraffic: '10.5 GB',
		onlineDevices: 2,
		...overrides
	})

	const createMockApiResponse = (data: UserInfoResponseData): ApiResult<UserInfoResponseData> => ({
		code: 0,
		message: 'success',
		data
	})

	describe('组件挂载', () => {
		it('应该正确渲染组件', () => {
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(createMockUserInfo()))

			const wrapper = mount(Dashboard)

			expect(wrapper.find('h2').text()).toBe('仪表盘')
			expect(wrapper.find('.dashboard').exists()).toBe(true)
			expect(wrapper.find('.n-grid').exists()).toBe(true)
			expect(wrapper.find('.traffic-chart-mock').exists()).toBe(true)
		})

		it('应该显示初始状态的统计数据', () => {
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(createMockUserInfo()))

			const wrapper = mount(Dashboard)

			const statistics = wrapper.findAll('.n-statistic')
			expect(statistics).toHaveLength(4)

			// 检查初始状态
			expect(statistics[0].text()).toContain('活跃隧道')
			expect(statistics[0].text()).toContain('0')
			expect(statistics[1].text()).toContain('可用流量')
			expect(statistics[1].text()).toContain('加载中...')
			expect(statistics[2].text()).toContain('在线设备')
			expect(statistics[2].text()).toContain('0')
			expect(statistics[3].text()).toContain('用户组')
			expect(statistics[3].text()).toContain('加载中...')
		})
	})

	describe('用户信息获取', () => {
		it('应该在组件挂载时调用getUserInfo API', async () => {
			const mockUserInfo = createMockUserInfo()
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			mount(Dashboard)

			expect(mockGetUserInfo).toHaveBeenCalledTimes(1)
		})

		it('应该正确显示用户信息', async () => {
			const mockUserInfo = createMockUserInfo({
				activeTunnels: 5,
				availableTraffic: '25.3 GB',
				onlineDevices: 3,
				userGroupName: '高级用户'
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 0))
			await nextTick()

			const statistics = wrapper.findAll('.n-statistic')
			expect(statistics[0].text()).toContain('5')
			expect(statistics[1].text()).toContain('25.30 GiB')
			expect(statistics[2].text()).toContain('3')
			expect(statistics[3].text()).toContain('高级用户')
		})
		it('应该正确显示VIP用户到期时间', async () => {
			const expiryDate = '2025-12-31T11:45:14Z'
			const mockUserInfo = createMockUserInfo({
				isVip: true,
				userGroupName: 'VIP用户',
				privilegeExpiry: expiryDate
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)

			// 等待异步操作完成
			await nextTick()
			await new Promise(resolve => setTimeout(resolve, 0))

			const userGroupStat = wrapper.findAll('.n-statistic')[3]
			expect(userGroupStat.text()).toContain('VIP用户（2025/12/31到期）')
		})

		it('应该正确处理非VIP用户', async () => {
			const mockUserInfo = createMockUserInfo({
				isVip: false,
				userGroupName: '普通用户',
				privilegeExpiry: null
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const userGroupStat = wrapper.findAll('.n-statistic')[3]
			expect(userGroupStat.text()).toContain('普通用户')
			expect(userGroupStat.text()).not.toContain('到期')
		})

		it('应该处理API调用失败', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
			const mockError = new Error('网络错误')
			mockGetUserInfo.mockRejectedValue(mockError)

			const wrapper = mount(Dashboard)
			await nextTick()

			expect(consoleSpy).toHaveBeenCalledWith('获取用户信息失败:', mockError)

			// 统计数据应该保持初始状态
			const statistics = wrapper.findAll('.n-statistic')
			expect(statistics[1].text()).toContain('加载中...')
			expect(statistics[3].text()).toContain('加载中...')

			consoleSpy.mockRestore()
		})

		it('应该处理API返回错误码', async () => {
			const errorResponse: ApiResult<UserInfoResponseData> = {
				code: 401,
				message: '未授权',
				data: {} as UserInfoResponseData
			}
			mockGetUserInfo.mockResolvedValue(errorResponse)

			const wrapper = mount(Dashboard)
			await nextTick()

			// 统计数据应该保持初始状态，因为code不为0
			const statistics = wrapper.findAll('.n-statistic')
			expect(statistics[1].text()).toContain('加载中...')
			expect(statistics[3].text()).toContain('加载中...')
		})
	})

	describe('流量格式化功能', () => {
		it('应该正确格式化TB级别的流量', async () => {
			const mockUserInfo = createMockUserInfo({
				availableTraffic: '2.5 TB'
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const trafficStat = wrapper.findAll('.n-statistic')[1]
			expect(trafficStat.text()).toContain('2.50 TiB')
		})

		it('应该正确格式化GB级别的流量', async () => {
			const mockUserInfo = createMockUserInfo({
				availableTraffic: '1.23 GB'
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const trafficStat = wrapper.findAll('.n-statistic')[1]
			expect(trafficStat.text()).toContain('1.23 GiB')
		})

		it('应该正确格式化MB级别的流量', async () => {
			const mockUserInfo = createMockUserInfo({
				availableTraffic: '512 MB'
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const trafficStat = wrapper.findAll('.n-statistic')[1]
			expect(trafficStat.text()).toContain('512.00 MiB')
		})

		it('应该正确格式化KB级别的流量', async () => {
			const mockUserInfo = createMockUserInfo({
				availableTraffic: '512 KB'
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const trafficStat = wrapper.findAll('.n-statistic')[1]
			expect(trafficStat.text()).toContain('512.00 KiB')
		})

		it('应该正确格式化Byte级别的流量', async () => {
			const mockUserInfo = createMockUserInfo({
				availableTraffic: '0.5 KB'
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const trafficStat = wrapper.findAll('.n-statistic')[1]
			expect(trafficStat.text()).toContain('512 Bytes')
		})

		it('应该处理无法解析的流量格式', async () => {
			const mockUserInfo = createMockUserInfo({
				availableTraffic: '114514'
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const trafficStat = wrapper.findAll('.n-statistic')[1]
			expect(trafficStat.text()).toContain('Unknown')
		})

		it('应该处理单位转换', async () => {
			const mockUserInfo = createMockUserInfo({
				availableTraffic: '0.5 GB'
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const trafficStat = wrapper.findAll('.n-statistic')[1]
			expect(trafficStat.text()).toContain('512.00 MiB')
		})
	})

	describe('TrafficChart 组件集成', () => {
		it('应该正确渲染TrafficChart组件', () => {
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(createMockUserInfo()))

			const wrapper = mount(Dashboard)

			const trafficChart = wrapper.find('.traffic-chart-mock')
			expect(trafficChart.exists()).toBe(true)
			expect(trafficChart.text()).toBe('总流量统计')
		})
	})

	describe('边界情况', () => {
		it('应该处理零值统计数据', async () => {
			const mockUserInfo = createMockUserInfo({
				activeTunnels: 0,
				availableTraffic: '0 Bytes',
				onlineDevices: 0
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const statistics = wrapper.findAll('.n-statistic')
			expect(statistics[0].text()).toContain('0')
			expect(statistics[1].text()).toContain('0 Bytes')
			expect(statistics[2].text()).toContain('0')
		})

		it('应该处理非常大的流量值', async () => {
			const mockUserInfo = createMockUserInfo({
				availableTraffic: '999.99 TB'
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const trafficStat = wrapper.findAll('.n-statistic')[1]
			expect(trafficStat.text()).toContain('999.99 TiB')
		})

		it('应该处理VIP用户但没有到期时间的情况', async () => {
			const mockUserInfo = createMockUserInfo({
				isVip: true,
				userGroupName: 'VIP用户',
				privilegeExpiry: null
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await new Promise(resolve => setTimeout(resolve, 50))
			await nextTick()

			const userGroupStat = wrapper.findAll('.n-statistic')[3]
			expect(userGroupStat.text()).toContain('VIP用户')
			expect(userGroupStat.text()).not.toContain('到期')
		})

		it('应该处理空字符串流量值', async () => {
			const mockUserInfo = createMockUserInfo({
				availableTraffic: ''
			})
			mockGetUserInfo.mockResolvedValue(createMockApiResponse(mockUserInfo))

			const wrapper = mount(Dashboard)
			await nextTick()

			const trafficStat = wrapper.findAll('.n-statistic')[1]
			expect(trafficStat.text()).toContain('')
		})
	})
})
