import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FC, useContext } from 'react'
import { SHOP_API } from '~/apis/shops.api'
import { AppContext } from '~/contexts/app.context'
import { setActiveStepToLS } from '~/utils/auth'
interface TermAndConditionProps {
  setActiveStep4: React.Dispatch<React.SetStateAction<boolean>>
}
const TermAndCondition: FC<TermAndConditionProps> = ({ setActiveStep4 }) => {
  const { activeStep, setActiveStep } = useContext(AppContext)
  const { data: shopsData } = useQuery({
    queryKey: ['shopsData'],
    queryFn: () => SHOP_API.getByPartnerId()
  })
  const updateShopStatus = useMutation({
    mutationFn: (is_active: boolean) => SHOP_API.updateStatus(is_active)
  })
  const queryClient = useQueryClient()
  const handleCompleteFinalStep = () => {
    // call api to update restaurant status to active
    const r_id = shopsData?.data?.data?._id
    if (r_id) {
      updateShopStatus.mutate(true, {
        onSuccess: async () => {
          setActiveStepToLS([activeStep[0], activeStep[1], activeStep[2], true])
          setActiveStep([activeStep[0], activeStep[1], activeStep[2], true])
          setActiveStep4(false)
          await queryClient.invalidateQueries({
            queryKey: ['shopsData']
          })
        },
        onError: (error) => {
          console.log(error)
        }
      })
    }
    // set step 2 to completed in local storage and keep other steps
  }
  return (
    <div className=' animate__animated animate__fadeIn bg-white'>
      <h1 className='text-2xl font-bold mb-6'>Điều Khoản và Điều Kiện Đối Tác Nhà Hàng</h1>
      <h2 className='text-xl font-bold mb-2'>1. Tổng Quan về Thỏa Thuận</h2>
      <p className='mb-4'>
        Bằng cách trở thành đối tác nhà hàng với nền tảng của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện
        được liệt kê trong thỏa thuận này.
      </p>
      <h2 className='text-xl font-bold mb-2'>2. Trách Nhiệm của Đối Tác</h2>
      <p className='mb-4'>Là một đối tác nhà hàng, bạn đồng ý:</p>
      <ul className='list-disc ml-6'>
        <li>Cung cấp thông tin menu chính xác và cập nhật.</li>
        <li>Chuẩn bị và giao hàng đúng hạn.</li>
        <li>Giữ chất lượng thực phẩm và tiêu chuẩn dịch vụ.</li>
        {/* Thêm các trách nhiệm khác khi cần */}
      </ul>
      <h2 className='text-xl font-bold mb-2'>3. Hoa Hồng và Thanh Toán</h2>
      <p className='mb-4'>
        Chi tiết về tỷ lệ hoa hồng, lịch thanh toán và bất kỳ thỏa thuận tài chính nào khác giữa hai bên.
      </p>
      <h2 className='text-xl font-bold mb-2'>4. Chấm Dứt Thỏa Thuận</h2>
      <p className='mb-4'>
        Mỗi bên đều có quyền chấm dứt thỏa thuận này với thông báo trước. Điều kiện chấm dứt nên được xác định rõ ràng.
      </p>
      {/* Thêm các phần khác nếu cần */}
      <h2 className='text-xl font-bold mb-2'>Liên Hệ</h2>
      <p className='mb-4'>
        Đối với bất kỳ câu hỏi hoặc lo ngại nào về điều khoản và điều kiện, vui lòng liên hệ chúng tôi qua{' '}
        <a href='mailto:thaib2005731@student.ctu.edu.vn' className='text-blue-500'>
          thaib2005731@student.ctu.edu.vn
        </a>
        .
      </p>
      <div className='flex justify-center'>
        <button
          type='button'
          onClick={handleCompleteFinalStep}
          className='text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'
        >
          Đồng ý và Hoàn tất
        </button>
      </div>
    </div>
  )
}
export default TermAndCondition
