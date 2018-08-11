import { Project } from './project.model';
import { writeJson, existsSync, readJsonSync } from 'fs-extra';
import { FILES_EXCLUDE } from './constants';
import { workspace } from 'vscode';

export class ExclusionController {

    updateExclusions(projects: Project[]): void {
        const exclusions = projects
            .filter(p => !this.isTestPattern(p))
            .map(p => this.analyseExcluded(p));

        const patterns = this.mergePatterns(exclusions, projects.some(p => this.isTestPattern(p)));
        const allPatterns = this.addDependencies(patterns);
        const settings = this.updateSettings(allPatterns);
        writeJson(this.settingsPath, settings);
    }

    private addDependencies(patterns: { [key: string]: boolean }): { [key: string]: object | boolean } {
        const additionalPatterns: { [key: string]: object | boolean } = {};
        const whenCondition = { 'when': '$(basename).ts' };
        Object.keys(patterns).forEach(p => {
            additionalPatterns[p] = true;
            if (p.includes('.ts')) {
                const html = p.replace('.ts', '.html');
                const scss = p.replace('.ts', '.scss');
                additionalPatterns[html] = whenCondition;
                additionalPatterns[scss] = whenCondition;
            }
        });
        return additionalPatterns;
    }

    private analyseExcluded(project: Project): string[] {
        const path = project.appConfig.slice(1);
        const tsSettings = readJsonSync(path);
        return tsSettings.exclude || [];
    }

    private updateSettings(patterns: { [key: string]: boolean | object }): { [key: string]: any } {
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

    private mergePatterns(newPatterns: string[][], withSpec: boolean): { [key: string]: boolean } {
        const result: { [key: string]: boolean } = {};
        if (newPatterns && newPatterns.length > 0) {
            let intersection = newPatterns[0];
            for (let i = 1; i < newPatterns.length; i++) {
                intersection = intersection.filter(v => newPatterns[i].some(p => p === v));
            }
            intersection.forEach(p => {
                if (withSpec) {
                    if (!this.isTestPattern(p)) {
                        result[p] = true;
                    }
                } else {
                    result[p] = true;
                }

            });
        }
        return result;
    }

    private get settingsPath(): string {
        return `${workspace.rootPath}\\.vscode\\settings.json`;
    }

    private isTestPattern(project: string | Project): boolean {
        if (typeof (project) === 'string') {
            return project.includes('.spec.ts') || project.includes('.spec-helpers.ts');
        }
        return project.appConfig.includes('.spec.json');
    }
}