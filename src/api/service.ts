/**
 * 服务相关API模块
 * 负责处理用户服务使用量等数据的获取
 */

import request from './request'
import { ApiResult } from './api'

/**
 * 获取使用量参数接口
 */
export interface GetUsageParams {
	range: string  // 时间范围：'24h'(24小时), '7d'(7天), '30d'(30天), 'month'(按月)
}

/**
 * 使用量数据项接口
 */
export interface UsageData {
	date: string   // 日期或时间点
	usage: number  // 对应时间点的使用量数据
}

/**
 * 获取使用量响应数据接口
 */
export interface GetUsageResponseData {
	usages: UsageData[]
}

/**
 * 获取用户使用量的模拟数据方法
 * 根据不同的时间范围生成不同的模拟数据，用于前端开发和测试
 * 
 * @param params - 包含时间范围的参数对象
 * @returns Promise - 返回模拟的使用量数据
 */
export function getUsageMock(params: GetUsageParams): Promise<ApiResult<GetUsageResponseData>> {
	let usages: UsageData[] = []

	// 根据不同的时间范围生成不同的模拟数据
	if (params.range === '24h') {
		// 生成24小时的数据，每小时一个数据点
		for (let i = 0; i < 24; i++) {
			usages.push({
				date: `2023-04-01 ${i.toString().padStart(2, '0')}:00`,
				usage: Math.floor(Math.random() * 100)
			})
		}
	}
	else if (params.range === '7d') {
		// 生成7天的数据，每天一个数据点
		for (let i = 0; i < 7; i++) {
			usages.push({
				date: '2023-04-' + (i + 1),
				usage: Math.floor(Math.random() * 100)
			})
		}
	}
	else if (params.range === '30d') {
		// 生成30天的数据，每天一个数据点
		for (let i = 0; i < 30; i++) {
			usages.push({
				date: '2023-04-' + (i + 1),
				usage: Math.floor(Math.random() * 100)
			})
		}
	}
	else if (params.range === 'month') {
		// 生成12个月的数据，每月一个数据点
		for (let i = 0; i < 12; i++) {
			usages.push({
				date: '2023' + (i + 1).toString().padStart(2, '0'),
				usage: Math.floor(Math.random() * 100)
			})
		}
	}

	// 返回模拟的API响应数据
	return Promise.resolve({
		code: 0,
		message: 'success',
		data: {
			usages: usages
		}
	})
}

/**
 * 获取用户使用量的实际API方法
 * 从后端获取真实的使用量数据
 * 
 * @param params - 包含时间范围的参数对象
 * @returns Promise - 返回后端的使用量数据
 */
export function getUsage(params: GetUsageParams): Promise<ApiResult<GetUsageResponseData>> {
	// return getUsageMock(params)  // 调用模拟数据方法，实际项目中应替换为后端API调用
	// 向后端发送GET请求，路径为/usage，带上查询参数
	return request.get('/usage', { params })
}