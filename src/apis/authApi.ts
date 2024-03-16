import { omit } from 'lodash'
import { AuthResponse, ProfileResponse } from 'src/types/auth.type'
import { RESTAURANT_STATUS } from '~/enums'
import { Card } from '~/types/card.type'
import { Category } from '~/types/category.type'
import { Food } from '~/types/food.type'
import { FoodCategory } from '~/types/food_category.type'
import { FoodType } from '~/types/food_type.type'
import { IMenu } from '~/types/menu.type'
import { MenuSection } from '~/types/menu_section.type'
import { Restaurant } from '~/types/restaurant.type'
import { User } from '~/types/user.type'
import { SuccessResponse } from '~/types/utils.type'
import { getRefreshTokenFromLS } from '~/utils/auth'
import http from '~/utils/http'
import {
  CardFormType,
  CategoryFormType,
  CategoryRequestType,
  FoodRequestType,
  FoodTypeRequestType,
  MenuFormType,
  MenuRequestType,
  MenuSectionRequestType,
  New_Form_Partner,
  New_Form_Restaurant
} from '~/utils/rules'

export const URL_LOGIN = 'login'
export const URL_REGISTER = 'register'
export const URL_LOGOUT = 'logout'
export const URL_REFRESH_TOKEN = 'refresh-access-token'
export const URL_VERIFY_EMAIL = 'verify-email'
export const URL_RESEND_VERIFY_EMAIL = 'resend-verify-email'
export const URL_FORGOT_PASSWORD = 'forgot-password'
export const URL_RESET_PASSWORD = 'reset-password'
export const URL_GET_USER_INFO = 'get-user-info'
export const URL_UPLOAD_AVATAR = 'upload-avatar'
export const URL_UPDATE_AVATAR = 'update-avatar'
export const URL_UPDATE_PROFILE = 'update-profile'
export const URL_CREATE_RESTAURANT = 'create-restaurant'
export const URL_GET_RESTAURANT_BY_PARTNER_ID = 'get-restaurant-by-partner-id'
export const URL_CREATE_CARD = 'create-card'
export const URL_GET_ALL_CARD = 'get-cards'
export const URL_UPDATE_RESTAURANT_STATUS = 'update-restaurant-status'
export const URL_DELETE_CARD_BY_ID = 'delete-card-by-id'
export const URL_UPDATE_CARD_STATUS_DEFAULT = 'update-card-status-default'
export const URL_UPDATE_CARD = 'update-card'
export const URL_UPDATE_RESTAURANT = 'update-restaurant'
export const URL_CREATE_menu = '/menu/create'
// Get all menus by restaurant id
export const URL_GET_ALL_MENU_BY_RESTAURANT_ID = '/menu/restaurant/'
// Get all menus by partner id
export const URL_GET_ALL_MENU_BY_PARTNER_ID = '/menu/partner'
// Get all menus by id
export const URL_GET_MENU_BY_ID = '/menu/'
// Update menu by id
export const URL_UPDATE_MENU_BY_ID = '/menu/'
// Delete menu by id
export const URL_DELETE_MENU_BY_ID = '/menu/'
export const URL_MENU_SECTIONS = {
  GET_ALL_BY_MENU_ID: '/menu-sections/menu/',
  CREATE: '/menu-sections/create',
  UPDATE: '/menu-sections/',
  DELETE: '/menu-sections/'
}

export const URL_CATEGORIES = {
  GET_ALL: '/categories',
  CREATE: '/categories/create',
  UPDATE: '/categories/',
  DELETE: '/categories/'
}
export const URL_FOOD_TYPES = {
  GET_BY_ID: '/food-types',
  CREATE: '/food-types/create',
  UPDATE: '/food-types/',
  DELETE: '/food-types/'
}
// create food
export const URL_CREATE_FOOD = '/food/create'
// Get all food items by restaurant id
export const URL_GET_ALL_FOOD_BY_RESTAURANT_ID = '/food-restaurant/'

