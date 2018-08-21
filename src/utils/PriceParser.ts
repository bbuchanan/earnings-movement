import IStockPrice from "../interfaces/StockPrice";
import ITickerData from "../interfaces/TickerData";

export const parseIEXStockData = (data: string[]) => {
  const priceData: IStockPrice[] = data.map(p => {
    return {
      /* tslint:disable:no-string-literal */
      date: new Date(p["date"]),
      open: parseFloat(p["open"]),
      high: parseFloat(p["high"]),
      low: parseFloat(p["low"]),
      close: parseFloat(p["close"]),
      volume: parseFloat(p["volume"])
      /* tslint:enable:no-string-literal */
    };
  });

  return priceData;
};

export const parseAlphaVantageStockData = (data: string) => {
  const tickerData: ITickerData = {
    dataInformation: data["Meta Data"]["1. Information"],
    symbol: data["Meta Data"]["2. Symbol"],
    lastRefreshed: data["Meta Data"]["3. Last Refreshed"],
    interval: data["Meta Data"]["4. Interval"]
  };

  const seriesName = Object.getOwnPropertyNames(data)[1];
  const priceData: IStockPrice[] = Object.keys(data[seriesName]).map(key => {
    return {
      date: new Date(key),
      open: parseFloat(data[seriesName][key]["1. open"]),
      high: parseFloat(data[seriesName][key]["2. high"]),
      low: parseFloat(data[seriesName][key]["3. low"]),
      close: parseFloat(data[seriesName][key]["4. close"]),
      volume: parseInt(data[seriesName][key]["5. volume"], 10)
    } as IStockPrice;
  });

  return { seriesName, tickerData, priceData };
};
