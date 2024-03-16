export type ProvinceType = {
  province_id: string
  province_name: string
  province_type: string
}
export type DistrictType = {
  district_id: string
  district_name: string
  district_type: string
  lat: string
  lng: string
  province_id: string
}
export type WardType = {
  district_id: string
  ward_id: string
  ward_name: string
  ward_type: string
}

export type AddressType = {
  province: ProvinceType
  district: DistrictType
  ward: WardType
  houseNumber_street: string
}
