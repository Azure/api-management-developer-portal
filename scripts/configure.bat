cd ..
npm install
cd scripts

set apimService = "portal-preview";
set apimSasAccessToken = "SharedAccessSignature ...";
set storageSasUrl = "https://portalpreviewstorage.blob.core.windows.net/?...";
set storageConnectionString = "DefaultEndpointsProtocol=https;AccountName=portalpreviewstorage;AccountKey...";

node ./cleanup %apimService% %apimSasAccessToken%
node ./configure %apimService% %apimSasAccessToken% %storageSasUrl% %storageConnectionString%
node ./generate %apimService% %apimSasAccessToken%
node ./upload %storageConnectionString%

cd ..
npm run publish
az storage blob upload-batch --source dist/website --destination $web --connection-string %storageConnectionString%