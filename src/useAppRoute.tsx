import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import { lazy, useContext, Suspense } from 'react'
import { partnerPaths } from '~/routes/partnerRoute'
import RegisterLayout from './layouts/RegisterLayout'
import MainLayout from './layouts/MainLayout'
import Loading from './components/Loading'
import { AppContext } from './contexts/app.context'
import { UserVerifyStatus } from './enums'

// use lazy for better performance and code splitting, only loading when it's needed
const Login = lazy(() => import('~/pages/Login'))
const Register = lazy(() => import('~/pages/Register'))
const Home = lazy(() => import('~/pages/Home'))
const NotFound = lazy(() => import('~/pages/NotFound'))
const EmailVerification = lazy(() => import('~/pages/EmailVerification'))
const UserVefication = lazy(() => import('~/pages/UserVerification'))
// const Restaurant = lazy(() => import('~/pages/Restaurant'))
const Orders = lazy(() => import('~/pages/Orders'))
const Menu = lazy(() => import('~/pages/Menu'))
const FoodManage = lazy(() => import('~/pages/FoodManage'))
const MenuManage = lazy(() => import('~/pages/MenuManage'))
const FoodDetail = lazy(() => import('~/pages/FoodDetail'))
const Shop = lazy(() => import('~/pages/Shop'))
/**import FoodManage from './pages/FoodManage/FoodManage';
import MenuManage from './pages/MenuManage/MenuManage';

 * Để tối ưu re-render thì nên ưu tiên dùng <Outlet /> thay cho {children}
 * Lưu ý là <Outlet /> nên đặt ngay trong component `element` thì mới có tác dụng tối ưu
 * Chứ không phải đặt bên trong children của component `element`
 */
const RejectedRoute = () => {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to={partnerPaths.home} />
}
const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to={partnerPaths.login} />
}
const CheckVerifyStatus = () => {
  const { profile } = useContext(AppContext)
  const isVerified = Boolean(profile?.verify === UserVerifyStatus.Verified)
  return !isVerified ? <Navigate to={partnerPaths.verify_email} /> : <Outlet />
}
const RejectVerifyEmail = () => {
  const { profile } = useContext(AppContext)
  const isVerified = Boolean(profile?.verify === UserVerifyStatus.Verified)
  return isVerified ? <Navigate to={partnerPaths.home} /> : <Outlet />
}
const useAppRoute = () => {
  const routes = useRoutes([
    {
      path: '',
      element: <RejectedRoute />,
      children: [
        {
          path: '',
          element: <RegisterLayout></RegisterLayout>,
          children: [
            {
              path: partnerPaths.login,
              element: (
                <Suspense fallback={<Loading color='text-white' />}>
                  <Login />
                </Suspense>
              )
            },
            {
              path: partnerPaths.register,
              element: (
                <Suspense fallback={<Loading color='text-white' />}>
                  <Register />
                </Suspense>
              )
            }
          ]
        }
      ]
    },
    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        {
          path: '',
          element: <CheckVerifyStatus></CheckVerifyStatus>,
          children: [
            {
              path: '',
              element: <MainLayout></MainLayout>,
              children: [
                {
                  path: partnerPaths.home,
                  index: true,
                  element: (
                    <Suspense fallback={<Loading />}>
                      <Home />
                    </Suspense>
                  )
                },
                {
                  path: partnerPaths.shop.index,
                  children: [
                    {
                      index: true,
                      element: (
                        <Suspense fallback={<Loading />}>
                          <Shop />
                        </Suspense>
                      )
                    }
                  ]
                },
                {
                  path: partnerPaths.orders,
                  element: (
                    <Suspense fallback={<Loading />}>
                      <Orders />
                    </Suspense>
                  )
                },
                {
                  path: partnerPaths.menu,
                  children: [
                    {
                      index: true,
                      element: (
                        <Suspense fallback={<Loading />}>
                          <Menu />
                        </Suspense>
                      )
                    },
                    // route for food detail
                    {
                      path: partnerPaths.menu_food_detail,
                      element: (
                        <Suspense fallback={<Loading />}>
                          <FoodDetail />
                        </Suspense>
                      )
                    },
                    // route for manage menu
                    {
                      path: partnerPaths.manage_menu,
                      element: (
                        <Suspense fallback={<Loading />}>
                          <MenuManage />
                        </Suspense>
                      )
                    },
                    // route for manage foods
                    {
                      path: partnerPaths.manage_foods,
                      element: (
                        <Suspense fallback={<Loading />}>
                          <FoodManage />
                        </Suspense>
                      )
                    }
                  ]
                }

                // another protected routes here
              ]
            }
          ]
        },
        {
          path: '',
          element: <RejectVerifyEmail />,
          children: [
            {
              path: partnerPaths.verify_email,
              element: (
                <Suspense fallback={<Loading />}>
                  <EmailVerification />
                </Suspense>
              )
            }
          ]
        }
      ]
    },
    {
      path: partnerPaths.user_verification,
      element: (
        <Suspense fallback={<Loading />}>
          <UserVefication />
        </Suspense>
      )
    },
    {
      path: '*',
      element: (
        <Suspense fallback={<Loading />}>
          <NotFound />
        </Suspense>
      )
    }
  ])
  return routes
}
export default useAppRoute
