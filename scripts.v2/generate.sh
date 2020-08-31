# Generate and provision default content of an API Management portal - incl. pages, layouts, configuration, media files, etc.

export management_endpoint="< service name >.management.azure-api.net"
export access_token="SharedAccessSignature ..."
export source_folder="../dist/snapshot"

# make sure to double quote the $access_token variable so it handles the space correctly
node ./generate $management_endpoint "$access_token" $data_file