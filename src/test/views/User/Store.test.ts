import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Store from '../../../views/User/Store.vue'
import * as authApi from '../../../api/auth'
import * as serviceApi from '../../../api/service'
import * as vnetApi from '../../../api/vnet'

// Mock naive-ui
vi.mock('naive-ui', () => ({
	NCard: {
		name: 'NCard',
		template: '<div class="n-card"><slot /><div class="n-card__footer"><slot name="footer" /></div></div>'
	},
	NGrid: { name: 'NGrid', template: '<div class="n-grid"><slot /></div>', props: ['cols', 'x-gap'] },
	NGridItem: { name: 'NGridItem', template: '<div class="n-grid-item"><slot /></div>' },
	NButton: {
		name: 'NButton',
		template: '<button class="n-button" @click="$emit(\'click\')" :disabled="disabled || loading"><slot /></button>',
		props: ['type', 'block', 'loading', 'disabled', 'size'],
		emits: ['click']
	},
	NTag: {
		name: 'NTag',
		template: '<span class="n-tag" :class="`n-tag--${type}`"><slot /></span>',
		props: ['type']
	},
	NModal: {
		name: 'NModal',
		template: '<div v-if="show" class="n-modal"><slot /></div>',
		props: ['show', 'mask-closable']
	},
	NButtonGroup: { name: 'NButtonGroup', template: '<div class="n-button-group"><slot /></div>' },
	NSkeleton: { name: 'NSkeleton', template: '<div class="n-skeleton"></div>', props: ['height', 'width'] },
	useMessage: () => ({
		success: vi.fn(),
		error: vi.fn(),
		warning: vi.fn(),
		info: vi.fn()
	})
}))

describe('基础渲染测试', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('应该正确渲染商城页面标题', async () => {
		// Mock API 调用
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick() // 等待异步操作完成

		// 检查页面标题
		const title = wrapper.find('h2')
		expect(title.exists()).toBe(true)
		expect(title.text()).toBe('商城')
	})

	it('应该渲染所有产品套餐', async () => {
		// Mock API 调用
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 检查是否渲染了4个产品卡片
		const productCards = wrapper.findAll('.n-grid-item')
		expect(productCards).toHaveLength(4)

		// 检查产品名称
		const productNames = wrapper.findAll('.product-header h3')
		expect(productNames[0].text()).toBe('免费套餐')
		expect(productNames[1].text()).toBe('青铜套餐')
		expect(productNames[2].text()).toBe('白银套餐')
		expect(productNames[3].text()).toBe('黄金套餐')
	})

	it('应该正确显示产品价格', async () => {
		// Mock API 调用
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 检查产品价格
		const productPrices = wrapper.findAll('.product-price')
		expect(productPrices[0].text()).toBe('免费')
		expect(productPrices[1].text()).toBe('￥19.99/月')
		expect(productPrices[2].text()).toBe('￥49.99/月')
		expect(productPrices[3].text()).toBe('￥99.99/月')
	})
})

describe('用户套餐状态测试', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('应该正确显示当前套餐标签', async () => {
		// Mock API 返回青铜用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 2 }, // 青铜用户
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 检查当前套餐标签
		const currentTags = wrapper.findAll('.n-tag--warning')
		expect(currentTags).toHaveLength(1)
		expect(currentTags[0].text()).toBe('当前套餐')
	})

	it('应该正确显示热门套餐标签', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 检查热门套餐标签（白银套餐应该显示热门）
		const popularTags = wrapper.findAll('.n-tag--success')
		expect(popularTags).toHaveLength(1)
		expect(popularTags[0].text()).toBe('最受欢迎')
	})
	it('应该正确显示购买按钮状态 - 免费用户', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		const buttons = wrapper.findAll('button')
		// 免费套餐不应该有按钮，其他套餐应该显示"立即购买"
		expect(buttons).toHaveLength(3) // 青铜、白银、黄金套餐的按钮
		expect(buttons[0].text()).toBe('立即购买')
		expect(buttons[1].text()).toBe('立即购买')
		expect(buttons[2].text()).toBe('立即购买')
	})

	it('应该正确显示续费按钮 - 当前套餐用户', async () => {
		// Mock API 返回白银用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 3 }, // 白银用户
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()
		const buttons = wrapper.findAll('.n-button')
		// 应该有3个按钮：青铜(立即购买)、白银(续费)、黄金(立即购买)
		expect(buttons).toHaveLength(3)
		expect(buttons[0].text()).toBe('立即购买') // 青铜
		expect(buttons[1].text()).toBe('续费') // 白银 - 当前套餐
		expect(buttons[2].text()).toBe('立即购买') // 黄金
	})
})

