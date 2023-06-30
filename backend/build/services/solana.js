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
exports.getMarketCap = exports.getRecentTPS = exports.getBalance = exports.getTokenSupply = void 0;
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
const prices_1 = require("./prices");
const bignumber_js_1 = require("bignumber.js");
const solanaConnection = new web3_js_1.Connection(constants_1.SOLANA_ENDPOINT);
const getTokenSupply = (tokenMintAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const minted = new web3_js_1.PublicKey(tokenMintAddress);
        const supply = yield solanaConnection.getTokenSupply(minted);
        return new bignumber_js_1.BigNumber(supply.value.uiAmountString || '0');
    }
    catch (err) {
        console.log(err);
        return new bignumber_js_1.BigNumber(0);
    }
});
exports.getTokenSupply = getTokenSupply;
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
const getRecentTPS = () => __awaiter(void 0, void 0, void 0, function* () {
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
exports.getRecentTPS = getRecentTPS;
const getMarketCap = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mintedAddresses = Object.keys(constants_1.SPL_TOKENS).map((key, index) => {
            return index === 0 ? constants_1.SPL_TOKENS[key] : `${constants_1.SPL_TOKENS[key]}`;
        });
        const supplyPromises = mintedAddresses.map(minted => getTokenSupply(minted));
        const supplies = yield Promise.all(supplyPromises);
        const prices = yield (0, prices_1.getPrices)(mintedAddresses);
        const marketCap = mintedAddresses.map((minted, idx) => {
            return {
                minted,
                symbol: prices[idx].mintSymbol,
                marketCap: supplies[idx].times(prices[idx].price).dp(8).toFixed()
            };
        });
        return marketCap;
    }
    catch (err) {
        console.log(err);
        return [];
    }
});
exports.getMarketCap = getMarketCap;
