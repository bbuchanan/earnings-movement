import React, { ChangeEvent } from "react";
import { Button, Input } from "antd";

import axios from "../../axios-stocks";
import IStockPrice from "../../interfaces/StockPrice";
import moment from "moment";
import { parseIEXStockData } from "../../utils/PriceParser";
import "./StockSymbolInput.css";
import IStatDisplay from "../../interfaces/StatDisplay";
import StatDisplayComponent from "../StatDisplayComponent/StatDisplayComponent";

interface IStockSymbolState {
  Symbol: string;
  Days: number;
  PriceData: IStockPrice[];
  EarningsData: IEarnings | null;
  StatItems: IStatDisplay[];
}

class StockSymbolInput extends React.Component<{}, IStockSymbolState> {
  public state: IStockSymbolState = {
    Symbol: "msft",
    Days: 7,
    PriceData: [],
    EarningsData: null,
    StatItems: []
  };

  public symbolChanged = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      Symbol: event.currentTarget.value
    });
  };

  public render() {
    return (
      <div className="stock-input">
        <form onSubmit={this.handleSubmit}>
          <label>Ticker symbol:</label>
          <Input placeholder="Enter ticker symbol" value={this.state.Symbol} onChange={this.symbolChanged} />
          <Button type="primary" onClick={this.handleSubmit}>
            Submit
          </Button>
        </form>
        <div>
          <h2>{this.state.Symbol}</h2>
          {this.state.StatItems.map(s => {
            return (
              <div key={s.EarningsDate.getTime()} style={{ marginBottom: 10 }}>
                <StatDisplayComponent StatDisplay={s} />
              </div>
            );
          })}
        </div>
        <div>
          <p>&nbsp;</p>
          <h2>Calculation Explanations:</h2>
          <p>
            <b>Earnings Move</b> = yesterday's close compared to earnings day high.
          </p>
          <p>
            <b>% Move week before</b> = 7 days before earnings open compared to day before earnings close.
          </p>
          <p>
            <b>% Move week after</b> = Earnings day price open compare to 7 days after earnings close.
          </p>
        </div>
      </div>
    );
  }

  private handleSubmit = () => {
    this.setState({
      StatItems: [],
      EarningsData: null
    });
    this.loadIEXStockData();
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
    const stats: IStatDisplay[] = [];

    this.state.EarningsData!.ReportDates.forEach(d => {
      const earningsDayPrice: IStockPrice | undefined = this.getPriceDataForDate(d);
      const weekBeforeDate: Date = new Date(
        moment(d)
          .subtract(6, "d")
          .format("YYYY-MM-DD")
      );
      const weekAfterDate: Date = new Date(
        moment(d)
          .add(8, "d")
          .format("YYYY-MM-DD")
      );
      const weekBeforePrice: IStockPrice | undefined = this.getPriceDataForDate(weekBeforeDate);
      const weekAfterPrice: IStockPrice | undefined = this.getPriceDataForDate(weekAfterDate);
      const pricesSlice: IStockPrice[] | undefined = this.state.PriceData.filter(p => {
        return p.date.getTime() >= weekBeforeDate.getTime() && p.date.getTime() <= weekAfterDate.getTime();
      });

      // get earnings date from the price slice.
      const earningsDayIndex = pricesSlice.findIndex(p => p.date.getTime() === d.getTime());
      const dayBeforePrice: IStockPrice = pricesSlice[earningsDayIndex - 1];
      const earningsMove: number = (earningsDayPrice!.high - dayBeforePrice.close) / earningsDayPrice!.high;
      const weekBeforeMove: number = (dayBeforePrice.close - weekBeforePrice!.open) / dayBeforePrice.close;
      const weekAfterMove: number = (weekAfterPrice!.close - earningsDayPrice!.open) / weekAfterPrice!.close;

      stats.push({
        EarningsDate: d,
        PercentMoveWeekBefore: weekBeforeMove,
        PercentMoveWeekAfter: weekAfterMove,
        PercentMoveEarningsDay: earningsMove
      });
    });

    this.setState({
      StatItems: stats
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
