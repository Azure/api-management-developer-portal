set management_endpoint="aztest.management.azure-api.net"
set access_token="SharedAccessSignature 58d58f2efbe665006b030003&201908071836&MXZHgyp+oLWeERDkG9nW2fRu/1fFxjDD2J4z4YiD8jM8Pcv2AkBO6u7KzA72VFzRcDZE5xxbqI98EPh19e/VcA=="
set storage_connection_string="DefaultEndpointsProtocol=https;AccountName=apimgmtstqsv1g2co3t2tto9;AccountKey=AwPPQdUe2DAO+0nXAXk2hzcRAv9gWQfGP3e8Ha2RppKOqhsVKfbE80rjWEIq6t6gLnhBcNmHeSqkFLLCYdKcqw==;EndpointSuffix=core.windows.net"
set data_file="./data.json"
set media_folder="./media"

node ./generate %management_endpoint% %access_token% %data_file%
node ./upload %connection_string% %media_folder%