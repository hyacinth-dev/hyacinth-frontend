/**
 * API响应结果接口
 * 定义了统一的后端响应数据格式
 * 
 * @template T - 响应数据的具体类型
 */
export interface ApiResult<T> {
	code: number      // 响应状态码，如200表示成功，400表示参数错误，401表示未认证等
	message: string   // 响应消息，如成功信息或错误提示
	data: T           // 响应数据主体，泛型类型，根据不同API返回不同的数据结构
}