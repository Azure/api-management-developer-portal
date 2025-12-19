@REM This script automates content migration between developer portal instances.
@REM Make sure you're logged-in with `az login` command before running the script.

node ./migrate ^
--sourceSubscriptionId "< your source subscription ID >" ^
--sourceResourceGroupName "< your source resource group name >" ^
--sourceServiceName "< your source service name >" ^
--destSubscriptionId "< your destination subscription ID >" ^
--destResourceGroupName "< your destination resource group name >" ^
--destServiceName "< your destination service name >"