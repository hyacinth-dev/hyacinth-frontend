/**
 * Home.vue 组件单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../../views/Home.vue'

// Mock Naive UI 组件
vi.mock('naive-ui', () => ({
	NLayout: { template: '<div class="n-layout"><slot /></div>' },
	NLayoutHeader: { template: '<div class="n-layout-header"><slot /></div>' },
	NLayoutContent: { template: '<div class="n-layout-content"><slot /></div>' },
	NButton: {
		template: '<button class="n-button" :type="type" :size="size" @click="$emit(\'click\')"><slot /></button>',
		props: ['type', 'size'],
		emits: ['click']
	},
	NSpace: { template: '<div class="n-space"><slot /></div>' },
	NGrid: {
		template: '<div class="n-grid" :cols="cols" :x-gap="xGap" :y-gap="yGap"><slot /></div>',
		props: ['xGap', 'yGap', 'cols']
	},
	NGridItem: { template: '<div class="n-grid-item"><slot /></div>' },
	NStatistic: {
		template: '<div class="n-statistic"><div class="label">{{ label }}</div><div class="value">{{ value }}</div></div>',
		props: ['label', 'value']
	},
	NCard: {
		template: '<div class="n-card" :class="$attrs.class"><slot /></div>',
		inheritAttrs: false
	},
	NIcon: {
		template: '<i class="n-icon" :size="size"><component :is="component" /></i>',
		props: ['component', 'size']
	}
}))

// Mock Ionicons
vi.mock('@vicons/ionicons5', () => ({
	GameControllerOutline: { template: '<svg class="game-controller-icon" />' },
	GitNetworkOutline: { template: '<svg class="git-network-icon" />' },
	ServerOutline: { template: '<svg class="server-icon" />' },
	GlobeOutline: { template: '<svg class="globe-icon" />' },
	ShieldCheckmarkOutline: { template: '<svg class="shield-checkmark-icon" />' },
	SpeedometerOutline: { template: '<svg class="speedometer-icon" />' },
	HeartOutline: { template: '<svg class="heart-icon" />' },
	TrophyOutline: { template: '<svg class="trophy-icon" />' }
}))

describe('Home.vue', () => {
	let router: any
	let mockPush: any

	beforeEach(() => {
		mockPush = vi.fn()

		// 创建 mock router
		router = createRouter({
			history: createWebHistory(),
			routes: [
				{ path: '/', component: { template: '<div>Home</div>' } },
				{ path: '/login', component: { template: '<div>Login</div>' } },
				{ path: '/register', component: { template: '<div>Register</div>' } }
			]
		})

		// Mock router.push
		router.push = mockPush
	})

	const createWrapper = () => {
		return mount(Home, {
			global: {
				plugins: [router],
				mocks: {
					$router: { push: mockPush }
				}
			}
		})
	}

	describe('组件渲染', () => {
		it('应该正确渲染组件结构', () => {
			const wrapper = createWrapper()

			expect(wrapper.find('.n-layout').exists()).toBe(true)
			expect(wrapper.find('.n-layout-header').exists()).toBe(true)
			expect(wrapper.find('.n-layout-content').exists()).toBe(true)
			expect(wrapper.find('.header').exists()).toBe(true)
			expect(wrapper.find('.logo').exists()).toBe(true)
		})

		it('应该显示正确的 Logo', () => {
			const wrapper = createWrapper()

			const logo = wrapper.find('.logo')
			expect(logo.text()).toBe('Hyacinth')
		})

		it('应该渲染导航按钮', () => {
			const wrapper = createWrapper()

			const buttons = wrapper.findAll('.n-button')
			expect(buttons.length).toBeGreaterThanOrEqual(3) // 登录、注册、立即注册按钮

			const loginButton = buttons.find(btn => btn.text() === '登录')
			const registerButton = buttons.find(btn => btn.text() === '注册')
			const ctaButton = buttons.find(btn => btn.text() === '立即注册')

			expect(loginButton).toBeDefined()
			expect(registerButton).toBeDefined()
			expect(ctaButton).toBeDefined()
		})
	})

	describe('统计数据展示', () => {
		it('应该显示所有统计数据', () => {
			const wrapper = createWrapper()

			const statistics = wrapper.findAll('.n-statistic')
			expect(statistics.length).toBe(4)

			// 验证统计数据内容
			const expectedStats = [
				{ label: '节点数', value: '29' },
				{ label: '用户数', value: '30878' },
				{ label: '链接数', value: '9128' },
				{ label: '流量总量', value: '52.53 TB' }
			]

			statistics.forEach((stat, index) => {
				const label = stat.find('.label')
				const value = stat.find('.value')

				expect(label.text()).toBe(expectedStats[index].label)
				expect(value.text()).toBe(expectedStats[index].value)
			})
		})

		it('应该在统计区域使用正确的样式类', () => {
			const wrapper = createWrapper()

			const statisticsSection = wrapper.find('.statistics-section')
			expect(statisticsSection.exists()).toBe(true)
		})
	})

	describe('产品特性展示', () => {
		it('应该显示所有产品特性', () => {
			const wrapper = createWrapper()

			const featureCards = wrapper.findAll('.feature-card')
			expect(featureCards.length).toBe(4)
		})

		it('应该显示产品特性描述', () => {
			const wrapper = createWrapper()

			const featureCards = wrapper.findAll('.feature-card')
			const descriptions = featureCards.map(card =>
				card.find('.feature-description').text()
			)

			expect(descriptions.length).toBe(4)
		})

		it('应该显示产品特性图标', () => {
			const wrapper = createWrapper()

			const featureIcons = wrapper.findAll('.feature-icon')
			expect(featureIcons.length).toBe(4)

			// 验证图标组件存在
			featureIcons.forEach(icon => {
				const nIcon = icon.find('.n-icon')
				expect(nIcon.exists()).toBe(true)
			})
		})

		it('应该显示正确的区块标题', () => {
			const wrapper = createWrapper()

			const sectionTitles = wrapper.findAll('.section-title')
			expect(sectionTitles.length).toBe(2)
		})
	})

	describe('服务类型展示', () => {
		it('应该显示所有服务类型', () => {
			const wrapper = createWrapper()

			const serviceCards = wrapper.findAll('.service-card')
			expect(serviceCards.length).toBe(4)
		})

		it('应该显示服务类型描述', () => {
			const wrapper = createWrapper()

			const serviceCards = wrapper.findAll('.service-card')
			const descriptions = serviceCards.map(card =>
				card.find('.service-description').text()
			)

			expect(descriptions.length).toBe(4)
		})

		it('应该显示服务类型图标', () => {
			const wrapper = createWrapper()

			const serviceIcons = wrapper.findAll('.service-icon')
			expect(serviceIcons.length).toBe(4)

			// 验证图标组件存在
			serviceIcons.forEach(icon => {
				const nIcon = icon.find('.n-icon')
				expect(nIcon.exists()).toBe(true)
			})
		})
	})

	describe('行动号召区域', () => {
		it('应该显示行动号召内容', () => {
			const wrapper = createWrapper()

			const ctaSection = wrapper.find('.cta-section')
			expect(ctaSection.exists()).toBe(true)

			const ctaTitle = wrapper.find('.cta-title')
			const ctaDescription = wrapper.find('.cta-description')

			expect(ctaTitle).toBeDefined()
			expect(ctaDescription).toBeDefined()
		})

		it('应该有立即注册按钮', () => {
			const wrapper = createWrapper()

			const ctaButton = wrapper.findAll('.n-button').find(btn =>
				btn.text() === '立即注册'
			)

			expect(ctaButton).toBeDefined()
		})
	})

	describe('路由导航功能', () => {
		it('应该在点击登录按钮时导航到登录页', async () => {
			const wrapper = createWrapper()

			const loginButton = wrapper.findAll('.n-button').find(btn =>
				btn.text() === '登录'
			)

			expect(loginButton).toBeDefined()
			await loginButton!.trigger('click')

			expect(mockPush).toHaveBeenCalledWith('/login')
		})
		it('应该在点击注册按钮时导航到注册页', async () => {
			const wrapper = createWrapper()

			const registerButton = wrapper.findAll('.n-button').find(btn =>
				btn.text() === '注册'
			)

			expect(registerButton).toBeDefined()
			await registerButton!.trigger('click')

			expect(mockPush).toHaveBeenCalledWith('/register')
		})

		it('应该在点击立即注册按钮时导航到注册页', async () => {
			const wrapper = createWrapper()

			const ctaButton = wrapper.findAll('.n-button').find(btn =>
				btn.text() === '立即注册'
			)

			expect(ctaButton).toBeDefined()
			await ctaButton!.trigger('click')

			expect(mockPush).toHaveBeenCalledWith('/register')
		})
	})

	describe('布局和样式', () => {
		it('应该有正确的页面布局结构', () => {
			const wrapper = createWrapper()

			// 验证主要布局元素
			expect(wrapper.find('.header-content').exists()).toBe(true)
			expect(wrapper.find('.statistics-section').exists()).toBe(true)
			expect(wrapper.find('.section').exists()).toBe(true)
			expect(wrapper.find('.cta-section').exists()).toBe(true)
		})

		it('应该使用 Grid 布局展示内容', () => {
			const wrapper = createWrapper()

			const grids = wrapper.findAll('.n-grid')
			expect(grids.length).toBeGreaterThanOrEqual(3) // 统计、特性、服务至少3个grid

			const gridItems = wrapper.findAll('.n-grid-item')
			expect(gridItems.length).toBeGreaterThanOrEqual(12) // 4+4+4=12个grid项
		})

		it('应该使用 Card 组件展示特性和服务', () => {
			const wrapper = createWrapper()

			const cards = wrapper.findAll('.n-card')
			expect(cards.length).toBe(8) // 4个特性卡片 + 4个服务卡片
		})
	})

	describe('响应式设计', () => {
		it('应该为所有 Grid 设置正确的列数', () => {
			const wrapper = createWrapper()

			const grids = wrapper.findAll('.n-grid')
			grids.forEach(grid => {
				// 所有网格都应该设置为4列
				expect(grid.attributes('cols')).toBe('4')
			})
		})

		it('应该为 Grid 设置间距', () => {
			const wrapper = createWrapper()

			const grids = wrapper.findAll('.n-grid')
			grids.forEach(grid => {
				expect(grid.attributes('x-gap')).toBe('24')
				expect(grid.attributes('y-gap')).toBe('24')
			})
		})
	})

	describe('可访问性', () => {
		it('应该为图标设置合适的尺寸', () => {
			const wrapper = createWrapper()

			const icons = wrapper.findAll('.n-icon')
			icons.forEach(icon => {
				expect(icon.attributes('size')).toBe('24')
			})
		})

		it('应该有语义化的内容结构', () => {
			const wrapper = createWrapper()

			// 验证标题结构
			const h2Elements = wrapper.findAll('h2')
			const h3Elements = wrapper.findAll('h3')

			expect(h2Elements.length).toBeGreaterThanOrEqual(2) // 至少有区块标题
			expect(h3Elements.length).toBeGreaterThanOrEqual(8) // 特性和服务标题
		})
	})

	describe('组件集成', () => {
		it('应该正确集成 Vue Router', () => {
			const wrapper = createWrapper()

			// 验证组件能正常挂载并使用路由
			expect(wrapper.vm).toBeDefined()
			expect(wrapper.exists()).toBe(true)
		})

		it('应该正确使用 Naive UI 组件', () => {
			const wrapper = createWrapper()

			// 验证各种 Naive UI 组件是否正确渲染
			expect(wrapper.find('.n-layout').exists()).toBe(true)
			expect(wrapper.find('.n-button').exists()).toBe(true)
			expect(wrapper.find('.n-card').exists()).toBe(true)
			expect(wrapper.find('.n-statistic').exists()).toBe(true)
		})

		it('应该正确使用 Ionicons 图标', () => {
			const wrapper = createWrapper()

			// 验证图标组件是否正确集成
			const icons = wrapper.findAll('.n-icon')
			expect(icons.length).toBeGreaterThan(0)
		})
	})
})
