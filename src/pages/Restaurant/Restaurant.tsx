import { UilCardAtm, UilDocumentLayoutCenter, UilShop, UilUserCircle } from '@iconscout/react-unicons'
import classNames from 'classnames'
import { FC, useContext, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import PartnerInfoForm from '~/components/PartnerInfoForm'
import PaymentForm from '~/components/PaymentForm'
import RestaurantFormInfo from '~/components/RestaurantFormInfo'
import TermAndCondition from '~/components/TermAndCondition'
import { AppContext } from '~/contexts/app.context'
/**
 * Trạng thái của bước 1:
 * 1. Chưa hoàn thành: stepRestaurantInfo = 1 && currentStep = 1
 * 2. Đã hoàn thành & chỉnh sửa lại: stepRestaurantInfo > 1 && currentStep >= 1
 * 3. Mạc định chưa xét: => icon mặc định, kiểu chữ mặc định
 */
const Restaurant: FC = () => {
  const { stepRestaurantInfo } = useContext(AppContext)
  const [currentStep, setCurrentStep] = useState<number>(stepRestaurantInfo)
  const handleSelectStep = (value: number) => {
    setCurrentStep(value)
  }
  return (
    <div>
      <Helmet>
        <title>Nhà hàng | TTFood-Partner</title>
        <meta name='description' content='Quản lý nhà hàng'></meta>
      </Helmet>
      <div className='w-full py-3 pl-7 pr-5'>
        <div className='px-5 pt-4 pb-7 bg-white  w-full max-h-full rounded-xl border border-[#E7E7E7] grid grid-cols-12 xl:gap-10 gap-6'>
          <div className='col-span-4 border-r-[1px] border-r-gray-300 px-5 overflow-hidden'>
            <ol className='relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400'>
              <li
                className={classNames('mb-10 ms-6', {
                  'cursor-pointer': stepRestaurantInfo > 1 && currentStep !== 1,
                  'cursor-not-allowed': stepRestaurantInfo === 1 && currentStep === 1
                })}
                onClick={
                  stepRestaurantInfo > 1 && stepRestaurantInfo < 5 && currentStep !== 1
                    ? () => handleSelectStep(1)
                    : () => null
                }
              >
                <span
                  className={classNames(
                    'absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900',
                    {
                      'bg-green-300': stepRestaurantInfo > 1 && currentStep >= 1,
                      'bg-gray-100': stepRestaurantInfo === 1 && currentStep === 1
                    }
                  )}
                >
                  {stepRestaurantInfo === 1 && currentStep === 1 ? (
                    <UilUserCircle className='text-gray-900'></UilUserCircle>
                  ) : (
                    <UilUserCircle className='text-white'></UilUserCircle>
                  )}
                </span>
                <h3 className='text-gray-900 font-medium leading-tight'>Thông tin chủ shop</h3>
              </li>
              {currentStep < 2 && stepRestaurantInfo <= 1 ? (
                <li className='mb-10 ms-6'>
                  <span className='absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900'>
                    <UilShop></UilShop>
                  </span>
                  <h3 className='font-medium leading-tight'>Thông tin Shop</h3>
                </li>
              ) : (
                <li
                  className={classNames('mb-10 ms-6', {
                    'cursor-pointer': stepRestaurantInfo >= 2 && currentStep !== 2
                  })}
                  onClick={
                    stepRestaurantInfo >= 2 && stepRestaurantInfo < 5 && currentStep !== 2
                      ? () => handleSelectStep(2)
                      : () => null
                  }
                >
                  <span
                    className={classNames(
                      'absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900',
                      {
                        'bg-gray-200': stepRestaurantInfo === 2,
                        'bg-green-300':
                          (stepRestaurantInfo > 2 && currentStep < 2) || (stepRestaurantInfo > 2 && currentStep >= 2)
                      }
                    )}
                  >
                    {stepRestaurantInfo === 2 && currentStep <= 2 ? (
                      <UilShop className='text-gray-900'></UilShop>
                    ) : (
                      <UilShop className='text-white'></UilShop>
                    )}
                  </span>
                  <h3 className='text-gray-900 font-medium leading-tight'>Thông tin Shop / Nhà hàng</h3>
                </li>
              )}
              {currentStep < 3 && stepRestaurantInfo <= 2 ? (
                <li className='mb-10 ms-6'>
                  <span className='absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900'>
                    <UilCardAtm></UilCardAtm>
                  </span>
                  <h3 className='font-medium leading-tight'>Thanh toán</h3>
                </li>
              ) : (
                <li
                  className={classNames('mb-10 ms-6', {
                    'cursor-pointer': stepRestaurantInfo >= 3 && currentStep !== 3
                  })}
                  onClick={
                    stepRestaurantInfo >= 3 && stepRestaurantInfo < 5 && currentStep !== 3
                      ? () => handleSelectStep(3)
                      : () => null
                  }
                >
                  <span
                    className={classNames(
                      'absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900',
                      {
                        'bg-gray-200': stepRestaurantInfo === 3 && currentStep !== 3,
                        'bg-green-300':
                          (stepRestaurantInfo > 3 && currentStep < 3) || (stepRestaurantInfo > 3 && currentStep >= 3)
                      }
                    )}
                  >
                    {stepRestaurantInfo === 3 && currentStep <= 3 ? (
                      <UilCardAtm className='text-gray-900'></UilCardAtm>
                    ) : (
                      <UilCardAtm className='text-white'></UilCardAtm>
                    )}
                  </span>
                  <h3 className='text-gray-900 font-medium leading-tight'>Thanh toán</h3>
                </li>
              )}
              {currentStep < 4 && stepRestaurantInfo <= 3 ? (
                <li className='mb-10 ms-6'>
                  <span className='absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900'>
                    <UilDocumentLayoutCenter></UilDocumentLayoutCenter>
                  </span>
                  <h3 className='font-medium leading-tight'>Điều khoản & Điều kiện</h3>
                </li>
              ) : (
                <li
                  className={classNames('mb-10 ms-6', {
                    'cursor-pointer': stepRestaurantInfo >= 4 && currentStep !== 4
                  })}
                  onClick={
                    stepRestaurantInfo >= 4 && stepRestaurantInfo < 5 && currentStep !== 4
                      ? () => handleSelectStep(4)
                      : () => null
                  }
                >
                  <span
                    className={classNames(
                      'absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900',
                      {
                        'bg-gray-200': stepRestaurantInfo === 4 && currentStep >= 4,
                        'bg-green-300':
                          (stepRestaurantInfo > 4 && currentStep < 4) || (stepRestaurantInfo > 4 && currentStep >= 4)
                      }
                    )}
                  >
                    {stepRestaurantInfo === 4 && currentStep <= 4 ? (
                      <UilDocumentLayoutCenter className='text-gray-900'></UilDocumentLayoutCenter>
                    ) : (
                      <UilDocumentLayoutCenter className='text-white'></UilDocumentLayoutCenter>
                    )}
                  </span>
                  <h3 className='text-gray-900 font-medium leading-tight'>Điều khoản & Điều kiện</h3>
                </li>
              )}
            </ol>
          </div>
          <div className='col-span-8'>
            {currentStep === 1 ? <PartnerInfoForm setStepCurrent={setCurrentStep}></PartnerInfoForm> : null}
            {currentStep === 2 ? <RestaurantFormInfo setStepCurrent={setCurrentStep}></RestaurantFormInfo> : null}
            {currentStep === 3 ? <PaymentForm setStepCurrent={setCurrentStep}></PaymentForm> : null}
            {currentStep === 4 ? <TermAndCondition setStepCurrent={setCurrentStep}></TermAndCondition> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Restaurant
