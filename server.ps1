param(
    [int]$Port = 8765
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "Server running at $prefix"
}
catch {
    Write-Host "Error starting listener: $_"
    exit 1
}

$root = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $relPath = $request.Url.LocalPath.TrimStart('/')
        if (-not $relPath) {
            $relPath = 'index.html'
        }

        $filePath = Join-Path $root $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                '.html' { $response.ContentType = 'text/html; charset=utf-8' }
                '.css'  { $response.ContentType = 'text/css; charset=utf-8' }
                '.js'   { $response.ContentType = 'application/javascript; charset=utf-8' }
                '.json' { $response.ContentType = 'application/json; charset=utf-8' }
                '.jpg'  { $response.ContentType = 'image/jpeg' }
                '.jpeg' { $response.ContentType = 'image/jpeg' }
                '.png'  { $response.ContentType = 'image/png' }
                '.svg'  { $response.ContentType = 'image/svg+xml' }
                '.webp' { $response.ContentType = 'image/webp' }
                '.ico'  { $response.ContentType = 'image/x-icon' }
                default { $response.ContentType = 'application/octet-stream' }
            }
            $response.Headers.Add('Access-Control-Allow-Origin', '*')
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        else {
            $response.StatusCode = 404
            $err = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
            $response.OutputStream.Write($err, 0, $err.Length)
        }
        $response.Close()
    }
    catch {
        # continue loop
    }
}
