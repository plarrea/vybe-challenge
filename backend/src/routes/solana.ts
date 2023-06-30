import express, { Router, Request, Response } from "express";
import { getBalance, getMarketCap, getRecentTPS } from "../services/solana";
import { BalanceRequestQuery } from "../interfaces/queries";
import IMarketCapResult from "../interfaces/marketCap";

const solanaRouter: Router = express.Router();

solanaRouter.get('/balance', async (
  req: Request<unknown, unknown, unknown, BalanceRequestQuery>,
  res: Response
) => {
  const balance  = await getBalance(req.query.key);
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
  req: Request,
  res: Response
) => {
  const result: IMarketCapResult[] = await getMarketCap();
  res.send(result);
});

export default solanaRouter;