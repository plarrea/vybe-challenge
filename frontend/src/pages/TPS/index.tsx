import { useEffect, useMemo, useState } from "react";
import solanaApi from '../../api/solana';
import ReactApexChart from "react-apexcharts";
import { TPS_REFRESH_RATE } from "../../constants";
import useInterval from "../../hooks/useInterval";
import { ApexOptions } from "apexcharts";
import { DateTime } from "luxon";

export interface ITps {
  date: number;
  tps: number;
}

const TPS = () => {
  const [ tps, setTps ] = useState<ITps[] | null>(null);

  const fetchTps = async () => {
    try {
      const response = await solanaApi.get('/tps');
      const data: ITps[] = response.data;
      setTps(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTps();
  }, []);

  useInterval(() => {
    fetchTps();
  }, TPS_REFRESH_RATE);

  const chartOptions = useMemo(() => {
    const chartOptions: ApexOptions = {
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: 'Transactions Per Second (Last Hour)',
        align: 'left'
      },
      theme: {
        mode: "dark"
      },
      xaxis: {
        categories: !tps? []:tps.map(t => {
          return DateTime.fromMillis(t.date).toLocaleString(DateTime.TIME_WITH_SECONDS);
        }),
      }
    };
    return chartOptions;
  }, [tps]);

  const chartSeries = useMemo(() => {
    if(!tps) return [];
    return [
      {
        name: 'TPS',
        data: tps.map(t => t?.tps || null)
      }
    ]
  }, [tps]);

  return (
    <div className='page'>
      <h4>TPS</h4>
      {
        !!tps?
          tps.length > 0? 
          <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={350} width={800} />
          :<h5>No Results</h5>
        :<h5>Loading...</h5>
      }
    </div>
  )
}

export default TPS