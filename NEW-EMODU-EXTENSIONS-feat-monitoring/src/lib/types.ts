export interface BaseResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface BaseListResponse<T> {
  success: boolean
  message: string
  totalCount: number
  data: T[]
}