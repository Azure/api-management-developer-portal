@REM This script automates content migration between developer portal instances.

node ./migrate ^
--sourceEndpoint "<name.management.azure-api.net>" ^
--sourceToken "<token>" ^
--destEndpoint "<name.management.azure-api.net>" ^
--destToken "<token>" ^
--publishEndpoint "<name.developer.azure-api.net>"
