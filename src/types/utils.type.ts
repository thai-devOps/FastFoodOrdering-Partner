export interface SuccessResponse<Data> {
  message: string
  data: Data
}
export interface ErrorResponse<Data> {
  message: string
  errors?: Data
}

// cú pháp `-?` sẽ loại bỏ undefiend của key optional

export type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>>
}

export interface ListPagination<DataType> {
  items: DataType[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}
