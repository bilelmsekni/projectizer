import { Project } from './project.model';
import { workspace } from 'vscode';
import { readJsonSync } from 'fs-extra';

export class ProjectController {

    private projects: Project[] = [];

    identifyProjects(selected: Project[]): Thenable<number> {
        return workspace.findFiles('**/angular.json', 'node_modules', 1).then(res => {
            if (res.length > 0) {
                const ngConfig = readJsonSync(res[0].fsPath);
                Object.keys(ngConfig.projects).forEach(project => {
                    const tsConfigPath = this.extractAppConfigPath(ngConfig.projects[project]);
                    if (tsConfigPath) {
                        this.projects.push({
                            label: project,
                            appConfig: tsConfigPath,
                            testConfig: this.extractTestConfigPath(ngConfig.projects[project]),
                            picked: selected.some(p => p.appConfig === tsConfigPath)
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

    updateProjects(selected: Project): Project[] {
        const index = this.projects.findIndex(p => p.appConfig === selected.appConfig);
        selected.picked = !selected.picked;
        this.projects[index] = selected;
        return this.projects.filter(p => p.picked);
    }

    private extractAppConfigPath(ngConfig: any): string {
        return ngConfig.architect.build ? ngConfig.architect.build.options.tsConfig : undefined;
    }

    private extractTestConfigPath(ngConfig: any): string {
        return ngConfig.architect.test ? ngConfig.architect.test.options.tsConfig : undefined;
    }
}