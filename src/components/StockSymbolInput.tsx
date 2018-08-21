import React, { ChangeEvent, FormEvent } from "react";
import axios from "../axios-stocks";
import IStockPrice from "../interfaces/StockPrice";
import { parseIEXStockData } from "../utils/PriceParser";

interface IStockSymbolState {
  Symbol: string;
  Days: number;
  PriceData: IStockPrice[];
  EarningsData: IEarnings | null;
}

class StockSymbolInput extends React.Component<{}, IStockSymbolState> {
  public state: IStockSymbolState = {
    Symbol: "",
    Days: 7,
    PriceData: [],
    EarningsData: null
  };

  public symbolChanged = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      Symbol: event.currentTarget.value
    });
  };

  public render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Ticker symbol:</label>
          <input type="text" value={this.state.Symbol} onChange={this.symbolChanged} />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }

  private handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    this.loadIEXStockData();
    // this.loadAVData();
    event.preventDefault();
  };

  private loadIEXStockData = () => {
    axios.get(`https://api.iextrading.com/1.0/stock/${this.state.Symbol}/chart/2y`).then(data => {
      this.setState({
        PriceData: parseIEXStockData(data.data)
      });
      this.loadEarnings();
    });
  };

  private loadEarnings = () => {
    axios.get(`https://api.iextrading.com/1.0/stock/${this.state.Symbol}/earnings`).then(data => {
      const earnings: IEarnings = {
        /* tslint:disable:no-string-literal */
        Symbol: data.data["symbol"],
        ReportDates: data.data["earnings"].map((d: string) => new Date(d["EPSReportDate"]))
      } as IEarnings;
      /* tslint:enable:no-string-literal */
      this.setState(
        {
          EarningsData: earnings
        },
        () => this.processEarningsDates()
      );
    });
  };

  private processEarningsDates = () => {
    this.state.EarningsData!.ReportDates.forEach(d => {
      const earningDayPrice: IStockPrice | undefined = this.getPriceDataForDate(d);
      const weekBeforePrice: IStockPrice | undefined = this.getPriceDataForDate(
        new Date(new Date().setDate(d.getDate() - 7))
      );
      const weekAfterPrice: IStockPrice | undefined = this.getPriceDataForDate(
        new Date(new Date().setDate(d.getDate() + 7))
      );
      console.log(weekBeforePrice);
      console.log(earningDayPrice);
      console.log(weekAfterPrice);
    });
  };

  private getPriceDataForDate = (date: Date): IStockPrice | undefined => {
    return this.state.PriceData.find(p => {
      return p.date.getTime() === date.getTime();
    });
  };
  // private loadAVData = () => {
  //   axios
  //     .get(
  //       `query?function=TIME_SERIES_DAILY&outputsize=full&symbol=${
  //         this.state.Symbol
  //       }&apikey=${apiKey}`
  //     )
  //     .then(data => {
  //       const parsedData = parseAlphaVantageStockData(data.data);
  //       console.log(parsedData);
  //     });
  // };
}

export default StockSymbolInput;
