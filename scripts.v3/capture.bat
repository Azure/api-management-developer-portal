@REM Capture the content (incl. pages, media files, configuration, etc.) of API Management developer portal into ./dist/snapshot folder.
@REM @REM Make sure you're logged-in with `az login` command before running the script.

node ./capture ^
--subscriptionId "< your subscription ID >" ^
--resourceGroupName "< your resource group name >" ^
--serviceName "< your service name >"
