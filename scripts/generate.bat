set service_name="service name"
set access_token="SharedAccessSignature ..."
set connection_string="DefaultEndpointsProtocol=..."

node ./generate %service_name% %access_token%
node ./upload %connection_string%