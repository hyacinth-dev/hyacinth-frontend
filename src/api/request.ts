/**
 * API请求封装模块
 * 基于Axios封装HTTP请求，统一处理请求拦截和响应拦截
 */

import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * 自定义Axios实例接口
 * 扩展了原生AxiosInstance，增加了更明确的泛型类型支持
 */
interface CustomAxiosInstance extends AxiosInstance {
	<T = any>(config: InternalAxiosRequestConfig): Promise<T>;
	get<T = any, Y = any>(url: string, data?: Y, config?: InternalAxiosRequestConfig): Promise<T>;
	post<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T>;
}

/**
 * 创建Axios请求实例
 * 配置基础URL、超时时间和默认请求头
 */
const service = axios.create({
	baseURL: 'http://localhost:8000/v1',
	timeout: 15000,
	headers: {
		'Content-Type': 'application/json'
	},
	responseType: 'json'
}) as CustomAxiosInstance

/**
 * 请求拦截器
 * 在发送请求前处理请求配置
 */
service.interceptors.request.use(
	// 成功拦截器 - 添加认证信息
	(config: InternalAxiosRequestConfig) => {
		// 从localStorage获取认证令牌
		const token = localStorage.getItem('token')
		// 如果存在令牌，添加到请求头的Authorization字段
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`
		}
		return config
	},
	// 错误拦截器 - 处理请求错误
	(error) => {
		console.error('请求错误：', error)
		return Promise.reject(error)
	}
)

/**
 * 响应拦截器
 * 在收到响应后统一处理响应数据和错误
 */
service.interceptors.response.use(
	// 成功拦截器 - 直接返回响应数据
	(response: AxiosResponse) => {
		const { data } = response
		// 这里可以根据后端的响应结构进行统一处理
		return data
	},
	// 错误拦截器 - 处理认证失败等错误情况
	(error) => {
		console.error('响应错误：', error)

		// 处理401未授权错误 - 清除认证信息并重定向到登录页
		if (error.response?.status === 401) {
			// 清除本地存储中的认证令牌
			localStorage.removeItem('token')
			// 如果当前不在登录页，跳转到登录页
			if (window.location.pathname !== '/login') {
				window.location.href = '/login'
			}
		}

		// 将错误继续抛出，让调用者可以继续处理
		return Promise.reject(error)
	}
)

export default service