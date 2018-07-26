import { Project } from './project.model';
import { readJson, writeJson } from 'fs-extra';
import * as vscode from 'vscode';

export class TreeController {
    updateTree(project: Project): void {
        const path = project.config.slice(1);
        readJson(path).then(r => this.hideExcluded(r.exclude));
    }

    private hideExcluded(patterns: string[]): void {
        console.log(patterns);
        const excludes: { [key: string]: boolean } = {};
        patterns.forEach(p => excludes[p] = true);
        writeJson(vscode.workspace.rootPath + '\\.vscode\\settings.json', { 'files.exclude': excludes }).then(res => console.log(res));
    }
}