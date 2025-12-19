@REM Make sure you're logged-in with `az login` command before running the script.
@REM Capture the content (incl. pages, media files, configuration, etc.) of API Management developer portal into ./dist/snapshot folder.
@REM This 'export' wrapper script uses the shared 'capture' functionality to perform the export operation.

node ./capture ^
--subscriptionId "< your source subscription ID >" ^
--resourceGroupName "< your source resource group name >" ^
--serviceName "< your source service name >" ^
--servicePrincipal "< your source Service Principal >" ^
--servicePrincipalSecret "< your source Service Principal Secret >"
