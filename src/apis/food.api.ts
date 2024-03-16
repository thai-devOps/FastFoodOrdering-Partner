import { omit } from 'lodash'
import { FoodRequestType } from '~/schemas/food.schema'
import { Food } from '~/types/food.type'
import { FoodOptions } from '~/types/food_options.type'
import { MenuListConfig } from '~/types/menu.type'
import { ListPagination, SuccessResponse } from '~/types/utils.type'
import http from '~/utils/http'

/**
 * description: Get food items by shop id pagination
 * method: get
 * path: /food-shop-pagination/:shop_id/
 */
export const URL_FOOD = {
  CREATE: '/food-create',
  GET_BY_MENU_SECTION_ID: '/food-menu-sections/:mc_id',
  GET_BY_SHOP_ID_PAGINATION: '/food-shop-pagination/:shop_id/',
  GET_BY_ID: '/food/:id',
  GET_BY_SHOP_ID: '/food-shop/:shop_id',
  UPDATE: '/food/:id',
  DELETE: '/food/:id'
}

export const FOOD_API = {
  getByShopIdPagination: (shop_id: string, params: MenuListConfig) =>
    http.get<SuccessResponse<ListPagination<Food>>>(URL_FOOD.GET_BY_SHOP_ID_PAGINATION.replace(':shop_id/', shop_id), {
      params
    }),
  create: (data: FoodRequestType) => http.post<SuccessResponse<any>>(URL_FOOD.CREATE, data),
  getByMenuSectionId: (mcId: string) =>
    http.get<SuccessResponse<Food[]>>(URL_FOOD.GET_BY_MENU_SECTION_ID.replace(':mc_id', mcId)),
  getById: (id: string) => http.get<SuccessResponse<Food>>(URL_FOOD.GET_BY_ID.replace(':id', id)),
  getByShopId: (shopId: string) =>
    http.get<SuccessResponse<Food[]>>(URL_FOOD.GET_BY_SHOP_ID.replace(':shop_id', shopId)),
  update: (data: Food & { categories: string[]; food_options: FoodOptions[] }) =>
    http.put<SuccessResponse<any>>(URL_FOOD.UPDATE.replace(':id', data._id), omit(data, ['_id'])),
  delete: (id: string) => http.delete<SuccessResponse<any>>(URL_FOOD.DELETE.replace(':id', id))
}
