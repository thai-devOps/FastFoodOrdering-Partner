import { useSearchParams } from 'react-router-dom'
const useQueryParams = () => {
  const [searchParams] = useSearchParams()
  const queryParams = Object.fromEntries([...searchParams])
  return queryParams
}
export default useQueryParams
