import React from 'react'
import { Helmet } from 'react-helmet-async'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormRegisterType, RegisterSchema } from '~/utils/rules'
import { useMutation } from '@tanstack/react-query'
import authApi from '~/apis/authApi'
import { AxiosError } from 'axios'
import { isAxiosUnprocessableEntityError } from '~/utils/utils'
import { ErrorResponse } from '~/types/utils.type'
import CustomInput from '~/components/CustomInput'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { partnerPaths } from '~/routes/partnerRoute'
import Loading from '~/components/Loading'
const Register: React.FC = () => {
  const navigate = useNavigate()
  const {
    register,
    setError,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormRegisterType>({
    resolver: yupResolver(RegisterSchema)
  })
  const registerMutation = useMutation({
    mutationFn: (body: FormRegisterType) => authApi.registerAccount(body)
  })
  const onSubmitLoginForm: SubmitHandler<FormRegisterType> = (data) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        reset()
        toast.success('Đăng ký thành công')
        navigate(partnerPaths.login)
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          // Error form validation
          if (isAxiosUnprocessableEntityError<ErrorResponse<FormRegisterType>>(err)) {
            const formError = err.response?.data.errors
            if (formError) {
              Object.keys(formError).forEach((key) => {
                setError(key as keyof FormRegisterType, {
                  message: formError[key as keyof FormRegisterType],
                  type: 'Server'
                })
              })
            }
          } else {
            const msg = err.response?.data.message || 'Đăng ký thất bại'
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            toast.error(msg)
            // }
          }
        }
      }
    })
  }
  return (
    <div className='grid h-full min-h-[100vh] place-items-center px-6 py-8 mx-auto'>
      <Helmet>
        <title>Đăng ký | TTFood</title>
        <meta name='description' content='Đăng ký tài khoản đối tác dự án TTFood' />
      </Helmet>
      {registerMutation.isPending ? (
        <Loading color='text-white' />
      ) : (
        <div className=' bg-transparent border-2 border-[rgba(255,255,255,0.5)] rounded-[20px] backdrop-blur-[15px]'>
          <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
            <h1 className='text-lg text-center font-bold leading-tight tracking-tight text-white md:text-xl dark:text-gray-900'>
              ĐĂNG KÝ TÀI KHOẢN ĐỐI TÁC
            </h1>
            <form noValidate className='flex flex-col gap-y-3' onSubmit={handleSubmit(onSubmitLoginForm)}>
              <div className='grid grid-cols-1 md:grid-cols-2 md:gap-5'>
                <CustomInput
                  csname='name'
                  csplaceholder='Họ tên'
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
                        d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z'
                      />
                    </svg>
                  }
                  csregisterfunc={register}
                  cserrormessage={errors.name?.message}
                />
                <CustomInput
                  csname='phone'
                  csplaceholder='Số điện thoại'
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
                        d='M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z'
                      />
                    </svg>
                  }
                  csregisterfunc={register}
                  cserrormessage={errors.phone?.message}
                />
              </div>
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
              <div className='grid grid-cols-1 md:grid-cols-1 md:gap-5'>
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
                <CustomInput
                  csname='password_confirmation'
                  cstype='password'
                  csplaceholder='Nhập lại mật khẩu'
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
                  cserrormessage={errors.password_confirmation?.message}
                />
              </div>
              <button
                type='submit'
                disabled={registerMutation.isPending}
                className='w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default Register
