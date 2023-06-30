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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTPS = exports.getBalance = void 0;
const web3_js_1 = require("@solana/web3.js");
const endpoint = 'https://solana-mainnet.rpc.extrnode.com/';
const solanaConnection = new web3_js_1.Connection(endpoint);
const getTokenSupply = () => __awaiter(void 0, void 0, void 0, function* () {
    //await solanaConnection.getTokenSupply()
});
const getBalance = (publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pk = new web3_js_1.PublicKey(publicKey);
        const balance = yield solanaConnection.getBalance(pk);
        return balance;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
});
exports.getBalance = getBalance;
const getTPS = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const samples = yield solanaConnection.getRecentPerformanceSamples(10);
        if (samples.length < 1)
            return 0;
        const short = samples
            .filter(sample => {
            return sample.numTransactions !== 0;
        })
            .map(sample => {
            return sample.numTransactions / sample.samplePeriodSecs;
        });
        const avgTps = short[0];
        return avgTps;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
});
exports.getTPS = getTPS;
