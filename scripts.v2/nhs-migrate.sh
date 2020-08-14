#!/bin/bash

if [ "$#" -ne 4 ]; then
    echo "Usage: $0 sourceInstance sourceKey destinationInstance desinationKey"
fi

# function for creating SAS tokens in the format needed by API Management
_apim_sas_token () {
  local EXPIRY=$(date --utc -d "+1 day" +%Y-%m-%dT%H:%M:00.0000000Z )
  local EXPIRY_SHORT=$(date --utc -d "$EXPIRY" +%Y%m%d%H%M)
  local SIGNATURE=$(printf "%s\n%s" integration $EXPIRY | openssl sha512 -hmac $1 -binary  | base64 -w 0)
  local APIM_SAS_TOKEN="SharedAccessSignature integration&$EXPIRY_SHORT&$SIGNATURE"  
  echo $APIM_SAS_TOKEN
}

DEV_SAS=$(_apim_sas_token "$2")
PROD_SAS=$(_apim_sas_token "$4")


node migrate.js \
    --sourceEndpoint  "$1.management.azure-api.net" \
    --sourceToken "$DEV_SAS" \
    --destEndpoint  "$3.management.azure-api.net" \
    --destToken "$PROD_SAS"