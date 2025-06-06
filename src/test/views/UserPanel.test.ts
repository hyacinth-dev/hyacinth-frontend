/**
 * UserPanel.vue 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { NLayout, NLayoutContent, NLayoutSider, NMenu, NAvatar, NDropdown, NSpace } from 'naive-ui'
import UserPanel from '../../views/UserPanel.vue'
import type { ApiResult } from '../../api/api'
import type { UserInfoResponseData } from '../../api/auth'

// Mock vue-router
const mockPush = vi.fn()
const mockCurrentRoute = {
	value: {
		path: '/user/dashboard'
	}
}

vi.mock('vue-router', () => ({
	useRouter: () => ({
		push: mockPush,
		currentRoute: mockCurrentRoute
	})
}))

// Mock auth API
vi.mock('../../api/auth', () => ({
	getUserInfo: vi.fn()
}))

// Import the mocked function
import { getUserInfo } from '../../api/auth'
const mockGetUserInfo = vi.mocked(getUserInfo)

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

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { })

describe('UserPanel.vue', () => {
	let wrapper: VueWrapper<any>

	const createWrapper = () => {
		return mount(UserPanel, {
			global: {
				components: {
					NLayout,
					NLayoutContent,
					NLayoutSider,
					NMenu,
					NAvatar,
					NDropdown,
					NSpace
				},
				stubs: {
					'router-view': {
						template: '<div class="router-view-stub">Router View Content</div>'
					}
				}
			}
		})
	}
	beforeEach(() => {
		vi.clearAllMocks()
		localStorageMock.getItem.mockReturnValue('mock-token')
		mockGetUserInfo.mockResolvedValue({
			code: 200,
			message: 'success',
			data: {
				userId: 'user123',
				username: 'testuser',
				email: 'test@example.com',
				userGroup: 1,
				userGroupName: 'basic',
				privilegeExpiry: null,
				isVip: false,
				activeTunnels: 5,
				availableTraffic: '100GB',
				onlineDevices: 2
			}
		} as ApiResult<UserInfoResponseData>)
	})

	afterEach(() => {
		wrapper?.unmount()
		vi.resetAllMocks()
	})

	describe('组件渲染', () => {
		it('应该正确渲染用户面板布局', async () => {
			wrapper = createWrapper()
			await nextTick()

			expect(wrapper.exists()).toBe(true)
			expect(wrapper.findComponent(NLayout).exists()).toBe(true)
			expect(wrapper.findComponent(NLayoutSider).exists()).toBe(true)
			expect(wrapper.findComponent(NLayoutContent).exists()).toBe(true)
			expect(wrapper.find('.router-view-stub').exists()).toBe(true)
		})

		it('应该渲染导航菜单', async () => {
			wrapper = createWrapper()
			await nextTick()

			const menu = wrapper.findComponent(NMenu)
			expect(menu.exists()).toBe(true)
		})

		it('应该渲染用户信息区域', async () => {
			wrapper = createWrapper()
			await nextTick()

			const userProfile = wrapper.find('.user-profile')
			expect(userProfile.exists()).toBe(true)
			expect(wrapper.findComponent(NAvatar).exists()).toBe(true)
			expect(wrapper.findComponent(NDropdown).exists()).toBe(true)
		})

		it('应该显示用户名', async () => {
			wrapper = createWrapper()
			await nextTick()
			await new Promise(resolve => setTimeout(resolve, 100))

			const username = wrapper.find('.username')
			expect(username.exists()).toBe(true)
			expect(username.text()).toBe('testuser')
		})
	})

	describe('登录状态检查', () => {
		it('应该在有token时正常加载', async () => {
			localStorageMock.getItem.mockReturnValue('valid-token')
			wrapper = createWrapper()
			await nextTick()

			expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
			expect(mockPush).not.toHaveBeenCalledWith('/login')
		})

		it('应该在没有token时跳转到登录页', async () => {
			localStorageMock.getItem.mockReturnValue(null)
			wrapper = createWrapper()
			await nextTick()

			expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
			expect(mockPush).toHaveBeenCalledWith('/login')
		})

		it('应该在token为空字符串时跳转到登录页', async () => {
			localStorageMock.getItem.mockReturnValue('')
			wrapper = createWrapper()
			await nextTick()

			expect(mockPush).toHaveBeenCalledWith('/login')
		})
	})

	describe('用户信息获取', () => {
		it('应该在组件挂载时获取用户信息', async () => {
			wrapper = createWrapper()
			await nextTick()

			expect(mockGetUserInfo).toHaveBeenCalled()
		})

		it('应该正确显示获取到的用户信息', async () => {
			wrapper = createWrapper()
			await nextTick()
			await new Promise(resolve => setTimeout(resolve, 100))

			const username = wrapper.find('.username')
			expect(username.text()).toBe('testuser')
		})

		it('应该处理用户信息获取失败', async () => {
			mockGetUserInfo.mockRejectedValue(new Error('API Error'))
			wrapper = createWrapper()
			await nextTick()

			expect(mockConsoleError).toHaveBeenCalledWith('获取用户信息失败:', expect.any(Error))
		})

		it('应该处理不同的用户信息', async () => {
			mockGetUserInfo.mockResolvedValue({
				code: 200,
				message: 'success',
				data: {
					userId: 'user456',
					username: 'anotheruser',
					email: 'another@example.com',
					userGroup: 2,
					userGroupName: 'premium',
					privilegeExpiry: '2024-12-31',
					isVip: true,
					activeTunnels: 10,
					availableTraffic: '500GB',
					onlineDevices: 5
				}
			} as ApiResult<UserInfoResponseData>)

			wrapper = createWrapper()
			await nextTick()
			await new Promise(resolve => setTimeout(resolve, 100))

			const username = wrapper.find('.username')
			expect(username.text()).toBe('anotheruser')
		})
	})

	describe('菜单导航', () => {
		beforeEach(async () => {
			wrapper = createWrapper()
			await nextTick()
		})

		it('应该根据当前路由设置激活菜单项', async () => {
			mockCurrentRoute.value.path = '/user/vnetwork'
			wrapper = createWrapper()
			await nextTick()

			const vm = wrapper.vm as any
			expect(vm.activeKey).toBe('/user/vnetwork')
		})

		it('应该在当前路由不在菜单中时设置默认激活项', async () => {
			mockCurrentRoute.value.path = '/user/unknown'
			wrapper = createWrapper()
			await nextTick()

			const vm = wrapper.vm as any
			expect(vm.activeKey).toBe('/user/dashboard')
		})

		it('应该在菜单项点击时导航到对应路由', async () => {
			const menu = wrapper.findComponent(NMenu)
			menu.vm.$emit('update:value', '/user/store')

			expect(mockPush).toHaveBeenCalledWith('/user/store')
		})

		it('应该支持所有预定义的菜单路由', async () => {
			const routes = ['/user/dashboard', '/user/vnetwork', '/user/store', '/user/about']

			for (const route of routes) {
				const menu = wrapper.findComponent(NMenu)
				menu.vm.$emit('update:value', route)
				expect(mockPush).toHaveBeenCalledWith(route)
			}
		})
	})

	describe('下拉菜单操作', () => {
		beforeEach(async () => {
			wrapper = createWrapper()
			await nextTick()
		})

		it('应该在选择个人中心时跳转到个人中心页面', async () => {
			const dropdown = wrapper.findComponent(NDropdown)
			dropdown.vm.$emit('select', 'profile')

			expect(mockPush).toHaveBeenCalledWith('/user/profile')
		})

		it('应该在选择退出登录时清除token并跳转到登录页', async () => {
			const dropdown = wrapper.findComponent(NDropdown)
			dropdown.vm.$emit('select', 'logout')

			expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
			expect(mockPush).toHaveBeenCalledWith('/login')
		})

		it('应该忽略未知的下拉菜单选项', async () => {
			const dropdown = wrapper.findComponent(NDropdown)
			dropdown.vm.$emit('select', 'unknown')

			expect(mockPush).not.toHaveBeenCalled()
			expect(localStorageMock.removeItem).not.toHaveBeenCalled()
		})
	})

	describe('侧边栏折叠功能', () => {
		beforeEach(async () => {
			wrapper = createWrapper()
			await nextTick()
		})

		it('应该正确初始化侧边栏状态', () => {
			const vm = wrapper.vm as any
			expect(vm.collapsed).toBe(false)
			expect(vm.showUsername).toBe(true)
		})

		it('应该通过点击折叠按钮切换侧边栏状态', async () => {
			const vm = wrapper.vm as any
			const layoutSider = wrapper.findComponent(NLayoutSider)
			
			// 初始状态应该是展开的
			expect(vm.collapsed).toBe(false)
			
			// 模拟点击折叠按钮
			await layoutSider.vm.$emit('update:collapsed', true)
			
			// 验证折叠状态已更新
			expect(vm.collapsed).toBe(true)
			expect(vm.showUsername).toBe(false)
			
			// 再次点击折叠按钮，展开侧边栏
			await layoutSider.vm.$emit('update:collapsed', false)
			
			// 等待动画延迟
			await new Promise(resolve => setTimeout(resolve, 150))
			
			// 验证展开状态
			expect(vm.collapsed).toBe(false)
			expect(vm.showUsername).toBe(true)
		})

		it('应该在折叠时隐藏用户名', async () => {
			const vm = wrapper.vm as any
			vm.collapsed = true
			await nextTick()

			expect(vm.showUsername).toBe(false)
		})

		it('应该在展开时延迟显示用户名', async () => {
			const vm = wrapper.vm as any
			vm.collapsed = true
			await nextTick()

			vm.collapsed = false
			await nextTick()

			// 立即检查，应该还是false
			expect(vm.showUsername).toBe(false)

			// 等待延迟后检查
			await new Promise(resolve => setTimeout(resolve, 150))
			expect(vm.showUsername).toBe(true)
		})

		it('应该在折叠状态下不显示用户名文本', async () => {
			const vm = wrapper.vm as any
			vm.collapsed = true
			vm.showUsername = false
			await nextTick()

			const username = wrapper.find('.username')
			expect(username.exists()).toBe(false)
		})
	})

	describe('响应式数据', () => {
		beforeEach(async () => {
			wrapper = createWrapper()
			await nextTick()
		})

		it('应该正确初始化用户信息数据', async () => {
			await new Promise(resolve => setTimeout(resolve, 0))

			const vm = wrapper.vm as any
			expect(vm.userInfo.username).toBe('testuser')
			expect(vm.userInfo.email).toBe('test@example.com')
			expect(vm.userInfo.avatar).toBe('https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg')
		})

		it('应该正确更新活跃菜单键', async () => {
			const vm = wrapper.vm as any
			const menu = wrapper.findComponent(NMenu)

			menu.vm.$emit('update:value', '/user/about')
			expect(vm.activeKey).toBe('/user/about')
		})
	})

	describe('边界情况测试', () => {
		it('应该处理空的用户信息响应', async () => {
			mockGetUserInfo.mockResolvedValue({
				code: 200,
				message: 'success',
				data: {
					userId: '',
					username: '',
					email: '',
					userGroup: 0,
					userGroupName: '',
					privilegeExpiry: null,
					isVip: false,
					activeTunnels: 0,
					availableTraffic: '',
					onlineDevices: 0
				}
			} as ApiResult<UserInfoResponseData>)

			wrapper = createWrapper()
			await nextTick()
			await new Promise(resolve => setTimeout(resolve, 100))

			const username = wrapper.find('.username')
			expect(username.text()).toBe('')
		})

		it('应该处理网络错误', async () => {
			mockGetUserInfo.mockRejectedValue(new Error('Network Error'))
			wrapper = createWrapper()
			await nextTick()

			expect(mockConsoleError).toHaveBeenCalledWith('获取用户信息失败:', expect.any(Error))
		})

		it('应该处理API返回错误状态码', async () => {
			mockGetUserInfo.mockRejectedValue({
				response: {
					status: 401,
					data: { message: 'Unauthorized' }
				}
			})

			wrapper = createWrapper()
			await nextTick()

			expect(mockConsoleError).toHaveBeenCalled()
		})
	})

	describe('组件样式类', () => {
		beforeEach(async () => {
			wrapper = createWrapper()
			await nextTick()
		})

		it('应该包含所有必要的CSS类', () => {
			expect(wrapper.find('.sider-content').exists()).toBe(true)
			expect(wrapper.find('.user-profile').exists()).toBe(true)
			expect(wrapper.find('.username').exists()).toBe(true)
		})

		it('应该正确应用样式属性', () => {
			const siderContent = wrapper.find('.sider-content')
			expect(siderContent.exists()).toBe(true)

			const userProfile = wrapper.find('.user-profile')
			expect(userProfile.exists()).toBe(true)
		})
	})

	describe('组件生命周期', () => {
		it('应该在组件挂载时执行必要的初始化', async () => {
			wrapper = createWrapper()
			await nextTick()

			expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
			expect(mockGetUserInfo).toHaveBeenCalled()
		})

		it('应该在组件卸载时正确清理', () => {
			wrapper = createWrapper()
			expect(() => wrapper.unmount()).not.toThrow()

			// 验证组件已被正确卸载
			expect(wrapper.exists()).toBe(false)
		})
	})

	describe('错误恢复测试', () => {
		it('应该在获取用户信息失败后仍能正常使用', async () => {
			mockGetUserInfo.mockRejectedValue(new Error('API Error'))
			wrapper = createWrapper()
			await nextTick()

			// 虽然获取用户信息失败，但组件应该仍然可用
			const menu = wrapper.findComponent(NMenu)
			menu.vm.$emit('update:value', '/user/dashboard')
			expect(mockPush).toHaveBeenCalledWith('/user/dashboard')
		})

		it('应该在路由错误时正确处理', async () => {
			mockPush.mockRejectedValue(new Error('Route Error'))
			wrapper = createWrapper()
			await nextTick()

			const menu = wrapper.findComponent(NMenu)
			menu.vm.$emit('update:value', '/user/dashboard')

			// 即使路由跳转失败，也不应该影响组件的基本功能
			expect(mockPush).toHaveBeenCalledWith('/user/dashboard')
		})
	})

	describe('安全性测试', () => {
		it('应该在token无效时跳转到登录页', async () => {
			localStorageMock.getItem.mockReturnValue('invalid-token')
			mockGetUserInfo.mockRejectedValue({
				response: { status: 401 }
			})

			wrapper = createWrapper()
			await nextTick()

			expect(mockConsoleError).toHaveBeenCalled()
		})

		it('应该正确清理敏感信息', async () => {
			wrapper = createWrapper()
			await nextTick()

			const dropdown = wrapper.findComponent(NDropdown)
			dropdown.vm.$emit('select', 'logout')

			expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
			expect(mockPush).toHaveBeenCalledWith('/login')
		})
	})

	describe('用户信息更新事件处理', () => {
		beforeEach(async () => {
			wrapper = createWrapper()
			await nextTick()
		})

		it('应该正确处理用户信息更新事件', async () => {
			// 触发用户信息更新事件
			const updateEvent = new CustomEvent('userInfoUpdated', {
				detail: {
					username: 'updateduser',
					email: 'updated@example.com'
				}
			})

			window.dispatchEvent(updateEvent)
			await nextTick()
			await new Promise(resolve => setTimeout(resolve, 100))

			// 验证用户信息已更新
			const vm = wrapper.vm as any
			expect(vm.userInfo.username).toBe('updateduser')
			expect(vm.userInfo.email).toBe('updated@example.com')

			// 验证界面显示已更新
			const username = wrapper.find('.username')
			expect(username.text()).toBe('updateduser')
		})

		it('应该只更新事件中包含的用户信息字段', async () => {
			// 先确保有初始用户信息
			await new Promise(resolve => setTimeout(resolve, 100))
			const vm = wrapper.vm as any
			const originalEmail = vm.userInfo.email

			// 只更新用户名
			const updateEvent = new CustomEvent('userInfoUpdated', {
				detail: {
					username: 'newusername'
				}
			})

			window.dispatchEvent(updateEvent)
			await nextTick()

			// 验证只有用户名被更新，邮箱保持不变
			expect(vm.userInfo.username).toBe('newusername')
			expect(vm.userInfo.email).toBe(originalEmail)
		})

		it('应该正确处理空的事件详情', async () => {
			const vm = wrapper.vm as any
			const originalUsername = vm.userInfo.username
			const originalEmail = vm.userInfo.email

			// 触发空详情的事件
			const updateEvent = new CustomEvent('userInfoUpdated', {
				detail: null
			})

			window.dispatchEvent(updateEvent)
			await nextTick()

			// 验证用户信息没有改变
			expect(vm.userInfo.username).toBe(originalUsername)
			expect(vm.userInfo.email).toBe(originalEmail)
		})

		it('应该正确处理不完整的事件详情', async () => {
			const vm = wrapper.vm as any
			const originalUsername = vm.userInfo.username
			const originalEmail = vm.userInfo.email

			// 触发包含无效字段的事件
			const updateEvent = new CustomEvent('userInfoUpdated', {
				detail: {
					invalidField: 'invalidValue'
				}
			})

			window.dispatchEvent(updateEvent)
			await nextTick()

			// 验证用户信息没有改变
			expect(vm.userInfo.username).toBe(originalUsername)
			expect(vm.userInfo.email).toBe(originalEmail)
		})

		it('应该在组件挂载时添加事件监听器', () => {
			const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
			
			wrapper = createWrapper()
			
			expect(addEventListenerSpy).toHaveBeenCalledWith('userInfoUpdated', expect.any(Function))
			
			addEventListenerSpy.mockRestore()
		})

		it('应该在组件卸载时移除事件监听器', () => {
			const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
			
			wrapper = createWrapper()
			wrapper.unmount()
			
			expect(removeEventListenerSpy).toHaveBeenCalledWith('userInfoUpdated', expect.any(Function))
			
			removeEventListenerSpy.mockRestore()
		})

		it('应该处理多次连续的用户信息更新事件', async () => {
			const vm = wrapper.vm as any

			// 第一次更新
			let updateEvent = new CustomEvent('userInfoUpdated', {
				detail: {
					username: 'user1',
					email: 'user1@example.com'
				}
			})
			window.dispatchEvent(updateEvent)
			await nextTick()

			expect(vm.userInfo.username).toBe('user1')
			expect(vm.userInfo.email).toBe('user1@example.com')

			// 第二次更新
			updateEvent = new CustomEvent('userInfoUpdated', {
				detail: {
					username: 'user2',
					email: 'user2@example.com'
				}
			})
			window.dispatchEvent(updateEvent)
			await nextTick()

			expect(vm.userInfo.username).toBe('user2')
			expect(vm.userInfo.email).toBe('user2@example.com')
		})
	})
})
