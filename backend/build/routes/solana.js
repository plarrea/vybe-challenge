"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const solana_1 = require("../services/solana");
const solanaRouter = express_1.default.Router();
solanaRouter.get('/balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const balance = yield (0, solana_1.getBalance)(req.query.key);
    res.send(balance.toString());
}));
solanaRouter.get('/tps', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tps = yield (0, solana_1.getRecentTPS)();
    res.send(tps.toString());
}));
solanaRouter.get('/market-cap', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, solana_1.getMarketCap)();
    res.send(result);
}));
exports.default = solanaRouter;
