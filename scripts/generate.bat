set management_endpoint="< service name >.management.azure-api.net"
set access_token="SharedAccessSignature ..."
set connection_string="DefaultEndpointsProtocol=..."

node ./generate %management_endpoint% %access_token%
