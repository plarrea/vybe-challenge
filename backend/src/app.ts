import express, { Application, Request, Response } from "express";

const app: Application = express();
const port: Number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Success!')
});

app.listen(port, () => {
  console.log(`Connected successfoully on port ${port}`);
});