import { QuickPickItem } from 'vscode';

export interface Project extends QuickPickItem {
    label: string;
    exclude: string[];
    include: string[];
    assets: string[];
}