import { Project } from './project.model';
import { writeJson, existsSync, readJsonSync } from 'fs-extra';
import { FILES_EXCLUDE } from './constants';
import { workspace } from 'vscode';

export class ExclusionController {

    updateExclusions(projects: Project[]): void {
        const exclusions = projects.map(p => this.analyseExcluded(p));
        const patterns = this.mergePatterns(exclusions);
        const settings = this.updateSettings(patterns);
        writeJson(this.settingsPath, settings);
    }

    private analyseExcluded(project: Project): string[] {
        const path = project.config.slice(1);
        const tsSettings = readJsonSync(path);
        return tsSettings.exclude || [];
    }

    private updateSettings(patterns: { [key: string]: boolean }): { [key: string]: any } {
        const settings = this.getCurrentSettings();
        settings[FILES_EXCLUDE] = patterns;
        return settings;
    }

    private getCurrentSettings(): { [key: string]: any } {
        if (existsSync(this.settingsPath)) {
            return readJsonSync(this.settingsPath);
        } else {

        }
        return {};
    }

    private mergePatterns(newPatterns: string[][]): { [key: string]: boolean } {
        const result: { [key: string]: boolean } = {};
        if (newPatterns && newPatterns.length > 0) {
            let intersection = newPatterns[0];
            for (let i = 1; i < newPatterns.length; i++) {
                intersection = intersection.filter(v => newPatterns[i].indexOf(v) !== -1);
            }
            intersection.forEach(p => result[p] = true);
        }
        return result;
    }

    private get settingsPath(): string {
        return `${workspace.rootPath}\\.vscode\\settings.json`;
    }
}