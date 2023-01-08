import { Plugin } from 'obsidian';
import { DBPluginSettings, DBPluginSettingTab, DEFAULT_SETTINGS } from './settings/Settings';
import { CSVView } from './CSVView';
import { TableParser } from './utils/TableParser';

// Remember to rename these classes and interfaces!

export default class DBPlugin extends Plugin {
	// @ts-ignore defined in onload
	settings: DBPluginSettings;
	// @ts-ignore defined in onload
	tableParser: TableParser;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.tableParser = new TableParser();

		this.registerView(CSVView.type, leaf => new CSVView(this, leaf));
		this.registerExtensions(['csv'], CSVView.type);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DBPluginSettingTab(this.app, this));
	}

	onunload(): void {
		//this.app.workspace.detachLeavesOfType(CSVView.type);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
