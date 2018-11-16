import { QuickPickItem } from 'vscode';

export interface Project extends QuickPickItem {
    root: string;
    label: string;
    exclude: string[];
    include: string[];
    assets: string[];
}