import { api } from "../../api/client";
import type { Quote } from "./transfer.types";

export const USE_QUOTE_MOCK = false;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const quoteApi = {
  getQuote: async (data: { amount: number, currency: string, country: string, method: string }) => {
    if (USE_QUOTE_MOCK) {
      await delay(1200);
      
      // Fake FX rules
      const fxRate = data.currency === "HTG" ? 135.25 : 
                     data.currency === "MXN" ? 17.50 : 1.0;
                     
      // Fake fee rules
      const fixedFee = 2.0;
      const percentFee = data.amount * 0.01;
      const fee = fixedFee + percentFee;
      
      const destinationAmount = (data.amount - fee) * fxRate;
      
      const quote: Quote = {
        amount: data.amount,
        fee,
        fxRate,
        destinationAmount
      };
      
      return { data: quote };
    }
    return api.post<Quote>("/transfers/quote", data);
  }
};
