import { ExtensionContext } from 'vscode';
import { Project } from './project.model';

export class SelectionController {

    constructor(private context: ExtensionContext) { }

    load(): Project[] {
        return this.context.globalState.get<Project[]>('selected') || [];
    }

    saveSelection(projects: Project[]): void {
        this.context.globalState.update('selected', projects);
    }
}