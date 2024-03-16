import { IMenu, MenuListConfig } from '~/types/menu.type'
import { ListPagination, SuccessResponse } from '~/types/utils.type'
import http from '~/utils/http'
import { MenuRequestType } from '~/utils/rules'

export const URL_MENUS = {
  CREATE: '/menu-create',
  GET_BY_SHOP_ID: '/menu-shop/:shop_id',
  GET_BY_PARTNER_ID: '/menu-partner',
  ACTIVE_MENU_BY_ID: '/menu-active/:menu_id',
  GET_ALL_BY_PARTNER_PAGINATION: '/menu-partner-pagination',
  GET_BY_ID: '/menu/:menu_id',
  UPDATE: '/menu/:menu_id',
  DELETE: '/menu/:menu_id'
}
export const MENUS_API = {
  getAllMenuByPartnerPagination: (params: MenuListConfig) => {
    return http.get<SuccessResponse<ListPagination<IMenu>>>(URL_MENUS.GET_ALL_BY_PARTNER_PAGINATION, { params })
  },
  updateActiveMenu: (menuId: string) =>
    http.put<SuccessResponse<any>>(URL_MENUS.ACTIVE_MENU_BY_ID.replace(':menu_id', menuId)),
  create: (data: MenuRequestType) => http.post<SuccessResponse<any>>(URL_MENUS.CREATE, data),
  getByShopId: (shopId: string) =>
    http.get<SuccessResponse<IMenu[]>>(URL_MENUS.GET_BY_SHOP_ID.replace(':shop_id', shopId)),
  getByPartnerId: () => http.get<SuccessResponse<IMenu[]>>(URL_MENUS.GET_BY_PARTNER_ID),
  getById: (menuId: string) => http.get<SuccessResponse<IMenu>>(URL_MENUS.GET_BY_ID.replace(':menu_id', menuId)),
  update: (menuId: string, data: MenuRequestType) =>
    http.put<SuccessResponse<any>>(URL_MENUS.UPDATE.replace(':menu_id', menuId), data),
  delete: (menuId: string) => http.delete<SuccessResponse<any>>(URL_MENUS.DELETE.replace(':menu_id', menuId))
}
