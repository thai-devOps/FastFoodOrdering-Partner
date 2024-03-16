import { FoodOptions } from '~/types/food_options.type'
import { SuccessResponse } from '~/types/utils.type'
import http from '~/utils/http'

export const URL_FOOD_OPTIONS = {
  GET_ALL_BY_FOOD_ID: '/food-options/:food_id',
  UPDATE: '/food-options/:food_id',
  DELETE: '/food-options/:food_id'
}

export const FOOD_OPTIONS_API = {
  getAllByFoodId: (food_id: string) =>
    http.get<SuccessResponse<FoodOptions[]>>(URL_FOOD_OPTIONS.GET_ALL_BY_FOOD_ID.replace(':food_id', food_id))
}
