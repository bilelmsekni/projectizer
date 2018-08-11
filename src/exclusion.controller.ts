import { Project } from './project.model';
import { writeJson, existsSync, readJsonSync } from 'fs-extra';
import { FILES_EXCLUDE } from './constants';
import { workspace } from 'vscode';

export class ExclusionController {

    updateExclusions(projects: Project[]): void {
        const exclusions = projects
            .map(p => this.analyseExcluded(p));

        const patterns = this.mergePatterns(exclusions);
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
        const appSettings = readJsonSync(`${workspace.rootPath}\\${project.appConfig}`);
        const tstSettings = readJsonSync(`${workspace.rootPath}\\${project.testConfig}`);
        const appExclude = appSettings.exclude || [];
        const tstInclude = tstSettings.include || [];
        return appExclude.filter((e: string) => !tstInclude.includes(e));
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

    private mergePatterns(newPatterns: string[][]): { [key: string]: boolean } {
        const result: { [key: string]: boolean } = {};
        if (newPatterns && newPatterns.length > 0) {
            let intersections = newPatterns[0];
            for (let i = 1; i < newPatterns.length; i++) {
                intersections = intersections.filter(v => newPatterns[i].some(p => p === v));
            }
            intersections.forEach(p => result[p] = true);
        }
        return result;
    }

    private get settingsPath(): string {
        return `${workspace.rootPath}\\.vscode\\settings.json`;
    }
}