param ($HostName = $(throw "HostName parameter is required."))
$Counter = 0
while ($Counter -ne 2 ){
    Start-Sleep -Seconds 4
    $Response = Invoke-WebRequest -Uri $HostName
    if ($Response.StatusCode -eq 200){
        Write-Host "server returned 200"
        exit 0
    }
    $Counter++
}

Write-Error "Server didn't return 200 status"