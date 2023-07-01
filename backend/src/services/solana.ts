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

/**
 * @param keys string with minted addresse
 * @returns Promise with fetched supply 
 */
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

/**
 * @param keys string with minted addresses separated by commas
 * @returns Promise with an array of results that include the mited addresses, symbol and its market cap
 */
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

/**
 * @param publicKey the public key to read its balance
 * @returns Promise with the balance
 */
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

/**
 * @param keys string with public keys separated by commas
 * @returns Promise with an array of fetched balances
 */
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

/**
 * Fetches a recent performance sample, 
 * takes the number of transactions and the period to obtain the avergage tps
 * @returns Promise with the recent TPS
 */
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
/**
 * adds a new sample to the current list, 
 * removes oldest sample when the limit is greater than max allowed
 */
const updateTPSList = async() => {
  const date = new Date().getTime()
  const tps  = await getRecentTPS();
  tpsList.push({ tps, date });
  if (tpsList.length > TPS_MAX_STORAGE) tpsList.shift();
}

/**
 * @returns array of samples with tps and date
 */
const getTPSList = (): ITps[] => {
  const dummyValues:ITps[] = [];

  if (tpsList.length < TPS_MAX_STORAGE) {
    // not enough samples, lets mock the timeline for the chart
    const oldestDate = tpsList[0]?.date || new Date().getTime();
    for (let i=0; i<TPS_MAX_STORAGE - tpsList.length; i++) {
      dummyValues.push({ tps: null, date: oldestDate - ((i+1)*TPS_UPDATE_TIME) });
    }
  }
  return [...dummyValues.reverse(), ...tpsList];
};

// automatically update the list every X amount of time and keeps it in memory
updateTPSList();
setInterval(async () => {
  updateTPSList();
}, TPS_UPDATE_TIME);

export {
  getTPSList,
  getMarketCap,
  getBalanceForKeys
};