/**
 * Register.vue 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { NCard, NForm, NFormItem, NInput, NButton } from 'naive-ui'
import Register from '../../views/Register.vue'
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
	register: vi.fn()
}))

// Import mocked modules after mocking
const { register } = await import('../../api/auth')

describe('Register.vue', () => {
	let wrapper: VueWrapper<any>

	const createWrapper = () => {
		return mount(Register, {
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
		it('应该正确渲染注册页面', () => {
			expect(wrapper.exists()).toBe(true)
			expect(wrapper.find('.login-container').exists()).toBe(true)
			expect(wrapper.find('.login-content').exists()).toBe(true)
			expect(wrapper.find('.login-left').exists()).toBe(true)
			expect(wrapper.find('.login-right').exists()).toBe(true)
		})

		it('应该渲染注册表单标题', () => {
			expect(wrapper.find('.login-title').text()).toBe('创建账号')
			expect(wrapper.find('.login-subtitle').text()).toBe('请填写以下信息完成注册')
		})

		it('应该渲染品牌信息', () => {
			expect(wrapper.find('.brand-title').text()).toBe('Hyacinth')
			expect(wrapper.find('.brand-description').text()).toBe('构建您的专属网络，连接无限可能')
		})

		it('应该渲染所有表单输入框', () => {
			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const confirmPasswordInput = wrapper.find('input[placeholder="确认密码"]')

			expect(usernameInput.exists()).toBe(true)
			expect(emailInput.exists()).toBe(true)
			expect(passwordInput.exists()).toBe(true)
			expect(confirmPasswordInput.exists()).toBe(true)
			expect(passwordInput.attributes('type')).toBe('password')
			expect(confirmPasswordInput.attributes('type')).toBe('password')
		})

		it('应该渲染注册按钮', () => {
			const registerButton = wrapper.find('button')
			expect(registerButton.exists()).toBe(true)
			expect(registerButton.text()).toBe('注册')
		})

		it('应该渲染登录链接', () => {
			const loginLink = wrapper.find('.link-text')
			expect(loginLink.text()).toContain('已有账号？')
			expect(loginLink.text()).toContain('立即登录')
		})
	})

	describe('表单交互', () => {
		it('应该能够输入所有字段的值', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const confirmPasswordInput = wrapper.find('input[placeholder="确认密码"]')

			await usernameInput.setValue('testuser123')
			await emailInput.setValue('test@example.com')
			await passwordInput.setValue('password123')
			await confirmPasswordInput.setValue('password123')

			expect((usernameInput.element as HTMLInputElement).value).toBe('testuser123')
			expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com')
			expect((passwordInput.element as HTMLInputElement).value).toBe('password123')
			expect((confirmPasswordInput.element as HTMLInputElement).value).toBe('password123')
		})

		it('应该支持不同格式的用户名输入', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名"]')

			await usernameInput.setValue('user123')
			expect((usernameInput.element as HTMLInputElement).value).toBe('user123')

			await usernameInput.setValue('test_user')
			expect((usernameInput.element as HTMLInputElement).value).toBe('test_user')
		})

		it('应该支持邮箱格式输入', async () => {
			const emailInput = wrapper.find('input[placeholder="邮箱"]')

			await emailInput.setValue('user@domain.com')
			expect((emailInput.element as HTMLInputElement).value).toBe('user@domain.com')
		})
	})

	describe('注册功能', () => {
		const fillValidForm = async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const confirmPasswordInput = wrapper.find('input[placeholder="确认密码"]')

			await usernameInput.setValue('testuser123')
			await emailInput.setValue('test@example.com')
			await passwordInput.setValue('password123')
			await confirmPasswordInput.setValue('password123')
		}
		it('应该在注册成功时显示成功消息并跳转到登录页', async () => {
			vi.mocked(register).mockResolvedValue({
				code: 200,
				message: 'success',
				data: undefined
			})

			await fillValidForm()
			const registerButton = wrapper.find('button')
			await registerButton.trigger('click')

			expect(register).toHaveBeenCalledWith({
				username: 'testuser123',
				email: 'test@example.com',
				password: 'password123'
			})

			// 等待异步操作完成
			await nextTick()
			await new Promise(resolve => setTimeout(resolve, 0))

			expect(mockMessage.success).toHaveBeenCalledWith('注册成功')
			expect(mockPush).toHaveBeenCalledWith('/login')
		})

		it('应该在注册失败时显示错误消息', async () => {
			const mockError = {
				response: {
					data: {
						message: '邮箱已被注册'
					}
				}
			}
			vi.mocked(register).mockRejectedValue(mockError)

			await fillValidForm()
			const registerButton = wrapper.find('button')
			await registerButton.trigger('click')

			expect(register).toHaveBeenCalledWith({
				username: 'testuser123',
				email: 'test@example.com',
				password: 'password123'
			})

			// 等待异步操作完成
			await nextTick()
			await new Promise(resolve => setTimeout(resolve, 0))

			expect(mockMessage.error).toHaveBeenCalledWith('注册失败：邮箱已被注册')
			expect(mockPush).not.toHaveBeenCalled()
		})

		it('应该处理无响应消息的错误', async () => {
			const mockError = new Error('Network Error')
			vi.mocked(register).mockRejectedValue(mockError)

			await fillValidForm()
			const registerButton = wrapper.find('button')
			await registerButton.trigger('click')

			// 等待异步操作完成
			await nextTick()
			await new Promise(resolve => setTimeout(resolve, 0))

			expect(mockMessage.error).toHaveBeenCalledWith('注册失败：未知错误')
		})

		it('应该在表单验证失败时显示错误提示', async () => {
			// 故意填写无效表单
			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const confirmPasswordInput = wrapper.find('input[placeholder="确认密码"]')

			await usernameInput.setValue('ab') // 太短
			await emailInput.setValue('invalid-email') // 无效邮箱
			await passwordInput.setValue('123') // 太短且缺少字母
			await confirmPasswordInput.setValue('456') // 不匹配

			const registerButton = wrapper.find('button')
			await registerButton.trigger('click')

			expect(mockMessage.error).toHaveBeenCalledWith('请检查注册信息是否符合要求')
			expect(register).not.toHaveBeenCalled()
			expect(mockPush).not.toHaveBeenCalled()
		})
	})

	describe('表单验证', () => {
		// 获取验证器函数的辅助方法
		const getValidator = (fieldName: string) => {
			const vm = wrapper.vm as any
			return vm.rules?.[fieldName]?.validator
		}

		describe('用户名验证', () => {
			it('应该验证合法的用户名格式', () => {
				const validator = getValidator('username')
				expect(validator).toBeDefined()

				// 测试有效用户名格式
				expect(validator(null, 'testuser123')).toBe(true)
				expect(validator(null, 'user_name')).toBe(true)
				expect(validator(null, 'abc')).toBe(true) // 3个字符的最小长度
				expect(validator(null, 'a'.repeat(20))).toBe(true) // 20个字符的最大长度
				expect(validator(null, '123user')).toBe(true) // 数字开头
			})

			it('应该拒绝无效的用户名格式', () => {
				const validator = getValidator('username')
				expect(validator).toBeDefined()

				// 测试无效用户名格式
				expect(validator(null, '')).toBe(false) // 空字符串
				expect(validator(null, 'ab')).toBe(false) // 太短
				expect(validator(null, 'a'.repeat(21))).toBe(false) // 太长
				expect(validator(null, 'user-name')).toBe(false) // 包含连字符
				expect(validator(null, 'user name')).toBe(false) // 包含空格
				expect(validator(null, 'user@name')).toBe(false) // 包含@符号
				expect(validator(null, 'user.name')).toBe(false) // 包含点号
			})
		})

		describe('邮箱验证', () => {
			it('应该验证合法的邮箱格式', () => {
				const validator = getValidator('email')
				expect(validator).toBeDefined()

				// 测试有效邮箱格式
				expect(validator(null, 'test@example.com')).toBe(true)
				expect(validator(null, 'user.name@domain.org')).toBe(true)
				expect(validator(null, 'admin@test-domain.com')).toBe(true)
				expect(validator(null, 'user123@sub.domain.info')).toBe(true)
			})

			it('应该拒绝无效的邮箱格式', () => {
				const validator = getValidator('email')
				expect(validator).toBeDefined()

				// 测试无效邮箱格式
				expect(validator(null, '')).toBe(false) // 空字符串
				expect(validator(null, 'invalid-email')).toBe(false)
				expect(validator(null, '@example.com')).toBe(false)
				expect(validator(null, 'test@')).toBe(false)
				expect(validator(null, 'test@.com')).toBe(false)
				expect(validator(null, 'test@example')).toBe(false) // 缺少顶级域名
				expect(validator(null, '中文@example.com')).toBe(false) // 包含中文
				expect(validator(null, 'test@中文.com')).toBe(false) // 域名包含中文
			})
		})

		describe('密码验证', () => {
			it('应该验证合法的密码格式', () => {
				const validator = getValidator('password')
				expect(validator).toBeDefined()

				// 测试有效密码格式（至少8位，包含字母和数字）
				expect(validator(null, 'password123')).toBe(true)
				expect(validator(null, 'Password1')).toBe(true)
				expect(validator(null, 'abc12345')).toBe(true)
				expect(validator(null, '12345abcd')).toBe(true)
				expect(validator(null, 'P@ssw0rd123')).toBe(true) // 包含特殊字符也可以
			})

			it('应该拒绝无效的密码格式', () => {
				const validator = getValidator('password')
				expect(validator).toBeDefined()

				// 测试无效密码格式
				expect(validator(null, '')).toBe(false) // 空字符串
				expect(validator(null, '1234567')).toBe(false) // 太短
				expect(validator(null, '12345678')).toBe(false) // 只有数字
				expect(validator(null, 'password')).toBe(false) // 只有字母
				expect(validator(null, 'Pass123')).toBe(false) // 长度不够
			})
		})

		describe('确认密码验证', () => {
			it('应该验证密码匹配', async () => {
				const passwordInput = wrapper.find('input[placeholder="密码"]')
				await passwordInput.setValue('password123')

				const validator = getValidator('confirmPassword')
				expect(validator).toBeDefined()

				// 测试密码匹配
				expect(validator(null, 'password123')).toBe(true)
			})

			it('应该拒绝不匹配的密码', async () => {
				const passwordInput = wrapper.find('input[placeholder="密码"]')
				await passwordInput.setValue('password123')

				const validator = getValidator('confirmPassword')
				expect(validator).toBeDefined()

				// 测试密码不匹配
				expect(validator(null, 'differentpassword')).toBe(false)
				expect(validator(null, '')).toBe(false)
				expect(validator(null, 'Password123')).toBe(false) // 大小写不同
			})
		})
	})

	describe('边界情况测试', () => {
		it('应该处理特殊字符输入', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const confirmPasswordInput = wrapper.find('input[placeholder="确认密码"]')

			await usernameInput.setValue('test_user123')
			await emailInput.setValue('test+tag@example.com')
			await passwordInput.setValue('P@ssw0rd!123')
			await confirmPasswordInput.setValue('P@ssw0rd!123')

			expect((usernameInput.element as HTMLInputElement).value).toBe('test_user123')
			expect((emailInput.element as HTMLInputElement).value).toBe('test+tag@example.com')
			expect((passwordInput.element as HTMLInputElement).value).toBe('P@ssw0rd!123')
			expect((confirmPasswordInput.element as HTMLInputElement).value).toBe('P@ssw0rd!123')
		})

		it('应该处理超长输入', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const longUsername = 'a'.repeat(100)
			const longEmail = 'a'.repeat(50) + '@example.com'

			await usernameInput.setValue(longUsername)
			await emailInput.setValue(longEmail)

			expect((usernameInput.element as HTMLInputElement).value).toBe(longUsername)
			expect((emailInput.element as HTMLInputElement).value).toBe(longEmail)
		})

		it('应该处理Unicode字符', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')

			await usernameInput.setValue('用户123')
			await emailInput.setValue('测试@example.com')
			await passwordInput.setValue('密码123abc')

			expect((usernameInput.element as HTMLInputElement).value).toBe('用户123')
			expect((emailInput.element as HTMLInputElement).value).toBe('测试@example.com')
			expect((passwordInput.element as HTMLInputElement).value).toBe('密码123abc')
		})
		it('应该处理连续点击注册按钮（防重复点击测试）', async () => {
			vi.mocked(register).mockResolvedValue({
				code: 200,
				message: 'success',
				data: undefined
			})

			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const confirmPasswordInput = wrapper.find('input[placeholder="确认密码"]')
			const registerButton = wrapper.find('button')

			await usernameInput.setValue('testuser123')
			await emailInput.setValue('test@example.com')
			await passwordInput.setValue('password123')
			await confirmPasswordInput.setValue('password123')

			// 连续快速点击注册按钮
			registerButton.trigger('click')
			registerButton.trigger('click')
			registerButton.trigger('click')

			await new Promise(resolve => setTimeout(resolve, 1000)) // 等待按钮动画恢复

			// 等待异步操作完成
			await nextTick()

			// 验证API调用次数（实际实现中应该有防重复点击机制）
			expect(register).toHaveBeenCalledTimes(1)
		})
	})

	describe('响应式数据', () => {
		it('应该正确初始化表单数据', () => {
			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const confirmPasswordInput = wrapper.find('input[placeholder="确认密码"]')

			expect((usernameInput.element as HTMLInputElement).value).toBe('')
			expect((emailInput.element as HTMLInputElement).value).toBe('')
			expect((passwordInput.element as HTMLInputElement).value).toBe('')
			expect((confirmPasswordInput.element as HTMLInputElement).value).toBe('')
		})

		it('应该正确绑定v-model', async () => {
			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const confirmPasswordInput = wrapper.find('input[placeholder="确认密码"]')

			await usernameInput.setValue('newuser')
			await emailInput.setValue('new@example.com')
			await passwordInput.setValue('newpassword123')
			await confirmPasswordInput.setValue('newpassword123')

			expect((usernameInput.element as HTMLInputElement).value).toBe('newuser')
			expect((emailInput.element as HTMLInputElement).value).toBe('new@example.com')
			expect((passwordInput.element as HTMLInputElement).value).toBe('newpassword123')
			expect((confirmPasswordInput.element as HTMLInputElement).value).toBe('newpassword123')
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
		it('应该通过按钮点击触发注册', async () => {
			vi.mocked(register).mockResolvedValue({
				code: 200,
				message: 'success',
				data: undefined
			})

			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const confirmPasswordInput = wrapper.find('input[placeholder="确认密码"]')
			const registerButton = wrapper.find('button')

			await usernameInput.setValue('testuser123')
			await emailInput.setValue('test@example.com')
			await passwordInput.setValue('password123')
			await confirmPasswordInput.setValue('password123')
			await registerButton.trigger('click')

			expect(register).toHaveBeenCalledWith({
				username: 'testuser123',
				email: 'test@example.com',
				password: 'password123'
			})

			// 等待异步操作完成
			await nextTick()

			expect(mockMessage.success).toHaveBeenCalledWith('注册成功')
			expect(mockPush).toHaveBeenCalledWith('/login')
		})

		it('应该在空表单时调用注册并显示验证错误', async () => {
			const registerButton = wrapper.find('button')
			await registerButton.trigger('click')

			expect(mockMessage.error).toHaveBeenCalledWith('请检查注册信息是否符合要求')
			expect(register).not.toHaveBeenCalled()
		})
	})

	describe('加载状态测试', () => {
		it('应该在注册过程中显示加载状态', async () => {
			// 创建一个永不resolve的Promise来模拟加载状态
			const pendingPromise: Promise<ApiResult<void>> = new Promise(() => { })
			vi.mocked(register).mockReturnValue(pendingPromise)

			const usernameInput = wrapper.find('input[placeholder="用户名"]')
			const emailInput = wrapper.find('input[placeholder="邮箱"]')
			const passwordInput = wrapper.find('input[placeholder="密码"]')
			const confirmPasswordInput = wrapper.find('input[placeholder="确认密码"]')
			const registerButton = wrapper.find('button')

			await usernameInput.setValue('testuser123')
			await emailInput.setValue('test@example.com')
			await passwordInput.setValue('password123')
			await confirmPasswordInput.setValue('password123')

			await registerButton.trigger('click')
			await nextTick()

			// 验证按钮显示加载状态
			expect(registerButton.text()).toBe('注册中...')
		})
	})
})
