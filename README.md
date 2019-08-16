# command-runner
> Inspired By vscode-code-runner

Tested on macOS

## Usage

### Define your commands
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

### Run your command
- right click on file in file exploer
- `cmd + shift + p`, then type `Run commands`
- use shortcuts, cmd+shift+c

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




## Development

- Install dependencies

```shell
yarn
```

- Compile source code

```sh
yarn watch
```

- Start Development version of vscode

<pre>F5</pre>