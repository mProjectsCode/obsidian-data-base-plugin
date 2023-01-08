import { App, PluginSettingTab } from 'obsidian';
import DBPlugin from '../main';

export interface DBPluginSettings {}

export const DEFAULT_SETTINGS: DBPluginSettings = {};

export class DBPluginSettingTab extends PluginSettingTab {
	plugin: DBPlugin;

	constructor(app: App, plugin: DBPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Data base Plugin Settings' });
	}
}
