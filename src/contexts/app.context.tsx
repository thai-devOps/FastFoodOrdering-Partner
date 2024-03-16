import React, { createContext, useState, Dispatch, SetStateAction, useEffect } from 'react'
import { Restaurant } from '~/types/restaurant.type'
import { Shop } from '~/types/shop.type'
import { User } from '~/types/user.type'
import { getAccessTokenFromLS, getProfileFromLS, getActiveStepFromLS, getShopFromLS } from '~/utils/auth'

interface AppContextInterface {
  isAuthenticated: boolean
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>
  profile: User | null
  setProfile: Dispatch<SetStateAction<User | null>>
  activeStep: Array<boolean>
  setActiveStep: Dispatch<SetStateAction<Array<boolean>>>
  shop: Shop | null
  setShop: Dispatch<SetStateAction<Shop | null>>
  reset: () => void
}
export const getInitialAppContext: () => AppContextInterface = () => {
  return {
    isAuthenticated: Boolean(getAccessTokenFromLS()),
    setIsAuthenticated: () => null,
    profile: getProfileFromLS(),
    setProfile: () => null,
    activeStep: getActiveStepFromLS() || [false, false, false, false],
    setActiveStep: () => null,
    shop: getShopFromLS(),
    setShop: () => null,
    reset: () => {}
  }
}
export const AppContext = createContext<AppContextInterface>(getInitialAppContext())

interface AppContextProviderProps {
  children: React.ReactNode
  defaultValues?: AppContextInterface // for testing purposes only
}
export const AppContextProvider = ({ children, defaultValues = getInitialAppContext() }: AppContextProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(defaultValues.isAuthenticated)
  const [profile, setProfile] = useState<User | null>(defaultValues.profile)
  const [activeStep, setActiveStep] = useState<Array<boolean>>(defaultValues.activeStep)
  const [shop, setShop] = useState<Shop | null>(defaultValues.shop)
  const reset = () => {
    setIsAuthenticated(false)
    setProfile(null)
    setActiveStep([false, false, false, false])
    setShop(null)
  }
  const value = {
    isAuthenticated,
    setIsAuthenticated,
    profile,
    setProfile,
    activeStep,
    setActiveStep,
    shop,
    setShop,
    reset
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
