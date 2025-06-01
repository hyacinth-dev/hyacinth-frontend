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
	userId?: string, // 用户ID，可选
	vnetId?: string, // 虚拟网络ID，可选，空值表示所有虚拟网络
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
 * 获取用户使用量
 * 
 * @param params - 包含时间范围的参数对象
 * @returns Promise - 返回后端的使用量数据
 */
export function getUsage(params: GetUsageParams): Promise<ApiResult<GetUsageResponseData>> {
	return request.get('/usage', { params })
}