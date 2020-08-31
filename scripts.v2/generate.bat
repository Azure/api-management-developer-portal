@REM Generate and provision default content of an API Management portal - incl. pages, layouts, configuration, media files, etc.

set management_endpoint="< service name >.management.azure-api.net"
set access_token="SharedAccessSignature ..."
set source_folder="../dist/snapshot"

node ./generate %management_endpoint% %access_token% %source_folder%
