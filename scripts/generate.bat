set management_endpoint="< service name >.management.azure-api.net"
set access_token="SharedAccessSignature ..."
set connection_string="DefaultEndpointsProtocol=..."
set data_file="./data.json"

node ./generate %management_endpoint% %access_token% %data_file%