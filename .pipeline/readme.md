# Create your pipeline
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
| sourceSubscriptionId | Source APIM service resource subscription ID |
| sourceResourceGroupName | Source APIM service resource group name |
| sourceServiceName | Source APIM service name |
| destServiceName | Destination APIM service name |
| destSubscriptionId | Destination APIM service resource subscription ID |
| destResourceGroupName | Destination APIM service resource group name |
| sourceTenantId | Source Azure tenant ID  |
| sourceServicePrincipal | Source Azure service principal |
| sourceServicePrincipalSecret | Source Azure service principal secret |
| destTenantId | Destination Azure tenant ID |
| destServicePrincipal | Destination Azure service principal|
| destServicePrincipalSecret | Destination Azure service principal secret |
| existingEnvUrls | Existing environment URLs (URLs used in the developer portal from source APIM to replace, if we have multiple urls then comma separated values to be given.) |
| destEnvUrls | Destination environment urls (urls used in the developer portal from destination APIM to be replaced with - if we have multiple urls then comma separated values to be given in same order of source.) |