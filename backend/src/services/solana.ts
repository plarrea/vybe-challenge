import { Connection, PublicKey } from "@solana/web3.js"
import { SOLANA_ENDPOINT, SPL_TOKENS } from "../constants";
import { getPrices } from "./prices";
import { BigNumber } from 'bignumber.js';
import { IPriceResult } from "../interfaces/prices";
import IMarketCapResult from "../interfaces/marketCap";

const solanaConnection: Connection = new Connection(SOLANA_ENDPOINT);

const getTokenSupply = async(tokenMintAddress: string):Promise<BigNumber> => {
  try {
    const minted = new PublicKey(tokenMintAddress);
    const supply = await solanaConnection.getTokenSupply(minted);
    return new BigNumber(supply.value.uiAmountString || '0');
  } catch (err) {
    console.log(err);
    return new BigNumber(0);
  }
}

const getBalance = async (publicKey: string): Promise<number> => {
  try {
    const pk = new PublicKey(publicKey);
    const balance = await solanaConnection.getBalance(pk);
    return balance;
  } catch (err) {
    console.log(err)
    return 0;
  }
}

const getRecentTPS = async(): Promise<number> => {
  try {
    const samples = await solanaConnection.getRecentPerformanceSamples(10);
    if(samples.length < 1) return 0;

    const short = samples
      .filter(sample => {
          return sample.numTransactions !== 0;
      })
      .map(sample => {
        return sample.numTransactions / sample.samplePeriodSecs;
      });

    const avgTps = short[0];
    return avgTps;
  } catch (err) {
    console.log(err)
    return 0;
  }
}

const getMarketCap = async(keys: string): Promise<IMarketCapResult[]> => {
  try {
    const mintedAddresses = keys.split(',');

    const supplyPromises = mintedAddresses.map(minted => getTokenSupply(minted));
    const supplies = await Promise.all(supplyPromises);
    const prices:IPriceResult[] = await getPrices(mintedAddresses);

    const marketCap: IMarketCapResult[] = mintedAddresses.map((minted, idx) => {
      return {
        minted,
        symbol: prices[idx].mintSymbol,
        marketCap: supplies[idx].times(prices[idx].price).dp(8).toFixed()
      };
    });

    return marketCap;
  } catch (err) {
    console.log(err)
    return [];
  }
}

const getBalanceForKeys = async(keys: string): Promise<number[]> => {
  try {
    const publicKeys = keys.split(',');

    const balancePromises = publicKeys.map(pk => getBalance(pk));
    const balances = await Promise.all(balancePromises);
    return balances;
  } catch (err) {
    console.log(err)
    return [];
  }
}

export {
  getRecentTPS,
  getMarketCap,
  getBalanceForKeys
};