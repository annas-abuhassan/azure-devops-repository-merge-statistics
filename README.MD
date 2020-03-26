## Getting Started

### Prerequisites

This tool runs on **Node.js** and requires the following packages:

- [axios](https://www.npmjs.com/package/axios)
- [inquirer](https://www.npmjs.com/package/inquirer)
- [chalk](https://www.npmjs.com/package/chalk)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [fs](https://www.npmjs.com/package/fs)

### Steps
1. Clone this repository:

    ```
    git clone https://github.com/annas-abuhassan/azure-devops-repository-merge-statistics
    ```

2. Change directories into the cloned repo

    ```
    cd azure-devops-repository-merge-statistics
    ```

3. Install all package dependencies:
    
    ```
    npm install
    ```

4. Create a .env file in the root of the repository     
    **Git Bash**:
    ```
    touch .env
    ```

    **Power Shell**:
    ```
    New-Item  -Name ".env"
    ```
    
    **cmd**:
    ```
    type nul > .env
    ```
5. Generate a Personal Access Token (PAT) with full access for Azure Devops Authentication: 

    [Link to docs](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops)

6. Open .env in a text editor and enter the Organisation name and PAT for which you want this tool to work with
    ```
    AZURE_ORG=YourOrganisationNameHere
    AZURE_KEY=YourPersonalAccessTokenHere
    ```

7. Before any statistics can be created, you must create a config:

    ```
    node index -g
    ```

8. Once a config has been created, you can create create statistics:
    
    ```
    node index -c
    ```

9. A list of the available commands can be found below or by running

    ```
    node index -h
    ```

    ```
   -g  ||  --generateConfig      Generate a new configuration file.
   -c  ||  --createStatistics    Outputs a JSON file with relevant statistics.
   -ps ||  --printStatistics     Prints the statistics file to the console.
   -h  ||  --help                Prints help information.
    ```