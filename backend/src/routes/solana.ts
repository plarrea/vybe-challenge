import express, { Router, Request, Response } from "express";
import { getBalanceForKeys, getMarketCap, getRecentTPS } from "../services/solana";
import { QueryWithKeys } from "../interfaces/queries";
import IMarketCapResult from "../interfaces/marketCap";

const solanaRouter: Router = express.Router();

solanaRouter.get('/balance', async (
  req: Request<unknown, unknown, unknown, QueryWithKeys>,
  res: Response
) => {
  const balance  = await getBalanceForKeys(req.query.keys);
  res.send(balance.toString());
});

solanaRouter.get('/tps', async (
  req: Request,
  res: Response
) => {
  const tps  = await getRecentTPS();
  res.send(tps.toString());
});

solanaRouter.get('/market-cap', async (
  req: Request<unknown, unknown, unknown, QueryWithKeys>,
  res: Response
) => {
  const result: IMarketCapResult[] = await getMarketCap(req.query.keys);
  res.send(result);
});

export default solanaRouter;