describe('购买流程测试', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('应该正确打开购买对话框', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击青铜套餐的购买按钮
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click')
		await nextTick()

		// 检查购买对话框是否打开
		const modal = wrapper.find('.n-modal')
		expect(modal.exists()).toBe(true)
		expect(modal.text()).toContain('购买 青铜套餐')
	})

	it('应该正确显示价格计算 - 无折扣', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击青铜套餐的购买按钮
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click')
		await nextTick()

		// 检查价格显示（默认1个月，无折扣）
		const finalPrice = wrapper.find('.final-price')
		expect(finalPrice.exists()).toBe(true)
		expect(finalPrice.text()).toBe('￥19.99')
	})

	it('应该正确计算折扣价格 - 3个月', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击青铜套餐的购买按钮
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click')
		await nextTick()

		// 选择3个月选项
		const durationButtons = wrapper.findAll('.n-button-group button')
		const threeMonthButton = durationButtons.find(btn => btn.text().includes('3个月'))
		expect(threeMonthButton?.exists()).toBe(true)
		await threeMonthButton?.trigger('click')
		await nextTick()
		// 检查价格计算（19.99 * 3 * 0.9 = 53.97）
		const finalPrice = wrapper.find('.final-price')
		expect(finalPrice.text()).toBe('￥53.97')

		// 检查原价显示
		const originalPrice = wrapper.find('.original-price')
		expect(originalPrice.text()).toContain('59.97')

		// 检查折扣信息
		const discountInfo = wrapper.find('.discount-info')
		expect(discountInfo.text()).toContain('6.00')
	})

	it('应该正确处理取消购买', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 打开购买对话框
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click')
		await nextTick()

		// 点击取消按钮
		const cancelButton = wrapper.findAll('button').find(btn => btn.text() === '取消')
		expect(cancelButton?.exists()).toBe(true)
		await cancelButton?.trigger('click')
		await nextTick()

		// 检查对话框是否关闭
		const modal = wrapper.find('.n-modal')
		expect(modal.exists()).toBe(false)
	})
})

describe('套餐购买确认和API调用测试', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('应该正确调用购买API并处理成功响应', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})
		// Mock purchasePackage API 成功响应
		const mockPurchase = vi.spyOn(serviceApi, 'purchasePackage').mockResolvedValue({
			code: 0,
			data: undefined,
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 打开购买对话框
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click')
		await nextTick()

		// 点击确认购买按钮
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		expect(confirmButton?.exists()).toBe(true)
		await confirmButton?.trigger('click')
		await nextTick()
		// 验证API调用
		expect(mockPurchase).toHaveBeenCalledWith({
			packageType: 2,
			duration: 1
		})
	})

	it('应该正确处理购买API错误响应', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})
		// Mock purchasePackage API 错误响应
		const mockPurchase = vi.spyOn(serviceApi, 'purchasePackage').mockResolvedValue({
			code: 1,
			data: undefined,
			message: 'error'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 打开购买对话框
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click')
		await nextTick()

		// 点击确认购买按钮
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await confirmButton?.trigger('click')
		await nextTick()

		// 验证API调用
		expect(mockPurchase).toHaveBeenCalled()

		// 购买失败时对话框应该保持打开状态
		const modal = wrapper.find('.n-modal')
		expect(modal.exists()).toBe(true)
	})

	it('应该在购买过程中显示加载状态', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})
		// Mock purchasePackage API 延迟响应
		vi.spyOn(serviceApi, 'purchasePackage').mockImplementation(() =>
			new Promise(resolve => setTimeout(() => resolve({
				code: 0,
				data: undefined,
				message: 'success'
			}), 100))
		)

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 打开购买对话框
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click')
		await nextTick()

		// 点击确认购买按钮
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await confirmButton?.trigger('click')

		// 检查按钮的加载状态
		expect(confirmButton?.attributes('disabled')).toBeDefined()
	})

	it('应该正确传递购买参数到API', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})
		const mockPurchase = vi.spyOn(serviceApi, 'purchasePackage').mockResolvedValue({
			code: 0,
			data: undefined,
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 打开银牌套餐购买对话框（packageType: 3）
		const buttons = wrapper.findAll('button')
		await buttons[1].trigger('click') // 银牌套餐的购买按钮
		await nextTick()

		// 选择3个月
		const durationButtons = wrapper.findAll('.n-button-group button')
		const threeMonthButton = durationButtons.find(btn => btn.text().includes('3个月'))
		await threeMonthButton?.trigger('click')
		await nextTick()

		// 点击确认购买
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await confirmButton?.trigger('click')
		await nextTick()
		// 验证API调用参数
		expect(mockPurchase).toHaveBeenCalledWith({
			packageType: 3,
			duration: 3
		})
	})
})

