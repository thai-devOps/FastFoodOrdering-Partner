import React, { useContext } from 'react'
import { Helmet } from 'react-helmet-async'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormLoginType, LoginSchema } from '~/utils/rules'
import { useMutation } from '@tanstack/react-query'
import authApi from '~/apis/authApi'
import { AxiosError } from 'axios'
import { isAxiosUnauthorizedError, isAxiosUnprocessableEntityError } from '~/utils/utils'
import { ErrorResponse } from '~/types/utils.type'
import CustomInput from '~/components/CustomInput'
import { AppContext } from '~/contexts/app.context'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { TOKEN_TYPE } from '~/enums'
const Login: React.FC = () => {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const navigate = useNavigate()
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm<FormLoginType>({
    resolver: yupResolver(LoginSchema)
  })
  const loginMutation = useMutation({
    mutationFn: (body: FormLoginType) => authApi.login(body)
  })
  const onSubmitLoginForm: SubmitHandler<FormLoginType> = (data) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        setIsAuthenticated(true)
        setProfile(res.data.data.partner)
        navigate('/')
        toast.success('Đăng nhập thành công')
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          // Error form validation
          if (isAxiosUnprocessableEntityError<ErrorResponse<FormLoginType>>(err)) {
            const formError = err.response?.data.errors
            if (formError) {
              Object.keys(formError).forEach((key) => {
                setError(key as keyof FormLoginType, {
                  message: formError[key as keyof FormLoginType],
                  type: 'Server'
                })
              })
            }
          } else if (isAxiosUnauthorizedError<ErrorResponse<{ message: string; type: TOKEN_TYPE }>>(err)) {
            // Respone status code 401 => Unauthorized
            // Return error message from server
            // if (err.response?.data.errors?.type === TOKEN_TYPE.EMAIL_VERIFY_TOKEN) {
            //   navigate(partnerPaths.verify_email)
            // } else {
            const msg = err.response?.data.message || 'Đăng nhập thất bại'
            toast.error(msg)
            // }
          } else {
            // Other error
            console.log(err)
          }
        }
      }
    })
  }
  return (
    <div className='grid h-full min-h-[100vh] place-items-center px-6 py-8 mx-auto max-w-[500px]'>
      <Helmet>
        <title>Đăng nhập | TTFood</title>
        <meta name='description' content='Đăng nhập vào dự án TTFood' />
      </Helmet>
      <div className=' bg-transparent border-2 border-[rgba(255,255,255,0.5)] rounded-[20px] backdrop-blur-[15px]'>
        <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
          <h1 className='text-lg text-center font-bold leading-tight tracking-tight text-white md:text-xl dark:text-gray-900'>
            ĐĂNG NHẬP HỆ THỐNG QUẢN LÝ
          </h1>
          <form noValidate className='space-y-4 md:space-y-6' onSubmit={handleSubmit(onSubmitLoginForm)}>
            <CustomInput
              csname='email'
              csplaceholder='Email'
              icon={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-6 h-6'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75'
                  />
                </svg>
              }
              csregisterfunc={register}
              cserrormessage={errors.email?.message}
            />
            <CustomInput
              csname='password'
              cstype='password'
              csplaceholder='Mật khẩu'
              icon={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-6 h-6'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z'
                  />
                </svg>
              }
              csregisterfunc={register}
              cserrormessage={errors.password?.message}
            />
            <div className='flex items-center justify-between'>
              <div className='flex items-start'>
                <div className='flex items-center h-5'>
                  <input
                    id='remember'
                    aria-describedby='remember'
                    type='checkbox'
                    className='w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800'
                    required
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label htmlFor='remember' className='text-gray-500 dark:text-gray-300'>
                    Ghi nhớ tôi
                  </label>
                </div>
              </div>
              <a href='#' className='text-sm text-blue-500 font-medium hover:underline'>
                Quên mật khẩu?
              </a>
            </div>
            <button
              type='submit'
              disabled={loginMutation.isPending}
              className='w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
            >
              Đăng nhập
            </button>
          </form>
          <div className='w-[100%] mx-auto h-[2px] bg-gray-700'></div>
          <button
            type='button'
            className='w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-3 border border-gray-300'
          >
            <div className='flex items-center justify-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                className='w-6 h-6'
                viewBox='0 0 48 48'
              >
                <defs>
                  <path
                    id='a'
                    d='M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z'
                  />
                </defs>
                <clipPath id='b'>
                  <use xlinkHref='#a' overflow='visible' />
                </clipPath>
                <path clipPath='url(#b)' fill='#FBBC05' d='M0 37V11l17 13z' />
                <path clipPath='url(#b)' fill='#EA4335' d='M0 11l17 13 7-6.1L48 14V0H0z' />
                <path clipPath='url(#b)' fill='#34A853' d='M0 37l30-23 7.9 1L48 0v48H0z' />
                <path clipPath='url(#b)' fill='#4285F4' d='M48 48L17 24l-4-3 35-10z' />
              </svg>
              <span className='ml-4'>Đăng nhập với Google</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
export default Login
