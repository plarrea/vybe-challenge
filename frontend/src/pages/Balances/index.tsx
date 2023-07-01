import { useEffect, useMemo, useState } from "react";
import solanaApi from '../../api/solana';
import ReactApexChart from "react-apexcharts";
import { BigNumber } from 'bignumber.js';
import { DEFAULT_REFRESH_TIME, WALLETS } from "../../constants";
import useInterval from "../../hooks/useInterval";
import { ApexOptions } from "apexcharts";

const Balances = () => {

  const [ balances, setBalances ] = useState<number[] | null>(null)

  const fetchBalances = async () => {
    try {
      const response = await solanaApi.get(`/balance?keys=${WALLETS}`);
      const data: number[] = response.data;
      setBalances(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  useInterval(() => {
    fetchBalances();
  }, DEFAULT_REFRESH_TIME);

  const chartOptions: ApexOptions =  {
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      }
    },
    dataLabels: {
      enabled: false
    },
    theme: {
      mode: "dark"
    },
    xaxis: {
      categories: WALLETS,
    }
  };

  const chartSeries = useMemo(() => {
    if(!balances) return [ {data: []} ];
    return [
      { data: balances!.map(b => new BigNumber(b).dividedBy(1).dp(0).toNumber()) }
    ]
  }, [balances]);

  return (
    <div className='page'>
      <h4>Balances</h4>
      {
        !!balances?
          balances.length > 0? 
          <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350}/>
          :<h5>No Results</h5>
        :<h5>Loading...</h5>
      }
    </div>
  )
}

export default Balances;