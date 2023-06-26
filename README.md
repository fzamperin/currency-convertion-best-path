# Currency Conversion Project

This project is a currency conversion tool that reads data from two CSV files and performs currency conversion based on the exchange rates provided. It is implemented in Node.js.

## Installation

To use this project, follow these steps:

1. Clone the repository:

```bash
   git clone https://github.com/your-username/currency-conversion.git
```

2. Install the dependencies using npm:

```bash
   npm install
```

3. Copy .env.example into .env, and change anyway you like.

## Usage

1. Ensure you have the CSV file is in the project directory. The files required are:

   - currency-conversion-example-input.json: Contains the exchange rates between different currencies.

   You can replace these files with your own.

2. Run the command below:

```bash
   npm run start
```

4. The output will be a csv containing all possible paths from the currency chosen as initial and all the other currencies.

## License

This project is licensed under the MIT License.
