# EmulatorJS local server for Windows.
# - serves the game page and emulator files
# - reads the ROM / thumbnails / BIOS folders so the page does not have to ask every time
# - folder settings and the LAN switch are saved in config.json next to this script
# - LAN play: lobby (who is playing what) + relays WebRTC connection info; video and inputs go peer to peer
# Only this PC can connect unless "LAN play" is switched on in the page's folder settings.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8765
if ($args.Count -gt 0) { $port = [int]$args[0] }
$prefix = "http://localhost:$port/"
$sep = [IO.Path]::DirectorySeparatorChar
$cfgFile = Join-Path $root 'config.json'
$homeDir = [Environment]::GetFolderPath('UserProfile')
if (-not $homeDir) { $homeDir = $HOME }
$kinds = @('roms', 'thumbs', 'bios')
$allowedHosts = @("localhost:$port", "127.0.0.1:$port")
$utf8 = New-Object Text.UTF8Encoding $false

# ---------------- JSON (works the same on PowerShell 5.1 and 7) ----------------
function J($v) {
  if ($null -eq $v) { return 'null' }
  if ($v -is [bool]) { if ($v) { return 'true' } else { return 'false' } }
  if ($v -is [int] -or $v -is [long] -or $v -is [double] -or $v -is [decimal]) { return [string]$v }
  if ($v -is [string] -or $v -is [char]) {
    $s = ([string]$v).Replace('\', '\\').Replace('"', '\"')
    $s = [regex]::Replace($s, '[\x00-\x1f]', { param($m) '\u{0:x4}' -f [int][char]$m.Value })
    return '"' + $s + '"'
  }
  if ($v -is [System.Collections.IDictionary]) {
    $parts = foreach ($k in $v.Keys) { (J ([string]$k)) + ':' + (J $v[$k]) }
    return '{' + ($parts -join ',') + '}'
  }
  if ($v -is [System.Collections.IEnumerable]) {
    $parts = foreach ($x in $v) { J $x }
    return '[' + ($parts -join ',') + ']'
  }
  if ($v -is [System.Management.Automation.PSCustomObject]) {
    $parts = foreach ($p in $v.PSObject.Properties) { (J ([string]$p.Name)) + ':' + (J $p.Value) }
    return '{' + ($parts -join ',') + '}'
  }
  return J ([string]$v)
}

# ---------------- folder settings ----------------
function RetroArchDirs {
  $out = @()
  foreach ($e in @($env:APPDATA, $env:USERPROFILE)) { if ($e) { $out += [IO.Path]::Combine($e, 'RetroArch') } }
  foreach ($d in @('C', 'D', 'E', 'F')) {
    $out += @("${d}:\RetroArch-Win64", "${d}:\RetroArch", "${d}:\Games\RetroArch-Win64", "${d}:\Games\RetroArch")
  }
  if (-not $IsWindows -and $PSVersionTable.PSVersion.Major -ge 6 -and -not $env:APPDATA) {
    $out += [IO.Path]::Combine($homeDir, '.config', 'retroarch')
  }
  return $out
}

function Candidates($kind) {
  $local = @{ roms = @('roms', 'ROMs'); thumbs = @('thumbnails'); bios = @('system', 'bios') }[$kind]
  $sub = @{ roms = @('roms'); thumbs = @('thumbnails'); bios = @('system') }[$kind]
  $out = @()
  foreach ($s in $local) { $out += [IO.Path]::Combine($root, $s) }
  foreach ($r in (RetroArchDirs)) { foreach ($s in $sub) { $out += [IO.Path]::Combine($r, $s) } }
  return $out
}

function IsDir($p) { if (-not $p) { return $false }; try { return [IO.Directory]::Exists([string]$p) } catch { return $false } }

function ReadSaved {
  $h = @{}
  if ([IO.File]::Exists($cfgFile)) {
    try {
      $o = [IO.File]::ReadAllText($cfgFile, $utf8).TrimStart([char]0xFEFF) | ConvertFrom-Json
      foreach ($k in $kinds) { if ($o.PSObject.Properties.Name -contains $k) { $h[$k] = [string]$o.$k } }
      if ($o.PSObject.Properties.Name -contains 'lan') { $h['lan'] = [bool]$o.lan }
      foreach ($k in @('cloud_url', 'cloud_key')) { if ($o.PSObject.Properties.Name -contains $k) { $h[$k] = [string]$o.$k } }
      if ($o.PSObject.Properties.Name -contains 'cloud_list') { $h['cloud_list'] = @($o.cloud_list | Where-Object { $_ } | ForEach-Object { [ordered]@{ url = [string]$_.url; key = [string]$_.key } }) }
    } catch {}
  }
  return $h
}

function CurrentConfig {
  $saved = ReadSaved
  $out = [ordered]@{ home = $homeDir; sep = [string]$sep; platform = 'win32' }
  foreach ($k in $kinds) {
    $p = ''
    if ($saved.ContainsKey($k)) { $p = $saved[$k] }
    if ($p -and (IsDir $p)) {
      $out[$k] = [ordered]@{ path = $p; ok = $true; auto = $false }
      continue
    }
    $found = ''
    foreach ($c in (Candidates $k)) { if (IsDir $c) { $found = $c; break } }
    $out[$k] = [ordered]@{ path = $found; ok = [bool]$found; auto = $true; missing = $p }
  }
  $cu = ''; $ck = ''
  if ($saved.ContainsKey('cloud_url')) { $cu = $saved['cloud_url'] }
  if ($saved.ContainsKey('cloud_key')) { $ck = $saved['cloud_key'] }
  $cl = @()
  if ($saved.ContainsKey('cloud_list') -and $saved['cloud_list']) { $cl = @($saved['cloud_list']) }
  $out['cloud'] = [ordered]@{ url = $cu; key = $ck; list = $cl }
  return $out
}

function BaseDir($kind) {
  if ($kinds -notcontains $kind) { return $null }
  $c = (CurrentConfig)[$kind]
  if ($c.ok) { return $c.path } else { return $null }
}

function SafeJoin($base, $rel) {
  $baseFull = [IO.Path]::GetFullPath($base).TrimEnd($sep)
  $parts = @($rel -split '/' | Where-Object { $_ -and $_ -ne '.' -and $_ -ne '..' })
  $full = $baseFull
  foreach ($p in $parts) { $full = [IO.Path]::Combine($full, $p) }
  $full = [IO.Path]::GetFullPath($full)
  if ($full -eq $baseFull -or $full.StartsWith($baseFull + $sep, [StringComparison]::OrdinalIgnoreCase)) { return $full }
  return $null
}

function ListFiles($base) {
  $baseFull = [IO.Path]::GetFullPath($base).TrimEnd($sep)
  $out = New-Object System.Collections.ArrayList
  foreach ($f in (Get-ChildItem -LiteralPath $baseFull -Recurse -File -ErrorAction SilentlyContinue)) {
    $rel = $f.FullName.Substring($baseFull.Length).TrimStart($sep)
    if (($rel -split '[\\/]') | Where-Object { $_.StartsWith('.') }) { continue }
    [void]$out.Add(@(($rel -replace '\\', '/'), [long]$f.Length))
  }
  return , $out
}

# ---- ROM / BIOS downloaded from another player's computer: written piece by piece into our own folder ----
$badName = '\.(exe|bat|cmd|com|ps1|psm1|vbs|vbe|js|jse|wsf|wsh|msi|scr|lnk|reg|sh|command|app|py|pyw|html?|dll|dylib|so|jar)$'
function RomSave($req) {
  $q = $req.QueryString
  $kind = [string]$q['kind']; if (-not $kind) { $kind = 'roms' }
  [long]$offset = 0; [long]$total = 0
  if (-not [long]::TryParse([string]$q['offset'], [ref]$offset) -or -not [long]::TryParse([string]$q['total'], [ref]$total)) { return @([ordered]@{ error = 'bad request' }, 400) }
  [long]$length = $req.ContentLength64
  if ($kind -ne 'roms' -and $kind -ne 'bios' -and $kind -ne 'thumbs') { return @([ordered]@{ error = 'bad kind' }, 400) }
  $keep = ([string]$q['keep']) -eq '1'   # thumbnails: if we already have one with this name, keep ours
  $cfg = CurrentConfig
  $used = $kind; $base = ''
  if ($cfg[$kind].ok) { $base = $cfg[$kind].path }
  elseif ($kind -eq 'bios' -and $cfg['roms'].ok) { $base = $cfg['roms'].path; $used = 'roms' }   # no BIOS folder: use the ROM folder
  elseif ($kind -eq 'thumbs') { $base = [IO.Path]::Combine($root, 'thumbnails'); [void][IO.Directory]::CreateDirectory($base) }   # no thumbnails folder: make one next to EmulatorJS (found automatically later)
  if (-not $base) { return @([ordered]@{ error = '还没有设置 ROM 文件夹'; code = 'no_folder' }, 400) }
  $rel = (([string]$q['rel']) -replace '\\', '/').Trim('/')
  $parts = @($rel -split '/' | Where-Object { $_ -and $_ -ne '.' -and $_ -ne '..' })
  if ($parts.Count -eq 0 -or $rel.Length -gt 300 -or $parts.Count -gt 5 -or $parts[-1].StartsWith('.') -or $parts[-1] -match $badName) { return @([ordered]@{ error = 'bad name' }, 400) }
  if ($total -le 0 -or $total -gt 4GB -or $offset -lt 0 -or $length -lt 0 -or $length -gt 64MB -or ($offset + $length) -gt $total) { return @([ordered]@{ error = 'bad range' }, 400) }
  $target = SafeJoin $base ($parts -join '/')
  if (-not $target) { return @([ordered]@{ error = 'bad name' }, 400) }
  $folder = [IO.Path]::GetDirectoryName($target); $name = [IO.Path]::GetFileName($target)
  $part = [IO.Path]::Combine($folder, '.' + $name + '.ejs-part')
  if ($offset -gt 0) {
    $have = 0; if ([IO.File]::Exists($part)) { $have = (New-Object IO.FileInfo($part)).Length }
    if ($have -ne $offset) { return @([ordered]@{ error = 'out of order'; have = $have }, 409) }
    $fs = New-Object IO.FileStream($part, [IO.FileMode]::Open, [IO.FileAccess]::Write)
    [void]$fs.Seek($offset, [IO.SeekOrigin]::Begin)
  } else {
    [void][IO.Directory]::CreateDirectory($folder)
    $fs = New-Object IO.FileStream($part, [IO.FileMode]::Create, [IO.FileAccess]::Write)
  }
  try { $req.InputStream.CopyTo($fs); $written = $fs.Position - $offset } finally { $fs.Close() }
  if ($written -ne $length) { return @([ordered]@{ error = 'short body' }, 400) }
  if (($offset + $length) -lt $total) { return @([ordered]@{ ok = $true }, 200) }
  $final = $target
  if ([IO.File]::Exists($final) -and ($keep -or (New-Object IO.FileInfo($final)).Length -eq $total)) { [IO.File]::Delete($part) }   # already have this one
  else {
    if ([IO.File]::Exists($final) -or [IO.Directory]::Exists($final)) {
      # same name, different file: never overwrite ours (arcade games need the exact file name)
      $dl = [IO.Path]::Combine($folder, 'EmulatorJS downloads'); [void][IO.Directory]::CreateDirectory($dl)
      $final = [IO.Path]::Combine($dl, $name)
      if ([IO.File]::Exists($final)) { [IO.File]::Delete($final) }
    }
    [IO.File]::Move($part, $final)
  }
  $baseFull = [IO.Path]::GetFullPath($base).TrimEnd($sep)
  $relOut = ($final.Substring($baseFull.Length).TrimStart($sep)) -replace '\\', '/'
  return @([ordered]@{ ok = $true; done = $true; kind = $used; rel = $relOut }, 200)
}

function Shortcuts {
  $items = New-Object System.Collections.ArrayList
  $add = { param($label, $path) if ((IsDir $path) -and -not ($items | Where-Object { $_.path -eq $path })) { [void]$items.Add([ordered]@{ label = $label; path = $path }) } }
  & $add '个人文件夹' $homeDir
  & $add '桌面' ([Environment]::GetFolderPath('Desktop'))
  & $add '文档' ([Environment]::GetFolderPath('MyDocuments'))
  & $add '下载' ([IO.Path]::Combine($homeDir, 'Downloads'))
  & $add 'EmulatorJS 文件夹' $root
  foreach ($r in (RetroArchDirs)) { & $add 'RetroArch' $r }
  foreach ($d in [IO.DriveInfo]::GetDrives()) { if ($d.IsReady -and $d.Name -match '^[A-Z]:') { & $add $d.Name.TrimEnd('\') $d.Name } }
  return , $items
}

function ListDirs($path) {
  if (-not $path) { $path = $homeDir }
  try { $path = [IO.Path]::GetFullPath([Environment]::ExpandEnvironmentVariables($path)) } catch { $path = $homeDir }
  if (-not (IsDir $path)) { $path = $homeDir }
  $names = @(Get-ChildItem -LiteralPath $path -Directory -ErrorAction SilentlyContinue |
      Where-Object { -not $_.Name.StartsWith('.') -and -not ($_.Attributes -band [IO.FileAttributes]::Hidden) } |
      Sort-Object Name | ForEach-Object { $_.Name })
  $parent = ''
  $t = $path.TrimEnd($sep)
  if ($t) { $pp = [IO.Path]::GetDirectoryName($t); if ($pp) { $parent = $pp } }
  if ($path -eq '/' ) { $parent = '' }
  return [ordered]@{ path = $path; parent = $parent; dirs = $names; shortcuts = (Shortcuts) }
}

# ---------------- HTTP ----------------
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript'; '.css' = 'text/css';
  '.json' = 'application/json'; '.wasm' = 'application/wasm'; '.png' = 'image/png'; '.jpg' = 'image/jpeg';
  '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon';
  '.data' = 'application/octet-stream'; '.txt' = 'text/plain; charset=utf-8' }

$corsOrigin = ''
function CorsOrigin($req) {
  # Other PCs' EmulatorJS pages (served from 127.0.0.1 or a LAN address) may call the multiplayer API
  $o = [string]$req.Headers['Origin']
  if (-not $req.Url.AbsolutePath.StartsWith('/api/mp/') -or -not $o.StartsWith('http://')) { return '' }
  try { $u = [Uri]$o } catch { return '' }
  if ($u.Host -eq 'localhost') { return $o }
  $ip = $null
  if (-not [Net.IPAddress]::TryParse($u.Host.Trim('[', ']'), [ref]$ip)) { return '' }
  if ([Net.IPAddress]::IsLoopback($ip) -or ($ip.AddressFamily -eq 'InterNetwork' -and (IsPrivateV4 $ip))) { return $o }
  return ''
}
function SendBytes($res, [int]$code, [string]$type, [byte[]]$bytes) {
  $res.StatusCode = $code
  $res.ContentType = $type
  try { $res.AddHeader('Cache-Control', 'no-store') } catch {}
  if ($script:corsOrigin) { try { $res.AddHeader('Access-Control-Allow-Origin', $script:corsOrigin); $res.AddHeader('Vary', 'Origin') } catch {} }
  $res.ContentLength64 = $bytes.Length
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
}
function SendJson($res, $obj, [int]$code = 200) { SendBytes $res $code 'application/json; charset=utf-8' ($utf8.GetBytes((J $obj))) }
function SendFile($res, $path, $method, $range) {
  $ext = [IO.Path]::GetExtension($path).ToLower()
  if ($types.ContainsKey($ext)) { $res.ContentType = $types[$ext] } else { $res.ContentType = 'application/octet-stream' }
  # Page and scripts: always check for a newer version (no stale browser cache after updates)
  if (@('.html', '.js', '.json', '.css') -contains $ext) { try { $res.AddHeader('Cache-Control', 'no-cache') } catch {} }
  $fs = [IO.File]::OpenRead($path)
  try {
    $size = $fs.Length; $start = [long]0; $end = $size - 1; $partial = $false
    # Range support: the page reads only file headers / zip directories, not whole files
    if ($range -and $range.StartsWith('bytes=')) {
      $spec = $range.Substring(6).Split(',')[0]; $dash = $spec.IndexOf('-')
      if ($dash -ge 0) {
        $a = $spec.Substring(0, $dash); $b = $spec.Substring($dash + 1)
        try {
          if ($a) { $start = [long]$a; if ($b) { $end = [Math]::Min([long]$b, $size - 1) } }
          elseif ($b) { $start = [Math]::Max($size - [long]$b, 0) }
          $partial = ($start -le $end -and $start -lt $size)
        } catch { $partial = $false }
        if (-not $partial) { $start = 0; $end = $size - 1 }
      }
    }
    $length = [Math]::Max($end - $start + 1, 0)
    try { $res.AddHeader('Accept-Ranges', 'bytes') } catch {}
    if ($partial) {
      $res.StatusCode = 206
      try { $res.AddHeader('Content-Range', "bytes $start-$end/$size") } catch {}
    }
    $res.ContentLength64 = $length
    if ($method -ne 'HEAD') {
      [void]$fs.Seek($start, [IO.SeekOrigin]::Begin)
      $buf = New-Object byte[] 1048576
      $left = $length
      while ($left -gt 0) {
        $n = $fs.Read($buf, 0, [int][Math]::Min($buf.Length, $left))
        if ($n -le 0) { break }
        $res.OutputStream.Write($buf, 0, $n)
        $left -= $n
      }
    }
  } finally { $fs.Close() }
}

function WriteSaved($saved) {
  $o = [ordered]@{}
  foreach ($k in $kinds) { if ($saved.ContainsKey($k)) { $o[$k] = $saved[$k] } }
  if ($saved.ContainsKey('lan')) { $o['lan'] = [bool]$saved['lan'] }
  foreach ($k in @('cloud_url', 'cloud_key')) { if ($saved.ContainsKey($k)) { $o[$k] = [string]$saved[$k] } }
  if ($saved.ContainsKey('cloud_list')) { $o['cloud_list'] = @($saved['cloud_list']) }
  [IO.File]::WriteAllText($cfgFile, (J $o), $utf8)
}
# LAN play is on unless switched off in the page's folder settings
function LanEnabled { $s = ReadSaved; if ($s.ContainsKey('lan')) { return [bool]$s['lan'] }; return $true }

function PublicConfig {
  # What other LAN devices see: no local folder paths
  $cfg = CurrentConfig
  $saved = ReadSaved
  $proxy = [bool]([string]$saved['cloud_url'] -and [string]$saved['cloud_key'])
  $out = [ordered]@{ remote = $true; sep = '/'; home = ''; cloudProxy = $proxy }
  foreach ($k in $kinds) { $out[$k] = [ordered]@{ path = ''; ok = $cfg[$k].ok; auto = $true; missing = '' } }
  return $out
}

# Phones / tablets on the LAN have no room password: their internet-server requests (accounts, friends,
# stats, internet lobby) come here and are forwarded with this PC's room password.
$script:cloudHttp = $null
$script:cloudDown = -100.0   # when the internet server last failed: answer "unreachable" at once for 20 s (this server handles one request at a time)
function CloudProxy($req, $res, [string]$method, [byte[]]$bodyBytes) {
  $path = $req.Url.AbsolutePath
  if ($path -notmatch '^/cp/api/((mp|acct|friends|stats|match)/[a-z/]+|ice|ping)$') { $res.StatusCode = 404; return }
  $saved = ReadSaved
  $base = [string]$saved['cloud_url']; $key = [string]$saved['cloud_key']
  if (-not $base -or -not $key) { SendJson $res ([ordered]@{ error = 'no cloud server' }) 404; return }
  if ((Now) - $script:cloudDown -lt 20) { SendJson $res ([ordered]@{ error = 'cloud server unreachable' }) 502; return }
  if (-not $script:cloudHttp) {
    Add-Type -AssemblyName System.Net.Http
    try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12 } catch {}
    $script:cloudHttp = New-Object System.Net.Http.HttpClient
    $script:cloudHttp.Timeout = [TimeSpan]::FromSeconds(6)
  }
  $url = $base + $req.Url.PathAndQuery.Substring(3)
  $msg = New-Object System.Net.Http.HttpRequestMessage((New-Object System.Net.Http.HttpMethod($method)), $url)
  [void]$msg.Headers.TryAddWithoutValidation('X-EJS-Key', $key)
  [void]$msg.Headers.TryAddWithoutValidation('X-EJS', '1')
  $tok = [string]$req.Headers['X-EJS-Token']
  if ($tok) { [void]$msg.Headers.TryAddWithoutValidation('X-EJS-Token', $tok) }
  if ($method -eq 'POST') {
    $msg.Content = New-Object System.Net.Http.ByteArrayContent(,$bodyBytes)
    $msg.Content.Headers.ContentType = New-Object System.Net.Http.Headers.MediaTypeHeaderValue('application/json')
  }
  try {
    $r = $script:cloudHttp.SendAsync($msg).GetAwaiter().GetResult()
    $bytes = $r.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
    SendBytes $res ([int]$r.StatusCode) 'application/json; charset=utf-8' $bytes
  } catch { $script:cloudDown = (Now); SendJson $res ([ordered]@{ error = 'cloud server unreachable' }) 502 }
}

function IsPrivateV4($a) {
  $b = $a.GetAddressBytes()
  return ($b[0] -eq 10) -or ($b[0] -eq 192 -and $b[1] -eq 168) -or ($b[0] -eq 172 -and $b[1] -ge 16 -and $b[1] -le 31)
}
function LanAddresses {
  $set = New-Object System.Collections.Generic.HashSet[string]
  try {
    $u = New-Object Net.Sockets.Socket([Net.Sockets.AddressFamily]::InterNetwork, [Net.Sockets.SocketType]::Dgram, [Net.Sockets.ProtocolType]::Udp)
    $u.Connect('10.255.255.255', 1); $a = $u.LocalEndPoint.Address; $u.Close()
    if (IsPrivateV4 $a) { [void]$set.Add($a.ToString()) }
  } catch {}
  try {
    foreach ($a in [Net.Dns]::GetHostAddresses([Net.Dns]::GetHostName())) {
      if ($a.AddressFamily -eq 'InterNetwork' -and (IsPrivateV4 $a)) { [void]$set.Add($a.ToString()) }
    }
  } catch {}
  return , @($set | Sort-Object)
}

# ---------------- player names: block insults / abusive words ----------------
# The word list is data\badwords.json (editable); reloaded automatically when it changes
$badFile = Join-Path $root 'data\badwords.json'
$badMtime = $null
$badWords = @()
function NormName($t) {
  $t = ([string]$t).Normalize([Text.NormalizationForm]::FormKC).ToLowerInvariant()
  return [regex]::Replace($t, '[\W_]+', '')
}
function BadWords {
  try {
    if ([IO.File]::Exists($badFile)) {
      $m = [IO.File]::GetLastWriteTimeUtc($badFile)
      if ($m -ne $script:badMtime) {
        $o = [IO.File]::ReadAllText($badFile, $utf8).TrimStart([char]0xFEFF) | ConvertFrom-Json
        $script:badWords = @($o.words | ForEach-Object { NormName $_ } | Where-Object { $_ })
        $script:badMtime = $m
      }
    }
  } catch {}
  return $script:badWords
}
function CleanName($name, $cid) {
  $name = [regex]::Replace([string]$name, '[\x00-\x1f\x7f]', '').Trim()
  if ($name.Length -gt 24) { $name = $name.Substring(0, 24) }
  $n = NormName $name
  $fallback = '玩家' + ([string]$cid + '   ').Substring(0, 3).Trim().ToUpperInvariant()   # numbered, so not everyone is "玩家"
  if (-not $n) { return $fallback }
  foreach ($w in (BadWords)) { if ($n.Contains($w)) { return $fallback } }
  return $name
}
# Someone else who is playing or has joined a game already uses this name
function NameTaken($cid, $name) {
  $n = NormName $name
  foreach ($s in $sessions.Values) {
    if ($s.host -ne $cid -and (NormName $s.hostName) -eq $n) { return $true }
    foreach ($c in $s.players.Keys) { if ($c -ne $cid -and (NormName $s.players[$c].name) -eq $n) { return $true } }
  }
  return $false
}
function TakenReply($name) { return @([ordered]@{ error = "名字「$name」已经有人在用了，请点「我是：…」换一个名字"; nameTaken = $true }, 409) }

# ---------------- multiplayer lobby (in memory) ----------------
$clock = [Diagnostics.Stopwatch]::StartNew()
function Now { return $clock.Elapsed.TotalSeconds }
$sessions = @{}   # sid -> hashtable
$mailbox = @{}    # cid -> ArrayList
$clientSeen = @{} # cid -> last request time
# A device's id (client) is public (room lists show the host's id), so it also carries a secret only it knows (csec):
# the first time an id shows up with a secret, its fingerprint is remembered, and later requests with that id must bring
# the same secret, so nobody else can pose as it (end its room, read its messages). Old versions without a secret still
# work as long as nobody has used that id with a secret.
$clientSecrets = @{}  # cid -> @(fingerprint, last used)
function ClientOk($cid, $sec, $now) {
  if ($sec.Length -gt 200) { $sec = $sec.Substring(0, 200) }
  $old = $clientSecrets[$cid]
  if (-not $sec) { return ($null -eq $old) }
  $sha = [Security.Cryptography.SHA256]::Create()
  $h = (($sha.ComputeHash($utf8.GetBytes('ejs-client:' + $sec)) | ForEach-Object { $_.ToString('x2') }) -join '')
  if ($null -eq $old) { $clientSecrets[$cid] = @($h, $now); return $true }
  if ($old[0] -cne $h) { return $false }
  $old[1] = $now
  return $true
}
$timeoutSec = 12
$bans = @{}       # host cid -> ArrayList of @{ cid; acct; iph; until }: people the host sent away (30 minutes)
$kickMinutes = 30
$ipSalt = New-Object byte[] 16; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($ipSalt)
$script:reqIph = ''
function IpHash([string]$ip) {
  # never show anyone's IP; keep only a fingerprint that can't be turned back into the IP
  if (-not $ip) { return '' }
  if ($ip.StartsWith('::ffff:')) { $ip = $ip.Substring(7) }
  $h = New-Object Security.Cryptography.HMACSHA256 -ArgumentList (,$ipSalt)
  return (($h.ComputeHash($utf8.GetBytes($ip)) | ForEach-Object { $_.ToString('x2') }) -join '').Substring(0, 16)
}
function BanLeft($hostCid, $cid, $acct, $iph) {
  if (-not $bans.ContainsKey($hostCid)) { return 0 }
  $now = Now
  foreach ($b in $bans[$hostCid]) {
    if ($b.until -gt $now -and (($cid -and $b.cid -eq $cid) -or ($acct -and $b.acct -and (NormName $b.acct) -eq (NormName $acct)) -or ($iph -and $b.iph -eq $iph))) {
      return [Math]::Max(1, [int][Math]::Floor(($b.until - $now + 59) / 60))
    }
  }
  return 0
}
function Post($cid, $msg) {
  if (-not $mailbox.ContainsKey($cid)) { $mailbox[$cid] = New-Object System.Collections.ArrayList }
  if ($mailbox[$cid].Count -lt 200) { [void]$mailbox[$cid].Add($msg) }
}
function MpCleanup {
  $now = Now
  foreach ($sid in @($sessions.Keys)) {
    $s = $sessions[$sid]
    if ($now - $s.seen -gt $timeoutSec) {
      foreach ($c in @($s.players.Keys)) { Post $c ([ordered]@{ type = 'ended'; sid = $sid }) }
      $sessions.Remove($sid); continue
    }
    foreach ($c in @($s.players.Keys)) {
      if ($now - $s.players[$c].seen -gt $timeoutSec) {
        $s.players.Remove($c); Post $s.host ([ordered]@{ type = 'left'; sid = $sid; from = $c })
      }
    }
  }
  # mailboxes of ids that stopped asking for their messages (or never existed) are thrown away
  foreach ($c in @($mailbox.Keys)) { if (-not $clientSeen.ContainsKey($c) -or $now - $clientSeen[$c] -gt 60) { $mailbox.Remove($c) } }
  if ($clientSeen.Count -gt 5000) { foreach ($c in @($clientSeen.Keys)) { if ($now - $clientSeen[$c] -gt 600) { $clientSeen.Remove($c) } } }
  if ($clientSecrets.Count -gt 2000) { foreach ($c in @($clientSecrets.Keys)) { if ($now - $clientSecrets[$c][1] -gt 30 * 86400) { $clientSecrets.Remove($c) } } }
  foreach ($h in @($bans.Keys)) {
    $keep = New-Object System.Collections.ArrayList
    foreach ($b in $bans[$h]) { if ($b.until -gt $now) { [void]$keep.Add($b) } }
    if ($keep.Count) { $bans[$h] = $keep } else { $bans.Remove($h) }
  }
}
function SessionView($sid, $s) {
  $pl = New-Object System.Collections.ArrayList
  foreach ($c in $s.players.Keys) { [void]$pl.Add([ordered]@{ cid = $c; name = $s.players[$c].name; slot = $s.players[$c].slot; mode = $s.players[$c].mode; country = $s.players[$c].country; watch = [bool]$s.players[$c].watch }) }
  return [ordered]@{ sid = $sid; game = $s.game; title = $s.title; system = $s.system; group = $s.group; host = $s.host;
    hostName = $s.hostName; allowJoin = $s.allowJoin; sync = [bool]$s.sync; size = [long]$s.size;
    challenge = [bool]$s.challenge; hostCountry = [string]$s.hostCountry; allowWatch = [bool]$s.allowWatch; regOnly = [bool]$s.regOnly; players = $pl }
}
function Str($o, $name, $max) {
  if ($null -eq $o -or -not ($o.PSObject.Properties.Name -contains $name) -or $null -eq $o.$name) { return '' }
  $v = [string]$o.$name; if ($v.Length -gt $max) { $v = $v.Substring(0, $max) }; return $v
}
function MpHandle($path, $data) {
  MpCleanup
  if ($path -eq '/api/mp/sessions') {
    $list = New-Object System.Collections.ArrayList
    foreach ($sid in $sessions.Keys) { [void]$list.Add((SessionView $sid $sessions[$sid])) }
    $remote = New-Object System.Collections.ArrayList; $npeers = 0
    if (LanEnabled) { $remote = RemoteSessions; $npeers = $peers.Count }
    return @([ordered]@{ sessions = $list; remote = $remote; peers = $npeers }, 200)
  }
  $cid = Str $data 'client' 64
  $name = CleanName (Str $data 'name' 40) (Str $data 'client' 64)
  if (-not $cid) { return @([ordered]@{ error = 'missing client' }, 400) }
  if (-not (ClientOk $cid (Str $data 'csec' 200) (Now))) { return @([ordered]@{ error = '这台设备的联机编号被别人占用了，请刷新页面'; code = 'bad_client' }, 403) }
  $clientSeen[$cid] = Now
  # names with 开发者 / Developer belong to the admin: only with that account (the host checks it with the internet server)
  $nn = NormName $name
  if (($nn.Contains('开发者') -or $nn.Contains('developer')) -and (NormName (Str $data 'acct' 16)) -ne $nn) { $name = '玩家' + $cid.Substring(0, [Math]::Min(3, $cid.Length)).ToUpper() }
  $now = Now
  if ($path -eq '/api/mp/host') {
    $game = Str $data 'game' 500
    foreach ($sid in @($sessions.Keys)) {
      $s = $sessions[$sid]
      if ($s.game -eq $game -and $s.host -ne $cid) { return @([ordered]@{ existing = (SessionView $sid $s) }, 200) }
    }
    foreach ($sid in @($sessions.Keys)) { if ($sessions[$sid].host -eq $cid) { $sessions.Remove($sid) } }
    if (NameTaken $cid $name) { return (TakenReply $name) }
    $sid = [guid]::NewGuid().ToString('N').Substring(0, 10)
    $allow = $true; if ($data.PSObject.Properties.Name -contains 'allowJoin') { $allow = [bool]$data.allowJoin }
    $sync = $false; if ($data.PSObject.Properties.Name -contains 'sync') { $sync = [bool]$data.sync }
    $size = [long]0; if ($data.PSObject.Properties.Name -contains 'size') { try { $size = [long]$data.size } catch {} }
    $allowWatch = $true; if ($data.PSObject.Properties.Name -contains 'allowWatch') { $allowWatch = [bool]$data.allowWatch }
    $sessions[$sid] = @{ game = $game; title = (Str $data 'title' 200); system = (Str $data 'system' 20); group = (Str $data 'group' 20);
      host = $cid; hostName = $name; allowJoin = $allow; sync = $sync; size = $size;
      challenge = [bool]($data.PSObject.Properties.Name -contains 'challenge' -and $data.challenge); hostCountry = (Str $data 'country' 2);
      allowWatch = $allowWatch; regOnly = [bool]($data.PSObject.Properties.Name -contains 'regOnly' -and $data.regOnly); players = @{}; seen = $now }
    return @([ordered]@{ sid = $sid }, 200)
  }
  $sidIn = Str $data 'sid' 40
  $s = $null; if ($sidIn -and $sessions.ContainsKey($sidIn)) { $s = $sessions[$sidIn] }
  switch ($path) {
    '/api/mp/heartbeat' {
      if ($s -and $s.host -eq $cid) { $s.seen = $now; if (-not (NameTaken $cid $name)) { $s.hostName = $name } }
      elseif ($s -and $s.players.ContainsKey($cid)) { $s.players[$cid].seen = $now }
      $view = $null; if ($s) { $view = SessionView $sidIn $s }
      return @([ordered]@{ ok = [bool]$s; session = $view }, 200)
    }
    '/api/mp/update' {
      if (-not $s -or $s.host -ne $cid) { return @([ordered]@{ error = 'not host' }, 403) }
      if ($data.PSObject.Properties.Name -contains 'allowJoin') { $s.allowJoin = [bool]$data.allowJoin }
      if ($data.PSObject.Properties.Name -contains 'challenge') { $s.challenge = [bool]$data.challenge }
      if ($data.PSObject.Properties.Name -contains 'allowWatch') { $s.allowWatch = [bool]$data.allowWatch }
      if ($data.PSObject.Properties.Name -contains 'regOnly') { $s.regOnly = [bool]$data.regOnly }
      return @([ordered]@{ session = (SessionView $sidIn $s) }, 200)
    }
    { $_ -eq '/api/mp/kick' -or $_ -eq '/api/mp/reject' } {
      # host sends someone away (kick: can't come back for 30 minutes) or turns them down (reject: account check failed)
      if (-not $s -or $s.host -ne $cid) { return @([ordered]@{ error = 'not host' }, 403) }
      $target = Str $data 'target' 64
      $p = $null; if ($s.players.ContainsKey($target)) { $p = $s.players[$target]; $s.players.Remove($target) }
      if ($path -eq '/api/mp/kick') {
        $acctT = Str $data 'acct' 16; if (-not $acctT -and $p) { $acctT = [string]$p.acct }
        $iphT = ''; if ($p) { $iphT = [string]$p.iph }
        if (-not $bans.ContainsKey($cid)) { $bans[$cid] = New-Object System.Collections.ArrayList }
        [void]$bans[$cid].Add(@{ cid = $target; acct = $acctT; iph = $iphT; until = $now + $kickMinutes * 60 })
        Post $target ([ordered]@{ type = 'kicked'; sid = $sidIn; minutes = $kickMinutes })
      } else {
        Post $target ([ordered]@{ type = 'rejected'; sid = $sidIn; code = (Str $data 'code' 20) })
      }
      return @([ordered]@{ ok = $true; session = (SessionView $sidIn $s) }, 200)
    }
    '/api/mp/end' {
      if ($s -and $s.host -eq $cid) {
        foreach ($c in @($s.players.Keys)) { Post $c ([ordered]@{ type = 'ended'; sid = $sidIn }) }
        $sessions.Remove($sidIn)
      }
      return @([ordered]@{ ok = $true }, 200)
    }
    '/api/mp/join' {
      if (-not $s) { return @([ordered]@{ error = '这局游戏已经结束了' }, 404) }
      if ($s.host -eq $cid) { return @([ordered]@{ error = '这是你自己开的游戏' }, 400) }
      $acct = Str $data 'acct' 16   # on the LAN this is only what the player says; used to recognise people who were sent away
      $left = BanLeft $s.host $cid $acct $script:reqIph
      if ($left) { return @([ordered]@{ error = "你被房主请出了这个房间，$left 分钟后才能再进入"; code = 'kicked'; minutes = $left }, 403) }
      $watch = [bool]($data.PSObject.Properties.Name -contains 'watch' -and $data.watch -eq $true)   # spectator: no player slot, no input
      $mode = 'stream'; if ((Str $data 'mode' 10) -eq 'sync') { $mode = 'sync' }
      if ($watch) {
        if (-not $s.allowWatch) { return @([ordered]@{ error = '房主关闭了观战'; code = 'no_watch' }, 403) }
        $nw = 0; $nv = 0
        foreach ($c in $s.players.Keys) { if ($c -ne $cid -and $s.players[$c].watch) { $nw++; if ($s.players[$c].mode -ne 'sync') { $nv++ } } }
        if ($nw -ge 8) { return @([ordered]@{ error = '观战的人太多了（最多 8 个）' }, 409) }
        if ($mode -eq 'stream' -and $nv -ge 2) { return @([ordered]@{ error = '看画面观战的人满了（最多 2 个）'; code = 'watch_video_full' }, 409) }
        $slot = 0
      } else {
        if (-not $s.allowJoin) { return @([ordered]@{ error = '主机设置了不允许乱入' }, 403) }
        $used = @(); foreach ($c in $s.players.Keys) { if ($c -ne $cid -and -not $s.players[$c].watch) { $used += $s.players[$c].slot } }
        $free = @(1, 2, 3 | Where-Object { $used -notcontains $_ })
        if ($free.Count -eq 0) { return @([ordered]@{ error = '人满了（最多 4 个玩家）' }, 409) }
        $slot = $free[0]
        if ($s.players.ContainsKey($cid) -and -not $s.players[$cid].watch) { $slot = $s.players[$cid].slot }
      }
      if (NameTaken $cid $name) { return (TakenReply $name) }
      $s.players[$cid] = @{ name = $name; slot = $slot; seen = $now; mode = $mode; watch = $watch; country = (Str $data 'country' 2); acct = $acct; iph = $script:reqIph }
      $msg = [ordered]@{ type = 'join'; sid = $sidIn; from = $cid; name = $name; slot = $slot; mode = $mode; watch = $watch; acct = $acct; verified = $false }
      $ticket = Str $data 'ticket' 600
      if ($ticket) { $msg.ticket = $ticket }   # the host's page checks it with the internet play server
      Post $s.host $msg
      return @([ordered]@{ slot = $slot; host = $s.host; session = (SessionView $sidIn $s) }, 200)
    }
    '/api/mp/leave' {
      if ($s -and $s.players.ContainsKey($cid)) { $s.players.Remove($cid); Post $s.host ([ordered]@{ type = 'left'; sid = $sidIn; from = $cid }) }
      return @([ordered]@{ ok = $true }, 200)
    }
    '/api/mp/send' {
      $to = Str $data 'to' 64
      $payload = $null; if ($data.PSObject.Properties.Name -contains 'data') { $payload = $data.data }
      if ((J $payload).Length -gt 64KB) { return @([ordered]@{ error = 'too large' }, 413) }
      # the other side is gone (or never existed): don't keep it
      if ($clientSeen.ContainsKey($to) -and (Now) - $clientSeen[$to] -le 60) {
        Post $to ([ordered]@{ type = 'signal'; from = $cid; sid = $sidIn; data = $payload })
      }
      return @([ordered]@{ ok = $true }, 200)
    }
    '/api/mp/recv' {
      $msgs = New-Object System.Collections.ArrayList
      if ($mailbox.ContainsKey($cid)) { $msgs = $mailbox[$cid]; $mailbox.Remove($cid) }
      return @([ordered]@{ messages = $msgs }, 200)
    }
  }
  return @([ordered]@{ error = 'not found' }, 404)
}

# ---------------- auto discovery: other PCs on the LAN running EmulatorJS ----------------
# Every 2 seconds each PC broadcasts "I am here + what is being played", so nobody has to share addresses.
$discPort = 8764
$instance = [guid]::NewGuid().ToString('N').Substring(0, 12)
$peers = @{}
$lastBroadcast = -10
$udp = $null
try {
  $udp = New-Object Net.Sockets.UdpClient
  $udp.Client.SetSocketOption([Net.Sockets.SocketOptionLevel]::Socket, [Net.Sockets.SocketOptionName]::ReuseAddress, $true)
  $udp.Client.Bind((New-Object Net.IPEndPoint([Net.IPAddress]::Any, $discPort)))
  $udp.EnableBroadcast = $true
} catch { $udp = $null }

function RemoteSessions {
  $out = New-Object System.Collections.ArrayList
  $now = Now
  foreach ($k in @($peers.Keys)) {
    $p = $peers[$k]
    if ($now - $p.seen -gt 8) { $peers.Remove($k); continue }
    foreach ($x in $p.sessions) {
      if ($null -eq $x -or -not $x.sid) { continue }
      $c = $x.PSObject.Copy()
      $c | Add-Member -NotePropertyName at -NotePropertyValue ($p.ip + ':' + $p.port) -Force
      [void]$out.Add($c)
    }
  }
  return , $out
}

function Discovery {
  if (-not $udp) { return }
  $now = Now
  if ($now - $script:lastBroadcast -ge 2) {
    $script:lastBroadcast = $now
    if (LanEnabled) {
      MpCleanup
      $list = New-Object System.Collections.ArrayList
      foreach ($sid in @($sessions.Keys)) {
        if ($list.Count -ge 12) { break }
        $v = SessionView $sid $sessions[$sid]; $v.Remove('game'); [void]$list.Add($v)
      }
      $bytes = $utf8.GetBytes((J ([ordered]@{ ejs = 2; id = $instance; port = $port; sessions = $list })))
      $targets = @('255.255.255.255') + @(LanAddresses | ForEach-Object { ($_ -replace '\.\d+$', '') + '.255' })
      foreach ($t in ($targets | Select-Object -Unique)) { try { [void]$udp.Send($bytes, $bytes.Length, $t, $discPort) } catch {} }
    }
  }
  try {
    while ($udp.Available -gt 0) {
      $ep = New-Object Net.IPEndPoint([Net.IPAddress]::Any, 0)
      $data = $udp.Receive([ref]$ep)
      try {
        $d = $utf8.GetString($data) | ConvertFrom-Json
        if ($d.ejs -eq 2 -and [string]$d.id -ne $instance -and ((IsPrivateV4 $ep.Address) -or $env:EJS_TEST_ANYIP)) {
          $pp = 8765; if ($d.port) { $pp = [int]$d.port }
          $peers[[string]$d.id] = @{ ip = $ep.Address.ToString(); port = $pp; sessions = @($d.sessions); seen = (Now) }
        }
      } catch {}
    }
  } catch {}
}

function HostOk($req, $lan) {
  # Only accept localhost or a plain IP address in the Host header (blocks DNS-rebinding attacks)
  $h = [string]$req.Headers['Host']
  if (@("localhost:$port", "127.0.0.1:$port", "[::1]:$port") -contains $h) { return $true }
  if (-not $lan) { return $false }
  $i = $h.LastIndexOf(':'); if ($i -lt 0) { return $false }
  $ip = $null
  return ([Net.IPAddress]::TryParse($h.Substring(0, $i).Trim('[', ']'), [ref]$ip) -and $h.Substring($i + 1) -eq [string]$port)
}

# ---------------- start / restart the listener ----------------
$lanError = ''
$elevTried = $false
function StartListener($lan) {
  $script:lanError = ''
  if ($lan) {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://+:$port/")
    try { $l.Start(); return $l } catch {
      try { $l.Close() } catch {}
      # Windows needs a one-time admin permission to listen on the LAN: ask for it once (UAC prompt)
      $helper = Join-Path $root 'Enable-LAN-Windows.bat'
      if (-not $script:elevTried -and ($env:OS -eq 'Windows_NT') -and (Test-Path $helper)) {
        $script:elevTried = $true
        Write-Host "First time LAN play: Windows will ask for permission once. Please click 'Yes'."
        try {
          Start-Process -FilePath $helper -ArgumentList 'auto' -Verb RunAs -Wait
          $l = New-Object System.Net.HttpListener
          $l.Prefixes.Add("http://+:$port/")
          $l.Start(); return $l
        } catch { try { $l.Close() } catch {} }
      }
      $script:lanError = 'needs_permission'
    }
  }
  $l = New-Object System.Net.HttpListener
  $l.Prefixes.Add($prefix)
  $l.Start()
  return $l
}

try { $listener = StartListener (LanEnabled) } catch {
  # An older EmulatorJS window is still running: ask it to quit so the newest version is used
  try { Invoke-WebRequest -UseBasicParsing -Method Post -Uri ($prefix + 'api/quit') -Headers @{ 'X-EJS' = '1' } -ContentType 'application/json' -Body '{}' -TimeoutSec 3 | Out-Null } catch {}
  Start-Sleep -Seconds 2
  $listener = $null
  try { $listener = StartListener (LanEnabled) } catch {}
  if (-not $listener) { Start-Process ($prefix + 'index.html'); exit }   # could not take over: just open the page
}
if (-not $env:EJS_NO_BROWSER) { Start-Process ($prefix + 'index.html') }
Write-Host "Game page is open at ${prefix}index.html"
Write-Host "Keep this window open while playing. Close it when you are done."

# Create an "EmulatorJS" shortcut with the game icon next to this script (a .bat file cannot have its own icon).
try {
  $ico = Join-Path $root 'data\icon.ico'
  if ((Test-Path $ico) -and ($env:OS -eq 'Windows_NT')) {
    $sc = (New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $root 'EmulatorJS.lnk'))
    $sc.TargetPath = Join-Path $root 'EmulatorJS-Windows.bat'
    $sc.WorkingDirectory = $root
    $sc.IconLocation = "$ico,0"
    $sc.Description = 'EmulatorJS'
    $sc.Save()
  }
} catch {}

while ($true) {
  $lan = LanEnabled
  if ($lan -and -not $lanError) { Write-Host "LAN play is ON: other PCs running EmulatorJS on the same network show up automatically." }
  elseif ($lan) { Write-Host "LAN play needs permission: double-click 'Enable-LAN-Windows.bat' once (asks for admin), then restart." }
  $restart = $false
  while ($listener.IsListening -and -not $restart) {
    # wait for the next request; meanwhile keep the LAN discovery going
    $ar = $listener.BeginGetContext($null, $null)
    while (-not $ar.AsyncWaitHandle.WaitOne(400)) { Discovery }
    Discovery
    $ctx = $listener.EndGetContext($ar)
    $req = $ctx.Request
    $res = $ctx.Response
    try {
      $isLocal = [Net.IPAddress]::IsLoopback($req.RemoteEndPoint.Address)
      if (-not (HostOk $req $lan) -or -not ($isLocal -or $lan)) { $res.StatusCode = 403 }
      else {
        $path = $req.Url.AbsolutePath
        $script:corsOrigin = CorsOrigin $req
        if ($req.HttpMethod -eq 'OPTIONS') {
          if ($script:corsOrigin) {
            $res.StatusCode = 204
            $res.AddHeader('Access-Control-Allow-Origin', $script:corsOrigin)
            $res.AddHeader('Access-Control-Allow-Methods', 'GET, POST')
            $res.AddHeader('Access-Control-Allow-Headers', 'Content-Type, X-EJS')
            $res.AddHeader('Access-Control-Allow-Private-Network', 'true')
            $res.AddHeader('Access-Control-Max-Age', '600')
            $res.AddHeader('Vary', 'Origin')
          } else { $res.StatusCode = 403 }
        }
        elseif ($req.HttpMethod -eq 'POST') {
          if ($req.Headers['X-EJS'] -ne '1') { $res.StatusCode = 403 }
          elseif ($path -eq '/api/rom/save') {
            # only our own page may write into our folders
            if (-not $isLocal) { $res.StatusCode = 403 }
            else {
              try { $r = RomSave $req } catch { $r = @([ordered]@{ error = ('保存失败：' + $_.Exception.Message); code = 'write' }, 500) }
              SendJson $res $r[0] $r[1]
            }
          }
          elseif ($req.ContentLength64 -gt 256KB -or ($req.HasEntityBody -and $req.ContentLength64 -lt 0)) { $res.StatusCode = 413 }
          else {
            $reader = New-Object IO.StreamReader($req.InputStream, $utf8)
            $body = $reader.ReadToEnd(); $reader.Close()
            $data = $null
            if (-not $path.StartsWith('/cp/')) { try { $data = $body | ConvertFrom-Json } catch {} }
            if ($path.StartsWith('/cp/')) { CloudProxy $req $res 'POST' ($utf8.GetBytes($body)) }
            elseif ($null -eq $data) { SendJson $res ([ordered]@{ error = 'bad request' }) 400 }
            elseif ($path.StartsWith('/api/mp/')) { $script:reqIph = IpHash ([string]$req.RemoteEndPoint.Address); $r = MpHandle $path $data; SendJson $res $r[0] $r[1] }
            elseif (-not $isLocal) { $res.StatusCode = 403 }
            elseif ($path -eq '/api/lan') {
              $saved = ReadSaved
              $want = [bool]$data.enabled
              $changed = (LanEnabled) -ne $want
              $saved['lan'] = $want
              WriteSaved $saved
              SendJson $res ([ordered]@{ enabled = $want; port = $port; addresses = (LanAddresses); isLocal = $true; restarting = $changed })
              if ($changed) { $restart = $true }
            }
            elseif ($path -eq '/api/quit') {
              # A newly opened EmulatorJS asks this (older) one to quit
              SendJson $res ([ordered]@{ ok = $true })
              try { $res.Close() } catch {}
              try { $listener.Stop(); $listener.Close() } catch {}
              [Environment]::Exit(0)
            }
            elseif ($path -eq '/api/cloud') {
              # Internet play server address + room password (saved in config.json, travels with the folder)
              $url = ([string]$data.url).Trim().TrimEnd('/')
              $key = ([string]$data.key).Trim()
              $bad = $false
              if ($url -and -not $url.Contains('://')) { $url = 'http://' + $url }
              if ($url) {
                $u = $null
                if (-not [Uri]::TryCreate($url, [UriKind]::Absolute, [ref]$u) -or ($u.Scheme -ne 'http' -and $u.Scheme -ne 'https')) { $bad = $true }
                elseif ($u.Scheme -eq 'http' -and $u.IsDefaultPort -and -not $url.EndsWith(':80')) { $url = $url + ':8765' }
              }
              if ($key.Length -gt 200) { $key = $key.Substring(0, 200) }
              if ($bad) { SendJson $res ([ordered]@{ error = '地址格式不对，例如 http://1.2.3.4:8765' }) 400 }
              else {
                $saved = ReadSaved
                $saved['cloud_url'] = $url; $saved['cloud_key'] = $key
                # saved servers (one server = one lobby, can switch between them)
                if ($data.PSObject.Properties.Name -contains 'list' -and $data.list -is [array]) {
                  $lst = New-Object System.Collections.ArrayList
                  foreach ($x in @($data.list | Select-Object -First 20)) {
                    $xu = ([string]$x.url).Trim().TrimEnd('/'); $xk = ([string]$x.key).Trim()
                    if (-not $xu) { continue }
                    if (-not $xu.Contains('://')) { $xu = 'http://' + $xu }
                    $uu = $null
                    if (-not [Uri]::TryCreate($xu, [UriKind]::Absolute, [ref]$uu) -or ($uu.Scheme -ne 'http' -and $uu.Scheme -ne 'https')) { continue }
                    if ($uu.Scheme -eq 'http' -and $uu.IsDefaultPort -and -not $xu.EndsWith(':80')) { $xu = $xu + ':8765' }
                    if ($xk.Length -gt 200) { $xk = $xk.Substring(0, 200) }
                    [void]$lst.Add([ordered]@{ url = $xu; key = $xk })
                  }
                  $saved['cloud_list'] = @($lst)
                }
                WriteSaved $saved
                SendJson $res (CurrentConfig)
              }
            }
            elseif ($path -eq '/api/config') {
              $saved = ReadSaved
              $err = $null
              foreach ($k in $kinds) {
                if ($data.PSObject.Properties.Name -contains $k) {
                  $p = ([string]$data.$k).Trim()
                  if ($p) {
                    $p = [IO.Path]::GetFullPath([Environment]::ExpandEnvironmentVariables($p))
                    if (-not (IsDir $p)) { $err = "文件夹不存在：$p"; break }
                  }
                  $saved[$k] = $p
                }
              }
              if ($err) { SendJson $res ([ordered]@{ error = $err }) 400 }
              else { WriteSaved $saved; SendJson $res (CurrentConfig) }
            }
            else { $res.StatusCode = 404 }
          }
        }
        elseif ($path.StartsWith('/cp/')) { CloudProxy $req $res 'GET' $null }
        elseif ($path -eq '/api/config') { if ($isLocal) { SendJson $res (CurrentConfig) } else { SendJson $res (PublicConfig) } }
        elseif ($path -eq '/api/lan') {
          SendJson $res ([ordered]@{ enabled = $lan; port = $port; addresses = (LanAddresses); isLocal = $isLocal; error = $lanError })
        }
        elseif ($path -eq '/api/mp/sessions') { $r = MpHandle $path $null; SendJson $res $r[0] $r[1] }
        elseif ($path -eq '/api/list') {
          $base = BaseDir $req.QueryString['root']
          if ($base) { SendJson $res ([ordered]@{ files = (ListFiles $base) }) }
          else { SendJson $res ([ordered]@{ files = @(); error = 'folder not set' }) }
        }
        elseif ($path -eq '/api/dirs') { if ($isLocal) { SendJson $res (ListDirs $req.QueryString['path']) } else { $res.StatusCode = 403 } }
        elseif ($path.StartsWith('/fs/')) {
          $rest = $path.Substring(4)
          $i = $rest.IndexOf('/')
          $target = $null
          if ($i -gt 0) {
            $base = BaseDir ($rest.Substring(0, $i))
            if ($base) { $target = SafeJoin $base ([Uri]::UnescapeDataString($rest.Substring($i + 1))) }
          }
          if ($target -and [IO.File]::Exists($target)) { SendFile $res $target $req.HttpMethod $req.Headers['Range'] }
          else { $res.StatusCode = 404 }
        }
        else {
          $rel = [Uri]::UnescapeDataString($path.TrimStart('/'))
          if ($rel -eq '') { $rel = 'index.html' }
          # Only the page itself and the data folder are served; everything else in the folder (config.json holds the
          # internet room password, scripts...) is not. Checked on the real file location, so other spellings can't get round it.
          $target = SafeJoin $root $rel
          if ($target) {
            $rootFull = [IO.Path]::GetFullPath($root).TrimEnd($sep)
            $okFile = ($target -eq ($rootFull + $sep + 'index.html')) -or ($target -eq ($rootFull + $sep + 'redirect.html')) -or
                      $target.StartsWith($rootFull + $sep + 'data' + $sep, [StringComparison]::OrdinalIgnoreCase)
            if (-not $okFile) { $target = $null }
          }
          if ($target -and [IO.File]::Exists($target)) { SendFile $res $target $req.HttpMethod $req.Headers['Range'] }
          else { $res.StatusCode = 404 }
        }
      }
    } catch {
      # The browser cancelled a request (page changed, image no longer needed): harmless, don't show it
      $m = [string]$_.Exception.Message
      if ($m -notmatch 'no longer available|forcibly closed|nonexistent network connection|transport connection|broken pipe|reset by peer') {
        Write-Host ("Error: " + $m + " (" + $req.Url.AbsolutePath + ")")
      }
      try { $res.StatusCode = 500 } catch {}
    }
    try { $res.Close() } catch {}
  }
  # LAN switch changed: listen again with the new setting
  Start-Sleep -Milliseconds 300
  try { $listener.Stop(); $listener.Close() } catch {}
  $listener = $null
  while (-not $listener) { try { $listener = StartListener (LanEnabled) } catch { Start-Sleep -Seconds 1 } }
}
