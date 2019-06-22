set source_management_endpoint="< source service name >.management.azure-api.net"
set source_access_token="SharedAccessSignature ..."
set source_storage_connection_string="DefaultEndpointsProtocol=..."
set target_management_endpoint="< target service name >.management.azure-api.net"
set target_access_token="SharedAccessSignature ..."
set target_storage_connection_string="DefaultEndpointsProtocol=..."
set data_file="../dist/data.json"
set media_folder="../dist/media"


node ./capture %source_management_endpoint% %source_access_token% %data_file%
node ./cleanup %target_management_endpoint% %target_access_token% %target_storage_connection_string%
node ./generate %target_management_endpoint% %target_access_token% %data_file%
node ./download %source_storage_connection_string% %media_folder%
node ./upload %target_storage_connection_string% %media_folder%