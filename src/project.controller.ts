import { Project } from './project.model';
import { workspace } from 'vscode';

export class ProjectController {

    private projects: Project[] = [];

    identifyProjects(selected: Project[]): Thenable<number> {
        return workspace.findFiles('**/*tsconfig.*.json', 'node_modules').then(res => {
            this.projects = res.map(r => <Project>{
                label: this.guessName(r.path),
                config: r.path,
                picked: selected.some(p => p.config === r.path)
            });
            return this.projects.length;
        });
    }

    getProjects(): Project[] {
        return this.projects;
    }

    updateProjects(selected: Project): Project[] {
        const index = this.projects.findIndex(p => p.config === selected.config);
        selected.picked = !selected.picked;
        this.projects[index] = selected;
        return this.projects.filter(p => p.picked);
    }

    private guessName(path: string): string {
        const names = path.split('/');
        return names[names.length - 1];
    }
}