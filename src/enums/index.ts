export enum UserVerifyStatus {
  Unverified = 'Unverified', // chưa xác thực email, mặc định = 0
  Verified = 'Verified', // đã xác thực email
  Banned = 'Banned' // bị khóa
}
export enum ShopStyles {
  FOOD = 'Quán ăn',
  HOT_POT = 'Quán nhậu - lẩu - nướng',
  COFFEE = 'Quán Cà Phê',
  MILK_TEA = 'Quán Trà Sữa',
  DESSERT = 'Quán Kem - Bánh ngọt',
  BEVERAGE = 'Quán Nước Uống'
}
export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}
export enum DiscountType {
  PERCENTAGE = 'percentage',
  AMOUNT = 'amount'
}
export enum SellingStatus {
  IN_STORE = 'in_store',
  WAITING = 'waiting',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum GENDER_TYPE {
  Male = 'nam',
  Female = 'nu',
  Other = 'khac'
}
export enum PARTNER_STATUS {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
export enum RESTAURANT_STATUS {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
export enum RestaurantStyle {
  'Beverage' = 'Cafe - Nước uống giải khát',
  'Restaurant' = 'Nhà hàng',
  'MikTea' = 'Trà sữa ',
  'SnackShop' = 'Quán ăn vặt',
  'FastFood' = 'FastFood',
  'HotPot' = 'Nhậu - Lẩu - Nướng'
}
export enum UserRole {
  Customer,
  Admin,
  Shipper,
  Partner
}
export enum TOKEN_TYPE {
  ACCESS_TOKEN = 'access-token',
  REFRESH_TOKEN = 'refresh-token',
  EMAIL_VERIFY_TOKEN = 'email-verify-token',
  FORGOT_PASSWORD_TOKEN = 'forgot-password-token'
}
export enum SORT_BY {
  newest = 'created_at',
  name = 'name',
  price = 'price',
  sold = 'sold'
}
export enum HttpStatusCode {
  Continue = 100,
  SwitchingProtocols = 101,
  Processing = 102,
  EarlyHints = 103,
  Ok = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultiStatus = 207,
  AlreadyReported = 208,
  ImUsed = 226,
  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  Unused = 306,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  PayloadTooLarge = 413,
  UriTooLong = 414,
  UnsupportedMediaType = 415,
  RangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  MisdirectedRequest = 421,
  UnprocessableEntity = 422,
  Locked = 423,
  FailedDependency = 424,
  TooEarly = 425,
  UpgradeRequired = 426,
  PreconditionRequired = 428,
  TooManyRequests = 429,
  RequestHeaderFieldsTooLarge = 431,
  UnavailableForLegalReasons = 451,
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HttpVersionNotSupported = 505,
  VariantAlsoNegotiates = 506,
  InsufficientStorage = 507,
  LoopDetected = 508,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511
}
