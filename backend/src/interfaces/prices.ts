export interface IPriceResult {
  id: string;
  mintSymbol: string;
  price: number;
}

export interface IPriceDataResponse {
  [key: string]: IPriceResult;
}