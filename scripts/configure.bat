set apimService = "apim-service-name";
set apimSasAccessToken = "SharedAccessSignature ...";
set storageSasUrl = "https://<account>.blob.core.windows.net?st=...";
set storageConnectionString = "DefaultEndpointsProtocol=...";

node ./cleanup %apimService% %apimSasAccessToken%
node ./configure %apimService% %apimSasAccessToken% %storageSasUrl% %storageConnectionString%
node ./generate %apimService% %apimSasAccessToken%
node ./upload %storageConnectionString%
npm run publish
az storage blob upload-batch --source dist/website --destination $web --connection-string %storageConnectionString%