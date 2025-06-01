/**
 * 虚拟网络相关API模块
 * 负责处理虚拟网络的CRUD操作
 */

import request from './request'
import { ApiResult } from './api'

/**
 * 虚拟网络数据接口
 */
export interface VNetData {
  vnetId: string
  comment: string
  enabled: boolean
  token: string
  password: string
  ipRange: string
  enableDHCP: boolean
  clientsLimit: number
  clientsOnline: number
}

/**
 * 获取虚拟网络响应数据接口
 */
export interface GetVNetResponseData {
  vnets: VNetData[]
}

/**
 * 创建虚拟网络请求参数接口
 */
export interface CreateVNetRequest {
  comment: string
  token: string
  password: string
  ipRange: string
  enableDHCP: boolean
  clientsLimit: number
  enabled: boolean
}

/**
 * 更新虚拟网络请求参数接口
 */
export interface UpdateVNetRequest {
  comment: string
  token: string
  password: string
  ipRange: string
  enableDHCP: boolean
  clientsLimit: number
  enabled: boolean
}

/**
 * 虚拟网络限制信息接口
 */
export interface VNetLimitInfo {
  currentCount: number  // 当前运行中的虚拟网络数量
  maxLimit: number      // 最大允许的虚拟网络数量
  userGroup: number     // 用户组
  maxClientsLimitPerVNet: number // 单个虚拟网络最大在线人数限制
}

/**
 * 获取用户的虚拟网络列表
 * 
 * @returns Promise - 返回虚拟网络列表数据
 */
export function getVNetList(): Promise<ApiResult<GetVNetResponseData>> {
  return request.get('/vnet')
}

/**
 * 创建新的虚拟网络
 * 
 * @param data - 虚拟网络创建参数
 * @returns Promise - 返回创建结果
 */
export function createVNet(data: CreateVNetRequest): Promise<ApiResult<null>> {
  return request.post('/vnet', data)
}

/**
 * 更新虚拟网络
 * 
 * @param vnetId - 虚拟网络ID
 * @param data - 更新参数
 * @returns Promise - 返回更新结果
 */
export function updateVNet(vnetId: string, data: UpdateVNetRequest): Promise<ApiResult<null>> {
  return request.put(`/vnet/${vnetId}`, data)
}

/**
 * 删除虚拟网络
 * 
 * @param vnetId - 虚拟网络ID
 * @returns Promise - 返回删除结果
 */
export function deleteVNet(vnetId: string): Promise<ApiResult<null>> {
  return request.delete(`/vnet/${vnetId}`)
}

/**
 * 获取用户的虚拟网络限制信息
 * 
 * @returns Promise - 返回虚拟网络限制信息
 */
export function getVNetLimitInfo(): Promise<ApiResult<VNetLimitInfo>> {
  return request.get('/vnet/limit')
}
