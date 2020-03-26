const { generateConfig } = require('./generate-config');
const { generateStatistics } = require('./generate-statistics');
const { printStatistics, printCsv } = require('./utils');
const config = require('./config/config.json');
const output = require('./output.json');
const { log } = console;

// Main entry point for the application
const main = async () => {
  const key = process.argv.slice(2)[0];
  switch (key) {
    case '-g':
    case '--generateConfig':
      generateConfig();
      break;
    case '-c':
    case '--createStatistics':
      generateStatistics(config);
      break;
    case '-ps':
    case '--printStatistics':
      printStatistics(config, output);
      break;
    case '-csv':
      printCsv(config, output);
      break;
    case '-h':
    case '--help':
      printHelp();
      break;
    default:
      log('Please enter a valid flag. Try --help for more details');
  }
};

// Prints help
const printHelp = () => {
  log('');
  log('This tool was designed to automatically generate statistics regarding the amount of code merged into master for specific repositories.');
  log('These are the available commands:');
  log('');
  log('   -g  ||  --generateConfig      Generate a new configuration file.');
  log('   -c  ||  --createStatistics    Outputs a JSON file with relevant statistics.');
  log('   -ps ||  --printStatistics     Prints the statistics file to the console.');
  log('   -h  ||  --help                Prints help information.');
  log('');
};

main();
