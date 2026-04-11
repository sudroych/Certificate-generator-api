# Test script for IBM Certificate Generator API

Write-Host "Testing IBM Certificate Generator API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "   Status: $($healthData.status)" -ForegroundColor Green
    Write-Host "   Version: $($healthData.version)" -ForegroundColor Green
    Write-Host "   Service: $($healthData.service)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Root Endpoint
Write-Host "2. Testing Root Endpoint..." -ForegroundColor Yellow
try {
    $rootResponse = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing
    $rootData = $rootResponse.Content | ConvertFrom-Json
    Write-Host "   Message: $($rootData.message)" -ForegroundColor Green
    Write-Host "   Version: $($rootData.version)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Generate Certificate
Write-Host "3. Testing Certificate Generation..." -ForegroundColor Yellow
try {
    $body = @{
        name = "John Doe"
        date = "2026-04-11"
        purpose = "Completion of Advanced Node.js Course"
    } | ConvertTo-Json

    $certResponse = Invoke-WebRequest -Uri "http://localhost:3000/generate-certificate" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing `
        -OutFile "test-certificate.png"
    
    Write-Host "   Certificate generated successfully!" -ForegroundColor Green
    Write-Host "   Saved to: test-certificate.png" -ForegroundColor Green
    Write-Host "   File size: $((Get-Item test-certificate.png).Length) bytes" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Validation Error Test
Write-Host "4. Testing Validation (should fail)..." -ForegroundColor Yellow
try {
    $invalidBody = @{
        name = ""
        date = "invalid-date"
        purpose = "Too short"
    } | ConvertTo-Json

    $validationResponse = Invoke-WebRequest -Uri "http://localhost:3000/generate-certificate" `
        -Method POST `
        -Body $invalidBody `
        -ContentType "application/json" `
        -UseBasicParsing
    
    Write-Host "   Unexpected success" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   Validation working correctly!" -ForegroundColor Green
    Write-Host "   Error code: $($errorResponse.error.code)" -ForegroundColor Green
    Write-Host "   Details: $($errorResponse.error.details -join ', ')" -ForegroundColor Green
}
Write-Host ""

Write-Host "Testing complete!" -ForegroundColor Cyan

# Made with Bob
