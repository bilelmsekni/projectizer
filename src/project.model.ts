import { QuickPickItem } from 'vscode';

export interface Project extends QuickPickItem {
    label: string;
    appConfig: string;
    testConfig: string;
}