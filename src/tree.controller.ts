import { Project } from './project.model';
import { writeJson, existsSync, readJsonSync } from 'fs-extra';
import * as vscode from 'vscode';
import { FILES_EXCLUDE } from './constants';

export class TreeController {
    updateTree(project: Project): void {
        const excluded = this.anaylyseExcluded(project);
        const settings = this.updateSettings(excluded);
        writeJson(this.settingsPath, settings).then(res => console.log(res));
    }

    private anaylyseExcluded(project: Project): string[] {
        const path = project.config.slice(1);
        const tsSettings = readJsonSync(path);
        // calculate the dependencies
        return tsSettings.exclude || [];
    }

    private updateSettings(patterns: string[]): { [key: string]: any } {
        console.log(patterns);
        const settings = this.getCurrentSettings();
        const currentExclude = settings[FILES_EXCLUDE];
        settings[FILES_EXCLUDE] = this.mergePatterns(currentExclude || {}, patterns);
        return settings;
    }

    private getCurrentSettings(): { [key: string]: any } {
        if (this.fileExists(this.settingsPath)) {
            return readJsonSync(this.settingsPath);
        } else {
            // create the file
        }
        return {};
    }

    private mergePatterns(currentPatterns: { [key: string]: boolean }, newPatterns: string[]): { [key: string]: boolean } {
        newPatterns.forEach(p => currentPatterns[p] = true);
        return currentPatterns;
    }

    get settingsPath(): string {
        return `${vscode.workspace.rootPath}\\.vscode\\settings.json`;
    }

    private fileExists(path: string): boolean {
        return existsSync(path);
    }
}