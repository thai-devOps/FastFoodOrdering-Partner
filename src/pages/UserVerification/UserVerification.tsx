import { FC, useContext, useEffect, useState } from 'react'
import { NavLink, Navigate } from 'react-router-dom'
import { adminPaths } from './../../../../consumer/src/routes/adminRoute'
import { Helmet } from 'react-helmet-async'
import { AppContext } from '~/contexts/app.context'
import { useQuery } from '@tanstack/react-query'
import authApi from '~/apis/authApi'
import useQueryParams from '~/hooks/useQueryParams'
import { AuthResponse } from '~/types/auth.type'
import { setAccessTokenToLS, setRefreshTokenToLS } from '~/utils/auth'
import { partnerPaths } from '~/routes/partnerRoute'
import classNames from 'classnames'
const EmailIcon = () => {
  return (
    <svg
      stroke='currentColor'
      fill='currentColor'
      strokeWidth='0'
      viewBox='0 0 24 24'
      height='20'
      width='20'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path fill='none' d='M0 0h24v24H0V0z'></path>
      <path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z'></path>
    </svg>
  )
}
const FacebookIcon = () => {
  return (
    <svg
      stroke='currentColor'
      fill='gray'
      strokeWidth='0'
      viewBox='0 0 16 16'
      height='18'
      width='18'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z'></path>
    </svg>
  )
}
const InstagramIcon = () => {
  return (
    <svg
      stroke='currentColor'
      fill='gray'
      strokeWidth='0'
      viewBox='0 0 1024 1024'
      height='18'
      width='18'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M512 378.7c-73.4 0-133.3 59.9-133.3 133.3S438.6 645.3 512 645.3 645.3 585.4 645.3 512 585.4 378.7 512 378.7zM911.8 512c0-55.2.5-109.9-2.6-165-3.1-64-17.7-120.8-64.5-167.6-46.9-46.9-103.6-61.4-167.6-64.5-55.2-3.1-109.9-2.6-165-2.6-55.2 0-109.9-.5-165 2.6-64 3.1-120.8 17.7-167.6 64.5C132.6 226.3 118.1 283 115 347c-3.1 55.2-2.6 109.9-2.6 165s-.5 109.9 2.6 165c3.1 64 17.7 120.8 64.5 167.6 46.9 46.9 103.6 61.4 167.6 64.5 55.2 3.1 109.9 2.6 165 2.6 55.2 0 109.9.5 165-2.6 64-3.1 120.8-17.7 167.6-64.5 46.9-46.9 61.4-103.6 64.5-167.6 3.2-55.1 2.6-109.8 2.6-165zM512 717.1c-113.5 0-205.1-91.6-205.1-205.1S398.5 306.9 512 306.9 717.1 398.5 717.1 512 625.5 717.1 512 717.1zm213.5-370.7c-26.5 0-47.9-21.4-47.9-47.9s21.4-47.9 47.9-47.9 47.9 21.4 47.9 47.9a47.84 47.84 0 0 1-47.9 47.9z'></path>
    </svg>
  )
}
const LinkedinIcon = () => {
  return (
    <svg
      stroke='currentColor'
      fill='gray'
      strokeWidth='0'
      viewBox='0 0 16 16'
      height='16'
      width='16'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z'></path>
    </svg>
  )
}
const UserVerification: FC = () => {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const [msg, setMsg] = useState<string>('')
  const params = useQueryParams()
  const { data } = useQuery({
    queryKey: ['user-verification', params.token],
    queryFn: () =>
      authApi
        .emailVerification(params.token)
        .then((res) => res.data as AuthResponse)
        .catch((error) => {
          if (error.response.data.message === 'jwt expired') {
            setMsg('Token hết hạn')
          }
          if (error.response.data.message === 'jwt malformed') {
            setMsg('Token không hợp lệ')
          }
          if (error.response.status === 401) {
            setMsg('Email đã được xác thực')
          }
        }),
    enabled: !!params.token
  })
  useEffect(() => {
    if (data) {
      setMsg('Xác thực email thành công')
      setAccessTokenToLS(data.data.access_token)
      setRefreshTokenToLS(data.data.refresh_token)
      setIsAuthenticated(true)
      setProfile(data.data.partner)
    }
  }, [data, setIsAuthenticated, setProfile])
  return (
    <div className='flex items-center justify-center flex-col mt-5'>
      <Helmet>
        <title>Xác thực tài khoản | TTFood</title>
        <meta name='description' content='Xác thực email'></meta>
      </Helmet>
      {params.token ? (
        <section className='max-w-2xl mx-auto bg-white'>
          <header className='py-8 flex justify-center w-full'>
            <NavLink to={adminPaths.home} className='flex gap-3 items-center justify-between'>
              <img src='images/vegetable.png' className='w-10 h-10 object-cover' alt='ttfoodicon' />
              <h3 className='text-xl md:text-3xl font-bold'>
                TTFo<span className='text-apps-pink'>o</span>d
              </h3>
            </NavLink>
          </header>
          <div className='h-[200px] bg-[#365CCE] w-full text-white flex items-center justify-center flex-col gap-5'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-[1px] bg-white'></div>
              <EmailIcon />
              <div className='w-10 h-[1px] bg-white'></div>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='text-center text-sm sm:text-xl tracking-widest font-normal'>CẢM ƠN BẠN ĐÃ ĐĂNG KÝ!</div>
              <div className='text-xl sm:text-3xl tracking-wider font-bold capitalize'>XÁC THỰC TÀI KHOẢN</div>
            </div>
          </div>
          <main className='mt-8 px-5 sm:px-10'>
            <h2
              className={classNames({
                'text-apps-black text-lg sm:text-xl font-semibold': msg === 'Email đã được xác thực',
                'text-green-700 text-lg sm:text-xl font-semibold': msg === 'Xác thực email thành công',
                'text-red-700 text-lg sm:text-xl font-semibold': msg === 'Token hết hạn' || msg === 'Token không hợp lệ'
              })}
            >
              {msg}
            </h2>
            <p className='mt-8 text-gray-600'>
              Cảm ơn, <br />
              Chau Thai - B2005731 | TTFood
            </p>
          </main>
          <p className='text-gray-500  px-5 sm:px-10 mt-8'>
            Email này được gửi từ . Nếu bạn không muốn nhận loại email này, bạn có thể{' '}
            <a href='#' className='text-[#365CCE] hover:underline'>
              hủy đăng ký{' '}
            </a>
            hoặc bỏ qua email này.
          </p>
          <footer className='mt-8'>
            <div className='bg-gray-300/60 h-[200px] flex flex-col gap-3 justify-center items-center'>
              <div className='text-center flex flex-col gap-2'>
                <h1 className='text-[#365CCE] font-semibold tracking-wide text-lg'>Liên hệ</h1>
                <a href='tel:0397706494' className='text-gray-500'>
                  0397706494
                </a>
                <a href='mailto:thaib2005731@student.ctu.edu.vn' className='text-gray-500'>
                  thaib2005731@student.ctu.edu.vn
                </a>
              </div>
              <div className='flex items-center justify-center gap-3'>
                <a href='#_'>
                  <FacebookIcon />
                </a>
                <a href='#_'>
                  <LinkedinIcon />
                </a>
                <a href='#_'>
                  <InstagramIcon />
                </a>
              </div>
            </div>
            <div className='bg-[#365CCE] py-5 text-white text-center'>
              <p className='mt-3 '>
                © {new Date().getFullYear()} TTFo<span>o</span>d. Đã đăng ký bản quyền.
              </p>
            </div>
          </footer>
        </section>
      ) : (
        <Navigate to={partnerPaths.login}></Navigate>
      )}
    </div>
  )
}

export default UserVerification
