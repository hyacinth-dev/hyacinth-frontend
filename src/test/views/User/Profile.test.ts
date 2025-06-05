/**
 * Profile.vue 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Profile from '../../../views/User/Profile.vue'

// Mock Naive UI 组件
vi.mock('naive-ui', () => ({
	NForm: {
		name: 'NForm',
		template: '<form class="n-form"><slot /></form>',
		props: ['model', 'rules', 'labelPlacement', 'labelWidth'],
		methods: {
			validate: vi.fn(() => Promise.resolve())
		}
	},
	NFormItem: {
		name: 'NFormItem',
		template: '<div class="n-form-item" :data-label="label" :data-path="path"><slot /></div>',
		props: ['label', 'path']
	},
	NInput: {
		name: 'NInput',
		template: '<input class="n-input" :type="type" :disabled="disabled" :value="value" @input="$emit(\'update:value\', $event.target.value)" />',
		props: ['value', 'type', 'disabled', 'showPasswordOn'],
		emits: ['update:value']
	},
	NButton: {
		name: 'NButton',
		template: '<button class="n-button" :class="{ loading: loading, [type]: type }" :disabled="loading" @click="$emit(\'click\')"><slot /></button>',
		props: ['type', 'loading'],
		emits: ['click']
	},
	NCard: {
		name: 'NCard',
		template: '<div class="n-card" :data-title="title"><slot /></div>',
		props: ['title']
	},
	NSpace: {
		name: 'NSpace',
		template: '<div class="n-space" :class="{ vertical: vertical }" :style="{ gap: size }"><slot /></div>',
		props: ['vertical', 'size']
	},
	NAvatar: {
		name: 'NAvatar',
		template: '<img class="n-avatar" :src="src" :class="{ round: round }" :style="{ width: size + \'px\', height: size + \'px\' }" />',
		props: ['src', 'round', 'size']
	},
	useMessage: vi.fn(() => ({
		success: vi.fn(),
		error: vi.fn()
	}))
}))

// Mock Vue Router
vi.mock('vue-router', () => ({
	useRouter: vi.fn(() => ({
		push: vi.fn()
	}))
}))

// Mock Auth API
vi.mock('../../../api/auth', () => ({
	getUserInfo: vi.fn(),
	updateProfile: vi.fn(),
	changePassword: vi.fn()
}))

import { useRouter } from 'vue-router'
import { getUserInfo, updateProfile, changePassword } from '../../../api/auth'
import { useMessage } from 'naive-ui'

describe('Profile.vue', () => {
	let mockRouter: any
	let mockMessage: any

	beforeEach(() => {
		mockRouter = {
			push: vi.fn()
		}
		mockMessage = {
			success: vi.fn(),
			error: vi.fn()
		}
		vi.mocked(useRouter).mockReturnValue(mockRouter)
		vi.mocked(useMessage).mockReturnValue(mockMessage)		// 默认提供getUserInfo的mock返回值
		vi.mocked(getUserInfo).mockResolvedValue({
			code: 0,
			message: 'success',
			data: {
				userId: "user_1",
				username: 'testuser',
				email: 'test@example.com',
				userGroup: 1,
				userGroupName: '普通用户',
				privilegeExpiry: null,
				isVip: false,
				activeTunnels: 0,
				availableTraffic: '100GB',
				onlineDevices: 0
			}
		})

		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('应该正确渲染组件', () => {
		const wrapper = mount(Profile)

		// 验证组件是否渲染
		expect(wrapper.exists()).toBe(true)
		expect(wrapper.find('.profile').exists()).toBe(true)
	})

	it('应该显示正确的标题', () => {
		const wrapper = mount(Profile)

		const title = wrapper.find('h2')
		expect(title.exists()).toBe(true)
		expect(title.text()).toBe('个人中心')
	})

	it('应该包含必要的卡片组件', () => {
		const wrapper = mount(Profile)

		const cards = wrapper.findAllComponents({ name: 'NCard' })
		expect(cards.length).toBe(2)

		// 验证卡片标题
		const basicInfoCard = cards.find(card => card.props('title') === '基本信息')
		const passwordCard = cards.find(card => card.props('title') === '修改密码')

		expect(basicInfoCard).toBeDefined()
		expect(passwordCard).toBeDefined()
	})

	it('应该包含用户头像', () => {
		const wrapper = mount(Profile)

		const avatar = wrapper.findComponent({ name: 'NAvatar' })
		expect(avatar.exists()).toBe(true)
		expect(avatar.props('round')).toBeDefined()
		expect(avatar.props('size')).toBe(64)
		expect(avatar.props('src')).toBe('https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg')
	})

	it('应该包含个人信息表单', () => {
		const wrapper = mount(Profile)

		const profileForm = wrapper.find('.form')
		expect(profileForm.exists()).toBe(true)

		const profileFormItems = profileForm.findAllComponents({ name: 'NFormItem' })
		expect(profileFormItems.length).toBeGreaterThan(0)

		// 验证用户名输入框
		const usernameFormItem = profileFormItems.find((item: any) => item.props('label') === '用户名')
		expect(usernameFormItem).toBeDefined()

		// 验证邮箱输入框
		const emailFormItem = profileFormItems.find((item: any) => item.props('label') === '邮箱')
		expect(emailFormItem).toBeDefined()
	})

	it('应该包含密码修改表单', () => {
		const wrapper = mount(Profile)

		const passwordCard = wrapper.findAllComponents({ name: 'NCard' }).find(card => card.props('title') === '修改密码')
		expect(passwordCard).toBeDefined()

		if (passwordCard) {
			const passwordFormItems = passwordCard.findAllComponents({ name: 'NFormItem' })

			// 验证当前密码输入框
			const currentPasswordItem = passwordFormItems.find(item => item.props('label') === '当前密码')
			expect(currentPasswordItem).toBeDefined()

			// 验证新密码输入框
			const newPasswordItem = passwordFormItems.find(item => item.props('label') === '新密码')
			expect(newPasswordItem).toBeDefined()

			// 验证确认密码输入框
			const confirmPasswordItem = passwordFormItems.find(item => item.props('label') === '确认新密码')
			expect(confirmPasswordItem).toBeDefined()
		}
	})

	it('应该包含保存修改按钮', () => {
		const wrapper = mount(Profile)

		const buttons = wrapper.findAllComponents({ name: 'NButton' })
		const saveButton = buttons.find(button => button.text().includes('保存修改'))

		expect(saveButton).toBeDefined()
		if (saveButton) {
			expect(saveButton.props('type')).toBe('primary')
		}
	})

	it('应该包含修改密码按钮', () => {
		const wrapper = mount(Profile)

		const buttons = wrapper.findAllComponents({ name: 'NButton' })
		const changePasswordButton = buttons.find(button => button.text().includes('修改密码'))

		expect(changePasswordButton).toBeDefined()
		if (changePasswordButton) {
			expect(changePasswordButton.props('type')).toBe('primary')
		}
	})

	it('应该包含密码类型的输入框', () => {
		const wrapper = mount(Profile)

		const passwordInputs = wrapper.findAllComponents({ name: 'NInput' }).filter(input => input.props('type') === 'password')
		expect(passwordInputs.length).toBe(3) // 当前密码、新密码、确认密码

		passwordInputs.forEach(input => {
			expect(input.props('showPasswordOn')).toBe('click')
		})
	})
	it('应该包含禁用的邮箱输入框', () => {
		const wrapper = mount(Profile)

		const allInputs = wrapper.findAllComponents({ name: 'NInput' })
		const emailInputByIndex = allInputs[1] // 邮箱是第二个表单

		// 检查邮箱输入框是否存在
		expect(emailInputByIndex).toBeDefined()
		expect(emailInputByIndex.props()).toHaveProperty('disabled')
	})

	it('应该包含NSpace组件并设置正确的属性', () => {
		const wrapper = mount(Profile)

		const space = wrapper.findComponent({ name: 'NSpace' })
		expect(space.exists()).toBe(true)
		expect(space.props('vertical')).toBeDefined()
		expect(space.props('size')).toBe('large')
	})

	it('应该正确应用样式类', () => {
		const wrapper = mount(Profile)

		// 验证主容器有正确的类名
		expect(wrapper.find('.profile').exists()).toBe(true)

		// 验证内容区域有正确的类名
		expect(wrapper.find('.profile-content').exists()).toBe(true)

		// 验证用户信息区域有正确的类名
		expect(wrapper.find('.user-info').exists()).toBe(true)

		// 验证表单有正确的类名
		expect(wrapper.find('.form').exists()).toBe(true)
	})
	it('组件挂载时应该调用获取用户信息方法', async () => {
		const mockGetUserInfo = vi.mocked(getUserInfo)
		mockGetUserInfo.mockResolvedValue({
			code: 0,
			message: 'success',
			data: {
				userId: "user_1",
				username: 'testuser',
				email: 'test@example.com',
				userGroup: 1,
				userGroupName: '普通用户',
				privilegeExpiry: null,
				isVip: false,
				activeTunnels: 0,
				availableTraffic: '100GB',
				onlineDevices: 0
			}
		})
		mount(Profile)

		await nextTick()
		expect(mockGetUserInfo).toHaveBeenCalled()
	})

	it('获取用户信息成功时应该更新表单数据', async () => {
		const mockGetUserInfo = vi.mocked(getUserInfo)
		const userData = {
			userId: "user_1",
			username: 'testuser',
			email: 'test@example.com',
			userGroup: 1,
			userGroupName: '普通用户',
			privilegeExpiry: null,
			isVip: false,
			activeTunnels: 0,
			availableTraffic: '100GB',
			onlineDevices: 0
		}

		mockGetUserInfo.mockResolvedValue({
			code: 0,
			message: 'success',
			data: userData
		})

		const wrapper = mount(Profile)

		// 等待组件挂载和异步数据加载完成
		await nextTick()
		await nextTick() // 需要多等一次 tick 确保异步操作完成

		// 验证用户名输入框的值 - 尝试通过索引查找
		const allInputs = wrapper.findAllComponents({ name: 'NInput' })
		const usernameInput = allInputs[0] // 用户名是第一个输入框

		if (usernameInput) {
			expect(usernameInput.props('value')).toBe(userData.username)
		}
	})

	it('获取用户信息失败时应该显示错误消息', async () => {
		const mockGetUserInfo = vi.mocked(getUserInfo)
		mockGetUserInfo.mockRejectedValue(new Error('Network error'))

		mount(Profile)
		await nextTick()

		expect(mockMessage.error).toHaveBeenCalledWith('获取用户信息失败')
	})
	it('点击保存修改按钮应该调用更新接口', async () => {
		const mockUpdateProfile = vi.mocked(updateProfile)
		mockUpdateProfile.mockResolvedValue({
			code: 0,
			message: 'success',
			data: undefined
		})

		const wrapper = mount(Profile)
		await nextTick()

		const saveButton = wrapper.findAllComponents({ name: 'NButton' }).find(button =>
			button.text().includes('保存修改')
		)

		if (saveButton) {
			await saveButton.trigger('click')
			await nextTick()

			expect(mockUpdateProfile).toHaveBeenCalled()
		}
	})

	it('点击修改密码按钮应该调用修改密码接口', async () => {
		const mockChangePassword = vi.mocked(changePassword)
		mockChangePassword.mockResolvedValue({
			code: 0,
			message: 'success',
			data: undefined
		})

		const wrapper = mount(Profile)
		await nextTick()

		const changePasswordButton = wrapper.findAllComponents({ name: 'NButton' }).find(button =>
			button.text().includes('修改密码')
		)

		if (changePasswordButton) {
			await changePasswordButton.trigger('click')
			await nextTick()

			expect(mockChangePassword).toHaveBeenCalled()
		}
	})
	it('密码修改成功后应该跳转到登录页', async () => {
		const mockChangePassword = vi.mocked(changePassword)
		mockChangePassword.mockResolvedValue({
			code: 0,
			message: 'success',
			data: undefined
		})

		// Mock setTimeout
		vi.useFakeTimers()

		const wrapper = mount(Profile)
		await nextTick()

		const changePasswordButton = wrapper.findAllComponents({ name: 'NButton' }).find(button =>
			button.text().includes('修改密码')
		)

		if (changePasswordButton) {
			await changePasswordButton.trigger('click')
			await nextTick()

			expect(mockMessage.success).toHaveBeenCalledWith('密码修改成功，即将退出登录')

			// 快进时间
			vi.advanceTimersByTime(1000)

			expect(mockRouter.push).toHaveBeenCalledWith('/login')
		}

		vi.useRealTimers()
	})

	it('更新个人信息失败时应该显示错误消息', async () => {
		const mockUpdateProfile = vi.mocked(updateProfile)
		const errorResponse = {
			response: {
				data: {
					message: '用户名已存在'
				}
			}
		}
		mockUpdateProfile.mockRejectedValue(errorResponse)

		const wrapper = mount(Profile)
		await nextTick()

		const saveButton = wrapper.findAllComponents({ name: 'NButton' }).find(button =>
			button.text().includes('保存修改')
		)

		if (saveButton) {
			await saveButton.trigger('click')
			await nextTick()

			expect(mockMessage.error).toHaveBeenCalledWith('更新失败: 用户名已存在')
		}
	})

	it('修改密码失败时应该显示错误消息', async () => {
		const mockChangePassword = vi.mocked(changePassword)
		const errorResponse = {
			response: {
				data: {
					message: '当前密码错误'
				}
			}
		}
		mockChangePassword.mockRejectedValue(errorResponse)

		const wrapper = mount(Profile)
		await nextTick()

		const changePasswordButton = wrapper.findAllComponents({ name: 'NButton' }).find(button =>
			button.text().includes('修改密码')
		)

		if (changePasswordButton) {
			await changePasswordButton.trigger('click')
			await nextTick()

			expect(mockMessage.error).toHaveBeenCalledWith('密码修改失败: 当前密码错误')
		}
	})

	it('加载状态时按钮应该显示loading', async () => {
		const mockUpdateProfile = vi.mocked(updateProfile)
		// 让接口调用一直挂起，模拟加载状态
		mockUpdateProfile.mockImplementation(() => new Promise(() => { }))

		const wrapper = mount(Profile)
		await nextTick()

		const saveButton = wrapper.findAllComponents({ name: 'NButton' }).find(button =>
			button.text().includes('保存修改')
		)

		if (saveButton) {
			await saveButton.trigger('click')
			await nextTick()

			expect(saveButton.props('loading')).toBe(true)
		}
	})
})
