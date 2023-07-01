import { Connection, PublicKey } from "@solana/web3.js"
import { DEFAULT_TTL, SOLANA_ENDPOINT, TPS_MAX_STORAGE, TPS_UPDATE_TIME } from "../constants";
import { getPrices } from "./prices";
import { BigNumber } from 'bignumber.js';
import { IPriceResult } from "../interfaces/prices";
import { ITps } from "../interfaces/TPS";
import IMarketCapResult from "../interfaces/marketCap";
import { CacheContainer } from "node-ts-cache";
import { MemoryStorage } from "node-ts-cache-storage-memory";

const solanaConnection: Connection = new Connection(SOLANA_ENDPOINT);
const cache = new CacheContainer(new MemoryStorage());

const getTokenSupply = async(tokenMintAddress: string):Promise<BigNumber> => {
  try {
    const cachedSupply = await cache.getItem<BigNumber>(tokenMintAddress);
    if (cachedSupply) return cachedSupply;

    const minted = new PublicKey(tokenMintAddress);
    const supply = await solanaConnection.getTokenSupply(minted);
    const supplyNum = new BigNumber(supply.value.uiAmountString || '0')
    await cache.setItem(tokenMintAddress, supplyNum, {ttl: DEFAULT_TTL});
    return supplyNum;
  } catch (err) {
    console.log(err);
    return new BigNumber(0);
  }
}

const getMarketCap = async(keys: string): Promise<IMarketCapResult[]> => {
  try {
    const mintedAddresses = keys.split(',');
    const supplyPromises = mintedAddresses.map(minted => getTokenSupply(minted));
    const supplies = await Promise.all(supplyPromises);

    let prices:IPriceResult[]
    const cachedPrices = await cache.getItem<IPriceResult[]>(keys);
    if (cachedPrices) {
      prices = cachedPrices;
    }
    else {
      prices = await getPrices(mintedAddresses);
      await cache.setItem(keys, prices, {ttl: DEFAULT_TTL});
    }
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

const getBalance = async (publicKey: string): Promise<number> => {
  try {
    const cachedBalance = await cache.getItem<number>(publicKey);
    if (cachedBalance) return cachedBalance;

    const pk = new PublicKey(publicKey);
    const balance = await solanaConnection.getBalance(pk);
    await cache.setItem(publicKey, balance, {ttl: DEFAULT_TTL});
    return balance;
  } catch (err) {
    console.log(err)
    return 0;
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

const tpsList: ITps[] = [];
const updateTPSList = async() => {
  const date = new Date().getTime()
  const tps  = await getRecentTPS();
  tpsList.push({ tps, date });
  if (tpsList.length > TPS_MAX_STORAGE) tpsList.shift();
}

updateTPSList();
setInterval(async () => {
  updateTPSList();
}, TPS_UPDATE_TIME);

const getTPSList = (): ITps[] => {
  const dummyValues:ITps[] = [];

  if (tpsList.length < TPS_MAX_STORAGE) {
    // not enough samples, lets mock the timeline
    const oldestDate = tpsList[0]?.date || new Date().getTime();
    for (let i=0; i<TPS_MAX_STORAGE - tpsList.length; i++) {
      dummyValues.push({ tps: null, date: oldestDate - ((i+1)*TPS_UPDATE_TIME) });
    }
  }
  return [...dummyValues.reverse(), ...tpsList];
};

export {
  getTPSList,
  getMarketCap,
  getBalanceForKeys
};