/**
 * 认证相关API模块
 * 处理用户的登录、注册、获取信息和登出功能
 */

import request from './request'
import { ApiResult } from './api'

/**
 * 登录请求参数接口
 */
export interface LoginParams {
  usernameOrEmail: string
  password: string
}

/**
 * 注册请求参数接口
 */
export interface RegisterParams {
  username: string
  email: string
  password: string
}

/**
 * 登录响应数据接口
 */
export interface LoginResponseData {
  accessToken: string
}

/**
 * 用户信息响应数据接口
 */
export interface UserInfoResponseData {
  userId: string
  username: string
  email: string
  userGroup: number
  userGroupName: string
  privilegeExpiry: string | null
  isVip: boolean
  activeTunnels: number
  availableTraffic: string
  onlineDevices: number
}

/**
 * 用户组信息响应数据接口
 */
export interface UserGroupResponseData {
  userGroup: number
}



/**
 * 更新个人信息请求参数接口
 */
export interface UpdateProfileParams {
  username: string
  email: string
}

/**
 * 修改密码请求参数接口
 */
export interface ChangePasswordParams {
  currentPassword: string
  newPassword: string
}

/**
 * 用户登录方法
 * 向后端提交登录信息并返回认证结果
 * 
 * @param data - 登录参数，包含邮箱和密码
 * @returns Promise - 返回登录结果，包含访问令牌和用户角色信息
 */
export function login(data: LoginParams): Promise<ApiResult<LoginResponseData>> {  // 注释掉的模拟数据，可用于开发阶段测试
  // return Promise.resolve({
  //   code: 200,
  //   data: {
  //     accessToken: '123456789',
  //   },
  //   message: 'success',
  // })

  return request.post<ApiResult<LoginResponseData>>('/login', data)
}

/**
 * 用户注册方法
 * 向后端提交注册信息并创建新用户账号
 * 
 * @param data - 注册参数，包含邮箱和密码
 * @returns Promise - 返回注册结果
 */
export function register(data: RegisterParams) {
  return request.post<ApiResult<void>>('/register', data)
}

/**
 * 获取用户信息方法
 * 获取当前登录用户的详细信息
 * 
 * @returns Promise - 返回用户信息
 */
export function getUserInfo(): Promise<ApiResult<UserInfoResponseData>> {
  return request.get('/user')
}

/**
 * 获取用户组信息方法
 * 获取当前登录用户的组信息，用于商城套餐显示
 * 
 * @returns Promise - 返回用户组信息
 */
export function getUserGroup(): Promise<ApiResult<UserGroupResponseData>> {
  return request.get('/user/group')
}

/**
 * 退出登录方法
 * 使当前用户的认证令牌失效
 * 
 * @returns Promise - 返回登出操作结果
 */
export function logout() {
  return request.post('/logout')
}



/**
 * 更新个人信息方法
 * 向后端提交更新的用户信息
 * 
 * @param data - 更新参数，包含用户名和邮箱
 * @returns Promise - 返回更新结果
 */
export function updateProfile(data: UpdateProfileParams): Promise<ApiResult<void>> {
  return request.put('/user', data)
}

/**
 * 修改密码方法
 * 向后端提交密码修改请求
 * 
 * @param data - 修改密码参数，包含当前密码和新密码
 * @returns Promise - 返回修改结果
 */
export function changePassword(data: ChangePasswordParams): Promise<ApiResult<void>> {
  return request.put('/user/password', data)
}