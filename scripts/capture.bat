@REM Capture the content of an API Management portal into data_file - incl. pages, layouts, configuration, etc. but excluding media files

set management_endpoint="alzaslondemo.management.azure-api.net"
set access_token="SharedAccessSignature 1&201911010000&UOG+c02sIEdDDm/sVUvfItFuSHE2Mf9fsoi7rnkhqql/ocKYYMrL8KhEu7DFfhVEi/H11boTh7xR7yJPfAA1Bg=="
set data_file="../dist/data.json"

node ./capture %management_endpoint% %access_token% %data_file%