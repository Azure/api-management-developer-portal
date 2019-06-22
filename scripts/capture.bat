set management_endpoint="< service name >.management.azure-api.net"
set access_token="SharedAccessSignature ..."
set data_file="../dist/data.json"

node ./capture %management_endpoint% %access_token% %data_file%