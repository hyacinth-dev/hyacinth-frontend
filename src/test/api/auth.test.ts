/**
 * 认证API模块单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  login,
  register,
  getUserInfo,
  getUserGroup,
  logout,
  updateProfile,
  changePassword,
  type LoginParams,
  type RegisterParams,
  type LoginResponseData,
  type UserInfoResponseData,
  type UserGroupResponseData,
  type UpdateProfileParams,
  type ChangePasswordParams
} from '../../api/auth'
import { type ApiResult } from '../../api/api'

// Mock request module
vi.mock('../../api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

import request from '../../api/request'

describe('Auth API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('login', () => {
    it('should login successfully with username', async () => {
      const loginData: LoginParams = {
        usernameOrEmail: 'testuser',
        password: 'password123'
      }

      const mockResponse: ApiResult<LoginResponseData> = {
        code: 200,
        message: 'Login successful',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await login(loginData)

      expect(request.post).toHaveBeenCalledWith('/login', loginData)
      expect(result).toEqual(mockResponse)
      expect(result.data.accessToken).toBeTruthy()
    })

    it('should login successfully with email', async () => {
      const loginData: LoginParams = {
        usernameOrEmail: 'test@example.com',
        password: 'password123'
      }

      const mockResponse: ApiResult<LoginResponseData> = {
        code: 200,
        message: 'Login successful',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await login(loginData)

      expect(request.post).toHaveBeenCalledWith('/login', loginData)
      expect(result).toEqual(mockResponse)
      expect(result.data.accessToken).toBeTruthy()
    })

    it('should handle invalid credentials', async () => {
      const loginData: LoginParams = {
        usernameOrEmail: 'wronguser',
        password: 'wrongpassword'
      }

      const mockResponse: ApiResult<LoginResponseData> = {
        code: 401,
        message: 'Invalid credentials',
        data: {
          accessToken: ''
        }
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await login(loginData)

      expect(request.post).toHaveBeenCalledWith('/login', loginData)
      expect(result.code).toBe(401)
      expect(result.message).toBe('Invalid credentials')
    })

    it('should handle network error during login', async () => {
      const loginData: LoginParams = {
        usernameOrEmail: 'testuser',
        password: 'password123'
      }

      const mockError = new Error('Network error')
      vi.mocked(request.post).mockRejectedValue(mockError)

      await expect(login(loginData)).rejects.toThrow('Network error')
      expect(request.post).toHaveBeenCalledWith('/login', loginData)
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const registerData: RegisterParams = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'newpassword123'
      }

      const mockResponse: ApiResult<void> = {
        code: 200,
        message: 'Registration successful',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await register(registerData)

      expect(request.post).toHaveBeenCalledWith('/register', registerData)
      expect(result).toEqual(mockResponse)
      expect(result.message).toBe('Registration successful')
    })

    it('should handle duplicate username', async () => {
      const registerData: RegisterParams = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123'
      }

      const mockResponse: ApiResult<void> = {
        code: 409,
        message: 'Username already exists',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await register(registerData)

      expect(request.post).toHaveBeenCalledWith('/register', registerData)
      expect(result.code).toBe(409)
      expect(result.message).toBe('Username already exists')
    })

    it('should handle duplicate email', async () => {
      const registerData: RegisterParams = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123'
      }

      const mockResponse: ApiResult<void> = {
        code: 409,
        message: 'Email already exists',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await register(registerData)

      expect(request.post).toHaveBeenCalledWith('/register', registerData)
      expect(result.code).toBe(409)
      expect(result.message).toBe('Email already exists')
    })

    it('should handle invalid registration data', async () => {
      const registerData: RegisterParams = {
        username: '',
        email: 'invalid-email',
        password: '123'
      }

      const mockResponse: ApiResult<void> = {
        code: 400,
        message: 'Invalid registration data',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await register(registerData)

      expect(request.post).toHaveBeenCalledWith('/register', registerData)
      expect(result.code).toBe(400)
      expect(result.message).toBe('Invalid registration data')
    })
  })

  describe('getUserInfo', () => {
    it('should fetch user info successfully', async () => {
      const mockUserInfo: UserInfoResponseData = {
        userId: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        userGroup: 1,
        userGroupName: 'Premium',
        privilegeExpiry: '2024-12-31T23:59:59Z',
        isVip: true,
        activeTunnels: 5,
        availableTraffic: '100GB',
        onlineDevices: 3
      }

      const mockResponse: ApiResult<UserInfoResponseData> = {
        code: 200,
        message: 'success',
        data: mockUserInfo
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUserInfo()

      expect(request.get).toHaveBeenCalledWith('/user')
      expect(result).toEqual(mockResponse)
      expect(result.data.username).toBe('testuser')
      expect(result.data.isVip).toBe(true)
      expect(result.data.activeTunnels).toBe(5)
    })

    it('should handle non-VIP user info', async () => {
      const mockUserInfo: UserInfoResponseData = {
        userId: 'user-456',
        username: 'basicuser',
        email: 'basic@example.com',
        userGroup: 0,
        userGroupName: 'Basic',
        privilegeExpiry: null,
        isVip: false,
        activeTunnels: 1,
        availableTraffic: '10GB',
        onlineDevices: 1
      }

      const mockResponse: ApiResult<UserInfoResponseData> = {
        code: 200,
        message: 'success',
        data: mockUserInfo
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUserInfo()

      expect(request.get).toHaveBeenCalledWith('/user')
      expect(result.data.isVip).toBe(false)
      expect(result.data.privilegeExpiry).toBeNull()
      expect(result.data.userGroup).toBe(0)
    })

    it('should handle unauthorized access', async () => {
      const mockError = new Error('Unauthorized')
      vi.mocked(request.get).mockRejectedValue(mockError)

      await expect(getUserInfo()).rejects.toThrow('Unauthorized')
      expect(request.get).toHaveBeenCalledWith('/user')
    })
  })

  describe('getUserGroup', () => {
    it('should fetch user group info successfully', async () => {
      const mockGroupInfo: UserGroupResponseData = {
        userGroup: 1
      }

      const mockResponse: ApiResult<UserGroupResponseData> = {
        code: 200,
        message: 'success',
        data: mockGroupInfo
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUserGroup()

      expect(request.get).toHaveBeenCalledWith('/user/group')
      expect(result).toEqual(mockResponse)
      expect(result.data.userGroup).toBe(1)
    })

    it('should handle basic user group', async () => {
      const mockGroupInfo: UserGroupResponseData = {
        userGroup: 0
      }

      const mockResponse: ApiResult<UserGroupResponseData> = {
        code: 200,
        message: 'success',
        data: mockGroupInfo
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUserGroup()

      expect(request.get).toHaveBeenCalledWith('/user/group')
      expect(result.data.userGroup).toBe(0)
    })

    it('should handle premium user group', async () => {
      const mockGroupInfo: UserGroupResponseData = {
        userGroup: 2
      }

      const mockResponse: ApiResult<UserGroupResponseData> = {
        code: 200,
        message: 'success',
        data: mockGroupInfo
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUserGroup()

      expect(result.data.userGroup).toBe(2)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockResponse: ApiResult<void> = {
        code: 200,
        message: 'Logout successful',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await logout()

      expect(request.post).toHaveBeenCalledWith('/logout')
      expect(result).toEqual(mockResponse)
      expect(result.message).toBe('Logout successful')
    })

    it('should handle logout when not logged in', async () => {
      const mockResponse: ApiResult<void> = {
        code: 401,
        message: 'Not authenticated',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await logout()

      expect(request.post).toHaveBeenCalledWith('/logout')
      expect(result.code).toBe(401)
      expect(result.message).toBe('Not authenticated')
    })

    it('should handle network error during logout', async () => {
      const mockError = new Error('Network error')
      vi.mocked(request.post).mockRejectedValue(mockError)

      await expect(logout()).rejects.toThrow('Network error')
      expect(request.post).toHaveBeenCalledWith('/logout')
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updateData: UpdateProfileParams = {
        username: 'updateduser',
        email: 'updated@example.com'
      }

      const mockResponse: ApiResult<void> = {
        code: 200,
        message: 'Profile updated successfully',
        data: undefined
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await updateProfile(updateData)

      expect(request.put).toHaveBeenCalledWith('/user', updateData)
      expect(result).toEqual(mockResponse)
      expect(result.message).toBe('Profile updated successfully')
    })

    it('should handle duplicate username during update', async () => {
      const updateData: UpdateProfileParams = {
        username: 'existinguser',
        email: 'test@example.com'
      }

      const mockResponse: ApiResult<void> = {
        code: 409,
        message: 'Username already taken',
        data: undefined
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await updateProfile(updateData)

      expect(request.put).toHaveBeenCalledWith('/user', updateData)
      expect(result.code).toBe(409)
      expect(result.message).toBe('Username already taken')
    })

    it('should handle duplicate email during update', async () => {
      const updateData: UpdateProfileParams = {
        username: 'testuser',
        email: 'existing@example.com'
      }

      const mockResponse: ApiResult<void> = {
        code: 409,
        message: 'Email already taken',
        data: undefined
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await updateProfile(updateData)

      expect(request.put).toHaveBeenCalledWith('/user', updateData)
      expect(result.code).toBe(409)
      expect(result.message).toBe('Email already taken')
    })

    it('should handle invalid profile data', async () => {
      const updateData: UpdateProfileParams = {
        username: '',
        email: 'invalid-email'
      }

      const mockResponse: ApiResult<void> = {
        code: 400,
        message: 'Invalid profile data',
        data: undefined
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await updateProfile(updateData)

      expect(request.put).toHaveBeenCalledWith('/user', updateData)
      expect(result.code).toBe(400)
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const passwordData: ChangePasswordParams = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword456'
      }

      const mockResponse: ApiResult<void> = {
        code: 200,
        message: 'Password changed successfully',
        data: undefined
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await changePassword(passwordData)

      expect(request.put).toHaveBeenCalledWith('/user/password', passwordData)
      expect(result).toEqual(mockResponse)
      expect(result.message).toBe('Password changed successfully')
    })

    it('should handle incorrect current password', async () => {
      const passwordData: ChangePasswordParams = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword456'
      }

      const mockResponse: ApiResult<void> = {
        code: 400,
        message: 'Current password is incorrect',
        data: undefined
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await changePassword(passwordData)

      expect(request.put).toHaveBeenCalledWith('/user/password', passwordData)
      expect(result.code).toBe(400)
      expect(result.message).toBe('Current password is incorrect')
    })

    it('should handle weak new password', async () => {
      const passwordData: ChangePasswordParams = {
        currentPassword: 'oldpassword123',
        newPassword: '123'
      }

      const mockResponse: ApiResult<void> = {
        code: 400,
        message: 'New password is too weak',
        data: undefined
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await changePassword(passwordData)

      expect(request.put).toHaveBeenCalledWith('/user/password', passwordData)
      expect(result.code).toBe(400)
      expect(result.message).toBe('New password is too weak')
    })

    it('should handle same password error', async () => {
      const passwordData: ChangePasswordParams = {
        currentPassword: 'samepassword',
        newPassword: 'samepassword'
      }

      const mockResponse: ApiResult<void> = {
        code: 400,
        message: 'New password must be different from current password',
        data: undefined
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await changePassword(passwordData)

      expect(request.put).toHaveBeenCalledWith('/user/password', passwordData)
      expect(result.code).toBe(400)
      expect(result.message).toBe('New password must be different from current password')
    })
  })

  describe('Type Safety Tests', () => {
    it('should enforce LoginParams interface structure', () => {
      const loginParams: LoginParams = {
        usernameOrEmail: 'test@example.com',
        password: 'password123'
      }

      expect(typeof loginParams.usernameOrEmail).toBe('string')
      expect(typeof loginParams.password).toBe('string')
    })

    it('should enforce RegisterParams interface structure', () => {
      const registerParams: RegisterParams = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      expect(typeof registerParams.username).toBe('string')
      expect(typeof registerParams.email).toBe('string')
      expect(typeof registerParams.password).toBe('string')
    })

    it('should enforce LoginResponseData interface structure', () => {
      const loginResponse: LoginResponseData = {
        accessToken: 'jwt-token-here'
      }

      expect(typeof loginResponse.accessToken).toBe('string')
      expect(loginResponse.accessToken).toBeTruthy()
    })

    it('should enforce UserInfoResponseData interface structure', () => {
      const userInfo: UserInfoResponseData = {
        userId: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        userGroup: 1,
        userGroupName: 'Premium',
        privilegeExpiry: '2024-12-31T23:59:59Z',
        isVip: true,
        activeTunnels: 5,
        availableTraffic: '100GB',
        onlineDevices: 3
      }

      expect(typeof userInfo.userId).toBe('string')
      expect(typeof userInfo.username).toBe('string')
      expect(typeof userInfo.email).toBe('string')
      expect(typeof userInfo.userGroup).toBe('number')
      expect(typeof userInfo.userGroupName).toBe('string')
      expect(typeof userInfo.isVip).toBe('boolean')
      expect(typeof userInfo.activeTunnels).toBe('number')
      expect(typeof userInfo.availableTraffic).toBe('string')
      expect(typeof userInfo.onlineDevices).toBe('number')
    })

    it('should handle null privilegeExpiry correctly', () => {
      const userInfo: UserInfoResponseData = {
        userId: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        userGroup: 0,
        userGroupName: 'Basic',
        privilegeExpiry: null,
        isVip: false,
        activeTunnels: 1,
        availableTraffic: '10GB',
        onlineDevices: 1
      }

      expect(userInfo.privilegeExpiry).toBeNull()
      expect(userInfo.isVip).toBe(false)
    })

    it('should enforce UpdateProfileParams interface structure', () => {
      const updateParams: UpdateProfileParams = {
        username: 'newusername',
        email: 'newemail@example.com'
      }

      expect(typeof updateParams.username).toBe('string')
      expect(typeof updateParams.email).toBe('string')
    })

    it('should enforce ChangePasswordParams interface structure', () => {
      const passwordParams: ChangePasswordParams = {
        currentPassword: 'currentpass',
        newPassword: 'newpass'
      }

      expect(typeof passwordParams.currentPassword).toBe('string')
      expect(typeof passwordParams.newPassword).toBe('string')
    })
  })
})
