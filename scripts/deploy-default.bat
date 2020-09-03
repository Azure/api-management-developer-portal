@REM Important: this script is no longer maintained; new scripts are located in the scripts.v2 folder.
@REM Reprovision an existing API Management portal deployment - clean all the content, autogenerate new content, upload it, publish the portal, and host it

cd ..
call npm install
cd scripts

set apimServiceName="<service-name>"
set management_endpoint="<service-name>.management.azure-api.net/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/xxxxx/providers/Microsoft.ApiManagement/service/<service-name>"
set access_token="SharedAccessSignature integration&..."
set storage_sas_url="https://portalstorage.blob.core.windows.net/?..."
set storage_connection_string="DefaultEndpointsProtocol=https;AccountName=portalstorage;AccountKey=...;EndpointSuffix=core.windows.net"
set portalUrl="https://portalstorage.../"
set backendUrl="https://<service-name>.developer.azure-api.net"

set data_file="./data.json"
set media_folder="./media"

node ./cleanup %management_endpoint% %access_token% %storage_connection_string%
node ./configure %management_endpoint% %access_token% %storage_sas_url% %storage_connection_string% %backendUrl% %apimServiceName%
node ./generate %management_endpoint% %access_token% %data_file%
node ./upload %storage_connection_string% %media_folder%

cd ..

@REM Run the publishing step and upload the generated portal to a Storage Account for hosting 

call npm run publish
call az storage blob upload-batch --source dist/website --destination $web --connection-string %storage_connection_string%
explorer %portalUrl%
