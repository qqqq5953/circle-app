import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/quote/:ticker', (req, res, ctx) => {
    const { ticker } = req.params;

    // Mock response data based on the ticker
    const mockData = {
      AAPL: {
        price: 160,
        previousCloseChange: "-2.4",
        previousCloseChangePercent: -1.1,
        name: "Apple",
        ticker: "AAPL",
        regularMarketTime: "",
        marketState: "OPEN"
      },
      MSFT: {
        price: 160,
        previousCloseChange: "-2.4",
        previousCloseChangePercent: -1.1,
        name: "Microsoft",
        ticker: "MSFT",
        regularMarketTime: "",
        marketState: "OPEN"
      },
      AMZN: {
        price: 160,
        previousCloseChange: "-2.4",
        previousCloseChangePercent: -1.1,
        name: "Amazon",
        ticker: "AMZN",
        regularMarketTime: "",
        marketState: "OPEN"
      },
      TSLA: {
        price: 160,
        previousCloseChange: "-2.4",
        previousCloseChangePercent: -1.1,
        name: "Tesla",
        ticker: "TSLA",
        regularMarketTime: "",
        marketState: "OPEN"
      },
      NVDA: {
        price: 160,
        previousCloseChange: "-2.4",
        previousCloseChangePercent: -1.1,
        name: "Nvidia",
        ticker: "NVDA",
        regularMarketTime: "",
        marketState: "OPEN"
      },
      "2330.TW": {
        price: 160,
        previousCloseChange: "-2.4",
        previousCloseChangePercent: -1.1,
        name: "台灣積體電路製造",
        ticker: "2330.TW",
        regularMarketTime: "",
        marketState: "OPEN"
      },
      "2317.TW": {
        price: 160,
        previousCloseChange: "-2.4",
        previousCloseChangePercent: -1.1,
        name: "鴻海",
        ticker: "2317.TW",
        regularMarketTime: "",
        marketState: "OPEN"
      },
      "2454.TW": {
        price: 160,
        previousCloseChange: "-2.4",
        previousCloseChangePercent: -1.1,
        name: "聯發科技",
        ticker: "2454.TW",
        regularMarketTime: "",
        marketState: "OPEN"
      },
      "2308.TW": {
        price: 160,
        previousCloseChange: "-2.4",
        previousCloseChangePercent: -1.1,
        name: "台達電子",
        ticker: "2308.TW",
        regularMarketTime: "",
        marketState: "OPEN"
      },
      "2303.TW": {
        price: 160,
        previousCloseChange: "-2.4",
        previousCloseChangePercent: -1.1,
        name: "聯華電子",
        ticker: "2303.TW",
        regularMarketTime: "",
        marketState: "OPEN"
      },
    };

    // Return the mock data for the requested ticker, or a default if not found
    const result = mockData[ticker] || { ticker, price: 'N/A', change: 'N/A' };

    return HttpResponse.json({ result });
  }),
  // http.get('/api/checkUpdateInfoAndStats', (req, res, ctx) => {
  //   const holdingLatestInfo = {

  //   }

  //   return HttpResponse.json({
  //     success: true,
  //     content: '還沒到更新時間',
  //     errorMessage: null,
  //     result: { holdingsStats, holdingLatestInfo, hasChecked: true }
  //   });
  // }),
];
