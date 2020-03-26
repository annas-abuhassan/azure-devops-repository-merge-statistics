const fs = require('fs');
const chalk = require('chalk');

// Creates the base url required for each request
const createBaseUrl = (azureOrg) => `https://dev.azure.com/${azureOrg}/_apis`;

// Creates authorization credentials for each request
const createCredentials = AZURE_KEY => ({
  auth: { username: 'Basic', password: AZURE_KEY },
});

// Saves an array of configs to file
const saveJsonToFile = (config, directory) => {
  const jsonContent = JSON.stringify(config, null, 4);

  fs.writeFile(directory, jsonContent, err => {
    if (err) {
      console.log('An error occured while writing Config to File.');
    } else {
      console.log('File has been saved.');
    }
  });
};

// Sorts objects by name
const sortByName = (a, b) => {
  const nameA = a.name.toUpperCase();
  const nameB = b.name.toUpperCase();

  let comparison = 0;

  if (nameA > nameB) {
    comparison = 1;
  } else if (nameA < nameB) {
    comparison = -1;
  }
  return comparison;
};

const getDateArray = (start) => {
  const arr = [];
  const dt = new Date(start);
  while (dt <= new Date()) {
    arr.push({ date: new Date(dt).toLocaleDateString('en-US') });
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
};

const sortStatisticsByDate = (output, config) => {
  const { startDate } = config;
  const repoStats = [];

  output.forEach(repo => {
    const dateArray = getDateArray(startDate);
    const stats = { name: repo.name, pullRequestCount: 0 };

    dateArray.forEach(date => {
      const pullRequestsByDate = repo.pullRequests.filter(pr => {
        return new Date(pr.closedDate).toLocaleDateString('en-US') === date.date;
      });
      date.pullRequests = pullRequestsByDate;
      date.pullRequestCount = pullRequestsByDate.length;
      stats.pullRequestCount += date.pullRequestCount;
    });
    stats.pullRequestsByDate = dateArray.filter(date => date.pullRequestCount);
    repoStats.push(stats);
  });

  return repoStats;
};

const printStatistics = async (config, output) => {
  const sortedStatistics = sortStatisticsByDate(output, config);
  sortedStatistics.forEach(repo => {
    console.log('');
    console.log('*****************************');
    console.log(chalk`{green Repository name:} {yellow ${repo.name}}`);
    console.log(chalk`{green Number of checkins:} {yellow ${repo.pullRequestCount}}`);
    console.log('*****************************');

    repo.pullRequestsByDate.forEach(date => {
      console.log(chalk`{green Date:} {yellow ${date.date}}`);
      console.log(chalk`{green Number of checkins:} {yellow ${date.pullRequestCount}}`);
      date.pullRequests.forEach(({
        pullRequestId, title, description, createdBy, reviewers
      }) => {
        console.log('----------------------------');
        console.log(chalk`{green Pull Request Id:} {yellow ${pullRequestId}}`);
        console.log(chalk`{green Title: }{yellow ${title}}`);
        console.log(chalk`{green Description: }{yellow ${description}}`);
        console.log(chalk`{green Created By: }{yellow ${createdBy.displayName}}`);
        console.log(chalk`{green Reviewed by: }{yellow ${reviewers.map(x => x.displayName).join(', ')}}`);
        console.log('----------------------------');
      });
    });
  });
};


const sortStatisticsByDate2 = (output, config) => {
  const { startDate } = config;
  const repoStats = [];

  output.forEach(repo => {
    const dateArray = getDateArray(startDate);
    const stats = { name: repo.name, pullRequestCount: 0 };

    dateArray.forEach(date => {
      const pullRequestsByDate = repo.pullRequests.filter(pr => {
        return new Date(pr.closedDate).toLocaleDateString('en-US') === date.date;
      });
      date.pullRequests = pullRequestsByDate;
      date.pullRequestCount = pullRequestsByDate.length;
      stats.pullRequestCount += date.pullRequestCount;
    });
    stats.pullRequestsByDate = dateArray.filter(date => date.pullRequestCount);
    stats.pullRequestsByDate.forEach(date => {
      date.pullRequests.forEach(({
        pullRequestId, title, description, createdBy, reviewers, creationDate, closedDate
      }) => {
        const test = {
          date: date.date,
          pullRequestId,
          repository: repo.name,
          title,
          description,
          createdBy: createdBy.displayName,
          reviewedBy: reviewers.map(x => x.displayName).join(', '),
          creationDate,
          closedDate
        };
        repoStats.push(test);
      });
    });
  });

  return repoStats;
};

const printCsv = async (config, output) => {
  const dailyStatisticsJson = JSON.stringify(sortStatisticsByDate2(output, config));
  console.log(dailyStatisticsJson);
};

module.exports = {
  createBaseUrl,
  createCredentials,
  saveJsonToFile,
  sortByName,
  printStatistics,
  printCsv
};
