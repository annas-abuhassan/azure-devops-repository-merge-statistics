const inquirer = require('inquirer');
const axios = require('axios');
const chalk = require('chalk');
require('dotenv').config();
const {
  sortByName,
  createBaseUrl,
  createCredentials,
  saveJsonToFile
} = require('./utils');

const { AZURE_ORG, AZURE_KEY } = process.env;
const baseUrl = createBaseUrl(AZURE_ORG);
const credentials = createCredentials(AZURE_KEY);
inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));

// Gets a list of team members associated with a team
const getTeamMembers = ({ projectId, id }) => axios
  .get(`${baseUrl}/projects/${projectId}/teams/${id}/members?api-version=5.1`, credentials)
  .then(({ data }) => data.value.map(({ identity: { displayName, id } }) => ({
    name: displayName,
    value: {
      displayName,
      id,
    },
  })));

// Gets teams associated with the organisation
const getTeamList = () => axios
  .get(`${baseUrl}/teams?api-version=5.1-preview.3`, credentials)
  .then(({ data }) => data.value.map(({ name, id, projectId }) => ({
    name,
    value: { name, id, projectId },
  })));

// Prompts the user to select their team
const selectTeam = teamList => inquirer
  .prompt([
    {
      type: 'list',
      name: 'team',
      message:
        'Select a team which has members for which you want their pull request history',
      choices: teamList,
    },
  ])
  .then(({ team }) => team);

// Get repositories associated with the organisation
const getRepositories = () => axios
  .get(`${baseUrl}/git/repositories?api-version=5.1`, credentials)
  .then(({ status, data }) => {
    switch (status) {
      case 200:
      case 201: {
        return data.value.map(repo => ({
          name: repo.name,
          value: { name: repo.name, id: repo.id }
        }))
          .sort(sortByName);
      }
      case 203:
        console.log(chalk`{red Error}: Incorrect or expired Personal Access Token`);
        return [];
      default:
        console.log(chalk`API response {yellow ${status}}, not sure what has happened here.`);
        return [];
    }
  })
  .catch(err => console.log(err.response));


// Prompt the user to select repositories they are interested in
const selectRepositories = (repositories, previousValues) => inquirer
  .prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Which repositories do you want pull request history for?',
      choices: repositories.map(({ name, value: { id } }) => ({ name, value: id })),
      default: previousValues.map(({ id }) => id),
      validate(input) {
        if (input.length) {
          return true;
        }
        return false;
      }
    },
  ])
  .then(({ selected }) => {
    return repositories.filter(repo => selected.includes(repo.value.id)).map(repo => repo.value);
  });

// Prompts the user to set a custom date
const setCustomDate = () => inquirer
  .prompt([
    {
      type: 'datetime',
      name: 'dt',
      message: 'From which date would you like pull request history for?',
    },
  ])
  .then(({ dt }) => dt);

// Prompt the user to select a date
const selectStartDate = () => inquirer
  .prompt(
    {
      type: 'list',
      name: 'date',
      message: 'From which date would you like pull request history for?',
      choices: [{ name: 'Today', value: new Date() }, { name: 'Last two weeks', value: new Date(Date.now() - 12096e5) }, { name: 'Custom' }],
    }
  )
  .then(async ({ date }) => {
    if (date !== 'Custom') {
      return new Date(date.setHours(0, 0, 0, 0));
    }

    const customDate = await setCustomDate();
    return customDate;
  });

// Prompts the user to select team members for pull request history
const selectTeamMembers = (teamMembers, previousValues) => inquirer
  .prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: '(Optional) Select team members that you want to include in the pull request history',
      choices: teamMembers.map(({ name, value: { id } }) => ({ name, value: id })),
      default: previousValues.map(({ id }) => id),
    }])
  .then(({ selected }) => {
    return teamMembers.filter(member => {
      return selected.includes(member.value.id);
    }).map(member => member.value);
  });

// Generates a new config
const generateConfig = async () => {
  const config = {};
  const repositories = await getRepositories();
  const teamList = await getTeamList();

  config.repositories = await selectRepositories(repositories, []);
  config.targetRefName = 'refs/heads/master';

  config.team = await selectTeam(teamList);
  config.projectId = config.team.projectId;
  const teamMembers = await getTeamMembers(config.team);
  const selectedTeamMembers = await selectTeamMembers(teamMembers, []);
  config.selectedTeamMembers = selectedTeamMembers;
  config.startDate = await selectStartDate();
  saveJsonToFile(config, 'config/config.json');
};

module.exports = {
  generateConfig,
};
