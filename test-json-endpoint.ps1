# Test the new /generate-certificate-json endpoint
# This script tests the JSON endpoint for ICA integration

$url = "http://localhost:3000/generate-certificate-json"
$body = @{
    name = "Sudip Roy Choudhury"
    date = "2026-04-11"
    purpose = "AHM Meeting"
} | ConvertTo-Json

Write-Host "Testing /generate-certificate-json endpoint..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host "Request Body:" -ForegroundColor Yellow
Write-Host $body -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host "Success: $($response.success)" -ForegroundColor Green
    Write-Host "Certificate Size: $($response.certificate.size) bytes" -ForegroundColor Cyan
    Write-Host "Content Type: $($response.certificate.contentType)" -ForegroundColor Cyan
    Write-Host "Filename: $($response.certificate.filename)" -ForegroundColor Cyan
    Write-Host "Generated At: $($response.metadata.generatedAt)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Base64 Image (first 100 chars):" -ForegroundColor Yellow
    Write-Host $response.certificate.image.Substring(0, [Math]::Min(100, $response.certificate.image.Length)) -ForegroundColor Gray
    Write-Host "..." -ForegroundColor Gray
    
} catch {
    Write-Host "Error!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
}

# Made with Bob
