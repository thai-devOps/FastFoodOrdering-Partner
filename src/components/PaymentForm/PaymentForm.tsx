import { FC, useContext, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { AppContext } from '~/contexts/app.context'
import { setActiveStepToLS } from '~/utils/auth'
import CommonInput from '../CommonInput'
import { yupResolver } from '@hookform/resolvers/yup'
import Loading from '../Loading'
import { CardFormType, cardSchema } from '~/utils/rules'
import { useMutation, useQuery } from '@tanstack/react-query'
import authApi from '~/apis/authApi'
interface PaymentFormInfoProps {
  setActiveStep3: React.Dispatch<React.SetStateAction<boolean>>
}
const PaymentForm: FC<PaymentFormInfoProps> = ({ setActiveStep3 }) => {
  const { activeStep, setActiveStep } = useContext(AppContext)
  const methods = useForm<CardFormType>({
    resolver: yupResolver(cardSchema)
  })
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputExpiryDate = e.target.value
    let formattedDate = inputExpiryDate

    if (inputExpiryDate.length === 2 && !inputExpiryDate.includes(' / ')) {
      // Automatically add slash after MM
      formattedDate += ' / '
    } else if (inputExpiryDate.length === 3 && inputExpiryDate.charAt(2) !== ' / ') {
      // Handle case where user pastes MMYY without slash
      formattedDate = inputExpiryDate.slice(0, 2) + ' / ' + inputExpiryDate.slice(2)
    }

    // Update input value to formatted date
    e.target.value = formattedDate
  }
  const createCardMutation = useMutation({
    mutationFn: (data: CardFormType) => authApi.createCard(data)
  })
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = methods
  const onSubmit = handleSubmit((data) => {
    createCardMutation.mutate(data, {
      onSuccess: () => {
        setActiveStepToLS([activeStep[0], activeStep[1], true, activeStep[3]])
        setActiveStep([activeStep[0], activeStep[1], true, activeStep[3]])
        setActiveStep3(false)
      }
    })
  })
  return (
    <div>
      {createCardMutation.isPending ? (
        <Loading></Loading>
      ) : (
        <div
          className='w-full mx-auto animate__animated animate__fadeIn rounded-lg bg-white p-5 text-gray-700 border'
          style={{ maxWidth: 500 }}
        >
          <div className=' flex justify-between mb-5'>
            <h2 className='font-normal text-gray-600 text-xl'>Thẻ Tín Dụng/Ghi Nợ</h2>
            <img src='https://leadershipmemphis.org/wp-content/uploads/2020/08/780370.png' className='h-8 ml-3' />
          </div>
          <FormProvider {...methods}>
            <form noValidate onSubmit={onSubmit}>
              <div className='grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6'>
                <div className='md:col-span-6 mb-3'>
                  <CommonInput
                    name='card_number'
                    register={register}
                    type='number'
                    label='Số thẻ'
                    requiredInput={true}
                    placeholder='0000 0000 0000 0000'
                    errorMessage={errors.card_number?.message}
                  />
                </div>
                <div className='md:col-span-4 mb-3'>
                  <CommonInput
                    name='expiration_date'
                    register={register}
                    type='text'
                    label='Ngày hết hạn (MM/YY)'
                    requiredInput={true}
                    maxLength={7}
                    onChange={handleChange}
                    placeholder='MM/YY'
                    errorMessage={errors.expiration_date?.message}
                  />
                </div>
                <div className='md:col-span-2 mb-3'>
                  <CommonInput
                    name='security_code'
                    register={register}
                    type='number'
                    label='Mã CVV'
                    requiredInput={true}
                    placeholder='000'
                    errorMessage={errors.security_code?.message}
                  />
                </div>
                <div className='md:col-span-6 mb-3'>
                  <CommonInput
                    name='card_holder_name'
                    register={register}
                    type='text'
                    label='Họ và tên chủ thẻ'
                    requiredInput={true}
                    placeholder='NGUYEN VAN A'
                    errorMessage={errors.card_holder_name?.message}
                  />
                </div>
                <div className='md:col-span-6 mb-3'>
                  <div className='inline-flex items-start'>
                    <CommonInput
                      id='default-checkbox'
                      name='is_active'
                      classNameLable='text-white mb-3'
                      classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
                      register={register}
                      type='checkbox'
                      placeholder='NGUYEN VAN A'
                      errorMessage={errors.is_active?.message}
                    ></CommonInput>
                    <label
                      htmlFor='default-checkbox'
                      className='ms-2 text-sm font-medium text-gray-900 dark:text-gray-300p py-2.5'
                    >
                      Đặt làm phương thức thanh toán mặc định
                    </label>
                  </div>
                </div>
                <div className='md:col-span-6'>
                  <div className='flex justify-center'>
                    <button
                      type='submit'
                      className='relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800'
                    >
                      <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0'>
                        Thêm thẻ
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      )}
    </div>
  )
}
export default PaymentForm
