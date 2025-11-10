try {
    $status = $null
    $headers = $null
    $json = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/' -Method GET -Headers @{ Accept = 'application/json' } -TimeoutSec 5 -StatusCodeVariable status -ResponseHeadersVariable headers -ErrorAction Stop
    
    if ($status -lt 200 -or $status -ge 300) {
        throw "HTTP $status"
    }
    
    $eps = $json.endpoints
    if ($null -eq $eps) {
        Write-Output "已連線，但回應中沒有 'endpoints' 欄位。"
        return
    }
    
    Write-Output "可用的 API 端點:"
    if ($eps -is [pscustomobject]) {
        $eps.PSObject.Properties | ForEach-Object {
            Write-Output (" - {0}: {1}" -f $_.Name, $_.Value)
        }
    } else {
        $eps | ForEach-Object {
            Write-Output (" - {0}" -f $_)
        }
    }
} catch {
    Write-Error ("請求失敗：{0}" -f $_.Exception.Message)
}



