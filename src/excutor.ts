import * as vscode from "vscode";
import * as fs from 'fs';
import * as os from 'os';

const TmpDir = os.tmpdir();
const storageKey = 'command_runner_mru';

export default class Excutor {
    constructor(private context: vscode.ExtensionContext) {}

    private terminal: vscode.Terminal | null = null;
    private fileUri: vscode.Uri | undefined;
    public excute(fileUri: vscode.Uri | undefined) {
        let cwd: string | undefined;
        let document: vscode.TextDocument | undefined;
        let workspace: string | undefined;
        
        this.fileUri = fileUri;
        const editor = vscode.window.activeTextEditor;
        // tslint:disable-next-line: no-unused-expression
        editor && (document = editor.document);
        // tslint:disable-next-line: no-unused-expression
        // ;

        if(fileUri) {
            cwd = this.isDir(fileUri) ? fileUri.fsPath : this.getCodeFileDir(fileUri.fsPath);
        } else if(document){
            cwd = this.getCodeFileDir(document.uri.fsPath);
        } else if (workspace = this.getWorkspaceFolder()) {
            cwd = workspace;
        } else {
            cwd = TmpDir;
        }
        
        if(cwd) {
            const commands = this.getConfig<{ [k : string]: string }>('commands');
            if(!commands) {
                return;
            }
            const sortedCommandNames = this.sortCommand(commands);
            vscode.window.showQuickPick(sortedCommandNames).then((key) => {
                if(key) {
                    this.setKeyDownCount(key);
                    const command = commands[key];
                    this.excuteCommand(command, cwd !== workspace, cwd!);
                }
            });
        }
    }

    private setKeyDownCount(key: string) {
        const keys = this.context.globalState.get<Array<string>>(storageKey, []);
        const index = keys.indexOf(key);
        if (index > -1) {
            const picked = keys.splice(index, 1)[0];
            keys.unshift(picked);
        } else {
            keys.unshift(key);
        }
        console.log(keys);
        this.context.globalState.update(storageKey, keys);
    }

    private sortCommand(commands: { [k: string]: string; }) {
        const mrus = this.context.globalState.get<Array<string>>(storageKey, []);
        const validMrus: string[] = [];
        mrus.forEach((item, index) => {
            if(commands[item]) {
                const picked = mrus.slice(index,index+1)[0];
                validMrus.push(picked);
            }
        });
        this.context.globalState.update(storageKey, validMrus);

        const notInMrus: string[] = [];
        Object.keys(commands).forEach(item => {
            if(!validMrus.includes(item)) {
                notInMrus.push(item);
            }
        });
        return [...validMrus, ...notInMrus];
    }

    public onDidCloseTerminal(): void {
        this.terminal = null;
    }



    private excuteCommand(command: string, cdCwd: boolean, cwd: string) {
        command = this.replacePlaceholders(command);
        this.excuteCommandInTerminal(command, cdCwd, cwd);
    }
    private excuteCommandInTerminal(command: string, cdCwd: boolean, cwd: string) {
        if (this.terminal === null) {
            this.terminal = vscode.window.createTerminal('Command Runner');
        }
        this.terminal.show();
        if (cdCwd) {
            this.terminal.sendText(`cd ${cwd}`);
        }
        this.terminal.sendText(command);
    }

    private getConfig<T>(key: string): T | undefined {
        const configs = vscode.workspace.getConfiguration('command-runner');
        if(configs) {
            return configs.get<T>(key);
        }
        return;
    }

    private isDir(fileUri: vscode.Uri) {
        let result = false;
        try {
            result = !fs.statSync(fileUri.fsPath).isFile();
        } catch (error) {
            console.error(error);
        }
        return result;
    }


    private getWorkspaceFolder(): string | undefined {
        if (vscode.workspace.workspaceFolders) {
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        } else {
            return undefined;
        }
    }

    /**
     * Gets the base name of the code file, that is without its directory.
     */
    private getCodeBaseFile(codeFile: string): string {
        const regexMatch = codeFile.match(/.*[\/\\](.*)/);
        return regexMatch ? regexMatch[1] : codeFile;
    }

    /**
     * Gets the code file name without its directory and extension.
     */
    private getCodeFileWithoutDirAndExt(codeFile: string): string {
        const regexMatch = codeFile.match(/.*[\/\\](.*(?=\..*))/);
        return regexMatch ? regexMatch[1] : codeFile;
    }

    /**
     * Gets the directory of the code file.
     */
    private getCodeFileDir(filePath: string): string {
        const regexMatch = filePath.match(/(.*[\/\\]).*/);
        return regexMatch ? regexMatch[1] : filePath;
    }


    private replacePlaceholders(command: string) {
        let filePath = this.fileUri && !this.isDir(this.fileUri) ? this.fileUri.fsPath : '';

        const placeholders: Array<{ regex: RegExp, replaceValue: string }> = [
            // // A placeholder that has to be replaced by the path of the folder opened in VS Code
            // // If no folder is opened, replace with the directory of the code file
            // { regex: /\$workspaceRoot/g, replaceValue: this.getWorkspaceRoot(codeFileDir) },
            // A placeholder that has to be replaced by the code file name without its extension
            { regex: /\$fileNameWithoutExt/g, replaceValue: this.getCodeFileWithoutDirAndExt(filePath) },
            // A placeholder that has to be replaced by the full code file name
            { regex: /\$fullFileName/g, replaceValue: filePath },
            // A placeholder that has to be replaced by the code file name without the directory
            { regex: /\$fileName/g, replaceValue: this.getCodeBaseFile(filePath) },
            // A placeholder that has to be replaced by the drive letter of the code file (Windows only)
            // { regex: /\$driveLetter/g, replaceValue: this.getDriveLetter() },
            // A placeholder that has to be replaced by the directory of the code file without a trailing slash
            // { regex: /\$dirWithoutTrailingSlash/g, replaceValue: this.quoteFileName(this.getCodeFileDirWithoutTrailingSlash()) },
            // A placeholder that has to be replaced by the directory of the code file
            { regex: /\$dir/g, replaceValue: this.getCodeFileDir(filePath) },
            // A placeholder that has to be replaced by the path of Python interpreter
            // { regex: /\$pythonPath/g, replaceValue: pythonPath },
        ];

        placeholders.forEach(p => command = command.replace(p.regex, p.replaceValue));

        return command;
    }
}