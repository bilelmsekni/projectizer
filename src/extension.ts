'use strict';
import { ProjectController } from './project.controller';
import { ExclusionController } from './exclusion.controller';
import { Project } from './project.model';
import { window, commands, ExtensionContext } from 'vscode';

export function activate(context: ExtensionContext): void {
    const projectController = new ProjectController();
    const exclusionController = new ExclusionController();

    projectController.identifyProjects().then(res => window.showInformationMessage(`Projectizer identified ${res} project`));
    exclusionController.updateExclusions({ selected: [], unselected: [] });

    let disposable = commands.registerCommand('extension.projectize', () => {
        window.showQuickPick(projectController.getProjects(), {
            canPickMany: true,
            onDidSelectItem: (selected: Project) => {
                const updatedProjects = projectController.updateProjects(selected);
                exclusionController.updateExclusions(updatedProjects);
            }
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate(): void { }