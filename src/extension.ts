'use strict';
import * as vscode from 'vscode';
import Excutor from './excutor';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const excutor = new Excutor();

    vscode.window.onDidCloseTerminal(function() {
        excutor.onDidCloseTerminal();
    });

    let disposable = vscode.commands.registerCommand('command-runner.excute', (uri: vscode.Uri | undefined) => {
        excutor.excute(uri);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    
}