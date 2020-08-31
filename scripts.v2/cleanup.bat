@REM Delete the content of an API Management portal - incl. pages, layouts, configuration, media files, etc.

set management_endpoint="< service name >.management.azure-api.net"
set access_token="SharedAccessSignature ..."

node ./cleanup %management_endpoint% %access_token%