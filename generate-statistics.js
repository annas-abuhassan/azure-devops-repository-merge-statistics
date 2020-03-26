require('dotenv').config();
const axios = require('axios');
const {
  createCredentials,
  saveJsonToFile
} = require('./utils');

const { AZURE_ORG, AZURE_KEY } = process.env;
const credentials = createCredentials(AZURE_KEY);

// Gets a list of completed pull requests for a specific repository
const getPullRequests = async (repoId, projectId) => {
  const repos = axios
    .get(`https://dev.azure.com/${AZURE_ORG}/${projectId}/_apis/git/repositories/${repoId}/pullrequests?&searchCriteria.targetRefName=refs/heads/master&searchCriteria.status=completed&api-version=5.1`, credentials)
    .then(({ data }) => {
      return data.value.map(({
        pullRequestId,
        title,
        description,
        sourceRefName,
        creationDate,
        closedDate,
        reviewers,
        createdBy
      }) => {
        return {
          pullRequestId,
          createdBy: { displayName: createdBy.displayName, id: createdBy.id },
          reviewers: reviewers.map(reviewer => ({
            displayName: reviewer.displayName,
            id: reviewer.id
          })),
          title,
          description,
          sourceRefName,
          creationDate,
          closedDate
        };
      });
    }).catch(err => console.log(err.response));
  return repos;
};

// Get a list of commits for a specific pull request
const getPullRequestCommits = (repoId, prId, projectId) => axios
  .get(`https://dev.azure.com/${AZURE_ORG}/${projectId}/_apis/git/repositories/${repoId}/pullrequests/${prId}/commits?api-version=5.1`, credentials)
  .then(({ data }) => {
    return data.value.map(({
      commitId, author, committer, comment
    }) => {
      return {
        commitId,
        author: { name: author.name, date: author.date },
        committer: { name: committer.name, date: committer.date },
        comment
      };
    });
  });

// Filter pull request by team member and date
const filterPullRequestsByMemberAndDate = (pullRequests, members, date) => {
  return pullRequests.filter(pr => {
    if (!members.length) {
      return pr.closedDate > date;
    }

    const memberPullRequests = members.filter(teamMember => {
      return teamMember.displayName === pr.createdBy.displayName;
    });

    if (pr.closedDate > date && memberPullRequests.length) {
      return true;
    }
    return false;
  });
};

const generateStatistics = async (config) => {
  const { repositories, selectedTeamMembers, startDate, projectId } = config;
  const statistics = [];
  console.log(`Generating statistics from ${startDate}`);

  await repositories.forEach(async repository => {
    const stats = {
      ...repository
    };
    // Gets all pull requests for repository
    let pullRequests = await getPullRequests(repository.id, projectId);

    // Filter pull request by team member and date
    pullRequests = filterPullRequestsByMemberAndDate(pullRequests, selectedTeamMembers, startDate);
    if (!pullRequests.length) {
      return console.log(`No pull request history for ${repository.name}`);
    }

    // Appends commit history for each pull request
    await Promise.all(pullRequests.map(async pullRequest => {
      pullRequest.commits = await getPullRequestCommits(repository.id, pullRequest.pullRequestId, projectId);
      return pullRequest;
    }));

    stats.pullRequestCount = pullRequests.length;
    stats.pullRequests = pullRequests;
    statistics.push(stats);
    return saveJsonToFile(statistics, 'output.json');
  });
};

module.exports = {
  generateStatistics
};
