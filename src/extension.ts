'use strict';
import { ProjectController } from './project.controller';
import { ExclusionController } from './exclusion.controller';
import { window, commands, ExtensionContext, StatusBarAlignment } from 'vscode';
import { StatusController } from './status.controller';
import { PROJECTIZE_COMMAND } from './constants';
import { Project } from './project.model';

export function activate(context: ExtensionContext): void {
    const projectController = new ProjectController();
    const exclusionController = new ExclusionController();
    const statusController = new StatusController(window.createStatusBarItem(StatusBarAlignment.Right));

    projectController.identifyProjects().then(res => window.showInformationMessage(`Projectizer identified ${res} project`));
    exclusionController.resetExclusions();
    let disposable = commands.registerCommand(PROJECTIZE_COMMAND, () => {

        window.showQuickPick(projectController.getProjects(), {
            canPickMany: true,
            placeHolder: 'Focus on a project'
        }).then(selected => {
            const updatedProjects = projectController.updateProjects(selected as Project[]);
            exclusionController.updateExclusions(updatedProjects);
            statusController.updateStatus(updatedProjects);
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate(): void { }