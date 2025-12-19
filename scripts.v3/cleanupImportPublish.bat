@REM Make sure you're logged-in with `az login` command before running the script.
@REM This 'cleanupImportPublish' wrapper script uses the shared 'cleanup', and generate' functionality to perform the cleanup, import and publish operation.

@REM Delete the content (incl. pages, media files, configuration, etc.) of API Management developer portal.

node ./cleanup ^
--subscriptionId "< your destination subscription ID >" ^
--resourceGroupName "< your destination resource group name >" ^
--serviceName "< your destination service name >" ^
--servicePrincipal "< your destination Service Principal >" ^
--servicePrincipalSecret "< your destination Service Principal Secret >"

@REM Generate content (incl. pages, media files, configuration, etc.) of API Management developer portal from ./dist/snapshot folder and publish it.

node ./generate ^
--subscriptionId "< your destination subscription ID >" ^
--resourceGroupName "< your destination resource group name >" ^
--serviceName "< your destination service name >" ^
--servicePrincipal "< your destination Service Principal >" ^
--servicePrincipalSecret "< your destination Service Principal Secret >" ^
--publish "< your publish option >"
