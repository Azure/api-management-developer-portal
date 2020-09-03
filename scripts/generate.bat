@REM Important: this script is no longer maintained; new scripts are located in the scripts.v2 folder.
@REM Generate and provision default content of an API Management portal - incl. pages, layouts, configuration, media files, etc.

set management_endpoint="< service name >.management.azure-api.net"
set access_token="SharedAccessSignature ..."
set storage_connection_string="DefaultEndpointsProtocol=..."
set container="content"
set data_file="./data.json"
set media_folder="./media"

node ./generate %management_endpoint% %access_token% %data_file%
node ./upload %storage_connection_string% %media_folder% %container%
