@REM Capture the content of an API Management portal into dest_folder - incl. pages, layouts, configuration, etc. but excluding media files

set management_endpoint="< service name >.management.azure-api.net"
set access_token="SharedAccessSignature ..."
set dest_folder="../dist/snapshot"

node ./capture %management_endpoint% %access_token% %dest_folder%