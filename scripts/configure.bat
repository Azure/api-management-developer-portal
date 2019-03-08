cd ..
call npm install
cd scripts

set apimService="portal-preview"
set apimSasAccessToken="SharedAccessSignature integration&..."
set storageSasUrl="https://portalpreviewstorage.blob.core.windows.net/?..."
set storageConnectionString="DefaultEndpointsProtocol=https;AccountName=portalpreview..."
set portalUrl="https://portalpreview..."

node ./cleanup %apimService% %apimSasAccessToken%
node ./configure %apimService% %apimSasAccessToken% %storageSasUrl% %storageConnectionString%
node ./generate %apimService% %apimSasAccessToken%
node ./upload %storageConnectionString%

cd ..
call npm run publish
az storage blob upload-batch --source dist/website --destination $web --connection-string %storageConnectionString%
explorer %portalUrl%