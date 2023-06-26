require("dotenv").config();
const csv = require("fast-csv");
const { createWriteStream, readFileSync } = require("fs");
const Graph = require("./dijkstra/Graph");
const isoCountries = require("./currencies-country");
const path = require("path");

const initialCurrencyCode = process.env.INITIAL_CURRENCY_CODE;
const startAmountOfInitialCurrency =
  process.env.START_AMOUNT_OF_INITIAL_CURRENCY;
const fileName = process.env.RESULT_FILE_NAME;
const inputPath = path.join(__dirname, process.env.INPUT_FILE_PATH);

(async () => {
  // Gather Results
  const data = JSON.parse(readFileSync(inputPath));

  const setOfCurrencies = new Set();

  // Get all currencies without repetition on set
  data.forEach((exchange) => {
    setOfCurrencies.add(exchange.fromCurrencyCode).add(exchange.toCurrencyCode);
  });

  const graph = generateGraph(setOfCurrencies, data);
  const results = calculatePaths(setOfCurrencies, graph);
  writeToCSV(results);

  console.log(
    `Finished calculating conversions for ${initialCurrencyCode}, amount: ${startAmountOfInitialCurrency}, result file name: ${fileName}`
  );
})();

function calculatePaths(setOfCurrencies, graph) {
  const results = [];
  // Get the logest path for each currency, in order to get the best  conversion
  for (let currencyCode of setOfCurrencies) {
    const { path, cost } = graph.path(initialCurrencyCode, currencyCode, {
      cost: true,
    });
    // Since currencies like NZD, AUD and USD are used in a lot of countries, I can´t just print the right country by the currency
    // If the country can't be found just use the code from the currency
    const countryCurrency = isoCountries.find(
      (isoCountry) => isoCountry.currency_code === currencyCode
    );
    // If way does not exists, then does not count on result
    if (Array.isArray(path)) {
      const obj = {
        currencyCode,
        country: countryCurrency ? countryCurrency.country : currencyCode,
        amount: cost,
        path: path.join(" | "),
      };
      results.push(obj);
    }
  }
  return results;
}

function generateGraph(setOfCurrencies, data) {
  // Instantiate Graph
  const graph = new Graph();

  // Mount Graph with neighbors
  setOfCurrencies.forEach((currencyCode) => {
    // For each currencyCode get All neighbors
    const exchanges = data.filter(
      (data) => data.fromCurrencyCode === currencyCode
    );
    const obj = {};
    exchanges.forEach((exchange) => {
      // Pre-calculate weight (distance) already if initial amount of money
      // In this case CAD 100
      obj[exchange.toCurrencyCode] =
        exchange.exchangeRate * startAmountOfInitialCurrency;
    });
    // For each currencyCode get All neighbors Node
    graph.addNode(currencyCode, obj);
  });

  return graph;
}

function writeToCSV(results) {
  // Create streams for CSV
  const writeStream = createWriteStream(fileName);
  const csvStream = csv.format({ headers: true });

  // Pipe streams from read to write
  csvStream.pipe(writeStream);

  // Iterate from resuts creating csv with headers
  results.forEach((result) => {
    csvStream.write({
      Currency: result.currencyCode,
      Country: result.country,
      Amount: result.amount,
      Path: result.path,
    });
  });

  csvStream.end();
}
