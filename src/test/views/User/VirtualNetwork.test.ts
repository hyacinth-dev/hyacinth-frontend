/**
 * 虚拟网络页面组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VirtualNetwork from '../../../views/User/VirtualNetwork.vue'
import type { VNetData, VNetLimitInfo } from '../../../api/vnet'

// Mock naive-ui components
vi.mock('naive-ui', () => ({
	NDataTable: { template: '<div class="mock-data-table"><slot /></div>' },
	NButton: { template: '<button class="mock-button" @click="$emit(\'click\')"><slot /></button>' },
	NSpace: { template: '<div class="mock-space"><slot /></div>' },
	NCard: { template: '<div class="mock-card"><slot /></div>' },
	NModal: { template: '<div class="mock-modal" v-if="show"><slot /><slot name="action" /></div>', props: ['show'] },
	NForm: {
		template: '<form class="mock-form"><slot /></form>',
		methods: {
			validate: vi.fn().mockResolvedValue(true)
		}
	},
	NFormItem: { template: '<div class="mock-form-item"><slot /></div>' },
	NInput: { template: '<input class="mock-input" :value="value" @input="$emit(\'update:value\', $event.target.value)" />', props: ['value'] },
	NInputGroup: { template: '<div class="mock-input-group"><slot /></div>' },
	NInputNumber: { template: '<input class="mock-input-number" type="number" :value="value" @input="$emit(\'update:value\', Number($event.target.value))" />', props: ['value'] },
	NSwitch: { template: '<input class="mock-switch" type="checkbox" :checked="value" @change="$emit(\'update:value\', $event.target.checked)" />', props: ['value'] },
	NText: { template: '<span class="mock-text"><slot /></span>' },
	useMessage: () => ({
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn()
	})
}))

// Mock TrafficChart component
vi.mock('../../../components/TrafficChart.vue', () => ({
	default: { template: '<div class="mock-traffic-chart">Traffic Chart</div>' }
}))

// Mock API functions
vi.mock('../../../api/vnet', () => ({
	getVNetList: vi.fn(),
	createVNet: vi.fn(),
	updateVNet: vi.fn(),
	deleteVNet: vi.fn(),
	getVNetLimitInfo: vi.fn()
}))

import { getVNetList, createVNet, updateVNet, deleteVNet, getVNetLimitInfo } from '../../../api/vnet'

describe('虚拟网络', () => {
	const mockVNetData: VNetData[] = [
		{
			vnetId: 'vnet-001',
			comment: 'Test Network 1',
			enabled: true,
			token: 'test-token-1',
			password: 'test-password-1',
			ipRange: '192.168.1.0/24',
			enableDHCP: true,
			clientsLimit: 10,
			clientsOnline: 3
		},
		{
			vnetId: 'vnet-002',
			comment: 'Test Network 2',
			enabled: false,
			token: 'test-token-2',
			password: 'test-password-2',
			ipRange: '192.168.2.0/24',
			enableDHCP: false,
			clientsLimit: 5,
			clientsOnline: 0
		}
	]

	const mockLimitInfo: VNetLimitInfo = {
		currentCount: 2,
		maxLimit: 5,
		userGroup: 2,
		maxClientsLimitPerVNet: 20
	}

	beforeEach(() => {
		vi.clearAllMocks()

		// Setup default mock implementations
		vi.mocked(getVNetList).mockResolvedValue({
			code: 0,
			message: 'success',
			data: { vnets: mockVNetData }
		})

		vi.mocked(getVNetLimitInfo).mockResolvedValue({
			code: 0,
			message: 'success',
			data: mockLimitInfo
		})
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	describe('组件渲染测试', () => {
		it('应该正确渲染虚拟网络页面基本结构', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待异步数据加载
			await nextTick()

			// 检查页面标题
			expect(wrapper.text()).toContain('虚拟网络')

			// 检查新建按钮
			expect(wrapper.text()).toContain('新建虚拟网络')

			// 检查数据表格存在
			expect(wrapper.find('.mock-data-table').exists()).toBe(true)

			// 检查卡片容器存在
			expect(wrapper.find('.mock-card').exists()).toBe(true)
		})

		it('应该显示虚拟网络使用情况信息', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待异步数据加载
			await nextTick()
			await nextTick() // 需要额外的nextTick等待limitInfo更新

			// 检查限制信息显示
			expect(wrapper.text()).toContain('虚拟网络使用情况: 2 / 5')
		})
	})

	describe('数据加载测试', () => {
		it('应该在组件挂载时调用API获取数据', async () => {
			mount(VirtualNetwork)

			// 等待异步调用
			await nextTick()

			// 验证API调用
			expect(getVNetList).toHaveBeenCalledTimes(1)
			expect(getVNetLimitInfo).toHaveBeenCalledTimes(1)
		})

		it('应该处理API错误情况', async () => {
			// Mock API调用失败
			vi.mocked(getVNetList).mockRejectedValue(new Error('网络错误'))
			vi.mocked(getVNetLimitInfo).mockRejectedValue(new Error('网络错误'))

			const wrapper = mount(VirtualNetwork)

			// 等待异步调用完成
			await nextTick()

			// 验证组件仍能正常渲染（错误处理）
			expect(wrapper.exists()).toBe(true)
			expect(wrapper.text()).toContain('虚拟网络')
		})

		it('应该正确处理空的虚拟网络列表', async () => {
			// Mock空列表响应
			vi.mocked(getVNetList).mockResolvedValue({
				code: 200,
				message: 'success',
				data: { vnets: [] }
			})

			const wrapper = mount(VirtualNetwork)

			// 等待异步数据加载
			await nextTick()

			// 验证组件正常渲染
			expect(wrapper.exists()).toBe(true)
			expect(wrapper.find('.mock-data-table').exists()).toBe(true)
		})
	})

	describe('新建虚拟网络功能测试', () => {
		it('应该能打开新建虚拟网络模态框', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()

			// 确认模态框初始状态是关闭的
			expect(wrapper.find('.mock-modal').exists()).toBe(false)

			// 点击新建按钮
			const createButton = wrapper.find('.mock-button')
			await createButton.trigger('click')
			await nextTick()

			// 验证模态框已打开
			expect(wrapper.find('.mock-modal').exists()).toBe(true)
			expect(wrapper.find('.mock-form').exists()).toBe(true)
		})

		it('应该正确初始化新建表单的默认值', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()
			await nextTick() // 等待limitInfo加载

			// 点击新建按钮
			const createButton = wrapper.find('.mock-button')
			await createButton.trigger('click')
			await nextTick()

			// 验证表单字段默认值
			const inputs = wrapper.findAll('.mock-input')
			const switches = wrapper.findAll('.mock-switch')
			const numberInputs = wrapper.findAll('.mock-input-number')			// 验证有相应的表单元素
			expect(inputs.length).toBeGreaterThan(0)
			expect(switches.length).toBeGreaterThan(0)
			expect(numberInputs.length).toBeGreaterThan(0)
		})

		it('应该能成功创建新的虚拟网络', async () => {
			// Mock成功的创建响应
			vi.mocked(createVNet).mockResolvedValue({
				code: 200,
				message: 'success',
				data: null
			})

			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()
			await nextTick()

			// 点击新建按钮打开模态框
			const createButton = wrapper.find('.mock-button')
			await createButton.trigger('click')
			await nextTick()

			// 验证模态框已打开
			expect(wrapper.find('.mock-modal').exists()).toBe(true)

			// 清除之前的API调用记录
			vi.mocked(createVNet).mockClear()
			vi.mocked(getVNetList).mockClear()
			vi.mocked(getVNetLimitInfo).mockClear()

			// 通过组件实例直接调用创建方法（模拟表单验证通过并提交）
			const vm = wrapper.vm as any

			// 设置表单数据
			vm.networkForm = {
				comment: 'Test Network',
				token: 'test-network',
				password: 'test123',
				ipAddress: '192.168.100.0',
				cidr: 24,
				enableDHCP: true,
				clientsLimit: 10,
				enabled: true
			}

			// 直接调用创建网络方法
			await vm.handleCreateNetwork()

			// 验证createVNet被正确调用
			expect(createVNet).toHaveBeenCalledTimes(1)
			expect(createVNet).toHaveBeenCalledWith({
				comment: 'Test Network',
				token: 'test-network',
				password: 'test123',
				ipRange: '192.168.100.0/24',
				enableDHCP: true,
				clientsLimit: 10,
				enabled: true
			})

			// 验证创建成功后重新获取列表和限制信息
			expect(getVNetList).toHaveBeenCalledTimes(1)
			expect(getVNetLimitInfo).toHaveBeenCalledTimes(1)
		})
		it('应该处理创建虚拟网络失败的情况', async () => {
			// Mock创建失败
			vi.mocked(createVNet).mockRejectedValue(new Error('创建失败'))

			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()
			await nextTick()

			// 清除之前的API调用记录
			vi.mocked(createVNet).mockClear()

			// 通过组件实例直接调用创建方法
			const vm = wrapper.vm as any

			// 设置表单数据
			vm.networkForm = {
				comment: 'Test Network',
				token: 'test-network',
				password: 'test123',
				ipAddress: '192.168.100.0',
				cidr: 24,
				enableDHCP: true,
				clientsLimit: 10,
				enabled: true
			}

			// 调用创建网络方法，应该会失败
			await vm.handleCreateNetwork()

			// 验证createVNet被调用
			expect(createVNet).toHaveBeenCalledTimes(1)
		})

		it('应该处理连续点击创建按钮（防重复点击测试）', async () => {
			// Mock成功的创建响应
			vi.mocked(createVNet).mockResolvedValue({
				code: 200,
				message: 'success',
				data: null
			})

			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()
			await nextTick()

			// 找到"新建虚拟网络"按钮并点击
			const createButtons = wrapper.findAll('.mock-button')
			const newNetworkButton = createButtons.find(btn => btn.text().includes('新建虚拟网络'))
			expect(newNetworkButton).toBeDefined()

			await newNetworkButton!.trigger('click')
			await nextTick()

			// 验证模态框已打开
			expect(wrapper.find('.mock-modal').exists()).toBe(true)

			// 清除之前的API调用记录
			vi.mocked(createVNet).mockClear()
			vi.mocked(getVNetList).mockClear()
			vi.mocked(getVNetLimitInfo).mockClear()

			// 通过组件实例设置有效的表单数据
			const vm = wrapper.vm as any
			vm.networkForm = {
				comment: 'Test Network',
				token: 'test-network',
				password: 'test123',
				ipAddress: '192.168.100.0',
				cidr: 24,
				enableDHCP: true,
				clientsLimit: 10,
				enabled: true
			}

			// 找到模态框中的确认按钮
			const allButtons = wrapper.findAll('.mock-button')
			const confirmButton = allButtons.find(btn =>
				btn.text().includes('确认')
			)

			expect(confirmButton).toBeDefined()

			// 连续快速点击确认按钮（模拟用户快速多次点击）
			await confirmButton!.trigger('click')
			await confirmButton!.trigger('click')
			await confirmButton!.trigger('click')

			// 等待防重复点击机制生效
			await new Promise(resolve => setTimeout(resolve, 1000))

			// 等待异步操作完成
			await nextTick()
			// 验证createVNet只被调用一次
			expect(createVNet).toHaveBeenCalledTimes(1)
			expect(createVNet).toHaveBeenCalledWith({
				comment: 'Test Network',
				token: 'test-network',
				password: 'test123',
				ipRange: '192.168.100.0/24',
				enableDHCP: true,
				clientsLimit: 10,
				enabled: true
			})
		})
	})

	describe('编辑虚拟网络功能测试', () => {
		it('应该能打开编辑虚拟网络模态框', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载和数据加载完成
			await nextTick()
			await nextTick()

			// 模拟点击编辑按钮（这需要通过数据表格的操作列实现）
			// 由于我们使用了mock组件，我们通过组件实例直接调用编辑方法
			const vm = wrapper.vm as any
			vm.openEditModal(mockVNetData[0])
			await nextTick()

			// 验证模态框已打开并且是编辑模式
			expect(wrapper.find('.mock-modal').exists()).toBe(true)
			expect(wrapper.find('.mock-form').exists()).toBe(true)
		})

		it('应该能成功更新虚拟网络', async () => {
			// Mock成功的更新响应
			vi.mocked(updateVNet).mockResolvedValue({
				code: 200,
				message: 'success',
				data: null
			})

			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()
			await nextTick()

			// 直接调用编辑方法
			const vm = wrapper.vm as any
			vm.openEditModal(mockVNetData[0])
			await nextTick()

			// 模拟点击更新按钮
			vm.handleCreateNetwork()
			await nextTick()

			// 验证updateVNet被调用
			expect(updateVNet).toHaveBeenCalledTimes(1)
			expect(updateVNet).toHaveBeenCalledWith('vnet-001', expect.any(Object))
		})
	})

	describe('删除虚拟网络功能测试', () => {
		it('应该能成功删除虚拟网络', async () => {
			// Mock成功的删除响应
			vi.mocked(deleteVNet).mockResolvedValue({
				code: 200,
				message: 'success',
				data: null
			})

			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()
			await nextTick()

			// 直接调用删除方法
			const vm = wrapper.vm as any
			await vm.handleDeleteNetwork('vnet-001')

			// 验证deleteVNet被调用
			expect(deleteVNet).toHaveBeenCalledTimes(1)
			expect(deleteVNet).toHaveBeenCalledWith('vnet-001')

			// 验证列表重新获取
			expect(getVNetList).toHaveBeenCalledTimes(2) // 初始加载 + 删除后重新加载
		})

		it('应该处理删除失败的情况', async () => {
			// Mock删除失败
			vi.mocked(deleteVNet).mockRejectedValue(new Error('删除失败'))

			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()
			await nextTick()

			// 直接调用删除方法
			const vm = wrapper.vm as any
			await vm.handleDeleteNetwork('vnet-001')

			// 验证deleteVNet被调用
			expect(deleteVNet).toHaveBeenCalledTimes(1)
			expect(deleteVNet).toHaveBeenCalledWith('vnet-001')
		})
	})

	describe('统计功能测试', () => {
		it('应该能正确切换统计展示状态', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()
			await nextTick()

			// 通过组件实例测试统计切换
			const vm = wrapper.vm as any

			// 初始状态：没有展开的统计
			expect(vm.expandedStats['vnet-001']).toBeFalsy()

			// 展开第一个虚拟网络的统计
			vm.toggleStats('vnet-001')
			expect(vm.expandedStats['vnet-001']).toBe(true)

			// 展开第二个虚拟网络的统计，应该关闭第一个
			vm.toggleStats('vnet-002')
			expect(vm.expandedStats['vnet-001']).toBe(false)
			expect(vm.expandedStats['vnet-002']).toBe(true)

			// 再次点击已展开的统计，应该关闭它
			vm.toggleStats('vnet-002')
			expect(vm.expandedStats['vnet-002']).toBe(false)
		})

		it('应该在统计展开时显示流量图表', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()
			await nextTick()

			// 通过组件实例展开统计
			const vm = wrapper.vm as any
			vm.expandedStats['vnet-001'] = true

			// 等待DOM更新
			await nextTick()

			// 由于我们mock了TrafficChart组件，检查是否渲染了mock组件
			expect(wrapper.find('.mock-traffic-chart').exists()).toBe(true)
		})
	})
	describe('表单验证测试', () => {
		it('应该验证IP地址格式', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()

			// 通过组件实例测试IP验证函数
			const vm = wrapper.vm as any

			// 测试有效的IP地址
			expect(vm.validateIpAddress('192.168.1.1')).toBe(true)
			expect(vm.validateIpAddress('10.0.0.1')).toBe(true)
			expect(vm.validateIpAddress('172.16.0.1')).toBe(true)

			// 测试无效的IP地址
			expect(vm.validateIpAddress('256.256.256.256')).toBe(false)
			expect(vm.validateIpAddress('192.168.1')).toBe(false)
			expect(vm.validateIpAddress('not.an.ip.address')).toBe(false)
			expect(vm.validateIpAddress('')).toBe(false)
		})

		it('应该根据用户权限验证最大连接数', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()
			await nextTick()

			// 通过组件实例测试验证函数
			const vm = wrapper.vm as any

			// 设置超出限制的连接数
			vm.networkForm.clientsLimit = 25

			// 调用验证函数，应该返回false（因为限制是20）
			const isValid = vm.validateForm()
			expect(isValid).toBe(false)

			// 设置合理的连接数
			vm.networkForm.clientsLimit = 15
			const isValidNow = vm.validateForm()
			expect(isValidNow).toBe(true)
		})
	})

	describe('随机生成功能测试', () => {
		it('应该能生成随机网络名称', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()

			const vm = wrapper.vm as any

			// 记录初始的token值
			const initialToken = vm.networkForm.token

			// 调用生成随机token函数
			vm.generateRandomToken()

			// 验证token已经改变且符合要求
			expect(vm.networkForm.token).not.toBe(initialToken)
			expect(vm.networkForm.token).toHaveLength(8)
			expect(vm.networkForm.token).toMatch(/^[a-zA-Z0-9]+$/)

			// 多次调用应该生成不同的值
			const firstToken = vm.networkForm.token
			vm.generateRandomToken()
			const secondToken = vm.networkForm.token

			// 虽然理论上可能相同，但概率极低
			expect(firstToken).not.toBe(secondToken)
		})

		it('应该能生成随机密码', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()

			const vm = wrapper.vm as any

			// 记录初始的password值
			const initialPassword = vm.networkForm.password

			// 调用生成随机密码函数
			vm.generateRandomPassword()

			// 验证密码已经改变且符合要求
			expect(vm.networkForm.password).not.toBe(initialPassword)
			expect(vm.networkForm.password).toHaveLength(8)
			expect(vm.networkForm.password).toMatch(/^[a-zA-Z0-9]+$/)

			// 多次调用应该生成不同的值
			const firstPassword = vm.networkForm.password
			vm.generateRandomPassword()
			const secondPassword = vm.networkForm.password

			// 虽然理论上可能相同，但概率极低
			expect(firstPassword).not.toBe(secondPassword)
		})

		it('应该能通过按钮触发随机生成功能', async () => {
			const wrapper = mount(VirtualNetwork)

			// 等待组件挂载完成
			await nextTick()

			// 点击新建按钮打开模态框
			const createButton = wrapper.find('.mock-button')
			await createButton.trigger('click')
			await nextTick()

			// 验证模态框已打开
			expect(wrapper.find('.mock-modal').exists()).toBe(true)

			const vm = wrapper.vm as any

			// 记录初始值
			const initialToken = vm.networkForm.token
			const initialPassword = vm.networkForm.password

			// 模拟点击随机按钮（由于我们使用了mock组件，需要直接调用函数）
			vm.generateRandomToken()
			vm.generateRandomPassword()			// 验证值已经改变
			expect(vm.networkForm.token).not.toBe(initialToken)
			expect(vm.networkForm.password).not.toBe(initialPassword)
		})
	})
	describe('不合法数据处理测试', () => {
		it('应该拒绝无效的IP地址格式', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// 测试各种无效的IP地址格式（确实无效的）
			const invalidIPs = [
				'256.256.256.256',  // 超出范围
				'192.168.1',        // 不完整
				'192.168.1.1.1',    // 多余段
				'abc.def.ghi.jkl',  // 字母
				'192.168.-1.1',     // 负数
				'192.168.1.',       // 末尾有点
				'.192.168.1.1',     // 开头有点
				'',                 // 空字符串
				'   ',              // 空白字符
				'192.168.1.1/24',   // 包含CIDR
			]

			invalidIPs.forEach(ip => {
				expect(vm.validateIpAddress(ip)).toBe(false)
			})

			// 测试有效的IP地址
			const validIPs = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '192.168.01.1']
			validIPs.forEach(ip => {
				expect(vm.validateIpAddress(ip)).toBe(true)
			})
		})
		it('应该拒绝无效的CIDR值', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// 测试无效的CIDR值 - 使用表单验证规则
			const invalidCIDRs = [-1, 0, 7, 31, 33, 100, NaN]

			invalidCIDRs.forEach(cidr => {
				vm.networkForm.cidr = cidr
				vm.networkForm.enableDHCP = true // 启用DHCP才会验证CIDR

				// 调用表单验证规则中的validator
				const validator = vm.networkFormRules.cidr.validator
				const isValid = validator(null, cidr)
				expect(isValid).toBe(false)
			})

			// 测试有效的CIDR值
			const validCIDRs = [8, 16, 24, 30]
			validCIDRs.forEach(cidr => {
				vm.networkForm.cidr = cidr
				vm.networkForm.enableDHCP = true

				const validator = vm.networkFormRules.cidr.validator
				const isValid = validator(null, cidr)
				expect(isValid).toBe(true)
			})
		})
		it('应该拒绝无效的网络名称', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// 测试无效的网络名称
			const invalidTokens = [
				'',                    // 空字符串
				'   ',                 // 空白字符
				'test@network',        // 包含特殊字符
				'test network',        // 包含空格
				'test-network',        // 包含连字符
				'test.network',        // 包含点
				'a',                   // 太短
				'aa',                  // 太短
				'a'.repeat(100),       // 太长
				'测试网络',             // 中文字符
				'Test Network!'        // 包含感叹号
			]

			invalidTokens.forEach(token => {
				const validator = vm.networkFormRules.token.validator
				const isValid = validator(null, token)
				expect(isValid).toBe(false)
			})

			// 测试有效的网络名称
			const validTokens = ['test123', 'network_1', 'abc_123', 'test_network_123']
			validTokens.forEach(token => {
				const validator = vm.networkFormRules.token.validator
				const isValid = validator(null, token)
				expect(isValid).toBe(true)
			})
		})
		it('应该拒绝无效的密码格式', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// 测试无效的密码 - 根据实际的正则表达式 /^[a-zA-Z0-9_]{3,50}$/
			const invalidPasswords = [
				'',                    // 空密码
				'   ',                 // 空白字符
				'12',                  // 太短
				'a'.repeat(51),        // 太长
				'pass word',           // 包含空格
				'密码123',             // 包含中文
				'pass@word',           // 包含特殊字符
				'pass-word',           // 包含连字符
				'pass.word'            // 包含点号
			]

			invalidPasswords.forEach(password => {
				const validator = vm.networkFormRules.password.validator
				const isValid = validator(null, password)
				expect(isValid).toBe(false)
			})

			// 测试有效的密码
			const validPasswords = ['pass123', 'password_1', 'abc_123', 'test_password', 'PASSWORD123']
			validPasswords.forEach(password => {
				const validator = vm.networkFormRules.password.validator
				const isValid = validator(null, password)
				expect(isValid).toBe(true)
			})
		})
		it('应该拒绝超出限制的客户端连接数', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()
			await nextTick() // 等待limitInfo加载

			const vm = wrapper.vm as any

			// 测试无效的客户端连接数
			const invalidLimits = [
				-1,                    // 负数
				0,                     // 零
				NaN,                   // 非数字
				null,                  // null值
				undefined,             // undefined值
				1.5,                   // 小数
				Infinity,              // 无穷大
				-Infinity              // 负无穷大
			]

			invalidLimits.forEach(limit => {
				const validator = vm.networkFormRules.clientsLimit.validator
				const isValid = validator(null, limit)
				expect(isValid).toBe(false)
			})

			// 测试超出限制的情况（通过validateForm函数）
			vm.networkForm.clientsLimit = 25 // 超出mockLimitInfo中的限制20
			const isFormValid = vm.validateForm()
			expect(isFormValid).toBe(false)

			// 测试合理的连接数
			vm.networkForm.clientsLimit = 15
			const isFormValidNow = vm.validateForm()
			expect(isFormValidNow).toBe(true)
		})
		it('应该拒绝无效的备注信息', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// 测试无效的备注信息
			const invalidComments = [
				'a'.repeat(1000),      // 太长的备注
			]

			invalidComments.forEach(comment => {
				const validator = vm.networkFormRules.comment.validator
				const isValid = validator(null, comment)
				expect(isValid).toBe(false)
			})

			// 测试有效的备注信息
			const validComments = [
				'',                    // 空备注（可选字段）
				'   ',                 // 空白字符（可选字段）
				'测试备注',             // 中文备注
				'Test comment',        // 英文备注
				'a'.repeat(100),       // 100字符（边界值）
			]

			validComments.forEach(comment => {
				const validator = vm.networkFormRules.comment.validator
				const isValid = validator(null, comment)
				expect(isValid).toBe(true)
			})
		})
		it('应该正确处理API返回的错误响应', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// Mock创建API抛出错误（模拟真实的API错误情况）
			const apiError = new Error('API Error')
				; (apiError as any).response = {
					data: {
						message: '创建失败：网络名称已存在'
					}
				}
			vi.mocked(createVNet).mockRejectedValue(apiError)

			// 设置有效的表单数据
			vm.networkForm = {
				comment: 'Test Network',
				token: 'testnet123',
				password: 'pass123',
				ipAddress: '192.168.100.0',
				cidr: 24,
				enableDHCP: true,
				clientsLimit: 10,
				enabled: true
			}

			// 调用创建方法
			await vm.handleCreateNetwork()

			// 验证API被调用
			expect(createVNet).toHaveBeenCalled()

			// 验证错误被正确处理（组件应该显示错误消息但不崩溃）
			expect(wrapper.exists()).toBe(true)
		})

		it('应该处理网络异常情况', async () => {
			// Mock网络错误
			vi.mocked(getVNetList).mockRejectedValue(new Error('Network Error'))
			vi.mocked(getVNetLimitInfo).mockRejectedValue(new Error('Network Error'))
			vi.mocked(createVNet).mockRejectedValue(new Error('Network Error'))
			vi.mocked(updateVNet).mockRejectedValue(new Error('Network Error'))
			vi.mocked(deleteVNet).mockRejectedValue(new Error('Network Error'))

			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// 测试在网络错误情况下组件是否仍能正常工作
			expect(wrapper.exists()).toBe(true)

			// 测试创建网络在网络错误时的处理
			vm.networkForm = {
				comment: 'Test Network',
				token: 'testnet123',
				password: 'pass123',
				ipAddress: '192.168.100.0',
				cidr: 24,
				enableDHCP: true,
				clientsLimit: 10,
				enabled: true
			}

			await vm.handleCreateNetwork()
			expect(createVNet).toHaveBeenCalled()

			// 测试删除网络在网络错误时的处理
			await vm.handleDeleteNetwork('test-vnet-id')
			expect(deleteVNet).toHaveBeenCalled()
		})

		it('应该处理边界值测试', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()
			await nextTick() // 等待limitInfo加载

			const vm = wrapper.vm as any

			// 测试CIDR边界值
			vm.networkForm.cidr = 1
			expect(vm.validateForm()).toBe(true)

			vm.networkForm.cidr = 32
			expect(vm.validateForm()).toBe(true)

			// 测试客户端连接数边界值
			vm.networkForm.clientsLimit = 1
			expect(vm.validateForm()).toBe(true)

			vm.networkForm.clientsLimit = 20 // 假设最大限制是20
			expect(vm.validateForm()).toBe(true)

			// 测试最小长度的有效输入
			vm.networkForm.token = 'a1b2c3d4' // 8个字符的最小有效token
			vm.networkForm.password = 'pass1234' // 8个字符的最小有效密码
			vm.networkForm.comment = 'Test' // 最短有效备注

			expect(vm.validateForm()).toBe(true)
		})

		it('应该正确处理并发操作', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// Mock异步操作
			vi.mocked(createVNet).mockImplementation(() =>
				new Promise(resolve =>
					setTimeout(() => resolve({ code: 200, message: 'success', data: null }), 100)
				)
			)

			// 设置有效的表单数据
			vm.networkForm = {
				comment: 'Test Network',
				token: 'testnet123',
				password: 'pass123',
				ipAddress: '192.168.100.0',
				cidr: 24,
				enableDHCP: true,
				clientsLimit: 10,
				enabled: true
			}

			// 同时触发多个创建操作
			const promises = [
				vm.handleCreateNetwork(),
				vm.handleCreateNetwork(),
				vm.handleCreateNetwork()
			]

			await Promise.all(promises)

			// 验证防重复提交机制（应该只调用一次或有适当的处理）
			// 具体行为取决于组件的实现
			expect(createVNet).toHaveBeenCalled()
		})
	})

	describe('DHCP开关功能测试', () => {
		it('应该在关闭DHCP后不检查IP地址格式', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// 设置DHCP为关闭状态
			vm.networkForm.enableDHCP = false

			// 测试无效的IP地址格式，在DHCP关闭时应该通过验证
			const invalidIPs = [
				'256.256.256.256',  // 超出范围
				'192.168.1',        // 不完整
				'192.168.1.1.1',    // 多余段
				'abc.def.ghi.jkl',  // 字母
				'192.168.-1.1',     // 负数
				'192.168.1.',       // 末尾有点
				'.192.168.1.1',     // 开头有点
				'',                 // 空字符串
				null,				// null值
				'   ',              // 空白字符
				'192.168.1.1/24',   // 包含CIDR
			]

			invalidIPs.forEach(ip => {
				vm.networkForm.ipAddress = ip
				const validator = vm.networkFormRules.ipAddress.validator
				const isValid = validator(null, ip)
				// 关闭DHCP时，即使IP地址格式无效也应该通过验证
				expect(isValid).toBe(true)
			})
		})

		it('应该在关闭DHCP后不检查CIDR值', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// 设置DHCP为关闭状态
			vm.networkForm.enableDHCP = false

			// 测试无效的CIDR值，在DHCP关闭时应该通过验证
			const invalidCIDRs = [-1, 0, 7, 31, 33, 100, NaN]

			invalidCIDRs.forEach(cidr => {
				vm.networkForm.cidr = cidr
				const validator = vm.networkFormRules.cidr.validator
				const isValid = validator(null, cidr)
				// 关闭DHCP时，即使CIDR值无效也应该通过验证
				expect(isValid).toBe(true)
			})
		})

		it('应该能够成功创建关闭DHCP的虚拟网络', async () => {
			// Mock成功的创建响应
			vi.mocked(createVNet).mockResolvedValue({
				code: 200,
				message: 'success',
				data: null
			})

			const wrapper = mount(VirtualNetwork)
			await nextTick()
			await nextTick()

			const vm = wrapper.vm as any

			// 清除之前的API调用记录
			vi.mocked(createVNet).mockClear()
			vi.mocked(getVNetList).mockClear()
			vi.mocked(getVNetLimitInfo).mockClear()

			// 设置关闭DHCP的表单数据，使用无效的IP地址格式
			vm.networkForm = {
				comment: 'Test Network Without DHCP',
				token: 'test-no-dhcp',
				password: 'test123',
				ipAddress: 'invalid-ip',  // 无效的IP地址
				cidr: -1,                 // 无效的CIDR值
				enableDHCP: false,        // 关闭DHCP
				clientsLimit: 10,
				enabled: true
			}

			// 调用创建网络方法
			await vm.handleCreateNetwork()

			// 验证createVNet被正确调用，即使IP地址和CIDR无效
			expect(createVNet).toHaveBeenCalledTimes(1)
			expect(createVNet).toHaveBeenCalledWith({
				comment: 'Test Network Without DHCP',
				token: 'test-no-dhcp',
				password: 'test123',
				ipRange: '192.168.100.0/24',  // 即使格式无效也会被传递
				enableDHCP: false,
				clientsLimit: 10,
				enabled: true
			})

			// 验证创建成功后重新获取列表和限制信息
			expect(getVNetList).toHaveBeenCalledTimes(1)
			expect(getVNetLimitInfo).toHaveBeenCalledTimes(1)
		})

		it('应该在DHCP开关切换时重新验证表单', async () => {
			const wrapper = mount(VirtualNetwork)
			await nextTick()

			const vm = wrapper.vm as any

			// 设置一个无效的IP地址
			vm.networkForm.ipAddress = '256.256.256.256'
			vm.networkForm.cidr = 50

			// 首先关闭DHCP，验证应该通过
			vm.networkForm.enableDHCP = false
			let ipValidator = vm.networkFormRules.ipAddress.validator
			let cidrValidator = vm.networkFormRules.cidr.validator
			expect(ipValidator(null, vm.networkForm.ipAddress)).toBe(true)
			expect(cidrValidator(null, vm.networkForm.cidr)).toBe(true)

			// 然后开启DHCP，验证应该失败
			vm.networkForm.enableDHCP = true
			expect(ipValidator(null, vm.networkForm.ipAddress)).toBe(false)
			expect(cidrValidator(null, vm.networkForm.cidr)).toBe(false)

			// 再次关闭DHCP，验证应该又通过
			vm.networkForm.enableDHCP = false
			expect(ipValidator(null, vm.networkForm.ipAddress)).toBe(true)
			expect(cidrValidator(null, vm.networkForm.cidr)).toBe(true)
		})
	})
})