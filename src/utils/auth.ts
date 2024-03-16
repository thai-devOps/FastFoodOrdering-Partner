import { Restaurant } from '~/types/restaurant.type'
import { Shop } from '~/types/shop.type'
import { User } from '~/types/user.type'

export const LocalStorageEventTarget = new EventTarget()

export const setAccessTokenToLS = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}

export const setRefreshTokenToLS = (refresh_token: string) => {
  localStorage.setItem('refresh_token', refresh_token)
}
// export const setRestaurantToLS = (restaurant: Restaurant) => {
//   localStorage.setItem('restaurant', JSON.stringify(restaurant))
// }

export const clearLS = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('profile')
  localStorage.removeItem('active')
  const clearLSEvent = new Event('clearLS')
  LocalStorageEventTarget.dispatchEvent(clearLSEvent)
}

export const getAccessTokenFromLS = () => localStorage.getItem('access_token') || ''
export const getShopFromLS = () => {
  const result = localStorage.getItem('shop')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result ? JSON.parse(result) : null
}
export const setShopToLS = (shop: Shop) => {
  localStorage.setItem('shop', JSON.stringify(shop))
}
export const getRefreshTokenFromLS = () => localStorage.getItem('refresh_token') || ''

export const getProfileFromLS = () => {
  const result = localStorage.getItem('profile')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result ? JSON.parse(result) : null
}
export const setActiveStepToLS = (active: Array<boolean>) => {
  localStorage.setItem('active', JSON.stringify(active))
}
export const getActiveStepFromLS = () => {
  const data = localStorage.getItem('active')
  const result = data ? (JSON.parse(data) as Array<boolean>) : null
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result
}

export const setProfileToLS = (profile: User) => {
  localStorage.setItem('profile', JSON.stringify(profile))
}
