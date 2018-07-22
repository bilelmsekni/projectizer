import { Project } from './project.model';
import { workspace } from 'vscode';

export class ProjectController {
    identifyProjects(): Thenable<Project[]> {
        return workspace.findFiles('**/*tsconfig*.json', '**/tsconfig.json').then(res => {
            console.log(res);
            const projects = res.map(r => <Project>{
                label: this.guessName(r.path),
                config: r.path
            });
            return projects;
        });
    }

    private guessName(path: string): string {
        const names = path.split('/');
        return names[names.length - 1];
    }
}