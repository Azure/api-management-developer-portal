cd ..
call npm install
cd scripts

set management_endpoint="<service-name>.management.azure-api.net/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/xxxxx/providers/Microsoft.ApiManagement/service/<service-name>"
set access_token="SharedAccessSignature integration&..."
set storage_sas_url="https://portalstorage.blob.core.windows.net/?..."
set storage_connection_string="DefaultEndpointsProtocol=https;AccountName=portalstorage;AccountKey=...;EndpointSuffix=core.windows.net"
set portalUrl="https://portalstorage.../"
set data_file="./data.json"
set media_folder="./media"

node ./cleanup %management_endpoint% %access_token% %storage_connection_string%
node ./configure %management_endpoint% %access_token% %storage_sas_url% %storage_connection_string%
node ./generate %management_endpoint% %access_token% %data_file%
node ./upload %storage_connection_string% %media_folder%

cd ..
call npm run publish
call az storage blob upload-batch --source dist/website --destination $web --connection-string %storage_connection_string%
explorer %portalUrl%