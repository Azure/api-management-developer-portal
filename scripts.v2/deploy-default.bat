@REM Reprovision an existing API Management portal deployment - clean all the content, autogenerate new content, upload it, publish the portal, and host it

cd ..
call npm install
cd scripts

set apimServiceName="<service-name>"
set management_endpoint="<service-name>.management.azure-api.net/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/xxxxx/providers/Microsoft.ApiManagement/service/<service-name>"
set access_token="SharedAccessSignature integration&..."
set portalUrl="https://portalstorage.../"
set backendUrl="https://<service-name>.developer.azure-api.net"

set source_folder="../dist/snapshot"

node ./cleanup %management_endpoint% %access_token%
node ./configure %management_endpoint% %access_token% %backendUrl% %apimServiceName%
node ./generate %management_endpoint% %access_token% %source_folder%

cd ..

@REM Run the publishing step and upload the generated portal to a Storage Account for hosting 

call npm run publish
call az storage blob upload-batch --source dist/website --destination $web --connection-string %storage_connection_string%
explorer %portalUrl%
