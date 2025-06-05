/**
 * About.vue 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import About from '../../../views/User/About.vue'

// Mock Naive UI 组件
vi.mock('naive-ui', () => ({
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
	NText: {
		name: 'NText',
		template: '<span class="n-text"><slot /></span>'
	}
}))

describe('About.vue', () => {
	it('应该正确渲染组件', () => {
		const wrapper = mount(About)

		// 验证组件是否渲染
		expect(wrapper.exists()).toBe(true)
		expect(wrapper.find('.about').exists()).toBe(true)
	})
	it('应该显示正确的标题', () => {
		const wrapper = mount(About)

		const title = wrapper.find('h2')
		expect(title.exists()).toBe(true)
		expect(title.text().length).toBeGreaterThan(0)
	})
	it('应该包含必要的卡片组件', () => {
		const wrapper = mount(About)

		const cards = wrapper.findAllComponents({ name: 'NCard' })
		expect(cards.length).toBeGreaterThan(0)

		// 验证卡片有标题
		cards.forEach(card => {
			expect(card.props('title')).toBeDefined()
			expect(typeof card.props('title')).toBe('string')
		})
	})
	it('应该显示系统介绍信息', () => {
		const wrapper = mount(About)

		const cards = wrapper.findAllComponents({ name: 'NCard' })
		const systemIntroCard = cards.find(card => card.props('title') === '系统介绍')
		expect(systemIntroCard).toBeDefined()
		if (systemIntroCard) {
			expect(systemIntroCard.text().length).toBeGreaterThan(0)
		}
	})
	it('应该显示功能特点列表', () => {
		const wrapper = mount(About)

		const featureList = wrapper.find('.feature-list')
		expect(featureList.exists()).toBe(true)

		const featureItems = featureList.findAll('li')
		expect(featureItems.length).toBeGreaterThan(0)

		// 验证功能特点列表有内容
		const featureText = featureList.text()
		expect(featureText.length).toBeGreaterThan(0)
	})
	it('应该显示使用指南链接', () => {
		const wrapper = mount(About)

		const links = wrapper.findAll('a')
		expect(links.length).toBeGreaterThan(0)

		// 验证存在外部链接
		const externalLink = links.find(link =>
			link.attributes('target') === '_blank' &&
			link.attributes('rel') === 'noopener noreferrer'
		)
		expect(externalLink).toBeDefined()
		if (externalLink) {
			expect(externalLink.text().length).toBeGreaterThan(0)
		}
	})
	it('应该显示联系信息', () => {
		const wrapper = mount(About)

		const contactInfo = wrapper.find('.contact-info')
		expect(contactInfo.exists()).toBe(true)

		const contactTexts = contactInfo.findAll('p')
		expect(contactTexts.length).toBeGreaterThan(0)

		// 验证联系信息有内容
		const contactText = contactInfo.text()
		expect(contactText.length).toBeGreaterThan(0)
	})
	it('应该显示版本信息', () => {
		const wrapper = mount(About)

		const cards = wrapper.findAllComponents({ name: 'NCard' })
		const versionCard = cards.find(card => card.props('title') === '版本信息')
		expect(versionCard).toBeDefined()
		if (versionCard) {
			expect(versionCard.text().length).toBeGreaterThan(0)
		}
	})
	it('应该包含NSpace组件并设置正确的属性', () => {
		const wrapper = mount(About)

		const space = wrapper.findComponent({ name: 'NSpace' })
		expect(space.exists()).toBe(true)
		// 检查布尔属性：在模板中没有值的布尔属性会被解析为空字符串，但表示 true
		expect(space.props('vertical')).toBeDefined()
		expect(space.props('size')).toBe('large')
	})

	it('应该正确应用样式类', () => {
		const wrapper = mount(About)

		// 验证主容器有正确的类名
		expect(wrapper.find('.about').exists()).toBe(true)

		// 验证功能列表有正确的类名
		expect(wrapper.find('.feature-list').exists()).toBe(true)

		// 验证联系信息有正确的类名
		expect(wrapper.find('.contact-info').exists()).toBe(true)
	})

	it('应该包含所有NText组件', () => {
		const wrapper = mount(About)

		const textComponents = wrapper.findAllComponents({ name: 'NText' })
		expect(textComponents.length).toBeGreaterThan(0)
	})
})
