import { Project } from './project.model';
import { workspace } from 'vscode';
import { readJsonSync } from 'fs-extra';

export class ProjectController {

    private projects: Project[] = [];

    identifyProjects(): Thenable<number> {
        return workspace.findFiles('**/angular.json', 'node_modules', 1).then(res => {
            if (res.length > 0) {
                const ngConfig = readJsonSync(res[0].fsPath);
                Object.keys(ngConfig.projects).forEach(project => {

                    const appConfigPath = this.extractAppConfigPath(ngConfig.projects[project]);
                    const tstConfigPath = this.extractTestConfigPath(ngConfig.projects[project]);
                    if (appConfigPath) {
                        this.projects.push({
                            label: project,
                            exclude: this.extractExcluded(appConfigPath),
                            include: this.extractIncluded(tstConfigPath),
                            dependencies: this.extractDependencies(ngConfig.projects[project]),
                            picked: false
                        });
                    }
                });
            }
            return this.projects.length;
        });
    }

    getProjects(): Project[] {
        return this.projects;
    }

    updateProjects(selected: Project): { selected: Project[], unselected: Project[] } {
        const index = this.projects.findIndex(p => p.label === selected.label);
        selected.picked = !selected.picked;
        this.projects[index] = selected;
        return { selected: this.projects.filter(p => p.picked), unselected: this.projects.filter(p => !p.picked) };
    }

    private extractExcluded(configPath: string): string[] {
        const appSettings = readJsonSync(`${workspace.rootPath}\\${configPath}`);
        return appSettings.exclude || [];
    }

    private extractIncluded(configPath: string): string[] {
        const appSettings = readJsonSync(`${workspace.rootPath}\\${configPath}`);
        return appSettings.include || [];
    }

    private extractAppConfigPath(ngConfig: any): string {
        return ngConfig.architect.build ? ngConfig.architect.build.options.tsConfig : undefined;
    }

    private extractTestConfigPath(ngConfig: any): string {
        return ngConfig.architect.test ? ngConfig.architect.test.options.tsConfig : undefined;
    }

    private extractDependencies(ngConfig: any): string[] {
        const assets = ngConfig.architect.build.options.assets || [];
        const styles = ngConfig.architect.build.options.styles || [];
        const scripts = ngConfig.architect.build.options.scripts || [];

        return [ngConfig.architect.build.options.tsConfig, ...assets, ...styles, ...scripts];
    }
}