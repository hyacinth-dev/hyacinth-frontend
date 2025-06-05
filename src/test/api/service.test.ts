/**
 * 服务API模块单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getUsage,
  purchasePackage,
  type GetUsageParams,
  type GetUsageResponseData,
  type UsageData,
  type PurchasePackageParams
} from '../../api/service'
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

describe('Service API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getUsage', () => {
    it('应该成功获取24小时范围的使用数据', async () => {
      const params: GetUsageParams = {
        range: '24h'
      }

      const mockUsageData: UsageData[] = [
        { date: '2025-06-04T00:00:00Z', usage: 1024 },
        { date: '2025-06-04T01:00:00Z', usage: 2048 },
        { date: '2025-06-04T02:00:00Z', usage: 1536 },
        { date: '2025-06-04T03:00:00Z', usage: 3072 }
      ]

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 200,
        message: 'success',
        data: {
          usages: mockUsageData
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(request.get).toHaveBeenCalledWith('/usage', { params })
      expect(result).toEqual(mockResponse)
      expect(result.data.usages).toHaveLength(4)
      expect(result.data.usages[0].date).toBe('2025-06-04T00:00:00Z')
      expect(result.data.usages[0].usage).toBe(1024)
    })

    it('应该成功获取7天范围的使用数据', async () => {
      const params: GetUsageParams = {
        range: '7d'
      }

      const mockUsageData: UsageData[] = [
        { date: '2025-05-28', usage: 50000 },
        { date: '2025-05-29', usage: 45000 },
        { date: '2025-05-30', usage: 60000 },
        { date: '2025-05-31', usage: 55000 },
        { date: '2025-06-01', usage: 70000 },
        { date: '2025-06-02', usage: 65000 },
        { date: '2025-06-03', usage: 58000 }
      ]

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 200,
        message: 'success',
        data: {
          usages: mockUsageData
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(request.get).toHaveBeenCalledWith('/usage', { params })
      expect(result.data.usages).toHaveLength(7)
      expect(result.data.usages[0].date).toBe('2025-05-28')
      expect(result.data.usages[6].usage).toBe(58000)
    })

    it('应该成功获取30天范围的使用数据', async () => {
      const params: GetUsageParams = {
        range: '30d'
      }

      // 模拟30天的数据
      const mockUsageData: UsageData[] = Array.from({ length: 30 }, (_, i) => ({
        date: `2025-05-${String(5 + i).padStart(2, '0')}`,
        usage: Math.floor(Math.random() * 100000) + 10000
      }))

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 200,
        message: 'success',
        data: {
          usages: mockUsageData
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(request.get).toHaveBeenCalledWith('/usage', { params })
      expect(result.data.usages).toHaveLength(30)
    })

    it('应该成功获取月度范围的使用数据', async () => {
      const params: GetUsageParams = {
        range: 'month'
      }

      const mockUsageData: UsageData[] = [
        { date: '2025-01', usage: 1500000 },
        { date: '2025-02', usage: 1200000 },
        { date: '2025-03', usage: 1800000 },
        { date: '2025-04', usage: 1650000 },
        { date: '2025-05', usage: 1750000 }
      ]

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 200,
        message: 'success',
        data: {
          usages: mockUsageData
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(request.get).toHaveBeenCalledWith('/usage', { params })
      expect(result.data.usages).toHaveLength(5)
      expect(result.data.usages[4].date).toBe('2025-05')
      expect(result.data.usages[4].usage).toBe(1750000)
    })

    it('应该能够根据用户ID筛选使用数据', async () => {
      const params: GetUsageParams = {
        userId: 'user-123',
        range: '7d'
      }

      const mockUsageData: UsageData[] = [
        { date: '2025-05-28', usage: 25000 },
        { date: '2025-05-29', usage: 30000 },
        { date: '2025-05-30', usage: 28000 }
      ]

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 200,
        message: 'success',
        data: {
          usages: mockUsageData
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(request.get).toHaveBeenCalledWith('/usage', { params })
      expect(result.data.usages).toHaveLength(3)
    })

    it('应该能够根据虚拟网络ID筛选使用数据', async () => {
      const params: GetUsageParams = {
        vnetId: 'vnet-456',
        range: '24h'
      }

      const mockUsageData: UsageData[] = [
        { date: '2025-06-04T00:00:00Z', usage: 512 },
        { date: '2025-06-04T01:00:00Z', usage: 768 },
        { date: '2025-06-04T02:00:00Z', usage: 1024 }
      ]

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 200,
        message: 'success',
        data: {
          usages: mockUsageData
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(request.get).toHaveBeenCalledWith('/usage', { params })
      expect(result.data.usages).toHaveLength(3)
      expect(result.data.usages[2].usage).toBe(1024)
    })

    it('应该能够同时根据用户ID和虚拟网络ID筛选使用数据', async () => {
      const params: GetUsageParams = {
        userId: 'user-123',
        vnetId: 'vnet-456',
        range: '7d'
      }

      const mockUsageData: UsageData[] = [
        { date: '2025-06-01', usage: 15000 },
        { date: '2025-06-02', usage: 18000 },
        { date: '2025-06-03', usage: 12000 }
      ]

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 200,
        message: 'success',
        data: {
          usages: mockUsageData
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(request.get).toHaveBeenCalledWith('/usage', { params })
      expect(result.data.usages).toHaveLength(3)
    })

    it('应该能够处理空的使用数据', async () => {
      const params: GetUsageParams = {
        range: '24h'
      }

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 200,
        message: 'success',
        data: {
          usages: []
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(request.get).toHaveBeenCalledWith('/usage', { params })
      expect(result.data.usages).toHaveLength(0)
    })

    it('应该能够处理无效的范围参数', async () => {
      const params: GetUsageParams = {
        range: 'invalid-range'
      }

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 400,
        message: 'Invalid range parameter',
        data: {
          usages: []
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(request.get).toHaveBeenCalledWith('/usage', { params })
      expect(result.code).toBe(400)
      expect(result.message).toBe('Invalid range parameter')
    })

    it('应该能够处理未授权访问', async () => {
      const params: GetUsageParams = {
        range: '7d'
      }

      const mockError = new Error('Unauthorized')
      vi.mocked(request.get).mockRejectedValue(mockError)

      await expect(getUsage(params)).rejects.toThrow('Unauthorized')
      expect(request.get).toHaveBeenCalledWith('/usage', { params })
    })

    it('应该能够处理网络错误', async () => {
      const params: GetUsageParams = {
        range: '24h'
      }

      const mockError = new Error('Network error')
      vi.mocked(request.get).mockRejectedValue(mockError)

      await expect(getUsage(params)).rejects.toThrow('Network error')
      expect(request.get).toHaveBeenCalledWith('/usage', { params })
    })
  })

  describe('purchasePackage', () => {
    it('应该成功购买青铜套餐', async () => {
      const purchaseData: PurchasePackageParams = {
        packageType: 2, // 青铜
        duration: 1
      }

      const mockResponse: ApiResult<void> = {
        code: 200,
        message: 'Package purchased successfully',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await purchasePackage(purchaseData)

      expect(request.post).toHaveBeenCalledWith('/user/purchase', purchaseData)
      expect(result).toEqual(mockResponse)
      expect(result.message).toBe('Package purchased successfully')
    })

    it('应该成功购买白银套餐', async () => {
      const purchaseData: PurchasePackageParams = {
        packageType: 3, // 白银
        duration: 3
      }

      const mockResponse: ApiResult<void> = {
        code: 200,
        message: 'Silver package purchased for 3 months',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await purchasePackage(purchaseData)

      expect(request.post).toHaveBeenCalledWith('/user/purchase', purchaseData)
      expect(result.message).toBe('Silver package purchased for 3 months')
    })

    it('应该成功购买黄金套餐', async () => {
      const purchaseData: PurchasePackageParams = {
        packageType: 4, // 黄金
        duration: 12
      }

      const mockResponse: ApiResult<void> = {
        code: 200,
        message: 'Gold package purchased for 12 months',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await purchasePackage(purchaseData)

      expect(request.post).toHaveBeenCalledWith('/user/purchase', purchaseData)
      expect(result.message).toBe('Gold package purchased for 12 months')
    })

    it('应该能够使用默认时长（1个月）购买套餐', async () => {
      const purchaseData: PurchasePackageParams = {
        packageType: 2 // 青铜，不指定duration
      }

      const mockResponse: ApiResult<void> = {
        code: 200,
        message: 'Package purchased successfully',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await purchasePackage(purchaseData)

      expect(request.post).toHaveBeenCalledWith('/user/purchase', purchaseData)
      expect(result.message).toBe('Package purchased successfully')
    })

    it('应该能够处理无效的套餐类型', async () => {
      const purchaseData: PurchasePackageParams = {
        packageType: -1, // 无效的套餐类型
        duration: 1
      }

      const mockResponse: ApiResult<void> = {
        code: 400,
        message: 'Invalid package type',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await purchasePackage(purchaseData)

      expect(request.post).toHaveBeenCalledWith('/user/purchase', purchaseData)
      expect(result.code).toBe(400)
      expect(result.message).toBe('Invalid package type')
    })

    it('应该能够处理无效的时长', async () => {
      const purchaseData: PurchasePackageParams = {
        packageType: 2,
        duration: 0 // 无效的时长
      }

      const mockResponse: ApiResult<void> = {
        code: 400,
        message: 'Invalid duration',
        data: undefined
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await purchasePackage(purchaseData)

      expect(request.post).toHaveBeenCalledWith('/user/purchase', purchaseData)
      expect(result.code).toBe(400)
      expect(result.message).toBe('Invalid duration')
    })

    it('应该能够处理未授权的购买', async () => {
      const purchaseData: PurchasePackageParams = {
        packageType: 2,
        duration: 1
      }

      const mockError = new Error('Unauthorized')
      vi.mocked(request.post).mockRejectedValue(mockError)

      await expect(purchasePackage(purchaseData)).rejects.toThrow('Unauthorized')
      expect(request.post).toHaveBeenCalledWith('/user/purchase', purchaseData)
    })

    it('应该能够处理购买过程中的网络错误', async () => {
      const purchaseData: PurchasePackageParams = {
        packageType: 3,
        duration: 3
      }

      const mockError = new Error('Network error')
      vi.mocked(request.post).mockRejectedValue(mockError)

      await expect(purchasePackage(purchaseData)).rejects.toThrow('Network error')
      expect(request.post).toHaveBeenCalledWith('/user/purchase', purchaseData)
    })
  })

  describe('Type Safety Tests', () => {
    it('应该强制执行GetUsageParams接口结构', () => {
      const params: GetUsageParams = {
        userId: 'user-123',
        vnetId: 'vnet-456',
        range: '24h'
      }

      expect(typeof params.userId).toBe('string')
      expect(typeof params.vnetId).toBe('string')
      expect(typeof params.range).toBe('string')
    })

    it('应该强制执行包含可选字段的GetUsageParams', () => {
      const params: GetUsageParams = {
        range: '7d'
      }

      expect(typeof params.range).toBe('string')
      expect(params.userId).toBeUndefined()
      expect(params.vnetId).toBeUndefined()
    })

    it('应该强制执行UsageData接口结构', () => {
      const usageData: UsageData = {
        date: '2025-06-04T12:00:00Z',
        usage: 2048
      }

      expect(typeof usageData.date).toBe('string')
      expect(typeof usageData.usage).toBe('number')
      expect(usageData.usage).toBeGreaterThanOrEqual(0)
    })

    it('应该强制执行GetUsageResponseData接口结构', () => {
      const responseData: GetUsageResponseData = {
        usages: [
          { date: '2025-06-04T00:00:00Z', usage: 1024 },
          { date: '2025-06-04T01:00:00Z', usage: 2048 }
        ]
      }

      expect(Array.isArray(responseData.usages)).toBe(true)
      expect(responseData.usages).toHaveLength(2)
      expect(typeof responseData.usages[0].date).toBe('string')
      expect(typeof responseData.usages[0].usage).toBe('number')
    })

    it('应该强制执行PurchasePackageParams接口结构', () => {
      const purchaseParams: PurchasePackageParams = {
        packageType: 2,
        duration: 3
      }

      expect(typeof purchaseParams.packageType).toBe('number')
      expect(typeof purchaseParams.duration).toBe('number')
      expect([2, 3, 4]).toContain(purchaseParams.packageType)
    })

    it('应该强制执行包含可选时长的PurchasePackageParams', () => {
      const purchaseParams: PurchasePackageParams = {
        packageType: 3
      }

      expect(typeof purchaseParams.packageType).toBe('number')
      expect(purchaseParams.duration).toBeUndefined()
    })

    it('应该验证套餐类型', () => {
      const bronzePackage: PurchasePackageParams = { packageType: 2 }
      const silverPackage: PurchasePackageParams = { packageType: 3 }
      const goldPackage: PurchasePackageParams = { packageType: 4 }

      expect(bronzePackage.packageType).toBe(2) // 青铜
      expect(silverPackage.packageType).toBe(3) // 白银
      expect(goldPackage.packageType).toBe(4)   // 黄金
    })

    it('应该验证范围类型', () => {
      const validRanges = ['24h', '7d', '30d', 'month']

      validRanges.forEach(range => {
        const params: GetUsageParams = { range }
        expect(typeof params.range).toBe('string')
        expect(validRanges).toContain(params.range)
      })
    })
  })

  describe('Edge Cases', () => {
    it('应该能够处理非常大的使用数字', async () => {
      const params: GetUsageParams = {
        range: '30d'
      }

      const mockUsageData: UsageData[] = [
        { date: '2025-06-01', usage: Number.MAX_SAFE_INTEGER },
        { date: '2025-06-02', usage: 999999999999 }
      ]

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 200,
        message: 'success',
        data: {
          usages: mockUsageData
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(result.data.usages[0].usage).toBe(Number.MAX_SAFE_INTEGER)
      expect(result.data.usages[1].usage).toBe(999999999999)
    })

    it('应该能够处理零使用量', async () => {
      const params: GetUsageParams = {
        range: '24h'
      }

      const mockUsageData: UsageData[] = [
        { date: '2025-06-04T00:00:00Z', usage: 0 },
        { date: '2025-06-04T01:00:00Z', usage: 0 }
      ]

      const mockResponse: ApiResult<GetUsageResponseData> = {
        code: 200,
        message: 'success',
        data: {
          usages: mockUsageData
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getUsage(params)

      expect(result.data.usages.every(u => u.usage === 0)).toBe(true)
    })
  })
})
