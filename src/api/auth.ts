import request from './request'
import { ApiResult } from './api'
export interface LoginParams {
  email: string
  password: string
}

export interface LoginResponseData {
  accessToken: string
}

// 用户登录
export function login(data: LoginParams): Promise<ApiResult<LoginResponseData>> {
  return request.post<ApiResult<LoginResponseData>>('/login', data)
}

// 用户注册
export function register(data: LoginParams) {
  return request.post<ApiResult<string>>('/register', data)
}

// 获取用户信息
export function getUserInfo() {
  return request.get('/user')
}

// 退出登录
export function logout() {
  return request.post('/logout')
}