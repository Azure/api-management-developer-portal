# Generate and provision default content of an API Management portal - incl. pages, layouts, configuration, media files, etc.
# Make sure you're logged-in with `az login` command before running the script.

node ./generate \
--subscriptionId "< your subscription ID >" \
--resourceGroupName "< your resource group name >" \
--serviceName "< your service name >"
