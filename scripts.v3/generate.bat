@REM Generate content (incl. pages, media files, configuration, etc.) of API Management developer portal from ./dist/snapshot folder.
@REM Make sure you're logged-in with `az login` command before running the script.

node ./generate ^
--subscriptionId "< your subscription ID >" ^
--resourceGroupName "< your resource group name >" ^
--serviceName "< your service name >"
