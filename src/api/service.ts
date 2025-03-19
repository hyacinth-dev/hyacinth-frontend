import request from './request'
import { ApiResult } from './api'

export interface GetUsageParams {
	range: string
}

export interface UsageData {
	date: string
	usage: number
}

export interface GetUsageResponseData {
	usages: UsageData[]
}

//获取用户使用量
export function getUsageMock(params: GetUsageParams): Promise<ApiResult<GetUsageResponseData>> {
	let usages: UsageData[] = []
	if (params.range === '24h') {
		for (let i = 0; i < 24; i++) {
			usages.push({
				date: `2023-04-01 ${i.toString().padStart(2, '0')}:00`,
				usage: Math.floor(Math.random() * 100)
			})
		}
	}
	else if (params.range === '7d') {
		for (let i = 0; i < 7; i++) {
			usages.push({
				date: '2023-04-' + (i + 1),
				usage: Math.floor(Math.random() * 100)
			})
		}
	}
	else if (params.range === '30d') {
		for (let i = 0; i < 30; i++) {
			usages.push({
				date: '2023-04-' + (i + 1),
				usage: Math.floor(Math.random() * 100)
			})
		}
	}
	else if (params.range === 'month') {
		for (let i = 0; i < 12; i++) {
			usages.push({
				date: '2023' + (i + 1).toString().padStart(2, '0'),
				usage: Math.floor(Math.random() * 100)
			})
		}
	}
	return Promise.resolve({
		code: 0,
		message: 'success',
		data: {
			usages: usages
		}
	})
}

export function getUsage(params: GetUsageParams): Promise<ApiResult<GetUsageResponseData>> {
	return request.get('/usage', {params})
}