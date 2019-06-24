# command-runner
> inspired By vscode-code-runner

Tested in macOS

## Usage

### Define command
Define your own command in `settings.json`, like that

```json
"command-runner.commands": {
    "babel": "babel $fileName",
    "pwd": "pwd"
}
```

Predefined placeholders (like `$fullName` above) are listed below

- $fileNameWithoutExt
- $fullFileName
- $fileName
- $dir

if the placeholder above can't be found in the specific excution, it will be removed

## CWD (current working directory)

cwd is up to the code below.

```ts
if(fileUri) {
    cwd = this.isDir(fileUri) ? fileUri.fsPath : this.getCodeFileDir(fileUri.fsPath);  
} else if(document){
    cwd = this.getCodeFileDir(document.uri.fsPath);
} else if (workspace = this.getWorkspaceFolder()) {
    cwd = workspace;
} else {
    cwd = TmpDir;
}
```


## Extension Settings

No Settings

