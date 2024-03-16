import omitBy from 'lodash/omitBy'
import isUndefined from 'lodash/isUndefined'
import useQueryParams from './useQueryParams'
import { MenuListConfig } from '~/types/menu.type'

export type QueryConfig = {
  [key in keyof MenuListConfig]: string
}

export default function useQueryConfig() {
  const queryParams: QueryConfig = useQueryParams()
  const queryConfig: QueryConfig = omitBy(
    {
      page: queryParams.page || '1',
      limit: queryParams.limit || '5',
      name: queryParams.name,
      sort_by: queryParams.sort_by,
      order_by: queryParams.order_by,
      is_draft: queryParams.is_draft,
      is_active: queryParams.is_active,
      is_selling: queryParams.is_selling,
      publish_status: queryParams.publish_status,
      quantity: queryParams.quantity,
      categories: queryParams.categories
    },
    isUndefined
  )
  return queryConfig
}
