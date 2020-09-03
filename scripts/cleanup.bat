@REM Important: this script is no longer maintained; new scripts are located in the scripts.v2 folder.
@REM Delete the content of an API Management portal - incl. pages, layouts, configuration, media files, etc.

set management_endpoint="< service name >.management.azure-api.net"
set access_token="SharedAccessSignature ..."
set storage_connection_string="DefaultEndpointsProtocol=..."

node ./cleanup %management_endpoint% %access_token% %storage_connection_string%