describe('套餐升级/降级验证测试', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('应该正确显示二级确认对话框 - 降级场景', async () => {
		// Mock API 返回黄金用户（从4降级到2）
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 4 }, // 黄金用户
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击青铜套餐的购买按钮（降级）
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click') // 青铜套餐按钮
		await nextTick()
		// 应该显示二级确认对话框
		const confirmModal = wrapper.find('.confirm-modal')
		expect(confirmModal.exists()).toBe(true)
		expect(confirmModal.text()).toContain('确认购买')
		expect(confirmModal.text()).toContain('青铜套餐')
	})

	it('应该正确处理二级确认对话框的确认操作', async () => {
		// Mock API 返回白银用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 3 }, // 白银用户
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击青铜套餐的购买按钮（降级）
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click') // 青铜套餐按钮
		await nextTick()

		// 确认二级对话框
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await confirmButton?.trigger('click')
		await nextTick()

		// 应该打开购买对话框
		const purchaseModal = wrapper.find('.purchase-modal')
		expect(purchaseModal.exists()).toBe(true)
		expect(purchaseModal.text()).toContain('购买 青铜套餐')
	})

	it('应该正确处理二级确认对话框的取消操作', async () => {
		// Mock API 返回黄金用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 4 }, // 黄金用户
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击青铜套餐的购买按钮（降级）
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click') // 青铜套餐按钮
		await nextTick()

		// 取消二级确认对话框
		const cancelButton = wrapper.findAll('button').find(btn => btn.text() === '取消')
		await cancelButton?.trigger('click')
		await nextTick()

		// 确认对话框应该关闭，且购买对话框不应该打开
		const confirmModal = wrapper.findAll('.confirm-modal')
		expect(confirmModal.length).toBe(0)

		const purchaseModal = wrapper.findAll('.purchase-modal')
		expect(purchaseModal.length).toBe(0)
	})
	it('应该允许免费用户直接购买套餐而不显示确认对话框', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 }, // 免费用户
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击白银套餐的购买按钮
		const buttons = wrapper.findAll('button')
		await buttons[1].trigger('click') // 白银套餐按钮
		await nextTick()

		// 应该直接打开购买对话框，不显示二级确认
		const purchaseModal = wrapper.find('.purchase-modal')
		expect(purchaseModal.exists()).toBe(true)
		expect(purchaseModal.text()).toContain('购买 白银套餐')

		// 确认没有二级确认对话框
		const confirmModal = wrapper.findAll('.confirm-modal')
		expect(confirmModal.length).toBe(0)
	})

	it('应该允许续费当前套餐而不显示确认对话框', async () => {
		// Mock API 返回白银用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 3 }, // 白银用户
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击白银套餐的续费按钮
		const buttons = wrapper.findAll('button')
		await buttons[1].trigger('click') // 白银套餐按钮（续费）
		await nextTick()

		// 应该直接打开购买对话框，不显示二级确认
		const purchaseModal = wrapper.find('.purchase-modal')
		expect(purchaseModal.exists()).toBe(true)
		expect(purchaseModal.text()).toContain('购买 白银套餐')

		// 确认没有二级确认对话框
		const confirmModal = wrapper.findAll('.confirm-modal')
		expect(confirmModal.length).toBe(0)
	})
	it('应该为升级套餐显示二级确认对话框', async () => {
		// Mock API 返回青铜用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 2 }, // 青铜用户
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击白银套餐的购买按钮（升级）
		const buttons = wrapper.findAll('button')
		await buttons[1].trigger('click') // 白银套餐按钮
		await nextTick()

		// 应该显示二级确认对话框
		const confirmModal = wrapper.find('.confirm-modal')
		expect(confirmModal.exists()).toBe(true)
		expect(confirmModal.text()).toContain('确认购买')
		expect(confirmModal.text()).toContain('白银套餐')
	})
})

