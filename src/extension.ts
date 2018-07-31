'use strict';
import { ProjectController } from './project.controller';
import { ExclusionController } from './exclusion.controller';
import { Project } from './project.model';
import { SelectionController } from './selection.controller';
import { window, commands, ExtensionContext } from 'vscode';

export function activate(context: ExtensionContext): void {
    const projectController = new ProjectController();
    const exclusionController = new ExclusionController();
    const selectionController = new SelectionController(context);

    const currentSelection = selectionController.load();

    projectController.identifyProjects(currentSelection).then(
        res => window.showInformationMessage(`Projectizer identified ${res} project`)
    );
    exclusionController.updateExclusions(currentSelection);

    let disposable = commands.registerCommand('extension.projectize', () => {
        window.showQuickPick(projectController.getProjects(), {
            canPickMany: true,
            onDidSelectItem: (selected: Project) => {
                const selectedProjects = projectController.updateProjects(selected);
                exclusionController.updateExclusions(selectedProjects);
                selectionController.saveSelection(selectedProjects);
            }
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate(): void { }