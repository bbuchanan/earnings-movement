import React from "react";
import IStatDisplay from "../../interfaces/StatDisplay";
import { Row, Col } from "antd";

import moment from "moment";
import numeral from "numeral";

import "./StatDisplayComponent.css";

interface IStatDisplayProps {
  StatDisplay: IStatDisplay;
}

class StatDisplayComponent extends React.Component<IStatDisplayProps, {}> {
  public render() {
    return (
      <div>
        <Row type="flex" justify="start">
          <Col className="calc-title" span={6}>
            Earnings Date:
          </Col>
          <Col span={6}>{moment(this.props.StatDisplay.EarningsDate).format("MM/DD/YYYY")}</Col>
        </Row>
        <Row type="flex" justify="start">
          <Col span={6}>% move on earnings day:</Col>
          <Col span={6}>{numeral(this.props.StatDisplay.PercentMoveEarningsDay).format("0.000%")}</Col>
        </Row>
        <Row type="flex" justify="start">
          <Col span={6}>% move week before earnings:</Col>
          <Col span={6}>{numeral(this.props.StatDisplay.PercentMoveWeekBefore).format("0.000%")}</Col>
        </Row>
        <Row type="flex" justify="start">
          <Col span={6}>% move week after earnings:</Col>
          <Col span={6}>{numeral(this.props.StatDisplay.PercentMoveWeekAfter).format("0.000%")}</Col>
        </Row>
      </div>
    );
  }
}

export default StatDisplayComponent;
