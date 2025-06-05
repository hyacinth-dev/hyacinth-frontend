/**
 * API响应结果接口
 * 定义了统一的后端响应数据格式
 * 
 * @template T - 响应数据的具体类型
 */
export interface ApiResult<T> {
	code: number      // 响应状态码，注意不是 HTTP 状态码，而是业务逻辑状态码，一般而言 0 表示没有错误
	message: string   // 响应消息，如成功信息或错误提示
	data: T           // 响应数据主体，泛型类型，根据不同API返回不同的数据结构（xxResponseData）
}