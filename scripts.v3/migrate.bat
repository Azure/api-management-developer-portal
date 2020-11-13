@REM This script automates content migration between developer portal instances.
@REM Make sure you're logged-in with `az login` command before running the script.

node ./migrate ^
--sourceSubscriptionId "< your subscription ID >" ^
--sourceResourceGroupName "< your resource group name >" ^
--sourceServiceName "< your service name >" ^
--destSubscriptionId "< your subscription ID >" ^
--destResourceGroupName "< your resource group name >" ^
--destServiceName "< your service name >"
