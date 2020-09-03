# Important: this script is no longer maintained; new scripts are located in the scripts.v2 folder.
# Generate and provision default content of an API Management portal - incl. pages, layouts, configuration, media files, etc.

export management_endpoint="< service name >.management.azure-api.net"
export access_token="SharedAccessSignature ..."
export storage_connection_string="DefaultEndpointsProtocol=..."
export container="content"
export data_file="./data.json"
export media_folder="./media"


# make sure to double quote the $access_token variable so it handles the space correctly
node ./generate $management_endpoint "$access_token" $data_file
node ./upload $storage_connection_string $media_folder $container