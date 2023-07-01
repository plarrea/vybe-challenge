import { useEffect, useMemo, useState } from "react";
import solanaApi from '../../api/solana';
import ReactApexChart from "react-apexcharts";
import { BigNumber } from 'bignumber.js';
import { DEFAULT_REFRESH_TIME, SPL_TOKENS, TOKEN_NAMES } from "../../constants";
import useInterval from "../../hooks/useInterval";
import { ApexOptions } from "apexcharts";

type MarketCapType = {
  minted: string;
  symbol: string;
  marketCap: string;
}

const MarketCap = () => {
  const [ marketCap, setMarketCap ] = useState<MarketCapType[] | null>(null)

  const fetchMarketCap = async () => {
    try {
      const mintedAddresses = Object.keys(SPL_TOKENS).map((key: string, index: number) => {
        return index === 0? SPL_TOKENS[key] : `${SPL_TOKENS[key]}`
      });
      const response = await solanaApi.get(`/market-cap?keys=${mintedAddresses}`);
      const mc: MarketCapType[] = response.data;
      setMarketCap(mc);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMarketCap();
  }, []);

  useInterval(() => {
    fetchMarketCap();
  }, DEFAULT_REFRESH_TIME);

  const chartOptions = useMemo(() => {
    const chartOptions: ApexOptions = {
      labels: marketCap?.map(mc => `${TOKEN_NAMES[mc.symbol]} (${mc.symbol})`),
      theme: {
        mode: "dark"
      },
    };
    return chartOptions;
  }, [marketCap]);

  const chartSeries = useMemo(() => {
    return marketCap?.map(mc => new BigNumber(mc.marketCap).toNumber());
  }, [marketCap]);

  return (
    <div className='page'>
      <h4>Market Cap</h4>
      {
        !!marketCap?
          marketCap.length > 0? 
          <ReactApexChart options={chartOptions} series={chartSeries} type="pie" width={500} />
          :<h5>No Results</h5>
        :<h5>Loading...</h5>
      }
    </div>
  )
}

export default MarketCap;