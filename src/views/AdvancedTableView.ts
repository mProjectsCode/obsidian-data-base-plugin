import { TFile, WorkspaceLeaf } from 'obsidian';
import DBPlugin from '../main';
import InteractiveTableComponent from '../table/InteractiveTableComponent.svelte';
import AdvancedTableHeaderComponent from '../table/AdvancedTableHeaderComponent.svelte';
import { TableData } from '../utils/TableParser';
import { AbstractTableView } from './AbstractTableView';

export interface AdvancedTableSettings {
	file: string;
}

export class AdvancedTableView extends AbstractTableView {
	static type: string = 'db-plugin-advanced-table-view';

	plugin: DBPlugin;
	// @ts-ignore
	tableData: TableData;
	// @ts-ignore
	tableSettings: AdvancedTableSettings;
	// @ts-ignore
	tableContainerEl: HTMLElement;
	// @ts-ignore
	settingsContainerEl: HTMLElement;

	constructor(plugin: DBPlugin, leaf: WorkspaceLeaf) {
		super(leaf);
		this.plugin = plugin;
	}

	public getDisplayText(): string {
		return AdvancedTableView.type;
	}

	public getViewType(): string {
		return AdvancedTableView.type;
	}

	public getViewData(): string {
		console.log('get view data');
		return JSON.stringify(this.tableSettings);
	}

	public setViewData(data: string, clear: boolean): void {
		console.log('set view data');
		if (data) {
			this.tableSettings = JSON.parse(data);
		} else {
			this.tableSettings = {
				file: '',
			};
		}

		this.contentEl.empty();
		this.settingsContainerEl = this.contentEl.createDiv();

		new AdvancedTableHeaderComponent({
			target: this.settingsContainerEl,
			props: {
				view: this,
				tableSettings: this.tableSettings,
			},
		});

		this.tableContainerEl = this.contentEl.createDiv({ cls: 'db-plugin-file-content' });
		this.tableContainerEl.createEl('p', { text: `loading data...` });

		this.loadTable();
	}

	public async loadTable(): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(this.tableSettings.file);
		if (!(file instanceof TFile)) {
			this.tableContainerEl.empty();
			this.tableContainerEl.createEl('p', { text: `invalid file path: ${this.tableSettings.file}` });
			return;
		}
		const fileContent: string = await this.app.vault.cachedRead(file);
		this.tableData = this.plugin.tableParser.parseCSV(fileContent);

		this.tableContainerEl.empty();
		new InteractiveTableComponent({
			target: this.tableContainerEl,
			props: {
				view: this,
				tableData: this.tableData,
			},
		});
	}

	public async saveTable(): Promise<void> {
		const csvString = this.plugin.tableParser.stringifyCSV(this.tableData);

		const file = this.app.vault.getAbstractFileByPath(this.tableSettings.file);
		if (!file) {
			await this.app.vault.create(this.tableSettings.file, csvString);
			return;
		} else if (file instanceof TFile) {
			await this.app.vault.modify(file, csvString);
		} else {
			throw new Error("couldn't save table data");
		}
	}

	public clear(): void {
		this.data = '';
	}

	protected async onOpen(): Promise<void> {}

	protected async onClose(): Promise<void> {}
}