const authApi = {
  deleteMenuSectionById(id: string) {
    return http.delete<SuccessResponse<any>>(`/menu-sections/${id}`)
  },
  getMenuSectionById(id: string) {
    return http.get<SuccessResponse<MenuSection>>(`/menu-section/${id}`)
  },
  getFoodCategories(food_id: string) {
    return http.get<SuccessResponse<FoodCategory[]>>(`/food-categories/${food_id}`)
  },
  createFoodType(body: FoodTypeRequestType) {
    return http.post<SuccessResponse<any>>(URL_FOOD_TYPES.CREATE, body)
  },
  updateFoodType(body: FoodTypeRequestType) {
    return http.put<SuccessResponse<any>>(URL_FOOD_TYPES.UPDATE + body._id, omit(body, '_id'))
  },
  deleteFoodTypeById(id: string) {
    return http.delete<SuccessResponse<any>>(URL_FOOD_TYPES.DELETE + id)
  },
  getFoodTypeById(id: string) {
    return http.get<SuccessResponse<FoodType>>(URL_FOOD_TYPES.GET_BY_ID + id)
  },
  getFoodItemsByRestaurantId(restaurantId: string) {
    return http.get<SuccessResponse<Food[]>>(URL_GET_ALL_FOOD_BY_RESTAURANT_ID + restaurantId)
  },
  createFood(body: FoodRequestType) {
    return http.post<SuccessResponse<any>>(URL_CREATE_FOOD, body)
  },
  getCategories() {
    return http.get<SuccessResponse<Category[]>>(URL_CATEGORIES.GET_ALL)
  },
  createCategory(body: CategoryFormType) {
    return http.post<SuccessResponse<any>>(URL_CATEGORIES.CREATE, body)
  },
  updateMenuSection(body: MenuSectionRequestType) {
    return http.put<SuccessResponse<any>>(URL_MENU_SECTIONS.UPDATE + body._id, omit(body, '_id'))
  },
  getAllMenuSectionByMenuId(menuId: string) {
    return http.get<SuccessResponse<MenuSection[]>>(URL_MENU_SECTIONS.GET_ALL_BY_MENU_ID + menuId)
  },
  createMenuSection(body: MenuSectionRequestType) {
    return http.post<SuccessResponse<any>>(URL_MENU_SECTIONS.CREATE, body)
  },
  updateMenu(body: MenuRequestType) {
    return http.put<SuccessResponse<any>>(URL_UPDATE_MENU_BY_ID + body._id, omit(body, '_id'))
  },
  createMenu(body: MenuRequestType) {
    return http.post<SuccessResponse<any>>(URL_CREATE_menu, body)
  },
  getAllMenuByRestaurantId(restaurantId: string) {
    return http.get<SuccessResponse<MenuFormType[]>>(URL_GET_ALL_MENU_BY_RESTAURANT_ID + restaurantId)
  },
  getAllMenuByPartnerId() {
    return http.get<SuccessResponse<IMenu[]>>(URL_GET_ALL_MENU_BY_PARTNER_ID)
  },
  getMenuById(id: string) {
    return http.get<SuccessResponse<IMenu>>(URL_GET_MENU_BY_ID + id)
  },
  // updateMenuById(body: MenuRequestType) {
  //   return http.put<SuccessResponse<any>>(URL_UPDATE_MENU_BY_ID + body._id, body)
  // },
  deleteMenuById(id: string) {
    return http.delete<SuccessResponse<any>>(URL_DELETE_MENU_BY_ID + id)
  },
  updateRestaurant(body: New_Form_Restaurant) {
    return http.put<SuccessResponse<any>>(URL_UPDATE_RESTAURANT + '/' + body._id, body)
  },
  updateAvatar(form: FormData) {
    return http.post<
      SuccessResponse<{
        url: string
        public_id: string
      }>
    >(URL_UPDATE_AVATAR, form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  updateCard(body: CardFormType) {
    return http.put<SuccessResponse<any>>(URL_UPDATE_CARD + '/' + body._id, body)
  },
  updateCardStatusDefault(body: { id: string; active: boolean }) {
    return http.put<SuccessResponse<any>>(URL_UPDATE_CARD_STATUS_DEFAULT, body)
  },
  deleteCardById(id: string) {
    return http.delete<SuccessResponse<any>>(URL_DELETE_CARD_BY_ID + '/' + id)
  },
  updateRestaurantStatus(body: { id: string; status: RESTAURANT_STATUS }) {
    return http.put<SuccessResponse<any>>(URL_UPDATE_RESTAURANT_STATUS, body)
  },
  getAllCard() {
    return http.get<SuccessResponse<Card[]>>(URL_GET_ALL_CARD)
  },
  createCard(body: CardFormType) {
    return http.post<SuccessResponse<any>>(URL_CREATE_CARD, body)
  },
  getRestaurantByPartnerId() {
    return http.get<SuccessResponse<Restaurant>>(URL_GET_RESTAURANT_BY_PARTNER_ID)
  },
  updateProfile(body: New_Form_Partner) {
    return http.put<SuccessResponse<User>>(URL_UPDATE_PROFILE, body)
  },
  createRestaurant(body: New_Form_Restaurant) {
    return http.post<SuccessResponse<any>>(URL_CREATE_RESTAURANT, body)
  },
  uploadAvatar(formData: FormData) {
    return http.post<
      SuccessResponse<{
        url: string
        public_id: string
      }>
    >(URL_UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  registerAccount(body: { email: string; password: string }) {
    return http.post<AuthResponse>(URL_REGISTER, body)
  },
  login(body: { email: string; password: string }) {
    return http.post<AuthResponse>(URL_LOGIN, body)
  },
  emailVerification(token: string) {
    return http.get(URL_VERIFY_EMAIL + '?token=' + token)
  },
  resendVerifyEmail() {
    return http.post(URL_RESEND_VERIFY_EMAIL)
  },
  logout() {
    return http.post(URL_LOGOUT, {
      refresh_token: getRefreshTokenFromLS()
    })
  },
  getProfile() {
    return http.get<ProfileResponse>(URL_GET_USER_INFO)
  }
}

export default authApi
