@REM Migrate the content of an API Management portal from one service instance to another - incl. pages, layouts, configuration, media files, etc.

@REM BEGIN: provide all the required parameters. If your portal is self-hosted, use the storage account connection string from the config.design.json file. If your portal is managed, refer to the documentation for instructions on accessing its storage account connection string.
set source_management_endpoint="< source service name >.management.azure-api.net"
set source_access_token="SharedAccessSignature ..."
set source_storage_connection_string="DefaultEndpointsProtocol=..."

set target_management_endpoint="< target service name >.management.azure-api.net"
set target_access_token="SharedAccessSignature ..."
set target_storage_connection_string="DefaultEndpointsProtocol=..."
@REM END: provide all the required parameters.

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

@REM At this point your target API Management service should contain the same content of the portal as the source service. To make the portal of the target service available to visitors, you still need to publish it and, in case of a self-hosted version, host the generated files.