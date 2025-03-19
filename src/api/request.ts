import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

interface CustomAxiosInstance extends AxiosInstance {
	<T = any>(config: InternalAxiosRequestConfig): Promise<T>;
	get<T = any, Y = any>(url: string, data?: Y, config?: InternalAxiosRequestConfig): Promise<T>;
	post<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T>;
}

// 创建axios实例
const service = axios.create({
	baseURL: 'http://localhost:8000/v1',
	timeout: 15000,
	headers: {
		'Content-Type': 'application/json'
	},
	responseType: 'json'
}) as CustomAxiosInstance

// 请求拦截器
service.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// 这里可以统一添加请求头，比如token
		const token = localStorage.getItem('token')
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`
		}
		return config
	},
	(error) => {
		console.error('请求错误：', error)
		return Promise.reject(error)
	}
)

// 响应拦截器
service.interceptors.response.use(
	(response: AxiosResponse) => {
		const { data } = response
		// 这里可以根据后端的响应结构进行统一处理
		return data
	},
	(error) => {
		console.error('响应错误：', error)
		// 这里可以统一处理错误，比如401跳转登录页
		if (error.response?.status === 401) {
			// 清除token
			localStorage.removeItem('token')
			// 跳转到登录页
			window.location.href = '/login'
		}
		return Promise.reject(error)
	}
)

export default service