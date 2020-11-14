@REM Delete the content (incl. pages, media files, configuration, etc.) of API Management developer portal.
@REM Make sure you're logged-in with `az login` command before running the script.

node ./cleanup ^
--subscriptionId "< your subscription ID >" ^
--resourceGroupName "< your resource group name >" ^
--serviceName "< your service name >"
