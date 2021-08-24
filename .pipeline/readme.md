# Create your Pipeline
In your Azure DevOps project pipelines section select new pipeline.

Select your source code provider and repository in the first two tabs and in the Configure steps above. Scroll down to the bottom of the page and select Existing Azure Pipelines YAML file:

![create-pipeline.PNG](/.pipeline/readme/create-pipeline.png)

Then select the [migrate.yml](/.pipeline/migrate.yml) file you previously added to the repository:

![select-existing.PNG](/.pipeline/readme/select-existing-yaml.png)

In the Review tab, select the Variables button and create the variables with the values defined in the Pipeline parameters table. Make sure you check the Keep this value secret option for sensitive parameters.

![variables.PNG](/.pipeline/readme/variables.png)

Then select Run. This saves and executes your pipeline for the fist time, seen below:

# Appendix: Pipeline Variables

| Variable Name | Value Description  |
|--|--|
| sourceSubscriptionId | your source APIM resource subscription ID |
| sourceResourceGroupName | your source APIM resource group name |
| sourceAPIMName | your source APIM name |
| destinationAPIMName | your destination APIM name |
| destSubscriptionId | your destination APIM resource subscription ID |
| destResourceGroupName | your destination APIM resource group name |
| sourceAzure_Tenant | your source azure tenant id  |
| sourceServicePrincipal | your source azure service principal |
| sourceAzureDevOps-ServicePrincipal-Secret | your source azure service service principal secret |
| Azure_Tenant | destination azure tenant id |
| ServicePrincipal | destination azure service service principal|
| AzureDevOps-ServicePrincipal-Secret |  destination azure service service service principal secret |
| existingEnvUrls | existing environment urls (urls used in the developer portal from source apim to replace - if we have multiple urls then comma separated values to be given.) |
| destEnvUrls | destination environment urls (urls used in the developer portal from destination apim to be replaced with - if we have multiple urls then comma separated values to be given in same order of source.) |