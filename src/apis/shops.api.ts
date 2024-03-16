import { omit } from 'lodash'
import { ShopRequestType } from '~/schemas/shop.schema'
import { Shop } from '~/types/shop.type'
import { SuccessResponse } from '~/types/utils.type'
import http from '~/utils/http'

export const URL_SHOP = {
  CREATE: '/shops-create',
  GET_BY_PARTNER_ID: '/shops-partner',
  GET_BY_ID: '/shops/:id',
  UPDATE_BY_ID: '/shops/:id',
  UPDATE_STATUS: '/shops-update-status'
}
export const SHOP_API = {
  create: (body: ShopRequestType) => http.post(URL_SHOP.CREATE, body),
  getByPartnerId: () => http.get<SuccessResponse<Shop>>(URL_SHOP.GET_BY_PARTNER_ID),
  getById: (id: string) => http.get(URL_SHOP.GET_BY_ID.replace(':id', id)),
  updateById: (body: ShopRequestType) =>
    http.put(URL_SHOP.UPDATE_BY_ID.replace(':id', body?._id as string), omit(body, '_id')),
  updateStatus: (is_active: boolean) => http.put(URL_SHOP.UPDATE_STATUS, { is_active })
}
