import * as React from "react";
import "./App.css";

import StockSymbolInput from "./components/StockSymbolInput";

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <StockSymbolInput />
      </div>
    );
  }
}

export default App;
