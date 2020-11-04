(for /f %%i in ('az account get-access-token --output tsv --query accessToken') do set TOKEN="Bearer %%i")
node dist/publisher/index.js %TOKEN%