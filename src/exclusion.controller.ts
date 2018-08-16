import { Project } from './project.model';
import { writeJson, existsSync, readJsonSync } from 'fs-extra';
import { FILES_EXCLUDE } from './constants';
import { workspace } from 'vscode';

export class ExclusionController {

    updateExclusions(projects: { selected: Project[], unselected: Project[] }): void {
        const exclusions = projects.selected
            .map(p => this.analyseSelected(p));

        // const dependencies = this.mergeDependencies(projects.selected, projects.unselected);

        const patterns = this.mergePatterns(exclusions);
        const allPatterns = this.addDependencies(patterns);
        const settings = this.updateSettings(allPatterns);
        writeJson(this.settingsPath, settings);
    }

    private analyseSelected(project: Project): string[] {
        return project.exclude.filter((e: string) => project.include.indexOf(e) < 0);
    }

    private mergeDependencies(selected: Project[], unselected: Project[]): string[] {
        const unselectedDependencies: string[] = [];
        const selectedDependencies: string[] = [];
        unselected.forEach(u => unselectedDependencies.push(...u.include));
        selected.forEach(u => selectedDependencies.push(...u.include));

        return unselectedDependencies.filter(ud => selectedDependencies.indexOf(ud) === -1);
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

    private get settingsPath(): string {
        return `${workspace.rootPath}\\.vscode\\settings.json`;
    }
}