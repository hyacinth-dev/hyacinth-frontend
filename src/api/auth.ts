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
  email: string
  password: string
}

/**
 * 注册请求参数接口
 */
export interface RegisterParams {
  email: string
  password: string
}

/**
 * 登录响应数据接口
 */
export interface LoginResponseData {
  accessToken: string
  isAdmin: boolean
}

/**
 * 用户登录方法
 * 向后端提交登录信息并返回认证结果
 * 
 * @param data - 登录参数，包含邮箱和密码
 * @returns Promise - 返回登录结果，包含访问令牌和用户角色信息
 */
export function login(data: LoginParams): Promise<ApiResult<LoginResponseData>> {
  // 注释掉的模拟数据，可用于开发阶段测试
  // return Promise.resolve({
  //   code: 200,
  //   data: {
  //     accessToken: '123456789',
  //     isAdmin: true,
  //   },
  //   message: 'success',
  // })

  // 向后端发送POST请求，路径为/login
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
export function getUserInfo() {
  return request.get('/user')
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