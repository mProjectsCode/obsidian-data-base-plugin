import { Editor, FileView, MarkdownFileInfo, MarkdownView, OpenViewState, PaneType, Plugin, WorkspaceLeaf } from 'obsidian';
import { DBPluginSettings, DBPluginSettingTab, DEFAULT_SETTINGS } from './settings/Settings';
import { TableView } from './views/TableView';
import { TableParser } from './utils/TableParser';
import { AdvancedTableView } from './views/AdvancedTableView';
import MetaBindPlugin from 'main';
import { Table, TableEntry } from './utils/Table';
import { TableEntryView } from './views/TableEntryView';

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

		this.registerView(TableEntryView.type, leaf => new TableEntryView(this, leaf));

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DBPluginSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			// @ts-ignore
			// console.log('Meta Bind', this.app.plugins.plugins['obsidian-meta-bind-plugin']);
			// @ts-ignore
			this.metaBind = this.app.plugins.plugins['obsidian-meta-bind-plugin'];
		});

		this.addCommand({
			id: 'link-test',
			name: 'Link Test',
			editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
				const file = ctx.file;
				if (!file) {
					return;
				}
				console.log(this.app.metadataCache.getFileCache(file));

				if (ctx instanceof MarkdownView) {
					console.log(ctx);
				}
			},
		});

		// this.mixin();
	}

	mixin(): void {
		this.app.workspace.openLinkText = (function (_super) {
			return function () {
				console.log('Function Mixin openLinkText', arguments);
				// @ts-ignore
				return _super.apply(this, arguments);
			};
		})(this.app.workspace.openLinkText);

		WorkspaceLeaf.prototype.openFile = (function (_super) {
			return function () {
				console.log('Function Mixin openFile', arguments);
				// @ts-ignore
				return _super.apply(this, arguments);
			};
		})(WorkspaceLeaf.prototype.openFile);

		WorkspaceLeaf.prototype.setViewState = (function (_super) {
			return function () {
				console.log('Function Mixin setViewState', arguments);
				console.log(_super);
				// @ts-ignore
				return _super.apply(this, arguments);
			};
		})(WorkspaceLeaf.prototype.setViewState);

		FileView.prototype.setState = (function (_super) {
			return function () {
				console.log('Function Mixin setState', arguments);
				console.log(_super);
				// @ts-ignore
				return _super.apply(this, arguments);
			};
		})(FileView.prototype.setState);
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

	async openEntryView(entry: TableEntry, table: Table): Promise<void> {
		const leaf = this.app.workspace.getLeaf('tab');

		await leaf.setViewState({
			type: TableEntryView.type,
			active: true,
		});

		(leaf.view as TableEntryView).setData(entry, table);
	}
}
