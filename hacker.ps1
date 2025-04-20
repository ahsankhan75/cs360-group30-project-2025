# --- Configuration ---
# !!! CHANGE THESE TWO VARIABLES !!!
$SourceProjectDir = "D:\LUMS\Sem6\CS360\REPOSITORY"  # Replace with the actual path to your project folder
$OutputTxtDir     = "D:\LUMS\Sem6\CS360\Repo_HACK"      # Replace with the desired path for the output .txt files folder



# --- Safety Check ---
if (-not (Test-Path -Path $SourceProjectDir -PathType Container)) {
    Write-Error "Error: Source directory '$SourceProjectDir' not found. Please edit the script and set the `$SourceProjectDir variable correctly."
    exit 1
}

# Resolve full paths for robust comparison and path manipulation
try {
    $resolvedSource = (Resolve-Path $SourceProjectDir).Path
    # Create output dir first so Resolve-Path doesn't fail if it doesn't exist
    if (-not (Test-Path -Path $OutputTxtDir -PathType Container)) {
        New-Item -ItemType Directory -Path $OutputTxtDir -Force | Out-Null
    }
    $resolvedOutput = (Resolve-Path $OutputTxtDir).Path
} catch {
    Write-Error "Error: Could not resolve source or create/resolve output directory. Source: '$SourceProjectDir', Output: '$OutputTxtDir'. Error: $($_.Exception.Message)"
    exit 1
}

# Ensure source path ends with a separator for accurate StartsWith/Substring
$sourcePrefix = $resolvedSource
if (-not $sourcePrefix.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
    $sourcePrefix += [System.IO.Path]::DirectorySeparatorChar
}

# Check if output is same as or inside source
if ($resolvedSource -eq $resolvedOutput -or $resolvedOutput.StartsWith($sourcePrefix)) {
    Write-Error "Error: Output directory '$resolvedOutput' cannot be the same as or inside the source directory '$resolvedSource'."
    exit 1
}

Write-Host "Outputting .txt files to: $resolvedOutput"

# --- Define Excluded Extensions ---
$ExcludedExtensions = @(".png", ".json") # Case-insensitive by default in PowerShell comparisons

# --- Find and Convert Files ---
Write-Host "Starting conversion (excluding node_modules, .git, $($ExcludedExtensions -join ', '))..."

Get-ChildItem -Path $resolvedSource -Recurse -File | ForEach-Object {
    $file = $_
    $fullFilePath = $file.FullName

    # Check 1: File Extension Exclusion
    if ($ExcludedExtensions -contains $file.Extension) {
        # Write-Host "Skipping by extension: $fullFilePath" # Uncomment for debugging
        return # Skips to the next file in the loop
    }

    # Check 2: Directory Exclusion (node_modules, .git)
    $isInExcludedDir = $false
    $currentPath = $file.DirectoryName
    while ($currentPath -ne $null -and $currentPath.Length -ge $resolvedSource.Length -and $currentPath.StartsWith($resolvedSource)) {
        $dirName = Split-Path -Path $currentPath -Leaf
        if ($dirName -eq "node_modules" -or $dirName -eq ".git") {
            $isInExcludedDir = $true
            # Write-Host "Skipping excluded dir: $fullFilePath" # Uncomment for debugging excludes
            break
        }
        $parentPath = Split-Path -Path $currentPath -Parent
        # Break if parent is the same as current (avoids infinite loop at root like C:\)
        if ($parentPath -eq $currentPath) { break }
        $currentPath = $parentPath
    }

    # If not in an excluded directory, process the file
    if (-not $isInExcludedDir) {

        # Calculate relative path (remove the source prefix)
        $relativePath = $fullFilePath.Substring($sourcePrefix.Length)

        # Create safe filename by replacing directory separators (\ or /) with underscore
        $safeFileName = $relativePath -replace "[\\/]", "_"

        # Define the destination path for the .txt file
        $destinationTxtFile = Join-Path -Path $resolvedOutput -ChildPath "${safeFileName}.txt"

        try {
            # 1. Write the original absolute path as the first line (overwrite/create file)
            Set-Content -Path $destinationTxtFile -Value $fullFilePath -NoNewline

            # 2. Append the original file content (using -Raw for efficiency and line ending preservation)
            #    Add a newline *before* appending content only if the original file isn't empty
            if ($file.Length -gt 0) {
                Add-Content -Path $destinationTxtFile -Value ([System.Environment]::NewLine) # Use environment's newline
                # Read all bytes and write using the default encoding, handles different file types better
                $bytes = [System.IO.File]::ReadAllBytes($fullFilePath)
                [System.IO.File]::AppendAllText($destinationTxtFile, ([System.Text.Encoding]::Default.GetString($bytes)), [System.Text.Encoding]::Default)

                # Alternative using PowerShell cmdlets (might change line endings or encoding):
                # Add-Content -Path $destinationTxtFile -Value ([System.Environment]::NewLine)
                # Get-Content -Path $fullFilePath -Raw | Add-Content -Path $destinationTxtFile
            }

            # Optional: uncomment for verbose output
            # Write-Host "Processed '$fullFilePath' -> '$destinationTxtFile'"

        } catch {
            Write-Warning "Warning: Failed to process '$fullFilePath' -> '$destinationTxtFile'. Error: $($_.Exception.Message)"
        }
    } # End if (-not $isInExcludedDir)
} # End ForEach-Object

Write-Host "Conversion complete."
exit 0