@REM Migrate the content of an API Management portal from one service instance to another - incl. pages, layouts, configuration, media files, etc.

set source_management_endpoint="< source service name >.management.azure-api.net"
set source_access_token="SharedAccessSignature ..."
set source_storage_connection_string="DefaultEndpointsProtocol=..."

set target_management_endpoint="< target service name >.management.azure-api.net"
set target_access_token="SharedAccessSignature ..."
set target_storage_connection_string="DefaultEndpointsProtocol=..."

set data_file="../dist/data.json"
set media_folder="../dist/content"

@REM Capture the content of the source portal (excl. media)
node ./capture %source_management_endpoint% %source_access_token% %data_file%

@REM Remove all the content of the target portal (incl. media)
node ./cleanup %target_management_endpoint% %target_access_token% %target_storage_connection_string%

@REM Upload the content of the source portal (excl. media)
node ./generate %target_management_endpoint% %target_access_token% %data_file%

@REM Download the media files from the source portal
node ./download %source_storage_connection_string% %media_folder%

@REM Upload the media files to the target portal
node ./upload %target_storage_connection_string% %media_folder%