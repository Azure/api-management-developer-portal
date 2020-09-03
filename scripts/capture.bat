@REM Important: this script is no longer maintained; new scripts are located in the scripts.v2 folder.
@REM Capture the content of an API Management portal into data_file - incl. pages, layouts, configuration, etc. but excluding media files

set management_endpoint="< service name >.management.azure-api.net"
set access_token="SharedAccessSignature ..."
set data_file="../dist/data.json"

node ./capture %management_endpoint% %access_token% %data_file%