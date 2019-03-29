cd ..
call npm install
cd scripts

set apimService="apim-instance"
set apimSasAccessToken="SharedAccessSignature integration&..."
set storageSasUrl="https://portalstorage.blob.core.windows.net/?..."
set storageConnectionString="DefaultEndpointsProtocol=https;AccountName=portalstorage;AccountKey=...;EndpointSuffix=core.windows.net"
set portalUrl="https://portalstorage.../"

node ./cleanup %apimService% %apimSasAccessToken%
node ./configure %apimService% %apimSasAccessToken% %storageSasUrl% %storageConnectionString%
node ./generate %apimService% %apimSasAccessToken%
node ./upload %storageConnectionString%

cd ..
call npm run publish
call az storage blob upload-batch --source dist/website --destination $web --connection-string %storageConnectionString%
explorer %portalUrl%