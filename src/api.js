const API_KEY =
  "71b246667933fca92aac58051fd3503a66b028d0ef83d8a8c28d61802f423060";

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

// const tickers = [];
// let currentTicker;

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);
  console.log(JSON.parse(e.data));

  // let fromKOBOtoBTC;
  // let fromBTCtoUSD;

  // if (currency !== "BTC" && currency) {
  //   if (!tickers.find((t) => t === currency)) {
  //     tickers.push(currency);
  //   }
  //   currentTicker = tickers.find((t) => t === currency);
  //   fromKOBOtoBTC = newPrice;
  // }

  // if (currency === "BTC") {
  //   fromBTCtoUSD = newPrice;
  // }

  if (type !== AGGREGATE_INDEX || newPrice === undefined) return;

  const errorStatus = false;

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => {
    fn(newPrice, errorStatus);
  });
});

function sendToWebSocket(message) {
  const stringifyedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifyedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifyedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(tickerName) {
  // if (tickers.length) {
  //   sendToWebSocket({
  //     action: "SubAdd",
  //     subs: [`5~CCCAGG~${tickerName}~BTC`],
  //   });
  // } else {
  //   sendToWebSocket({
  //     action: "SubAdd",
  //     subs: [`5~CCCAGG~${tickerName}~BTC`, `5~CCCAGG~BTC~USD`],
  //   });
  // }
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
}

function unsubscribeFromTickerOnWs(tickerName) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (tickerName) => {
  tickersHandlers.delete(tickerName);
  unsubscribeFromTickerOnWs(tickerName);
};
