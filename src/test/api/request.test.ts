/**
 * request.ts HTTP请求封装模块单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

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

// Mock window.location
const mockLocation = {
	pathname: '/',
	href: ''
}
Object.defineProperty(window, 'location', {
	value: mockLocation,
	writable: true
})

describe('request.ts', () => {
	let mockAxiosInstance: any
	let requestInterceptor: any
	let responseInterceptor: any

	beforeEach(() => {
		vi.clearAllMocks()

		// 重置 location mock
		mockLocation.pathname = '/'
		mockLocation.href = ''

		// 创建 mock axios 实例
		mockAxiosInstance = {
			interceptors: {
				request: {
					use: vi.fn()
				},
				response: {
					use: vi.fn()
				}
			},
			get: vi.fn(),
			post: vi.fn(),
			put: vi.fn(),
			delete: vi.fn()
		};

		// Mock axios.create 返回 mock 实例
		(mockedAxios.create as any).mockReturnValue(mockAxiosInstance)

		// 获取拦截器函数以便测试
		mockAxiosInstance.interceptors.request.use.mockImplementation((successHandler: any, errorHandler: any) => {
			requestInterceptor = { success: successHandler, error: errorHandler }
		})

		mockAxiosInstance.interceptors.response.use.mockImplementation((successHandler: any, errorHandler: any) => {
			responseInterceptor = { success: successHandler, error: errorHandler }
		})

		// 重新导入模块以触发拦截器设置
		vi.resetModules()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	describe('Axios 实例创建', () => {
		it('应该使用正确的配置创建 Axios 实例', async () => {
			// 导入模块以触发 axios.create 调用
			await import('../../api/request')

			expect(mockedAxios.create).toHaveBeenCalledWith({
				baseURL: 'https://hyacinth-backend.baka9.vip/v1',
				timeout: 15000,
				headers: {
					'Content-Type': 'application/json'
				},
				responseType: 'json'
			})
		})

		it('应该设置请求和响应拦截器', async () => {
			await import('../../api/request')

			expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
			expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
		})
	})

	describe('请求拦截器', () => {
		beforeEach(async () => {
			await import('../../api/request')
		})

		it('应该在有token时添加Authorization请求头', () => {
			const mockToken = 'test-jwt-token'
			localStorageMock.getItem.mockReturnValue(mockToken)

			const mockConfig = {
				headers: {},
				url: '/test'
			}

			const result = requestInterceptor.success(mockConfig)

			expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
			expect(result.headers['Authorization']).toBe(`Bearer ${mockToken}`)
			expect(result).toBe(mockConfig)
		})

		it('应该在没有token时不添加Authorization请求头', () => {
			localStorageMock.getItem.mockReturnValue(null)

			const mockConfig = {
				headers: {},
				url: '/test'
			}

			const result = requestInterceptor.success(mockConfig)

			expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
			expect(result.headers['Authorization']).toBeUndefined()
			expect(result).toBe(mockConfig)
		})
		it('应该在请求错误时记录日志并抛出错误', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
			const mockError = new Error('Request failed')

			await expect(requestInterceptor.error(mockError)).rejects.toThrow('Request failed')

			expect(consoleSpy).toHaveBeenCalledWith('请求错误：', mockError)

			consoleSpy.mockRestore()
		})
	})

	describe('响应拦截器', () => {
		beforeEach(async () => {
			await import('../../api/request')
		})

		it('应该返回响应数据', () => {
			const mockResponseData = { code: 200, message: 'success', data: { id: 1 } }
			const mockResponse: AxiosResponse = {
				data: mockResponseData,
				status: 200,
				statusText: 'OK',
				headers: {},
				config: {} as any
			}

			const result = responseInterceptor.success(mockResponse)

			expect(result).toBe(mockResponseData)
		})
		it('应该在401错误时清除token并重定向到登录页', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
			mockLocation.pathname = '/dashboard'

			const mockError: AxiosError = {
				response: {
					status: 401,
					data: { message: 'Unauthorized' },
					statusText: 'Unauthorized',
					headers: {},
					config: {} as any
				},
				message: 'Request failed with status code 401',
				name: 'AxiosError',
				config: {} as any,
				isAxiosError: true,
				toJSON: () => ({})
			}

			await expect(responseInterceptor.error(mockError)).rejects.toThrow()

			expect(consoleSpy).toHaveBeenCalledWith('响应错误：', mockError)
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
			expect(mockLocation.href).toBe('/login')

			consoleSpy.mockRestore()
		})
		it('应该在401错误且当前在登录页时不重定向', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
			mockLocation.pathname = '/login'

			const mockError: AxiosError = {
				response: {
					status: 401,
					data: { message: 'Unauthorized' },
					statusText: 'Unauthorized',
					headers: {},
					config: {} as any
				},
				message: 'Request failed with status code 401',
				name: 'AxiosError',
				config: {} as any,
				isAxiosError: true,
				toJSON: () => ({})
			}

			await expect(responseInterceptor.error(mockError)).rejects.toThrow()

			expect(consoleSpy).toHaveBeenCalledWith('响应错误：', mockError)
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
			expect(mockLocation.href).toBe('') // 不应该被修改

			consoleSpy.mockRestore()
		})
		it('应该在非401错误时记录日志并抛出错误', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

			const mockError: AxiosError = {
				response: {
					status: 500,
					data: { message: 'Internal Server Error' },
					statusText: 'Internal Server Error',
					headers: {},
					config: {} as any
				},
				message: 'Request failed with status code 500',
				name: 'AxiosError',
				config: {} as any,
				isAxiosError: true,
				toJSON: () => ({})
			}

			await expect(responseInterceptor.error(mockError)).rejects.toThrow()

			expect(consoleSpy).toHaveBeenCalledWith('响应错误：', mockError)
			expect(localStorageMock.removeItem).not.toHaveBeenCalled()
			expect(mockLocation.href).toBe('')

			consoleSpy.mockRestore()
		})
		it('应该在网络错误时记录日志并抛出错误', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

			const mockError: AxiosError = {
				message: 'Network Error',
				name: 'AxiosError',
				config: {} as any,
				isAxiosError: true,
				toJSON: () => ({})
			}

			await expect(responseInterceptor.error(mockError)).rejects.toThrow()

			expect(consoleSpy).toHaveBeenCalledWith('响应错误：', mockError)
			expect(localStorageMock.removeItem).not.toHaveBeenCalled()
			expect(mockLocation.href).toBe('')

			consoleSpy.mockRestore()
		})
	})

	describe('边界情况测试', () => {
		beforeEach(async () => {
			await import('../../api/request')
		})

		it('应该处理空的响应数据', () => {
			const mockResponse: AxiosResponse = {
				data: null,
				status: 200,
				statusText: 'OK',
				headers: {},
				config: {} as any
			}

			const result = responseInterceptor.success(mockResponse)

			expect(result).toBeNull()
		})

		it('应该处理空字符串token', () => {
			localStorageMock.getItem.mockReturnValue('')

			const mockConfig = {
				headers: {},
				url: '/test'
			}

			const result = requestInterceptor.success(mockConfig)

			expect(result.headers['Authorization']).toBeUndefined()
		})

		it('应该处理包含特殊字符的token', () => {
			const specialToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test+special/chars='
			localStorageMock.getItem.mockReturnValue(specialToken)

			const mockConfig = {
				headers: {},
				url: '/test'
			}

			const result = requestInterceptor.success(mockConfig)

			expect(result.headers['Authorization']).toBe(`Bearer ${specialToken}`)
		})

		it('应该处理已存在Authorization头的请求', () => {
			const mockToken = 'new-token'
			localStorageMock.getItem.mockReturnValue(mockToken)

			const mockConfig = {
				headers: {
					'Authorization': 'Bearer old-token'
				},
				url: '/test'
			}

			const result = requestInterceptor.success(mockConfig)

			expect(result.headers['Authorization']).toBe(`Bearer ${mockToken}`)
		})
	})

	describe('TypeScript类型测试', () => {
		it('应该正确导出service实例', async () => {
			const service = await import('../../api/request')

			expect(service.default).toBeDefined()
			expect(typeof service.default).toBe('object')
		})
	})

	describe('集成测试', () => {
		let service: any

		beforeEach(async () => {
			const serviceModule = await import('../../api/request')
			service = serviceModule.default
		})

		it('应该正确导出configured service实例', () => {
			expect(service).toBeDefined()
			expect(typeof service).toBe('object')
			expect(service.interceptors).toBeDefined()
			expect(service.interceptors.request).toBeDefined()
			expect(service.interceptors.response).toBeDefined()
		})

		it('应该包含自定义方法签名', () => {
			expect(typeof service.get).toBe('function')
			expect(typeof service.post).toBe('function')
		})
	})
	describe('配置验证', () => {
		it('应该使用正确的baseURL', async () => {
			await import('../../api/request')

			const createConfig = (mockedAxios.create as any).mock.calls[0][0]
			expect(createConfig.baseURL).toBe('https://hyacinth-backend.baka9.vip/v1')
		})

		it('应该设置正确的超时时间', async () => {
			await import('../../api/request')

			const createConfig = (mockedAxios.create as any).mock.calls[0][0]
			expect(createConfig.timeout).toBe(15000)
		})

		it('应该设置正确的默认headers', async () => {
			await import('../../api/request')

			const createConfig = (mockedAxios.create as any).mock.calls[0][0]
			expect(createConfig.headers['Content-Type']).toBe('application/json')
		})

		it('应该设置正确的响应类型', async () => {
			await import('../../api/request')

			const createConfig = (mockedAxios.create as any).mock.calls[0][0]
			expect(createConfig.responseType).toBe('json')
		})
	})
})
