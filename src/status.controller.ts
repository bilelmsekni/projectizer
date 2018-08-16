import { StatusBarItem } from 'vscode';
import { Project } from './project.model';
import { PROJECTIZE_COMMAND } from './constants';

export class StatusController {

    constructor(private statusItem: StatusBarItem) {
        statusItem.text = '$(telescope)';
        statusItem.command = PROJECTIZE_COMMAND;
        statusItem.show();
    }

    updateStatus(projects: { selected: Project[], unselected: Project[] }): void {
        let projectizing = '$(telescope)';
        for (let i = 0; i < projects.selected.length; i++) {
            projectizing += i < projects.selected.length - 1 ?
                ` ${projects.selected[i].label} |` : ` ${projects.selected[i].label}`;
        }
        this.statusItem.text = projectizing;
    }
}