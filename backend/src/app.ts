import express, { Application, Request, Response } from "express";
import solanaRouter from "./routes/solana";

const app: Application = express();
const port: Number = 3000;

app.use('/solana', solanaRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Success!')
});

app.listen(port, () => {
  console.log(`Connected successfully on port ${port}`);
});