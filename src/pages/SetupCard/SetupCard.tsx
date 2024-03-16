import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { CheckCheck, ChevronRight, ChevronUp } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import authApi from '~/apis/authApi'
import { SHOP_API } from '~/apis/shops.api'
import PartnerInfoForm from '~/components/PartnerInfoForm'
import PaymentForm from '~/components/PaymentForm'
import RestaurantFormInfo from '~/components/RestaurantFormInfo'
import TermAndCondition from '~/components/TermAndCondition'
import { AppContext } from '~/contexts/app.context'
import { PARTNER_STATUS, RESTAURANT_STATUS } from '~/enums'

const SetupCard = () => {
  const { activeStep, profile, setProfile, setActiveStep } = useContext(AppContext)
  const [activeStep1, setActiveStep1] = useState<boolean>(activeStep[0])
  const [activeStep2, setActiveStep2] = useState<boolean>(activeStep[1])
  const [activeStep3, setActiveStep3] = useState<boolean>(activeStep[2])
  const [activeStep4, setActiveStep4] = useState<boolean>(activeStep[3])
  const progress = activeStep.filter((step) => step).length * 25
  const handleActiveStep1 = () => {
    // if step 1 is not active, set it to active
    if (!activeStep[0]) {
      setActiveStep1(!activeStep1)
    }
    // CASE 1: Chưa hoàn thành bước 1 => Bấm vào bước 1 => Mở bước 1
    if (!activeStep[0]) {
      setActiveStep1(!activeStep1)
    }
    // CASE 2: Đã hoàn thành bước 1
    if (activeStep[0]) {
      toast.info('Bạn đã hoàn thành bước 1')
    }
  }
  const handleActiveStep2 = () => {
    // CASE 1: Chưa hoàn thành bước 2 và chưa hoàn thành bước 1
    if (!activeStep[1] && !activeStep[0]) {
      toast.warn('Vui lòng hoàn thành bước 1')
    }
    // CASE 2: Chưa hoàn thành bước 2 và đã hoàn thành bước 1
    if (!activeStep[1] && activeStep[0]) {
      setActiveStep2(!activeStep2)
    }
    // CASE 3: Đã hoàn thành bước 2 và đã hoàn thành bước 1
    if (activeStep[1] && activeStep[0]) {
      toast.info('Bạn đã hoàn thành bước 2')
    }
  }
  const handleActiveStep3 = () => {
    // CASE 1: Chưa hoàn thành bước <=3
    if (!activeStep[2] && activeStep[1] && activeStep[0]) {
      setActiveStep3(!activeStep3)
    }
    if (!activeStep[2] && (!activeStep[1] || !activeStep[0])) {
      toast.warn('Vui lòng hoàn thành bước 2')
    }
    // CASE 2: Đã hoàn thành bước 3
    if (activeStep[2]) {
      toast.info('Bạn đã hoàn thành bước 3')
    }
  }
  const handleActiveStep4 = () => {
    // CASE 1: Chưa hoàn thành bước 4
    if (!activeStep[3] && activeStep[2]) {
      setActiveStep4(!activeStep4)
    }
    if (!activeStep[3] && !activeStep[2]) {
      toast.warn('Vui lòng hoàn thành bước 3')
    }
    // CASE 2: Đã hoàn thành bước 4
    if (activeStep[3]) {
      toast.info('Bạn đã hoàn thành bước 4')
    }
  }
  const { data: profileData } = useQuery({
    queryKey: ['profile', profile?._id],
    queryFn: () => authApi.getProfile(),
    enabled: !!profile?._id
  })
  const { data: shopsData } = useQuery({
    queryKey: ['shopsData'],
    queryFn: () => SHOP_API.getByPartnerId()
  })
  const { data: cardsData } = useQuery({
    queryKey: ['get-cards'],
    queryFn: () => authApi.getAllCard()
  })
  const navigate = useNavigate()
  useEffect(() => {
    if (profileData) {
      if (profileData.data.data !== profile) {
        setProfile(profileData.data.data)
      }
      setActiveStep((prevSteps) => {
        const updatedSteps = [...prevSteps]
        if (profileData.data.data.is_active === PARTNER_STATUS.ACTIVE && !prevSteps[0]) {
          updatedSteps[0] = true
        }
        if (shopsData && shopsData.data.data && !prevSteps[1]) {
          updatedSteps[1] = true
        }
        // Check if shopsData has data and its length is greater than 0
        if (cardsData && cardsData.data.data.length > 0 && !prevSteps[2]) {
          updatedSteps[2] = true
        }
        const restaurant = shopsData?.data.data
        if (restaurant && restaurant.is_active === RESTAURANT_STATUS.ACTIVE && !prevSteps[3]) {
          updatedSteps[3] = true
        }
        return updatedSteps
      })
    }
  }, [profile, profileData, setProfile, setActiveStep, shopsData, cardsData, navigate])

  return (
    <div>
      <Helmet>
        <title>Thiết lập thông tin shop | TTFood-Partner</title>
        <meta name='description' content='Restaurant partner info'></meta>
      </Helmet>
      <div className='w-full py-3 pl-7 pr-5'>
        <div className='px-5 pt-4 pb-7 bg-white  w-full max-h-full rounded-xl border border-[#E7E7E7] flex flex-col gap-y-[25px]'>
          <div className='flex flex-row gap-4'>
            <img
              src='/images/restaurant_info.svg'
              className='w-[120px] h-[120px] self-center object-cover col-span-3'
              alt=''
            />
            <div className='flex flex-col gap-4 w-full'>
              <h2 className='text-2xl font-bold'>Xin chào {profile?.name} 👋</h2>
              <p>
                Chìa khóa quan trọng tạo nên sự đặc biệt của TTFood là không gian ẩm thực độc đáo và menu đa dạng, cam
                kết mang lại trải nghiệm tốt nhất cho bạn và những người thân yêu của bạn.
              </p>
              <p>
                Bắt đầu thiết lập nhà hàng của bạn với{'  '}
                <span className='text-apps-black font-bold'>
                  TTFo<span className='text-apps-pink'>o</span>d.
                </span>
              </p>
            </div>
          </div>
          <div className='flex flex-col border-[1px] border-solid border-[#eaeaea] bg-[#eaecee] shadow-md rounded-lg'>
            <div className='py-4 px-5'>
              <div className='flex justify-between items-center'>
                <h2 className='font-neutral text-xl'>Thiết lập thông tin Shop</h2>
                <p className='font-light-grey text-lg'>
                  {activeStep.filter((step) => step).length} / {activeStep.length} bước
                </p>
              </div>
            </div>
            <div className='w-full bg-[#AFD6FF] rounded-full dark:bg-gray-700'>
              <div
                className='bg-blue-600 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full transition-all ease-in-out duration-500'
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
            <div className='py-5 px-5 bg-white flex flex-col'>
              {/**
               * STEP 1: Create restaurant owner info
               * STEP 2: Create restaurant info
               * STEP 3: Create payment info
               * STEP 4: Confirm terms and conditions
               */}
              <div className='flex flex-col'>
                {/*
                 * STEP 1: Create restaurant owner info
                 */}
                <div
                  onClick={handleActiveStep1}
                  className={classNames('flex py-4 justify-between items-center', {
                    'cursor-pointer': !activeStep[0],
                    'cursor-default': activeStep[0]
                  })}
                >
                  <div className='flex flex-col gap-y-2'>
                    <div
                      className={classNames(' flex items-center gap-3 font-bold text-lg', {
                        'text-green-500': activeStep[0]
                      })}
                    >
                      <h3>Bước 1: Tạo thông tin chủ shop</h3>
                      {activeStep[0] ? <CheckCheck /> : null}
                    </div>
                    <p className='text-sm text-neutral'>
                      Cung cấp thông tin chủ sở hữu để chúng tôi có thể xác minh và liên lạc khi cần thiết
                    </p>
                  </div>
                  {activeStep1 && !activeStep[0] ? <ChevronUp /> : <ChevronRight />}
                </div>
                <div
                  className={`${
                    activeStep1 && !activeStep[0]
                      ? 'block border border-gray-100 p-4 rounded-[10px] bg-gray-50 shadow-xl'
                      : 'hidden'
                  }`}
                >
                  <PartnerInfoForm setActiveStep1={setActiveStep1}></PartnerInfoForm>
                </div>
                {/*
                 * STEP 2: Create restaurant  info
                 */}
                <div
                  onClick={handleActiveStep2}
                  className={classNames('flex py-4 justify-between items-center', {
                    'cursor-pointer': !activeStep[1] && activeStep[0],
                    'cursor-default': activeStep[1] || !activeStep[0]
                  })}
                >
                  <div className='flex flex-col gap-y-2'>
                    <div
                      className={classNames(' flex items-center gap-3 font-bold text-lg', {
                        'text-green-500': activeStep[1]
                      })}
                    >
                      <h3>Bước 2: Tạo thông tin shop</h3>
                      {activeStep[1] ? <CheckCheck /> : null}
                    </div>
                    <p className='text-sm text-neutral'>
                      Điền thông tin nhà hàng để chúng tôi có thể xác minh và liên lạc khi cần thiết
                    </p>
                  </div>
                  {activeStep2 ? <ChevronUp /> : <ChevronRight />}
                </div>
                <div
                  className={`${
                    activeStep2 && !activeStep[1]
                      ? 'block border border-gray-100 p-4 rounded-[10px] bg-gray-50 shadow-xl'
                      : 'hidden'
                  }`}
                >
                  <RestaurantFormInfo setActiveStep2={setActiveStep2} />
                </div>
                {/*
                 * STEP 3: Create payment info
                 */}
                <div
                  onClick={handleActiveStep3}
                  className={classNames('flex py-4 justify-between items-center', {
                    'cursor-pointer': !activeStep[2] && activeStep[1],
                    'cursor-default': activeStep[2] || !activeStep[1]
                  })}
                >
                  <div className='flex flex-col gap-y-2'>
                    <div
                      className={classNames(' flex items-center gap-3 font-bold text-lg', {
                        'text-green-500': activeStep[2]
                      })}
                    >
                      <h3>Bước 3: Tạo thông tin thanh toán</h3>
                      {activeStep[2] ? <CheckCheck /> : null}
                    </div>
                    <p className='text-sm text-neutral'>
                      Cung cấp thông tin thanh toán để chúng tôi có thể xác minh và liên lạc khi cần thiết
                    </p>
                  </div>
                  {activeStep3 ? <ChevronUp /> : <ChevronRight />}
                </div>
                <div
                  className={`${
                    activeStep3 && !activeStep[2]
                      ? 'block border border-gray-100 p-4 rounded-[10px] bg-gray-50 shadow-xl'
                      : 'hidden'
                  }`}
                >
                  <PaymentForm setActiveStep3={setActiveStep3} />
                </div>
                {/*
                 * STEP 4: Confirm terms and conditions
                 */}
                <div
                  onClick={handleActiveStep4}
                  className={classNames('flex py-4 justify-between items-center', {
                    'cursor-pointer': !activeStep[3] && activeStep[2],
                    'cursor-default': activeStep[3] || !activeStep[2]
                  })}
                >
                  <div className='flex flex-col gap-y-2'>
                    <div
                      className={classNames(' flex items-center gap-3 font-bold text-lg', {
                        'text-green-500': activeStep[3]
                      })}
                    >
                      <h3>Bước 4: Xác nhận điều khoản</h3>
                      {activeStep[3] ? <CheckCheck /> : null}
                    </div>
                    <p className='text-sm text-neutral'>
                      Xác nhận các điều khoản để chúng tôi có thể xác minh và liên lạc khi cần thiết
                    </p>
                  </div>
                  {activeStep4 ? <ChevronUp /> : <ChevronRight />}
                </div>
                <div
                  className={`${
                    activeStep4 && !activeStep[3] ? 'block border border-gray-100 p-4 rounded-[10px] ' : 'hidden'
                  }`}
                >
                  <TermAndCondition setActiveStep4={setActiveStep4} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default SetupCard