describe('错误处理测试', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('应该正确处理用户组API获取失败', async () => {
		// Mock API 返回错误
		vi.spyOn(authApi, 'getUserGroup').mockRejectedValue(new Error('网络错误'))

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 检查加载状态不再显示
		const loadingButtons = wrapper.findAll('button[loading]')
		expect(loadingButtons.length).toBe(0)

		// 应该仍然渲染产品列表
		const productCards = wrapper.findAll('.n-grid-item')
		expect(productCards).toHaveLength(4)
	})

	it('应该正确处理虚拟网络API获取失败 - 降级场景', async () => {
		// Mock API 返回黄金用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 4 }, // 黄金用户
			message: 'success'
		})

		// Mock vnet API 失败
		vi.spyOn(vnetApi, 'getVNetList').mockRejectedValue(new Error('获取虚拟网络失败'))

		// Mock purchasePackage API（不会被调用）
		const mockPurchase = vi.spyOn(serviceApi, 'purchasePackage').mockResolvedValue({
			code: 0,
			data: undefined,
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击青铜套餐的购买按钮（降级）
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click') // 青铜套餐按钮
		await nextTick()

		// 确认二级对话框
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await confirmButton?.trigger('click')
		await nextTick()

		// 点击购买对话框中的确认购买按钮
		const finalConfirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await finalConfirmButton?.trigger('click')
		await nextTick()

		// 验证purchasePackage API没有被调用（因为vnet检查失败）
		expect(mockPurchase).not.toHaveBeenCalled()

		// 购买对话框应该保持打开
		const purchaseModal = wrapper.find('.purchase-modal')
		expect(purchaseModal.exists()).toBe(true)
	})

	it('应该正确处理购买过程中的网络错误', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		// Mock purchasePackage API 网络错误
		const mockPurchase = vi.spyOn(serviceApi, 'purchasePackage').mockRejectedValue(new Error('网络连接失败'))

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 打开购买对话框
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click')
		await nextTick()

		// 点击确认购买按钮
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await confirmButton?.trigger('click')
		await nextTick()

		// 验证API调用
		expect(mockPurchase).toHaveBeenCalled()

		// 购买对话框应该保持打开
		const modal = wrapper.find('.n-modal')
		expect(modal.exists()).toBe(true)
	})

	it('应该正确处理API返回的业务错误', async () => {
		// Mock API 返回免费用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 1 },
			message: 'success'
		})

		// Mock purchasePackage API 返回业务错误
		const mockPurchase = vi.spyOn(serviceApi, 'purchasePackage').mockResolvedValue({
			code: 500,
			data: undefined,
			message: '系统繁忙，请稍后重试'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 打开购买对话框
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click')
		await nextTick()

		// 点击确认购买按钮
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await confirmButton?.trigger('click')
		await nextTick()

		// 验证API调用
		expect(mockPurchase).toHaveBeenCalled()

		// 购买对话框应该保持打开（因为购买失败）
		const modal = wrapper.find('.purchase-modal')
		expect(modal.exists()).toBe(true)
	})
})

