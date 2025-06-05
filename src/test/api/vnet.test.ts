/**
 * 虚拟网络API模块单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getVNetList,
  createVNet,
  updateVNet,
  deleteVNet,
  getVNetLimitInfo,
  type VNetData,
  type CreateVNetRequest,
  type UpdateVNetRequest,
  type VNetLimitInfo,
  type GetVNetResponseData
} from '../../api/vnet'
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

describe('VNet API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getVNetList', () => {
    it('should fetch vnet list successfully', async () => {
      // 模拟响应数据
      const mockResponse: ApiResult<GetVNetResponseData> = {
        code: 200,
        message: 'success',
        data: {
          vnets: [
            {
              vnetId: 'vnet-001',
              comment: 'Test VNet',
              enabled: true,
              token: 'test-token',
              password: 'test-password',
              ipRange: '192.168.1.0/24',
              enableDHCP: true,
              clientsLimit: 10,
              clientsOnline: 3
            }
          ]
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getVNetList()

      expect(request.get).toHaveBeenCalledWith('/vnet')
      expect(result).toEqual(mockResponse)
      expect(result.data.vnets).toHaveLength(1)
      expect(result.data.vnets[0].vnetId).toBe('vnet-001')
    })

    it('should handle empty vnet list', async () => {
      const mockResponse: ApiResult<GetVNetResponseData> = {
        code: 200,
        message: 'success',
        data: {
          vnets: []
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getVNetList()

      expect(request.get).toHaveBeenCalledWith('/vnet')
      expect(result.data.vnets).toHaveLength(0)
    })

    it('should handle API error', async () => {
      const mockError = new Error('Network error')
      vi.mocked(request.get).mockRejectedValue(mockError)

      await expect(getVNetList()).rejects.toThrow('Network error')
      expect(request.get).toHaveBeenCalledWith('/vnet')
    })
  })

  describe('createVNet', () => {
    it('should create vnet successfully', async () => {
      const createData: CreateVNetRequest = {
        comment: 'New VNet',
        token: 'new-token',
        password: 'new-password',
        ipRange: '192.168.2.0/24',
        enableDHCP: true,
        clientsLimit: 20,
        enabled: true
      }

      const mockResponse: ApiResult<null> = {
        code: 200,
        message: 'VNet created successfully',
        data: null
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await createVNet(createData)

      expect(request.post).toHaveBeenCalledWith('/vnet', createData)
      expect(result).toEqual(mockResponse)
      expect(result.message).toBe('VNet created successfully')
    })

    it('should handle creation failure', async () => {
      const createData: CreateVNetRequest = {
        comment: 'Invalid VNet',
        token: '',
        password: '',
        ipRange: 'invalid-ip',
        enableDHCP: false,
        clientsLimit: -1,
        enabled: false
      }

      const mockResponse: ApiResult<null> = {
        code: 400,
        message: 'Invalid parameters',
        data: null
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await createVNet(createData)

      expect(request.post).toHaveBeenCalledWith('/vnet', createData)
      expect(result.code).toBe(400)
      expect(result.message).toBe('Invalid parameters')
    })
  })

  describe('updateVNet', () => {
    it('should update vnet successfully', async () => {
      const vnetId = 'vnet-001'
      const updateData: UpdateVNetRequest = {
        comment: 'Updated VNet',
        token: 'updated-token',
        password: 'updated-password',
        ipRange: '192.168.3.0/24',
        enableDHCP: false,
        clientsLimit: 15,
        enabled: true
      }

      const mockResponse: ApiResult<null> = {
        code: 200,
        message: 'VNet updated successfully',
        data: null
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await updateVNet(vnetId, updateData)

      expect(request.put).toHaveBeenCalledWith(`/vnet/${vnetId}`, updateData)
      expect(result).toEqual(mockResponse)
      expect(result.message).toBe('VNet updated successfully')
    })

    it('should handle update with non-existent vnet', async () => {
      const vnetId = 'non-existent-vnet'
      const updateData: UpdateVNetRequest = {
        comment: 'Updated VNet',
        token: 'updated-token',
        password: 'updated-password',
        ipRange: '192.168.3.0/24',
        enableDHCP: false,
        clientsLimit: 15,
        enabled: true
      }

      const mockResponse: ApiResult<null> = {
        code: 404,
        message: 'VNet not found',
        data: null
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await updateVNet(vnetId, updateData)

      expect(request.put).toHaveBeenCalledWith(`/vnet/${vnetId}`, updateData)
      expect(result.code).toBe(404)
      expect(result.message).toBe('VNet not found')
    })
  })

  describe('deleteVNet', () => {
    it('should delete vnet successfully', async () => {
      const vnetId = 'vnet-001'
      const mockResponse: ApiResult<null> = {
        code: 200,
        message: 'VNet deleted successfully',
        data: null
      }

      vi.mocked(request.delete).mockResolvedValue(mockResponse)

      const result = await deleteVNet(vnetId)

      expect(request.delete).toHaveBeenCalledWith(`/vnet/${vnetId}`)
      expect(result).toEqual(mockResponse)
      expect(result.message).toBe('VNet deleted successfully')
    })

    it('should handle deletion of non-existent vnet', async () => {
      const vnetId = 'non-existent-vnet'
      const mockResponse: ApiResult<null> = {
        code: 404,
        message: 'VNet not found',
        data: null
      }

      vi.mocked(request.delete).mockResolvedValue(mockResponse)

      const result = await deleteVNet(vnetId)

      expect(request.delete).toHaveBeenCalledWith(`/vnet/${vnetId}`)
      expect(result.code).toBe(404)
      expect(result.message).toBe('VNet not found')
    })
  })

  describe('getVNetLimitInfo', () => {
    it('should fetch vnet limit info successfully', async () => {
      const mockLimitInfo: VNetLimitInfo = {
        currentCount: 3,
        maxLimit: 10,
        userGroup: 1,
        maxClientsLimitPerVNet: 50
      }

      const mockResponse: ApiResult<VNetLimitInfo> = {
        code: 200,
        message: 'success',
        data: mockLimitInfo
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getVNetLimitInfo()

      expect(request.get).toHaveBeenCalledWith('/vnet/limit')
      expect(result).toEqual(mockResponse)
      expect(result.data.currentCount).toBe(3)
      expect(result.data.maxLimit).toBe(10)
      expect(result.data.userGroup).toBe(1)
      expect(result.data.maxClientsLimitPerVNet).toBe(50)
    })

    it('should handle limit info fetch error', async () => {
      const mockError = new Error('Authorization failed')
      vi.mocked(request.get).mockRejectedValue(mockError)

      await expect(getVNetLimitInfo()).rejects.toThrow('Authorization failed')
      expect(request.get).toHaveBeenCalledWith('/vnet/limit')
    })

    it('should handle different user groups', async () => {
      const mockLimitInfo: VNetLimitInfo = {
        currentCount: 0,
        maxLimit: 5,
        userGroup: 0, // 基础用户组
        maxClientsLimitPerVNet: 10
      }

      const mockResponse: ApiResult<VNetLimitInfo> = {
        code: 200,
        message: 'success',
        data: mockLimitInfo
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getVNetLimitInfo()

      expect(result.data.userGroup).toBe(0)
      expect(result.data.maxLimit).toBe(5)
      expect(result.data.maxClientsLimitPerVNet).toBe(10)
    })
  })

  describe('Type Safety Tests', () => {
    it('should enforce VNetData interface structure', () => {
      const vnetData: VNetData = {
        vnetId: 'test-id',
        comment: 'test comment',
        enabled: true,
        token: 'test-token',
        password: 'test-password',
        ipRange: '192.168.1.0/24',
        enableDHCP: true,
        clientsLimit: 10,
        clientsOnline: 5
      }

      expect(typeof vnetData.vnetId).toBe('string')
      expect(typeof vnetData.enabled).toBe('boolean')
      expect(typeof vnetData.clientsLimit).toBe('number')
      expect(typeof vnetData.clientsOnline).toBe('number')
    })

    it('should enforce CreateVNetRequest interface structure', () => {
      const createRequest: CreateVNetRequest = {
        comment: 'new vnet',
        token: 'token',
        password: 'password',
        ipRange: '192.168.1.0/24',
        enableDHCP: true,
        clientsLimit: 20,
        enabled: true
      }

      expect(typeof createRequest.comment).toBe('string')
      expect(typeof createRequest.enableDHCP).toBe('boolean')
      expect(typeof createRequest.clientsLimit).toBe('number')
    })

    it('should enforce UpdateVNetRequest interface structure', () => {
      const updateRequest: UpdateVNetRequest = {
        comment: 'updated vnet',
        token: 'new-token',
        password: 'new-password',
        ipRange: '192.168.2.0/24',
        enableDHCP: false,
        clientsLimit: 30,
        enabled: false
      }

      expect(typeof updateRequest.comment).toBe('string')
      expect(typeof updateRequest.enableDHCP).toBe('boolean')
      expect(typeof updateRequest.enabled).toBe('boolean')
    })
  })
})
