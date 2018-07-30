'use strict';
import * as vscode from 'vscode';
import { ProjectController } from './project.controller';
import { TreeController } from './tree.controller';
import { Project } from './project.model';

export function activate(context: vscode.ExtensionContext): void {
    const projectController = new ProjectController();
    const treeController = new TreeController();
    // save extension settings
    // hide empty folders (vs code not handling it by default)

    const projects = projectController.identifyProjects().then(
        res => {
            vscode.window.showInformationMessage(`Projectizer identified ${res.length} project`);
            return res;
        }
    );

    let disposable = vscode.commands.registerCommand('extension.projectize', () => {
        vscode.window.showQuickPick(projects, {
            canPickMany: true,
            onDidSelectItem: selected => treeController.updateTree(selected as Project)
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate(): void { }