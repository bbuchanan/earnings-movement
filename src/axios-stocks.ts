import axios from "axios";

export const apiKey = "K0SQD48RZGOG7HX5";

const instance = axios.create({
  baseURL: "https://www.alphavantage.co/"
});

export default instance;
