set source_management_endpoint="< source service name >.management.azure-api.net"
set source_access_token="SharedAccessSignature ..."
set source_connection_string="DefaultEndpointsProtocol=..."
set target_management_endpoint="< target service name >.management.azure-api.net"
set target_access_token="SharedAccessSignature ..."
set target_connection_string="DefaultEndpointsProtocol=..."
set data_file="../dist/data.json"


node ./capture %source_management_endpoint% %source_access_token% %data_file%
node ./cleanup %target_management_endpoint% %target_access_token% %target_connection_string%
node ./generate %target_management_endpoint% %target_access_token% %data_file%