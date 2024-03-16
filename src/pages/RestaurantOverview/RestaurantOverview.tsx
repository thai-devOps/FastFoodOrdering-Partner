import { FC, useContext, useEffect, useMemo, useState } from 'react'
import { Cake, Clock, Home, MailCheck, MapPinned, Phone, Soup, Store, UserCheck, Utensils } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import authApi from '~/apis/authApi'
import { AppContext } from '~/contexts/app.context'
import { formatDate, isAxiosUnprocessableEntityError } from '~/utils/utils'
import { DistrictType, ProvinceType, WardType } from '~/types/address.type'
import MasterCardLayout from '~/components/MasterCardLayout'
import { UilEdit, UilTimes, UilPlus, UilTrash } from '@iconscout/react-unicons'
import { Controller, FormProvider, useController, useForm } from 'react-hook-form'
import CommonInput from '~/components/CommonInput'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  CardFormType,
  FormPartnerType,
  New_Form_Partner,
  cardSchema,
  partnerFormSchema,
  shopSchema
} from '~/utils/rules'
import { Card } from '~/types/card.type'
import { toast } from 'react-toastify'
import { RestaurantStyle } from '~/enums'
import InputFile from '~/components/InputFile'
import { ErrorResponse } from '~/types/utils.type'
import Loading from '~/components/Loading'
import { SHOP_API } from '~/apis/shops.api'
import { shopSchema, ShopFormType, ShopRequestType } from '~/schemas/shop.schema'
const RestaurantOverview: FC = () => {
  const { shop, setShop, profile, setProfile } = useContext(AppContext)
  const [showFormAddCard, setShowFormAddCard] = useState<boolean>(false)
  const [selectedCardDefault, setSelectedCardDefault] = useState<string>('')
  const [showFormEditRestaurant, setShowFormEditRestaurant] = useState<boolean>(false)
  const [showFormEditPartner, setShowFormEditPartner] = useState<boolean>(false)
  const [cards, setCards] = useState<Card[]>([])
  const [fileAvatar, setFileAvatar] = useState<File>()
  const { data: shopsData } = useQuery({
    queryKey: ['shopsData'],
    queryFn: () => SHOP_API.getByPartnerId()
  })
  const { data: profileData } = useQuery({
    queryKey: ['profileData'],
    queryFn: () => authApi.getProfile()
  })
  const { data: cardData } = useQuery({
    queryKey: ['cardData'],
    queryFn: () => authApi.getAllCard()
  })
  const [file, setFile] = useState<File>()
  const methodsShop = useForm<ShopFormType>({
    resolver: yupResolver(shopSchema)
  })
  const {
    handleSubmit: handleSubmitRestaurant,
    register: registerRestaurant,
    watch: watchRestaurant,
    setError: setErrorRestaurant,
    control: controlRestaurant,
    formState: { errors: errorsRestaurant }
  } = methodsShop
  const { field, fieldState } = useController({
    name: 'restaurant_style',
    control: controlRestaurant,
    defaultValue: ''
  })
  // update restaurant mutation
  const updateShopMutation = useMutation({
    mutationFn: (data: ShopFormType) => SHOP_API.updateById(data)
  })
  const handleChangeFilePartner = (file?: File) => {
    setFileAvatar(file)
  }
  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])
  const previewImageAvatarPartner = useMemo(() => {
    return fileAvatar ? URL.createObjectURL(fileAvatar) : ''
  }, [fileAvatar])

  const methodsPartner = useForm<FormPartnerType>({
    resolver: yupResolver(partnerFormSchema)
  })
  const {
    handleSubmit: handleSubmitFormPartner,
    register: registerPartner,
    watch: watchPartner,
    setError: setErrorPartner,
    control: controlPartner,
    formState: { errors: errorsPartner }
  } = methodsPartner
  const selectedProvincePartner = watchPartner('province')
  const selectedProvinceRestaurant = watchRestaurant('province')
  const selectedDistrictPartner = watchPartner('district')
  const selectedDistrictRestaurant = watchRestaurant('district')
  const { field: fieldPartner, fieldState: fieldStatePartner } = useController({
    name: 'gender',
    control: controlPartner,
    defaultValue: ''
  })
  useEffect(() => {
    if (shopsData) {
      setShop(shopsData.data.data)
      methodsShop.reset({
        _id: shopsData.data.data._id,

      })
    }
    if (profileData) {
      setProfile(profileData.data.data)
      methodsPartner.reset({
        _id: profileData.data.data._id,
        name: profileData.data.data.name,
        phone: profileData.data.data.phone,
        date_of_birth: profileData.data.data.date_of_birth,
        email: profileData.data.data.email,
        gender: profileData.data.data.gender,
        identity_number: profileData.data.data.identity_number || '',
        province: profileData.data.data.address?.province || '',
        district: profileData.data.data.address?.district || '',
        ward: profileData.data.data.address?.ward || '',
        houseNumber_street: profileData.data.data.address?.houseNumber_street || ''
      })
    }
    if (cardData) {
      setCards(cardData.data.data)
      // find default card
      const defaultCard = cardData.data.data.find((card: Card) => card.is_active === true)
      if (defaultCard) {
        setSelectedCardDefault(defaultCard._id)
        const card = cards.find((card) => card._id === defaultCard._id)
        if (card) {
          methods.reset({
            card_number: card.card_number,
            expiration_date: card.expiration_date,
            card_holder_name: card.card_holder_name,
            security_code: card.security_code,
            is_active: card.is_active
          })
        }
      }
    }
  }, [cardData, cards, profileData, shopsData, setProfile, setRestaurant])
  const { data: provinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const response = await fetch('https://vapi.vnappmob.com/api/province/')
      const data = (await response.json()) as {
        results: ProvinceType[]
      }
      return data.results
    }
  })
  const { data: districtsRestaurant } = useQuery({
    queryKey: ['districtsRestaurant', selectedProvinceRestaurant],
    queryFn: async () => {
      if (selectedProvinceRestaurant) {
        const response = await fetch(`https://vapi.vnappmob.com/api/province/district/${selectedProvinceRestaurant}`)
        const data = (await response.json()) as {
          results: DistrictType[]
        }
        return data.results
      }
      return []
    },
    enabled: !!selectedProvinceRestaurant
  })
  const { data: districtsPartner } = useQuery({
    queryKey: ['districtsPartner', selectedProvincePartner],
    queryFn: async () => {
      if (selectedProvincePartner) {
        const response = await fetch(`https://vapi.vnappmob.com/api/province/district/${selectedProvincePartner}`)
        const data = (await response.json()) as {
          results: DistrictType[]
        }
        return data.results
      }
      return []
    },
    enabled: !!selectedProvincePartner
  })
  const { data: wardsRestaurant } = useQuery({
    queryKey: ['wardsRestaurant', selectedDistrictRestaurant],
    queryFn: async () => {
      if (selectedDistrictRestaurant) {
        const response = await fetch(`https://vapi.vnappmob.com/api/province/ward/${selectedDistrictRestaurant}`)
        const data = (await response.json()) as {
          results: WardType[]
        }
        return data.results
      }
      return []
    },
    enabled: !!selectedDistrictRestaurant
  })
  const { data: wardsPartner } = useQuery({
    queryKey: ['wardsPartner', selectedDistrictPartner],
    queryFn: async () => {
      if (selectedDistrictPartner) {
        const response = await fetch(`https://vapi.vnappmob.com/api/province/ward/${selectedDistrictPartner}`)
        const data = (await response.json()) as {
          results: WardType[]
        }
        return data.results
      }
      return []
    },
    enabled: !!selectedDistrictPartner
  })
  const methods = useForm<CardFormType>({
    resolver: yupResolver(cardSchema),
    defaultValues: {
      _id: '',
      card_number: '',
      expiration_date: '',
      card_holder_name: '',
      security_code: '',
      is_active: false
    }
  })
  const createCardMutation = useMutation({
    mutationFn: (data: CardFormType) => authApi.createCard(data)
  })
  const handleEditCard = () => {
    if (!selectedCardDefault) {
      toast.info('Vui lòng chọn thẻ mặc định')
      return
    } else {
      setShowFormAddCard(true)
      const card = cards.find((card) => card._id === selectedCardDefault)
      if (card) {
        methods.reset({
          _id: card._id,
          card_number: card.card_number,
          expiration_date: card.expiration_date,
          card_holder_name: card.card_holder_name,
          security_code: card.security_code,
          is_active: card.is_active
        })
      }
    }
  }
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
  const updateCardStatusDefaultMutation = useMutation({
    mutationFn: (body: { id: string; active: boolean }) => authApi.updateCardStatusDefault(body)
  })
  const updateCardMutation = useMutation({
    mutationFn: (data: CardFormType) => authApi.updateCard(data)
  })
  const handleChangeSelectedDefaultCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCardStatusDefaultMutation.mutate(
      { id: e.target.value, active: true },
      {
        onSuccess: async () => {
          setSelectedCardDefault(e.target.value)
          await queryClient.invalidateQueries({ queryKey: ['cardData'] })
        }
      }
    )
    setSelectedCardDefault(e.target.value)
  }
  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors }
  } = methods
  const deleteCardMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteCardById(id)
  })
  const queryClient = useQueryClient()
  const handleDeleteCard = (id: string) => {
    setShowFormAddCard(false)
    if (!id) {
      toast.info('Vui lòng chọn thẻ cần xóa')
      return
    }
    if (cards.length <= 1) {
      toast.info('Không thể xóa thẻ mặc định')
      return
    } else {
      deleteCardMutation.mutate(id, {
        onSuccess: async () => {
          setSelectedCardDefault('')
          methods.reset()
          await queryClient.invalidateQueries({ queryKey: ['cardData'] })
        }
      })
    }
  }
  const handleSubmitFormCard = handleSubmit((data) => {
    if (data._id) {
      updateCardMutation.mutate(data, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ['cardData'] })
          setShowFormAddCard(false)
          methods.reset()
          toast.success('Cập nhật thẻ thành công')
        }
      })
    } else {
      createCardMutation.mutate(data, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ['cardData'] })
          setShowFormAddCard(false)
          methods.reset()
          toast.success('Thêm thẻ thành công')
        }
      })
    }
  })

  const onSubmitRestaurant = handleSubmitRestaurant(async (data) => {
    const new_data: New_Form_Restaurant = {
      _id: restaurant?._id || '',
      restaurant_name: data.restaurant_name,
      description: data.description,
      restaurant_style: data.restaurant_style,
      restaurant_cuisine: data.restaurant_cuisine,
      open_time: data.open_time,
      close_time: data.close_time,
      hotline: data.hotline,
      restaurant_address: {
        province: data.province,
        district: data.district,
        ward: data.ward,
        houseNumber_street: data.houseNumber_street
      },
      r_background: {
        url: restaurant?.r_background.url || '',
        public_id: restaurant?.r_background.public_id || ''
      }
    }
    if (!file) {
      try {
        updateRestaurantMutation.mutate(new_data, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['shopsData'] })
            setShowFormEditRestaurant(false)
            toast.success('Cập nhật nhà hàng thành công')
          }
        })
      } catch (error) {
        if (isAxiosUnprocessableEntityError<ErrorResponse<ShopFormType>>(error)) {
          const formError = error.response?.data.errors
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setErrorRestaurant(key as keyof ShopFormType, {
                message: formError[key as keyof ShopFormType],
                type: 'Server'
              })
            })
          }
        } else {
          toast.error('Cập nhật nhà hàng thất bại')
        }
      }
    } else {
      try {
        let img: {
          url: string
          public_id: string
        } = {
          url: '',
          public_id: ''
        }
        const form = new FormData()
        form.append('avatar', file)
        form.append('publicId', shop?.shop_image?.public_id || '')
        const uploadRes = await updateAvatarMutation.mutateAsync(form)
        img = uploadRes.data.data
        await updateRestaurantMutation.mutateAsync({ ...new_data, r_background: img })
        await queryClient.invalidateQueries({ queryKey: ['shopsData'] })
        setShowFormEditRestaurant(false)
        toast.success('Cập nhật nhà hàng thành công')
      } catch (error) {
        if (isAxiosUnprocessableEntityError<ErrorResponse<ShopFormType>>(error)) {
          const formError = error.response?.data.errors
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setErrorRestaurant(key as keyof ShopFormType, {
                message: formError[key as keyof ShopFormType],
                type: 'Server'
              })
            })
          }
        }
      }
    }
  })
  const updateAvatarMutation = useMutation({
    mutationFn: (form: FormData) => authApi.updateAvatar(form)
  })
  const handleChangeFile = (file?: File) => {
    setFile(file)
  }

  const updatePartnerMutation = useMutation({
    mutationFn: async (data: New_Form_Partner) => authApi.updateProfile(data)
  })
  const onSubmitPartnerForm = handleSubmitFormPartner(async (data) => {
    const new_data: New_Form_Partner = {
      _id: profile?._id || '',
      name: data.name,
      gender: data.gender,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      email: data.email,
      address: {
        province: data.province,
        district: data.district,
        ward: data.ward,
        houseNumber_street: data.houseNumber_street
      },
      identity_card: data.identity_card,
      avatar: {
        url: (profile?.avatar?.url as string) || '',
        public_id: (profile?.avatar?.public_id as string) || ''
      }
    }
    if (!fileAvatar) {
      try {
        updatePartnerMutation.mutate(new_data, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['profileData'] })
            setShowFormEditPartner(false)
            toast.success('Cập nhật chủ nhà hàng thành công')
          }
        })
      } catch (error) {
        if (isAxiosUnprocessableEntityError<ErrorResponse<FormPartnerType>>(error)) {
          const formError = error.response?.data.errors
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setErrorPartner(key as keyof FormPartnerType, {
                message: formError[key as keyof FormPartnerType],
                type: 'Server'
              })
            })
          }
        } else {
          toast.error('Cập nhật chủ nhà hàng thất bại')
        }
      }
    } else {
      try {
        let img: {
          url: string
          public_id: string
        } = {
          url: '',
          public_id: ''
        }
        const form = new FormData()
        form.append('avatar', fileAvatar)
        form.append('publicId', profile?.avatar?.public_id || '')
        const uploadRes = await updateAvatarMutation.mutateAsync(form)
        img = uploadRes.data.data
        await updatePartnerMutation.mutateAsync({ ...new_data, avatar: img })
        await queryClient.invalidateQueries({ queryKey: ['profileData'] })
        setShowFormEditPartner(false)
        toast.success('Cập nhật chủ nhà hàng thành công')
      } catch (error) {
        if (isAxiosUnprocessableEntityError<ErrorResponse<FormPartnerType>>(error)) {
          const formError = error.response?.data.errors
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setErrorPartner(key as keyof FormPartnerType, {
                message: formError[key as keyof FormPartnerType],
                type: 'Server'
              })
            })
          }
        }
      }
    }
  })
  return (
    <div>
      <Helmet>
        <title>{restaurant?.restaurant_name || 'Nhà hàng'} | TTFood-Partner</title>
        <meta name='description' content='Nhà hàng Thủy Ngân | TTFood-Partner'></meta>
      </Helmet>
      <div className='container mx-auto py-3 pl-7 pr-5'>
        <div className='flex flex-col px-5 pt-4 pb-7 bg-white justify-between rounded-md'>
          <main className='mb-auto'>
            <div className='divide-y divide-gray-200 dark:divide-gray-700'>
              <div className='space-y-2 pb-8 pt-6 md:space-y-5'>
                <div className='lg:max-w-[1440px] relative inset-0 md:max-w-[744px] max-w-[375px] mx-auto bg-white'>
                  <div className='relative'>
                    <div className='w-full h-full bg-black opacity-50 absolute top-0 left-0' />
                    <img src={restaurant?.r_background.url} className='w-full h-[400px] object-cover' />
                    <div className='absolute lg:bottom-8 md:bottom-3 bottom-0 lg:px-7 md:px-10 px-4 py-4'>
                      <p className='lg:text-4xl md:text-2xl text-2xl font-semibold leading-9 text-white'>
                        {restaurant?.restaurant_name}
                      </p>
                      <p className='text-base font-medium leading-none text-white px-2 py-2 mt-3 text-start'>
                        {restaurant?.description}
                      </p>
                      <div className='flex gap-3 pt-4'>
                        <svg
                          className='text-white hover:text-gray-300 cursor-pointer'
                          width={20}
                          height={20}
                          viewBox='0 0 20 20'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            fillRule='evenodd'
                            clipRule='evenodd'
                            d='M18.75 10.0532C18.75 5.22119 14.832 1.30322 10 1.30322C5.16797 1.30322 1.25 5.22119 1.25 10.0532C1.25 14.4204 4.44922 18.0403 8.63281 18.6974V12.5833H6.41055V10.0532H8.63281V8.12549C8.63281 5.93291 9.93945 4.7208 11.9379 4.7208C12.8953 4.7208 13.8969 4.89189 13.8969 4.89189V7.04541H12.793C11.7066 7.04541 11.3668 7.71963 11.3668 8.4126V10.0532H13.7934L13.4059 12.5833H11.3672V18.6981C15.5508 18.0415 18.75 14.4216 18.75 10.0532Z'
                            fill='currentColor'
                          />
                        </svg>
                        <svg
                          className='text-white hover:text-gray-300 cursor-pointer'
                          width={20}
                          height={20}
                          viewBox='0 0 20 20'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M19.375 4.27735C18.6717 4.58296 17.9275 4.7843 17.166 4.87501C17.9663 4.4064 18.5681 3.66195 18.8586 2.78126C18.102 3.22368 17.2756 3.5341 16.4148 3.69923C16.0524 3.31935 15.6165 3.01716 15.1336 2.811C14.6507 2.60484 14.1309 2.49904 13.6059 2.50001C11.4801 2.50001 9.75977 4.19532 9.75977 6.28516C9.75826 6.57585 9.79157 6.86568 9.85898 7.14844C8.33464 7.07698 6.842 6.68813 5.47656 6.00675C4.11111 5.32537 2.90292 4.36648 1.9293 3.19141C1.58772 3.76724 1.40708 4.42424 1.40625 5.09376C1.40625 6.40626 2.09102 7.56641 3.125 8.2461C2.51239 8.23156 1.91234 8.06942 1.37578 7.77344V7.82032C1.37578 9.65626 2.70391 11.1836 4.46172 11.5313C4.13117 11.6194 3.79053 11.664 3.44844 11.6641C3.20569 11.6645 2.9635 11.6409 2.72539 11.5938C3.21406 13.0977 4.63633 14.1914 6.32109 14.2227C4.9521 15.2777 3.27134 15.848 1.54297 15.8438C1.23618 15.8433 0.929674 15.825 0.625 15.7891C2.38327 16.9118 4.42713 17.5057 6.51328 17.5C13.5977 17.5 17.468 11.7305 17.468 6.72657C17.468 6.56251 17.4637 6.39844 17.4559 6.23829C18.2071 5.70394 18.857 5.03989 19.375 4.27735Z'
                            fill='currentColor'
                          />
                        </svg>
                        <svg
                          className='text-white hover:text-gray-300 cursor-pointer'
                          width={20}
                          height={20}
                          viewBox='0 0 20 20'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M17.3504 1.25H2.74531C1.94727 1.25 1.25 1.82422 1.25 2.61289V17.2504C1.25 18.0434 1.94727 18.75 2.74531 18.75H17.3461C18.1484 18.75 18.75 18.0387 18.75 17.2504V2.61289C18.7547 1.82422 18.1484 1.25 17.3504 1.25ZM6.67461 15.8371H4.16758V8.04219H6.67461V15.8371ZM5.50781 6.85703H5.48984C4.6875 6.85703 4.16797 6.25977 4.16797 5.51211C4.16797 4.75078 4.70117 4.16758 5.52148 4.16758C6.3418 4.16758 6.84375 4.74648 6.86172 5.51211C6.86133 6.25977 6.3418 6.85703 5.50781 6.85703ZM15.8371 15.8371H13.3301V11.575C13.3301 10.5539 12.9652 9.85625 12.0582 9.85625C11.3652 9.85625 10.9551 10.325 10.7727 10.7816C10.7043 10.9457 10.6859 11.1691 10.6859 11.3973V15.8371H8.17891V8.04219H10.6859V9.12695C11.0508 8.60742 11.6207 7.85977 12.9469 7.85977C14.5926 7.85977 15.8375 8.94453 15.8375 11.2832L15.8371 15.8371Z'
                            fill='currentColor'
                          />
                        </svg>
                        <svg
                          className='text-white hover:text-gray-300 cursor-pointer'
                          width={20}
                          height={20}
                          viewBox='0 0 20 20'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M13.6457 2.7082C14.6118 2.71109 15.5375 3.09616 16.2207 3.77931C16.9038 4.46246 17.2889 5.38818 17.2918 6.3543V13.6457C17.2889 14.6118 16.9038 15.5375 16.2207 16.2207C15.5375 16.9038 14.6118 17.2889 13.6457 17.2918H6.3543C5.38818 17.2889 4.46246 16.9038 3.77931 16.2207C3.09616 15.5375 2.71109 14.6118 2.7082 13.6457V6.3543C2.71109 5.38818 3.09616 4.46246 3.77931 3.77931C4.46246 3.09616 5.38818 2.71109 6.3543 2.7082H13.6457ZM13.6457 1.25H6.3543C3.54687 1.25 1.25 3.54687 1.25 6.3543V13.6457C1.25 16.4531 3.54687 18.75 6.3543 18.75H13.6457C16.4531 18.75 18.75 16.4531 18.75 13.6457V6.3543C18.75 3.54687 16.4531 1.25 13.6457 1.25Z'
                            fill='white'
                          />
                          <path
                            d='M14.7395 6.35449C14.5231 6.35449 14.3117 6.29034 14.1318 6.17016C13.9519 6.04998 13.8117 5.87916 13.729 5.6793C13.6462 5.47944 13.6245 5.25953 13.6667 5.04736C13.7089 4.8352 13.8131 4.64031 13.9661 4.48734C14.119 4.33438 14.3139 4.23021 14.5261 4.18801C14.7382 4.14581 14.9582 4.16747 15.158 4.25025C15.3579 4.33303 15.5287 4.47322 15.6489 4.65309C15.7691 4.83295 15.8332 5.04442 15.8332 5.26074C15.8335 5.40446 15.8054 5.54683 15.7506 5.67967C15.6957 5.8125 15.6152 5.9332 15.5135 6.03483C15.4119 6.13645 15.2912 6.21701 15.1584 6.27186C15.0255 6.32672 14.8832 6.3548 14.7395 6.35449Z'
                            fill='white'
                          />
                          <path
                            d='M10 7.0832C10.5769 7.0832 11.1408 7.25427 11.6205 7.57477C12.1002 7.89527 12.474 8.35082 12.6948 8.88379C12.9155 9.41677 12.9733 10.0032 12.8608 10.569C12.7482 11.1348 12.4704 11.6546 12.0625 12.0625C11.6546 12.4704 11.1348 12.7482 10.569 12.8608C10.0032 12.9733 9.41677 12.9155 8.8838 12.6948C8.35082 12.474 7.89528 12.1002 7.57478 11.6205C7.25428 11.1408 7.08321 10.5769 7.08321 10C7.08404 9.22667 7.39161 8.48525 7.93843 7.93843C8.48526 7.3916 9.22668 7.08403 10 7.0832ZM10 5.625C9.13471 5.625 8.28885 5.88159 7.56939 6.36232C6.84992 6.84305 6.28917 7.52633 5.95804 8.32576C5.6269 9.12519 5.54026 10.0049 5.70907 10.8535C5.87788 11.7022 6.29456 12.4817 6.90642 13.0936C7.51827 13.7054 8.29782 14.1221 9.14648 14.2909C9.99515 14.4597 10.8748 14.3731 11.6742 14.042C12.4737 13.7108 13.1569 13.1501 13.6377 12.4306C14.1184 11.7112 14.375 10.8653 14.375 10C14.375 8.83968 13.9141 7.72688 13.0936 6.90641C12.2731 6.08594 11.1603 5.625 10 5.625Z'
                            fill='currentColor'
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className='flex items-center justify-end py-4 gap-3'>
                <div className='w-5 h-5 bg-green-500 rounded-full'></div>
                <span className='text-green-900'>Đang hoạt động</span>
              </div> */}
              <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
                <li className='py-12'>
                  <div className='flex justify-between items-center mb-10'>
                    <div className='text-xl font-bold '>Thông tin chủ nhà hàng</div>
                    {!showFormEditPartner ? (
                      <button
                        type='button'
                        onClick={() => setShowFormEditPartner(!showFormEditPartner)}
                        className='text-white inline-flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
                      >
                        <span>Chỉnh sửa</span>
                        <UilEdit />
                      </button>
                    ) : (
                      <button
                        type='button'
                        onClick={() => setShowFormEditPartner(!showFormEditPartner)}
                        className='text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 me-2 mb-2'
                      >
                        <span>Hủy</span>
                        <UilTimes />
                      </button>
                    )}
                  </div>
                  <div className='space-y-2 xl:grid xl:grid-cols-4 xl:items-center xl:space-y-0'>
                    <div className='space-y-5 xl:col-span-4'>
                      {showFormEditPartner ? (
                        <div className='animate__animated animate__bounceInUp border shadow-md p-5 '>
                          <FormProvider {...methodsPartner}>
                            <form onSubmit={onSubmitPartnerForm} noValidate>
                              <div className='grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6'>
                                <div className='md:col-span-6'>
                                  <div className='flex justify-center'>
                                    <div className='flex flex-col items-center'>
                                      <div className='my-5 h-24 w-24'>
                                        <img
                                          src={previewImageAvatarPartner || '/images/avatar_default.svg'}
                                          alt=''
                                          className='h-full w-full rounded-full object-cover'
                                        />
                                      </div>
                                      <InputFile onChange={handleChangeFilePartner} />
                                      <div className='mt-3 text-gray-400'>
                                        <div>Dụng lượng file tối đa 1 MB</div>
                                        <div>Định dạng:.JPEG, .PNG</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className='md:col-span-4'>
                                  <CommonInput
                                    name='name'
                                    register={registerPartner}
                                    type='text'
                                    label='Họ tên'
                                    requiredInput={true}
                                    placeholder='Vinh Bá Hùng'
                                    className='mt-3'
                                    errorMessage={errorsPartner.name?.message}
                                  />
                                </div>
                                <div className='md:col-span-2'>
                                  <CommonInput
                                    name='phone'
                                    register={registerPartner}
                                    type='tel'
                                    className='mt-3'
                                    errorMessage={errorsPartner.phone?.message}
                                    placeholder='0397706494'
                                    label='Số điện thoại'
                                    requiredInput={true}
                                  />
                                </div>
                                <div className='md:col-span-2'>
                                  <CommonInput
                                    name='date_of_birth'
                                    register={registerPartner}
                                    type='date'
                                    className='mt-3'
                                    errorMessage={errorsPartner.date_of_birth?.message}
                                    label='Ngày sinh'
                                    requiredInput={true}
                                  />
                                </div>
                                <div className='md:col-span-2 mt-3'>
                                  <div className='block text-sm font-medium text-gray-700 mb-1'>
                                    Giới tính <span className='text-red-500'>*</span>
                                  </div>
                                  <select
                                    {...fieldPartner}
                                    className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                                  >
                                    <option value='' disabled>
                                      Chọn giới tính
                                    </option>
                                    <option value='Nam'>Nam</option>
                                    <option value='Nữ'>Nữ</option>
                                    <option value='Khác'>Khác</option>
                                  </select>
                                  <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                    {fieldStatePartner.error?.message}
                                  </div>
                                </div>
                                <div className='md:col-span-2'>
                                  <CommonInput
                                    name='identity_card'
                                    register={registerPartner}
                                    type='number'
                                    className='mt-3'
                                    errorMessage={errorsPartner.identity_card?.message}
                                    placeholder='036093002023'
                                    label='CCCD / CMND'
                                    requiredInput={true}
                                  />
                                </div>
                                <div className='md:col-span-3'>
                                  <CommonInput
                                    name='email'
                                    register={registerPartner}
                                    disabled={true}
                                    type='email'
                                    className='mt-3'
                                    errorMessage={errorsPartner.email?.message}
                                    label='Địa chỉ email'
                                    requiredInput={true}
                                    placeholder='vbhung1@gmail.com'
                                  />
                                </div>
                                <div className='md:col-span-3'>
                                  <CommonInput
                                    name='houseNumber_street'
                                    register={registerPartner}
                                    type='text'
                                    className='mt-3'
                                    errorMessage={errorsPartner.houseNumber_street?.message}
                                    label='Số nhà / Tên đường'
                                    requiredInput={true}
                                    placeholder='123, Trần Hưng Đạo'
                                  />
                                </div>
                                <div className='md:col-span-2 mt-3'>
                                  <Controller
                                    name='province'
                                    control={controlPartner}
                                    defaultValue=''
                                    render={({ field, fieldState }) => (
                                      <>
                                        <div className='block text-sm font-medium text-gray-700 mb-1'>
                                          Tỉnh / Thành phố <span className='text-red-500'>*</span>
                                        </div>
                                        <select
                                          {...field}
                                          className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                                        >
                                          <option value=''>--Chọn tỉnh/thành phố--</option>
                                          {provinces?.map((province) => (
                                            <option key={province.province_id} value={province.province_id}>
                                              {province.province_name}
                                            </option>
                                          ))}
                                        </select>
                                        <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                          {fieldState.error?.message}
                                        </div>
                                      </>
                                    )}
                                  />
                                </div>
                                <div className='md:col-span-2 mt-3'>
                                  <Controller
                                    name='district'
                                    control={controlPartner}
                                    defaultValue=''
                                    render={({ field, fieldState }) => (
                                      <>
                                        <div className='block text-sm font-medium text-gray-700 mb-1'>
                                          Quận / Huyện <span className='text-red-500'>*</span>
                                        </div>
                                        <select
                                          {...field}
                                          className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                                        >
                                          <option value=''>--Chọn quận/huyện--</option>
                                          {districtsPartner?.map((district) => (
                                            <option key={district.district_id} value={district.district_id}>
                                              {district.district_name}
                                            </option>
                                          ))}
                                        </select>
                                        <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                          {fieldState.error?.message}
                                        </div>
                                      </>
                                    )}
                                  />
                                </div>
                                <div className='md:col-span-2 mt-3'>
                                  <Controller
                                    name='ward'
                                    control={controlPartner}
                                    defaultValue=''
                                    render={({ field, fieldState }) => (
                                      <>
                                        <div className='block text-sm font-medium text-gray-700 mb-1'>
                                          Xã / Phường / Thị trấn <span className='text-red-500'>*</span>
                                        </div>
                                        <select
                                          {...field}
                                          className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                                        >
                                          <option value=''>--Chọn xã/phường/thị trấn--</option>
                                          {wardsPartner?.map((ward) => (
                                            <option key={ward.ward_id} value={ward.ward_id}>
                                              {ward.ward_name}
                                            </option>
                                          ))}
                                        </select>
                                        <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                          {fieldState.error?.message}
                                        </div>
                                      </>
                                    )}
                                  />
                                </div>
                                <div className='md:col-span-6 text-center'>
                                  <div className='inline-flex items-end'>
                                    <button
                                      type='submit'
                                      className='text-white inline-flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
                                    >
                                      <span>Cập nhật</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </FormProvider>
                        </div>
                      ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-center'>
                          <div className=' flex flex-col items-center gap-5 xl:col-span-1'>
                            <img
                              className='w-56 h-56 object-cover rounded-full'
                              src={profile?.avatar?.url}
                              alt='partner_image'
                            />
                          </div>
                          <div className='xl:col-span-1'>
                            <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                              <UserCheck />
                              <span className='font-normal'>{profile?.name}</span>
                            </div>
                            <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                              <Phone />
                              <span className='font-normal'>{profile?.phone}</span>
                            </div>
                            <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                              <Cake />
                              <span className='font-normal'>{formatDate(profile?.date_of_birth || '')}</span>
                            </div>
                            <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                              <img
                                src='https://cdn-icons-png.flaticon.com/512/684/684833.png'
                                alt='identity_id'
                                className='w-[24px] h-[24px] object-cover'
                              />
                              <span className='font-normal'>{profile?.identity_card}</span>
                            </div>
                          </div>
                          <div className='xl:col-span-2 self-center justify-center'>
                            <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                              <svg
                                className='w-[24px] h-[24px]'
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 320 512'
                                strokeWidth={2}
                              >
                                {/*!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.*/}
                                <path d='M160 0a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm8 352V128h6.9c33.7 0 64.9 17.7 82.3 46.6l58.3 97c9.1 15.1 4.2 34.8-10.9 43.9s-34.8 4.2-43.9-10.9L232 256.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V352h0zM58.2 182.3c19.9-33.1 55.3-53.5 93.8-54.3V384h0v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V384H70.2c-10.9 0-18.6-10.7-15.2-21.1L93.3 248.1 59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l53.6-89.2z' />
                              </svg>

                              <span className='font-normal'>{profile?.gender}</span>
                            </div>
                            <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                              <MailCheck />
                              <span className='font-normal'>{profile?.email}</span>
                            </div>
                            <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                              <Home />
                              <span className='font-normal'>{profile?.address?.houseNumber_street}</span>
                            </div>
                            <div className='flex gap-3 md:gap-6 mb-5'>
                              <MapPinned />
                              <span className='font-normal flex flex-wrap'>
                                {wardsPartner?.find((ward) => ward.ward_id === profile?.address?.ward)?.ward_name}
                                {', '}
                                {
                                  districtsPartner?.find(
                                    (district) => district.district_id === profile?.address?.district
                                  )?.district_name
                                }
                                {', '}
                                {
                                  provinces?.find((province) => province.province_id === profile?.address?.province)
                                    ?.province_name
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
                <li className='py-12'>
                  <article>
                    <div className='flex justify-between items-center mb-5'>
                      <div className='text-xl font-bold '>Thông tin nhà hàng</div>
                      <div className='text-xl font-bold flex flex-wrap gap-y-2 items-center '>
                        {showFormEditRestaurant ? (
                          <button
                            type='button'
                            onClick={() => setShowFormEditRestaurant(false)}
                            className='text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 me-2 mb-2'
                          >
                            <span>HỦY</span>
                            <UilTimes />
                          </button>
                        ) : (
                          <button
                            type='button'
                            onClick={() => setShowFormEditRestaurant(!showFormEditRestaurant)}
                            className='text-white inline-flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
                          >
                            <span>Chỉnh sửa</span>
                            <UilEdit />
                          </button>
                        )}
                      </div>
                    </div>
                    {showFormEditRestaurant ? (
                      <div className='animate__animated animate__bounceInUp border shadow-md p-5 '>
                        <FormProvider {...methodsShop}>
                          <form onSubmit={onSubmitRestaurant} noValidate>
                            <div className='grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6'>
                              <div className='md:col-span-6'>
                                <div className='flex flex-col items-center'>
                                  <div className='text-gray-600 italic mb-3'>Chọn ảnh nền nhà hàng / quán ăn</div>
                                  <InputFile
                                    classNamesButton='py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex gap-2 items-center'
                                    onChange={handleChangeFile}
                                  />
                                  <div className='mt-3'>
                                    <img
                                      src={previewImage || '/images/restaurant_default.svg'}
                                      alt='preview'
                                      className='w-72 h-40 object-cover'
                                    />
                                  </div>
                                  <div className='mt-3 text-gray-400'>
                                    <div>Dụng lượng file tối đa 1 MB</div>
                                    <div>Định dạng:.JPEG, .PNG</div>
                                  </div>
                                </div>
                              </div>
                              <div className='md:col-span-4'>
                                <CommonInput
                                  name='restaurant_name'
                                  classNameLable='mb-3'
                                  classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
                                  register={registerRestaurant}
                                  type='text'
                                  label='Tên nhà hàng / quán ăn'
                                  requiredInput={true}
                                  placeholder='Quán ăn Thủy Ngân'
                                  className='mt-3'
                                  errorMessage={errorsRestaurant.restaurant_name?.message}
                                />
                              </div>
                              <div className='md:col-span-2'>
                                <CommonInput
                                  name='hotline'
                                  classNameLable='mb-3'
                                  classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
                                  register={registerRestaurant}
                                  type='tel'
                                  className='mt-3'
                                  errorMessage={errorsRestaurant.hotline?.message}
                                  placeholder='0397706494'
                                  label='Hotline'
                                  requiredInput={true}
                                />
                              </div>
                              <div className='md:col-span-2'>
                                <CommonInput
                                  name='description'
                                  classNameLable='mb-3'
                                  classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
                                  register={registerRestaurant}
                                  type='text'
                                  className='mt-3'
                                  errorMessage={errorsRestaurant.description?.message}
                                  label='Mô tả'
                                  requiredInput={true}
                                />
                              </div>
                              <div className='md:col-span-2 mt-3'>
                                <div className='block text-sm font-medium mb-3'>
                                  Lĩnh vực <span className='text-red-500'>*</span>
                                </div>
                                <select
                                  {...field}
                                  className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                                >
                                  <option value='' disabled>
                                    Chọn lĩnh vực
                                  </option>
                                  <option value={RestaurantStyle.Beverage}>{RestaurantStyle.Beverage}</option>
                                  <option value={RestaurantStyle.FastFood}>{RestaurantStyle.FastFood}</option>
                                  <option value={RestaurantStyle.HotPot}>{RestaurantStyle.HotPot}</option>
                                  <option value={RestaurantStyle.MikTea}>{RestaurantStyle.MikTea}</option>
                                  <option value={RestaurantStyle.Restaurant}>{RestaurantStyle.Restaurant}</option>
                                  <option value={RestaurantStyle.SnackShop}>{RestaurantStyle.SnackShop}</option>
                                </select>
                                <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                  {fieldState.error?.message}
                                </div>
                              </div>
                              <div className='md:col-span-2'>
                                <CommonInput
                                  name='restaurant_cuisine'
                                  register={registerRestaurant}
                                  classNameLable='mb-3'
                                  classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
                                  type='text'
                                  placeholder='Trung Hoa, Việt Nam, Thái Lan...'
                                  className='mt-3'
                                  errorMessage={errorsRestaurant.restaurant_cuisine?.message}
                                  label='Ẩm thực'
                                  requiredInput={true}
                                />
                              </div>
                              <div className='md:col-span-1'>
                                <CommonInput
                                  name='open_time'
                                  classNameLable='mb-3'
                                  classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
                                  register={registerRestaurant}
                                  type='time'
                                  className='mt-3'
                                  errorMessage={errorsRestaurant.open_time?.message}
                                  label='Giờ mở cửa'
                                  requiredInput={true}
                                />
                              </div>
                              <div className='md:col-span-1'>
                                <CommonInput
                                  name='close_time'
                                  classNameLable='mb-3'
                                  classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
                                  register={registerRestaurant}
                                  type='time'
                                  className='mt-3'
                                  errorMessage={errorsRestaurant.close_time?.message}
                                  label='Giờ đóng cửa'
                                  requiredInput={true}
                                />
                              </div>
                              <div className='md:col-span-4'>
                                <CommonInput
                                  name='houseNumber_street'
                                  register={registerRestaurant}
                                  classNameLable='mb-3'
                                  classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
                                  type='text'
                                  className='mt-3'
                                  errorMessage={errorsRestaurant.houseNumber_street?.message}
                                  label='Số nhà / Tên đường'
                                  autoComplete='off'
                                  requiredInput={true}
                                  placeholder='123, Trần Hưng Đạo'
                                />
                              </div>
                              <div className='md:col-span-2 mt-3'>
                                <Controller
                                  name='province'
                                  control={controlRestaurant}
                                  defaultValue=''
                                  render={({ field, fieldState }) => (
                                    <>
                                      <div className='block text-sm font-medium mb-3'>
                                        Tỉnh / Thành phố <span className='text-red-500'>*</span>
                                      </div>
                                      <select
                                        {...field}
                                        className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                                      >
                                        <option value=''>--Chọn tỉnh/thành phố--</option>
                                        {provinces?.map((province) => (
                                          <option key={province.province_id} value={province.province_id}>
                                            {province.province_name}
                                          </option>
                                        ))}
                                      </select>
                                      <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                        {fieldState.error?.message}
                                      </div>
                                    </>
                                  )}
                                />
                              </div>
                              <div className='md:col-span-2 mt-3'>
                                <Controller
                                  name='district'
                                  control={controlRestaurant}
                                  defaultValue=''
                                  render={({ field, fieldState }) => (
                                    <>
                                      <div className='block text-sm font-medium mb-3'>
                                        Quận / Huyện <span className='text-red-500'>*</span>
                                      </div>
                                      <select
                                        {...field}
                                        className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                                      >
                                        <option value=''>--Chọn quận/huyện--</option>
                                        {districtsRestaurant?.map((district) => (
                                          <option key={district.district_id} value={district.district_id}>
                                            {district.district_name}
                                          </option>
                                        ))}
                                      </select>
                                      <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                        {fieldState.error?.message}
                                      </div>
                                    </>
                                  )}
                                />
                              </div>
                              <div className='md:col-span-2 mt-3'>
                                <Controller
                                  name='ward'
                                  control={controlRestaurant}
                                  defaultValue=''
                                  render={({ field, fieldState }) => (
                                    <>
                                      <div className='block text-sm font-medium mb-3'>
                                        Xã / Phường / Thị trấn <span className='text-red-500'>*</span>
                                      </div>
                                      <select
                                        {...field}
                                        className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                                      >
                                        <option value=''>--Chọn xã/phường/thị trấn--</option>
                                        {wardsRestaurant?.map((ward) => (
                                          <option key={ward.ward_id} value={ward.ward_id}>
                                            {ward.ward_name}
                                          </option>
                                        ))}
                                      </select>
                                      <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                        {fieldState.error?.message}
                                      </div>
                                    </>
                                  )}
                                />
                              </div>
                              <div className='md:col-span-6 text-center'>
                                <div className='inline-flex items-end'>
                                  <button
                                    type='submit'
                                    className='text-white inline-flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
                                  >
                                    <span>Cập nhật</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </FormProvider>
                      </div>
                    ) : (
                      <div className='space-y-2 xl:grid xl:grid-cols-4 xl:items-center xl:space-y-0'>
                        <div className='space-y-5 xl:col-span-3'>
                          <div className='flex justify-between items-center'>
                            <div className=''>
                              <div className='flex gap-3 md:gap-6 flex-wrap items-center mb-5'>
                                <Store />
                                <span className='font-normal'>{restaurant?.restaurant_name}</span>
                              </div>
                              <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                                <Soup />
                                <span className='font-normal'>
                                  Ẩm thực:
                                  {restaurant?.restaurant_cuisine}
                                </span>
                              </div>
                              <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                                <Utensils />
                                <span className='font-normal'>
                                  Lĩnh vực:
                                  {restaurant?.restaurant_style}
                                </span>
                              </div>
                            </div>
                            <div className='self-start'>
                              <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                                <Phone />
                                <span className='font-normal'>Hotline: {restaurant?.hotline}</span>
                              </div>
                              <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                                <Clock />
                                <span className='font-normal'>
                                  Giờ hoạt động: {restaurant?.open_time} AM - {restaurant?.close_time} PM{' '}
                                </span>
                              </div>
                              <div className='flex gap-3 md:gap-6 flex-wrap mb-5'>
                                <MapPinned />
                                <span className='font-normal truncate'>
                                  {
                                    wardsRestaurant?.find(
                                      (ward) => ward.ward_id === restaurant?.restaurant_address?.ward
                                    )?.ward_name
                                  }
                                  {', '}
                                  {
                                    districtsRestaurant?.find(
                                      (district) => district.district_id === restaurant?.restaurant_address?.district
                                    )?.district_name
                                  }
                                  {', '}
                                  {
                                    provinces?.find(
                                      (province) => province.province_id === restaurant?.restaurant_address?.province
                                    )?.province_name
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                </li>
                <li className='py-12'>
                  <article>
                    <div className='flex justify-between items-center'>
                      <div className='mb-10 text-xl font-bold '>Thông tin thanh toán</div>
                      <div className='mb-10 text-xl font-bold flex flex-wrap gap-y-2 items-center '>
                        <button
                          type='button'
                          onClick={handleEditCard}
                          className='text-white inline-flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
                        >
                          <span>Chỉnh sửa</span>
                          <UilEdit />
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDeleteCard(selectedCardDefault)}
                          className='focus:outline-none inline-flex items-center justify-center gap-3 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900'
                        >
                          <span>Xóa</span>
                          <UilTrash />
                        </button>
                        <button
                          type='button'
                          onClick={() => {
                            methods.reset({
                              _id: '',
                              card_number: '',
                              expiration_date: '',
                              card_holder_name: '',
                              security_code: '',
                              is_active: false
                            })
                            setShowFormAddCard(true)
                          }}
                          className='focus:outline-none inline-flex justify-center items-center gap-3 text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-yellow-900'
                        >
                          <span>Thêm thẻ</span>
                          <UilPlus />
                        </button>
                      </div>
                    </div>
                    <div className='space-y-2 xl:grid xl:grid-cols-4 xl:items-start xl:space-y-0'>
                      <div className={`space-y-5 ${showFormAddCard ? 'xl:col-span-2' : 'col-span-4'}`}>
                        <div
                          className={`grid grid-cols-1 ${
                            showFormAddCard ? 'md:grid-cols-1 gap-y-3' : 'md:grid-cols-2 gap-y-3'
                          }`}
                        >
                          {cards.map((card) => (
                            <div key={card._id} className='flex items-start justify-start gap-3'>
                              <MasterCardLayout
                                cardHolderName={card.card_holder_name}
                                cardNumber={card.card_number}
                                expiredDate={card.expiration_date}
                              ></MasterCardLayout>
                              <div className='flex items-center'>
                                <input
                                  type='radio'
                                  id={card._id}
                                  defaultChecked={card._id === selectedCardDefault}
                                  name='default-card'
                                  value={card._id}
                                  onChange={handleChangeSelectedDefaultCard}
                                  className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                                />
                                <label
                                  htmlFor={card._id}
                                  className='ms-2 text-base font-medium text-gray-900 dark:text-gray-300'
                                >
                                  Mặc định
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {showFormAddCard ? (
                        <div
                          className={`space-y-5 xl:col-span-2 animate__animated animate__bounceInUp
                          `}
                        >
                          <div className='flex flex-col'>
                            <div className='p-5 text-xl bg-[#21252C] text-white border-b-white border-b flex justify-between items-center'>
                              <div>Thông tin thẻ Tín Dụng/Ghi Nợ</div>
                              <button>
                                <UilTimes className='text-white' onClick={() => setShowFormAddCard(false)} />
                              </button>
                            </div>
                            <div className='bg-[#2A2E33] p-5 flex flex-col'>
                              <img
                                src='https://leadershipmemphis.org/wp-content/uploads/2020/08/780370.png'
                                className='h-8 mb-5 object-contain'
                              />
                              <FormProvider {...methods}>
                                <form noValidate onSubmit={handleSubmitFormCard}>
                                  <div className='grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6 xl:items-start'>
                                    <div className='md:col-span-6 mb-3'>
                                      <CommonInput
                                        name='card_number'
                                        classNameLable='text-white mb-3'
                                        classNameInput='bg-[#1A2029] w-full p-3 border border-gray-400 text-white'
                                        classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
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
                                        classNameLable='text-white mb-3'
                                        classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
                                        classNameInput='bg-[#1A2029] w-full p-3 border border-gray-400 text-white'
                                        register={register}
                                        onChange={handleChange}
                                        maxLength={7}
                                        type='text'
                                        label='Ngày hết hạn (MM/YY)'
                                        requiredInput={true}
                                        placeholder='MM/YY'
                                        errorMessage={errors.expiration_date?.message}
                                      />
                                    </div>
                                    <div className='md:col-span-2 mb-3'>
                                      <CommonInput
                                        name='security_code'
                                        classNameLable='text-white mb-3'
                                        classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
                                        classNameInput='bg-[#1A2029] w-full p-3 border border-gray-400 text-white'
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
                                        classNameLable='text-white mb-3'
                                        classNameInput='bg-[#1A2029] w-full p-3 border border-gray-400 text-white'
                                        classNameError='mt-1 text-red-400 min-h-[1.25rem] text-sm'
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
                                          className='ms-2 text-sm font-medium text-white dark:text-gray-300p py-2.5'
                                        >
                                          Đặt làm phương thức thanh toán mặc định
                                        </label>
                                      </div>
                                    </div>
                                    <div className='md:col-span-6'>
                                      <div className='flex justify-center'>
                                        {getValues('_id') === '' ? (
                                          <button
                                            type='submit'
                                            className='focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900'
                                          >
                                            Thêm
                                          </button>
                                        ) : (
                                          <button
                                            type='submit'
                                            className='text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
                                          >
                                            Cập nhật
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </form>
                              </FormProvider>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                </li>
              </ul>
            </div>
          </main>
          {updatePartnerMutation.isPending && (
            <Loading
              classNameCustom='overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 justify-center flex  bg-gray-900/40 backdrop-blur-[5px] z-[1001]  items-center w-full md:inset-0 h-[calc(100%)] max-h-full'
              color='text-white'
            />
          )}
          {updateAvatarMutation.isPending && (
            <Loading
              classNameCustom='overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 justify-center flex  bg-gray-900/40 backdrop-blur-[5px] z-[1001]  items-center w-full md:inset-0 h-[calc(100%)] max-h-full'
              color='text-white'
            />
          )}
          {updateRestaurantMutation.isPending && (
            <Loading
              classNameCustom='overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 justify-center flex  bg-gray-900/40 backdrop-blur-[5px] z-[1001]  items-center w-full md:inset-0 h-[calc(100%)] max-h-full'
              color='text-white'
            />
          )}
        </div>
      </div>
    </div>
  )
}
export default RestaurantOverview
