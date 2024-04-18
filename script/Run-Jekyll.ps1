Function ContainsBOM
{   
    return $input | where {
        $contents = new-object byte[] 3
        $stream = [System.IO.File]::OpenRead($_.FullName)
        $stream.Read($contents, 0, 3) | Out-Null
        $stream.Close()
        $contents[0] -eq 0xEF -and $contents[1] -eq 0xBB -and $contents[2] -eq 0xBF }
}


Clear-Host;

$docsPath = [System.IO.Path]::GetFullPath("$PSScriptRoot/..");
$sitePath = [System.IO.Path]::GetFullPath("$PSScriptRoot/../_site");

Write-Host "Checking for BOM on markdown files."
$mdFilesWithBOM = get-childitem "$docsPath/*.md" -recurse | where {!$_.PsIsContainer -and $_.Length -gt 2 } | ContainsBOM;
$count = 0;
foreach($file in $mdFilesWithBOM)
{
    $count++;
    Write-Host "$count : Removing BOM from $file";
    $content = Get-Content -Path $file;
    Set-Content -Encoding UTF8NoBOM -Path $file -Value $content
}

Write-Host "Finished removing the BOM from $count files."

Write-Host "& jekyll build --source `"$docsPath`" --destination `"$sitePath`" --verbose;"
& jekyll build --source "$docsPath" --destination "$sitePath" --verbose;

Write-Host "& jekyll serve --source `"$docsPath`" --destination `"$sitePath`" --port $($ENV:JEKYLL_PORT);"
& jekyll serve --source "$docsPath" --destination "$sitePath" --port $ENV:JEKYLL_PORT;