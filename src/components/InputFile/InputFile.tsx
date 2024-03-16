import { UilUpload } from '@iconscout/react-unicons'
import { Fragment, useRef } from 'react'
import { toast } from 'react-toastify'
import config from '~/constants/config'

interface Props {
  onChange?: (file?: File) => void
  classNamesButton?: string
}

const InputFile = ({
  onChange,
  classNamesButton = 'flex gap-2 h-10 items-center justify-end rounded-sm border bg-white px-6 text-sm text-gray-600 shadow-sm'
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFromLocal = event.target.files?.[0]
    fileInputRef.current?.setAttribute('value', '')
    if (fileFromLocal && (fileFromLocal.size >= config.maxSizeUploadAvatar || !fileFromLocal.type.includes('image'))) {
      toast.error(`Dụng lượng file tối đa 1 MB. Định dạng:.JPEG, .PNG`, {
        position: 'top-center'
      })
    } else {
      onChange && onChange(fileFromLocal)
    }
  }
  const handleUpload = () => {
    fileInputRef.current?.click()
  }
  return (
    <Fragment>
      <input
        className='hidden'
        type='file'
        accept='.jpg,.jpeg,.png'
        ref={fileInputRef}
        onChange={onFileChange}
        onClick={(event) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(event.target as any).value = null
        }}
      />
      <button className={classNamesButton} type='button' onClick={handleUpload}>
        <span>Chọn ảnh</span>
        <UilUpload size={20} />
      </button>
    </Fragment>
  )
}

export default InputFile
