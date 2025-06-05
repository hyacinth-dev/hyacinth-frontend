/**
 * Login.vue 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { NCard, NForm, NFormItem, NInput, NButton } from 'naive-ui'
import Login from '../../views/Login.vue'
import type { LoginResponseData } from '../../api/auth'
import type { ApiResult } from '../../api/api'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
	useRouter: () => ({
		push: mockPush
	})
}))

// Mock naive-ui message
const mockMessage = {
	success: vi.fn(),
	error: vi.fn(),
	warning: vi.fn(),
	info: vi.fn()
}

vi.mock('naive-ui', async () => {
	const actual = await vi.importActual('naive-ui')
	return {
		...actual,
		useMessage: () => mockMessage
	}
})

// Mock auth API
vi.mock('../../api/auth', () => ({
	login: vi.fn()
}))

// Import mocked modules after mocking
const { login } = await import('../../api/auth')

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
})

describe('Login.vue', () => {
	let wrapper: VueWrapper<any>

	const createWrapper = () => {
		return mount(Login, {
			global: {
				components: {
					NCard,
					NForm,
					NFormItem,
					NInput,
					NButton
				},
				stubs: {
					'router-link': {
						template: '<a href="#"><slot /></a>'
					}
				}
			}
		})
	}

	beforeEach(() => {
		vi.clearAllMocks()
		wrapper = createWrapper()
	})

	afterEach(() => {
		wrapper?.unmount()
		vi.resetAllMocks()
	})

	describe('组件渲染', () => {
		it('应该正确渲染登录页面', () => {
			expect(wrapper.exists()).toBe(true)
			expect(wrapper.find('.login-container').exists()).toBe(true)
			expect(wrapper.find('.login-content').exists()).toBe(true)
			expect(wrapper.find('.login-left').exists()).toBe(true)
			expect(wrapper.find('.login-right').exists()).toBe(true)
		})

		it('应该渲染登录表单标题', () => {
			expect(wrapper.find('.login-title').text()).toBe('欢迎回来')
			expect(wrapper.find('.login-subtitle').text()).toBe('请登录您的账号')
		})

		it('应该渲染品牌信息', () => {
			expect(wrapper.find('.brand-title').text()).toBe('Hyacinth')
			expect(wrapper.find('.brand-description').text()).toBe('构建您的专属网络，连接无限可能')
		})

		it('应该渲染表单输入框', () => {
			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')

			expect(usernameInput.exists()).toBe(true)
			expect(passwordInput.exists()).toBe(true)
			expect(passwordInput.attributes('type')).toBe('password')
		})

		it('应该渲染登录按钮', () => {
			const loginButton = wrapper.find('button')
			expect(loginButton.exists()).toBe(true)
			expect(loginButton.text()).toBe('登录')
		})

		it('应该渲染注册链接', () => {
			const registerLink = wrapper.find('.link-text')
			expect(registerLink.text()).toContain('还没有账号？')
			expect(registerLink.text()).toContain('立即注册')
		})
	})

	describe('表单交互', () => {
		it('应该能够输入用户名和密码', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')

			await usernameInput.setValue('testuser@example.com')
			await passwordInput.setValue('password123')

			expect((usernameInput.element as HTMLInputElement).value).toBe('testuser@example.com')
			expect((passwordInput.element as HTMLInputElement).value).toBe('password123')
		})

		it('应该支持用户名格式输入', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			await usernameInput.setValue('testuser123')
			expect((usernameInput.element as HTMLInputElement).value).toBe('testuser123')
		})

		it('应该支持邮箱格式输入', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			await usernameInput.setValue('test@example.com')
			expect((usernameInput.element as HTMLInputElement).value).toBe('test@example.com')
		})
	})

	describe('登录功能', () => {
		it('应该在登录成功时保存token并跳转', async () => {
			const mockLoginResponse: ApiResult<LoginResponseData> = {
				code: 200,
				message: 'success',
				data: {
					accessToken: 'test-token-123'
				}
			}

			vi.mocked(login).mockResolvedValue(mockLoginResponse)

			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const loginButton = wrapper.find('button')

			await usernameInput.setValue('testuser@example.com')
			await passwordInput.setValue('password123')
			await loginButton.trigger('click')

			expect(login).toHaveBeenCalledWith({
				usernameOrEmail: 'testuser@example.com',
				password: 'password123'
			})

			// 等待异步操作完成
			await nextTick()

			expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token-123')
			expect(mockMessage.success).toHaveBeenCalledWith('登录成功')
			expect(mockPush).toHaveBeenCalledWith('/user/dashboard')
		})

		it('应该在登录失败时显示错误消息', async () => {
			const mockError = new Error('Unauthorized')
			vi.mocked(login).mockRejectedValue(mockError)

			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const loginButton = wrapper.find('button')

			await usernameInput.setValue('wronguser@example.com')
			await passwordInput.setValue('wrongpassword')
			await loginButton.trigger('click')

			expect(login).toHaveBeenCalledWith({
				usernameOrEmail: 'wronguser@example.com',
				password: 'wrongpassword'
			})

			// 等待异步操作完成
			await nextTick()

			expect(mockMessage.error).toHaveBeenCalledWith('用户名或密码错误')
			expect(localStorageMock.setItem).not.toHaveBeenCalled()
			expect(mockPush).not.toHaveBeenCalled()
		})

		it('应该处理网络错误', async () => {
			const mockError = new Error('Network Error')
			vi.mocked(login).mockRejectedValue(mockError)

			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const loginButton = wrapper.find('button')

			await usernameInput.setValue('test@example.com')
			await passwordInput.setValue('password123')
			await loginButton.trigger('click')

			// 等待异步操作完成
			await nextTick()

			expect(mockMessage.error).toHaveBeenCalledWith('用户名或密码错误')
		})
		it('应该在空表单时调用登录', async () => {
			const loginButton = wrapper.find('button')
			await loginButton.trigger('click')

			expect(login).toHaveBeenCalledWith({
				usernameOrEmail: '',
				password: ''
			})
		})
	})

	describe('表单验证', () => {
		// 获取组件内部的验证器函数
		const getValidator = () => {
			const vm = wrapper.vm as any
			return vm.rules?.usernameOrEmail?.validator
		}

		it('应该验证合法的邮箱格式', () => {
			const validator = getValidator()
			expect(validator).toBeDefined()

			// 测试有效邮箱格式
			expect(validator(null, 'test@example.com')).toBe(true)
			expect(validator(null, 'admin@test-domain.com')).toBe(true)
		})

		it('应该验证合法的用户名格式', () => {
			const validator = getValidator()
			expect(validator).toBeDefined()

			// 测试有效用户名格式
			expect(validator(null, 'testuser123')).toBe(true)
			expect(validator(null, 'user_name')).toBe(true)
			expect(validator(null, 'abc')).toBe(true) // 3个字符的最小长度
			expect(validator(null, 'username123456789012')).toBe(true) // 20个字符的最大长度
		})

		it('应该拒绝无效的邮箱格式', () => {
			const validator = getValidator()
			expect(validator).toBeDefined()

			// 测试无效邮箱格式
			expect(validator(null, 'invalid-email')).toBe(false)
			expect(validator(null, '@example.com')).toBe(false)
			expect(validator(null, 'test@')).toBe(false)
			expect(validator(null, 'test@.com')).toBe(false)
			expect(validator(null, 'test@example')).toBe(false) // 缺少顶级域名
			expect(validator(null, 'test..test@example.com')).toBe(true)
			expect(validator(null, '中文@example.com')).toBe(false)
			expect(validator(null, 'test@中文.com')).toBe(false)
			expect(validator(null, ',,test@example.com')).toBe(false)
		})

		it('应该拒绝无效的用户名格式', () => {
			const validator = getValidator()
			expect(validator).toBeDefined()

			// 测试无效用户名格式
			expect(validator(null, 'ab')).toBe(false) // 太短
			expect(validator(null, 'a'.repeat(21))).toBe(false) // 太长
			expect(validator(null, 'user-name')).toBe(false) // 包含连字符
			expect(validator(null, 'user name')).toBe(false) // 包含空格
			expect(validator(null, 'user@name')).toBe(false) // 包含@符号但不是有效邮箱
		})

		it('应该验证组合验证逻辑', () => {
			const validator = getValidator()
			expect(validator).toBeDefined()

			// 测试有效输入（邮箱或用户名）
			expect(validator(null, 'test@example.com')).toBe(true) // 有效邮箱
			expect(validator(null, 'testuser123')).toBe(true) // 有效用户名
			expect(validator(null, 'admin_user')).toBe(true) // 带下划线的用户名
			expect(validator(null, 'user123@domain.org')).toBe(true) // 邮箱格式

			// 测试无效输入
			expect(validator(null, '')).toBe(false) // 空字符串
			expect(validator(null, 'ab')).toBe(false) // 太短的用户名
			expect(validator(null, 'invalid-email')).toBe(false) // 既不是邮箱也不是用户名
		})

		it('应该处理空值和特殊情况', () => {
			const validator = getValidator()
			expect(validator).toBeDefined()

			// 测试空值情况
			expect(validator(null, '')).toBe(false)
			expect(validator(null, null as any)).toBe(false)
			expect(validator(null, undefined as any)).toBe(false)

			// 测试边界情况
			expect(validator(null, '   ')).toBe(false) // 只有空格
			expect(validator(null, 'a@')).toBe(false) // 不完整的邮箱
			expect(validator(null, '@b')).toBe(false) // 不完整的邮箱
		})

		it('应该处理复杂格式', () => {
			const validator = getValidator()
			expect(validator).toBeDefined()

			// 测试复杂但有效的邮箱格式
			expect(validator(null, 'user.name123@sub.domain.com')).toBe(true)

			// 测试特殊字符的用户名（应该失败）
			expect(validator(null, 'test+tag@example.com')).toBe(false) // +符号不被支持
			expect(validator(null, 'user#name')).toBe(false)
			expect(validator(null, 'user$name')).toBe(false)
			expect(validator(null, 'user.name')).toBe(false) // 点号不被用户名正则支持

			// 测试数字开头的用户名（应该成功）
			expect(validator(null, '123user')).toBe(true)
			expect(validator(null, '999test999')).toBe(true)
		})
	})

	describe('边界情况测试', () => {
		it('应该处理特殊字符输入', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')

			await usernameInput.setValue('test+user@example.com')
			await passwordInput.setValue('P@ssw0rd!@#$%^&*()')

			expect((usernameInput.element as HTMLInputElement).value).toBe('test+user@example.com')
			expect((passwordInput.element as HTMLInputElement).value).toBe('P@ssw0rd!@#$%^&*()')
		})

		it('应该处理超长输入', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const longInput = 'a'.repeat(100) + '@example.com'

			await usernameInput.setValue(longInput)
			expect((usernameInput.element as HTMLInputElement).value).toBe(longInput)
		})

		it('应该处理Unicode字符', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')

			await usernameInput.setValue('测试用户@example.com')
			await passwordInput.setValue('密码123')

			expect((usernameInput.element as HTMLInputElement).value).toBe('测试用户@example.com')
			expect((passwordInput.element as HTMLInputElement).value).toBe('密码123')
		})

		it('应该处理连续点击登录按钮', async () => {
			const mockLoginResponse: ApiResult<LoginResponseData> = {
				code: 200,
				message: 'success',
				data: {
					accessToken: 'test-token'
				}
			}

			vi.mocked(login).mockResolvedValue(mockLoginResponse)

			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const loginButton = wrapper.find('button')

			await usernameInput.setValue('test@example.com')
			await passwordInput.setValue('password123')

			// 连续点击登录按钮
			loginButton.trigger('click')
			loginButton.trigger('click')
			loginButton.trigger('click')

			await new Promise(resolve => setTimeout(resolve, 1000)) // 等待按钮动画恢复
			// 等待所有异步操作完成
			await nextTick()

			// 验证API只被调用了一次
			expect(login).toHaveBeenCalledTimes(1)
		})
	})
	describe('响应式数据', () => {
		it('应该正确初始化表单数据', () => {
			// 对于Composition API，我们检查输入框的初始值
			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')

			expect((usernameInput.element as HTMLInputElement).value).toBe('')
			expect((passwordInput.element as HTMLInputElement).value).toBe('')
		})

		it('应该正确绑定v-model', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')

			await usernameInput.setValue('newvalue')
			await passwordInput.setValue('newpassword')

			expect((usernameInput.element as HTMLInputElement).value).toBe('newvalue')
			expect((passwordInput.element as HTMLInputElement).value).toBe('newpassword')
		})
	})

	describe('样式类测试', () => {
		it('应该包含所有必要的CSS类', () => {
			expect(wrapper.find('.login-container').exists()).toBe(true)
			expect(wrapper.find('.login-content').exists()).toBe(true)
			expect(wrapper.find('.login-left').exists()).toBe(true)
			expect(wrapper.find('.login-right').exists()).toBe(true)
			expect(wrapper.find('.login-card').exists()).toBe(true)
			expect(wrapper.find('.login-header').exists()).toBe(true)
			expect(wrapper.find('.login-title').exists()).toBe(true)
			expect(wrapper.find('.login-subtitle').exists()).toBe(true)
			expect(wrapper.find('.form-actions').exists()).toBe(true)
			expect(wrapper.find('.form-links').exists()).toBe(true)
			expect(wrapper.find('.brand-content').exists()).toBe(true)
			expect(wrapper.find('.brand-title').exists()).toBe(true)
			expect(wrapper.find('.brand-description').exists()).toBe(true)
		})
	})
	describe('组件实例方法', () => {
		it('应该通过按钮点击触发登录', async () => {
			const mockLoginResponse: ApiResult<LoginResponseData> = {
				code: 200,
				message: 'success',
				data: {
					accessToken: 'test-token'
				}
			}

			vi.mocked(login).mockResolvedValue(mockLoginResponse)

			const usernameInput = wrapper.find('input[placeholder="用户名或邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const loginButton = wrapper.find('button')

			await usernameInput.setValue('test@example.com')
			await passwordInput.setValue('password123')
			await loginButton.trigger('click')

			expect(login).toHaveBeenCalledWith({
				usernameOrEmail: 'test@example.com',
				password: 'password123'
			})
			expect(mockMessage.success).toHaveBeenCalledWith('登录成功')
			expect(mockPush).toHaveBeenCalledWith('/user/dashboard')
		})
	})
})
