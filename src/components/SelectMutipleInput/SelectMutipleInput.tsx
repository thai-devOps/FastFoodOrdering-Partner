import React from 'react'
import { StylesConfig } from 'react-select'
import AsyncSelect from 'react-select/async'
import makeAnimated from 'react-select/animated'
import { useQuery } from '@tanstack/react-query'
import authApi from '~/apis/authApi'
const animatedComponents = makeAnimated()
interface Props {
  setSelectedOptions: React.Dispatch<any>
  food_id?: string
}
const SelectMutipleInput: React.FC<Props> = ({ food_id, setSelectedOptions }) => {
  const [selectedOptionsState, setSelectedOptionsState] = React.useState<any>(null)
  const { data: dataCategories } = useQuery({
    queryKey: ['dataCategories'],
    queryFn: () => authApi.getCategories()
  })
  // Fetch all food categories by shop id
  const { data: foodCategoriesData } = useQuery({
    queryKey: ['foodCategoriesData', food_id],
    queryFn: () => authApi.getFoodCategories(food_id),
    enabled: !!food_id,
    refetchOnWindowFocus: true
  })

  // wrap dataCategories  useMemo Hook to avoid re-render
  const categoriesData = React.useMemo(() => dataCategories?.data.data, [dataCategories])
  const categoriesOptions = categoriesData?.map((menuCategory) => ({
    value: menuCategory._id,
    label: menuCategory.name
  }))
  // Define custom styles
  const customStyles: StylesConfig = {
    control: (provided) => ({
      ...provided,
      padding: '0.5rem', // tương đương với p-3
      width: '100%', // tương đương với w-full
      outline: 'none', // tương đương với outline-none
      borderWidth: '1px', // tương đương với border
      borderStyle: 'solid', // tương đương với border
      borderColor: '#d1d5db', // tương đương với border-gray-300
      borderRadius: '0.375rem', // tương đương với rounded-md
      boxShadow: 'none', // tương đương với focus:shadow-sm
      marginBottom: '0.75rem' // tương đương với mb-2
    }),
    menu: (provided) => ({
      ...provided,
      padding: '0.75rem' // tương đương với p-3
    })
  }
  const filterColors = (inputValue: string) => {
    return categoriesOptions?.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()))
  }

  const promiseOptions = (inputValue: string) =>
    new Promise<{ value: string; label: string }[]>((resolve) => {
      setTimeout(() => {
        resolve(filterColors(inputValue) || [])
      }, 1000)
    })
  // handle selected options and set to selectedOptionsState
  React.useEffect(() => {
    if (foodCategoriesData) {
      const selectedOptions = foodCategoriesData.data.data.map((category) => ({
        value: category.category_id,
        label: categoriesData?.find((item) => item._id === category.category_id)?.name
      }))
      setSelectedOptionsState(selectedOptions)
      setSelectedOptions(selectedOptions) // Set parent component's state
    }
  }, [foodCategoriesData, categoriesData, setSelectedOptions, setSelectedOptionsState])
  return (
    <AsyncSelect
      styles={customStyles}
      placeholder='Tìm kiếm danh mục'
      components={animatedComponents}
      cacheOptions
      defaultOptions={categoriesOptions}
      loadOptions={promiseOptions}
      isMulti
      value={selectedOptionsState}
      onChange={(selectedOptions) => {
        setSelectedOptionsState(selectedOptions)
        setSelectedOptions(selectedOptions)
      }}
    />
  )
}
export default SelectMutipleInput
