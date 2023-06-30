import axios from "axios";
import { PRICES_ENDPOINT } from "../constants";
import { IPriceDataResponse, IPriceResult } from "../interfaces/prices";

export const getPrices = async(mintedAddresses: string[]): Promise<IPriceResult[]> => {
  try {
    const res = await axios.get(`${PRICES_ENDPOINT}?ids=${mintedAddresses}`);
    const data:IPriceDataResponse = res.data.data;
    const prices: IPriceResult[] = Object.keys(data).map((key) => {
      return data[key];
    });
    return prices;
  } catch (err) {
    console.log(err);
    return [];
  }
}
