import { Plugin } from 'obsidian';
import { DBPluginSettings, DBPluginSettingTab, DEFAULT_SETTINGS } from './settings/Settings';
import { TableView } from './views/TableView';
import { TableParser } from './utils/TableParser';
import { AdvancedTableView } from './views/AdvancedTableView';
import MetaBindPlugin from 'main';

// Remember to rename these classes and interfaces!

export default class DBPlugin extends Plugin {
	// @ts-ignore defined in onload
	settings: DBPluginSettings;
	// @ts-ignore defined in onload
	tableParser: TableParser;

	// @ts-ignore defined in onload
	metaBind: MetaBindPlugin;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.tableParser = new TableParser();

		this.registerView(TableView.type, leaf => new TableView(this, leaf));
		this.registerExtensions(['csv'], TableView.type);
		this.registerView(AdvancedTableView.type, leaf => new AdvancedTableView(this, leaf));
		this.registerExtensions(['csvdb'], AdvancedTableView.type);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DBPluginSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			// @ts-ignore
			console.log('Meta Bind', this.app.plugins.plugins['obsidian-meta-bind-plugin']);
			// @ts-ignore
			this.metaBind = this.app.plugins.plugins['obsidian-meta-bind-plugin'];
		});
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