describe('虚拟网络限制验证测试', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('应该正确验证降级时的虚拟网络数量限制', async () => {
		// Mock API 返回黄金用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 4 }, // 黄金用户
			message: 'success'
		})
		// Mock vnet API 返回超过青铜套餐限制的虚拟网络
		vi.spyOn(vnetApi, 'getVNetList').mockResolvedValue({
			code: 0,
			data: {
				vnets: [
					{ vnetId: '1', token: 'vnet1', comment: '测试网络1', enabled: true, clientsLimit: 5, password: '123', ipRange: '10.0.1.0/24', enableDHCP: true, clientsOnline: 2 },
					{ vnetId: '2', token: 'vnet2', comment: '测试网络2', enabled: true, clientsLimit: 5, password: '123', ipRange: '10.0.2.0/24', enableDHCP: true, clientsOnline: 1 },
					{ vnetId: '3', token: 'vnet3', comment: '测试网络3', enabled: true, clientsLimit: 5, password: '123', ipRange: '10.0.3.0/24', enableDHCP: true, clientsOnline: 0 },
					{ vnetId: '4', token: 'vnet4', comment: '测试网络4', enabled: true, clientsLimit: 5, password: '123', ipRange: '10.0.4.0/24', enableDHCP: true, clientsOnline: 3 }, // 超过青铜套餐限制(3个)
				]
			},
			message: 'success'
		})

		// Mock purchasePackage API（不会被调用）
		const mockPurchase = vi.spyOn(serviceApi, 'purchasePackage').mockResolvedValue({
			code: 0,
			data: undefined,
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击青铜套餐的购买按钮（降级）
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click') // 青铜套餐按钮
		await nextTick()

		// 确认二级对话框
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await confirmButton?.trigger('click')
		await nextTick()

		// 点击购买对话框中的确认购买按钮
		const finalConfirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await finalConfirmButton?.trigger('click')
		await nextTick()

		// 验证purchasePackage API没有被调用（因为虚拟网络数量超限）
		expect(mockPurchase).not.toHaveBeenCalled()

		// 购买对话框应该保持打开
		const purchaseModal = wrapper.find('.purchase-modal')
		expect(purchaseModal.exists()).toBe(true)
	})

	it('应该正确验证降级时的客户端连接数限制', async () => {
		// Mock API 返回黄金用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 4 }, // 黄金用户
			message: 'success'
		})
		// Mock vnet API 返回客户端连接数超过青铜套餐限制的虚拟网络
		vi.spyOn(vnetApi, 'getVNetList').mockResolvedValue({
			code: 0,
			data: {
				vnets: [
					{ vnetId: '1', token: 'vnet1', comment: '测试网络1', enabled: true, clientsLimit: 10, password: '123', ipRange: '10.0.1.0/24', enableDHCP: true, clientsOnline: 2 }, // 超过青铜套餐限制(5)
					{ vnetId: '2', token: 'vnet2', comment: '测试网络2', enabled: true, clientsLimit: 3, password: '123', ipRange: '10.0.2.0/24', enableDHCP: true, clientsOnline: 1 },
				]
			},
			message: 'success'
		})

		// Mock purchasePackage API（不会被调用）
		const mockPurchase = vi.spyOn(serviceApi, 'purchasePackage').mockResolvedValue({
			code: 0,
			data: undefined,
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击青铜套餐的购买按钮（降级）
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click') // 青铜套餐按钮
		await nextTick()

		// 确认二级对话框
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await confirmButton?.trigger('click')
		await nextTick()

		// 点击购买对话框中的确认购买按钮
		const finalConfirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await finalConfirmButton?.trigger('click')
		await nextTick()

		// 验证purchasePackage API没有被调用（因为客户端连接数超限）
		expect(mockPurchase).not.toHaveBeenCalled()

		// 购买对话框应该保持打开
		const purchaseModal = wrapper.find('.purchase-modal')
		expect(purchaseModal.exists()).toBe(true)
	})

	it('应该允许降级当虚拟网络配置符合限制时', async () => {
		// Mock API 返回黄金用户
		vi.spyOn(authApi, 'getUserGroup').mockResolvedValue({
			code: 0,
			data: { userGroup: 4 }, // 黄金用户
			message: 'success'
		})
		// Mock vnet API 返回符合青铜套餐限制的虚拟网络
		vi.spyOn(vnetApi, 'getVNetList').mockResolvedValue({
			code: 0,
			data: {
				vnets: [
					{ vnetId: '1', token: 'vnet1', comment: '测试网络1', enabled: true, clientsLimit: 3, password: '123', ipRange: '10.0.1.0/24', enableDHCP: true, clientsOnline: 1 },
					{ vnetId: '2', token: 'vnet2', comment: '测试网络2', enabled: true, clientsLimit: 1, password: '123', ipRange: '10.0.2.0/24', enableDHCP: true, clientsOnline: 2 },
					{ vnetId: '3', token: 'vnet3', comment: '测试网络3', enabled: true, clientsLimit: 2, password: '123', ipRange: '10.0.3.0/24', enableDHCP: true, clientsOnline: 0 },
					{ vnetId: '3', token: 'vnet4', comment: '测试网络4', enabled: false, clientsLimit: 10, password: '123', ipRange: '10.0.3.0/24', enableDHCP: true, clientsOnline: 0 }, // 禁用的不计算
				]
			},
			message: 'success'
		})

		// Mock purchasePackage API 成功响应
		const mockPurchase = vi.spyOn(serviceApi, 'purchasePackage').mockResolvedValue({
			code: 0,
			data: undefined,
			message: 'success'
		})

		const wrapper = mount(Store)
		await nextTick()
		await nextTick()

		// 点击青铜套餐的购买按钮（降级）
		const buttons = wrapper.findAll('button')
		await buttons[0].trigger('click') // 青铜套餐按钮
		await nextTick()

		// 确认二级对话框
		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await confirmButton?.trigger('click')
		await nextTick()

		// 点击购买对话框中的确认购买按钮
		const finalConfirmButton = wrapper.findAll('button').find(btn => btn.text() === '确认购买')
		await finalConfirmButton?.trigger('click')
		await nextTick()

		// 验证purchasePackage API被调用
		expect(mockPurchase).toHaveBeenCalledWith({
			packageType: 2,
			duration: 1
		})
	})
})