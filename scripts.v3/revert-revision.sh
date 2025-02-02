# This script automates reverting the editor from a published developer portal revision. 
node ./revert-revision \
--subscriptionId "< your subscription ID >" \
--resourceGroupName "< your resource group name >" \
--serviceName "< your service name >"
--snapshotPath "< path to snapshot json file >"
