@REM Generate and provision default content of an API Management portal - incl. pages, layouts, configuration, media files, etc.

set management_endpoint="devportal-lrp.management.azure-api.net"
set access_token="SharedAccessSignature integration&201911141734&iHKIsRvVAIlWU/WqhTgZBAjXmJWhuugpNnl/5DxcvKe+J7UxmwQ0R8PqqxEjdxu2iBVjlHqlFd6NCsz+PKdPYg=="
set storage_connection_string="DefaultEndpointsProtocol=https;AccountName=devportaldb;AccountKey=a+GBwxUcDQwlS9E915NQfhBGkv5YcWehoIyGx5JXu+800RaKAdxPiGRKPhVEByzVoe3CI1KW539JEyOI1Dn2cg==;EndpointSuffix=core.windows.net"
set data_file="./data.json"
set media_folder="./content"

node ./generate %management_endpoint% %access_token% %data_file%
node ./upload %storage_connection_string% %media_folder%