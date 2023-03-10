import { TFile, WorkspaceLeaf } from 'obsidian';
import DBPlugin from '../main';
import AdvancedTableViewComponent from '../table/AdvancedTableViewComponent.svelte';
import { AbstractTableView } from './AbstractTableView';
import { DEFAULT_TABLE_CONFIG, Table, TableConfig, TableData } from '../utils/Table';

export class AdvancedTableView extends AbstractTableView {
	static type: string = 'db-plugin-advanced-table-view';

	plugin: DBPlugin;
	// @ts-ignore
	table: Table;
	// @ts-ignore
	advancedTableViewComponent: AdvancedTableViewComponent;

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
		return JSON.stringify(this.table.tableConfig, undefined, 4);
	}

	public setViewData(data: string, clear: boolean): void {
		console.trace();

		console.log(this.leaf.getEphemeralState());
		console.log(this.leaf.getViewState());

		const tableConfig: TableConfig = structuredClone(DEFAULT_TABLE_CONFIG);

		if (data) {
			Object.assign(tableConfig, JSON.parse(data));
		}

		this.contentEl.empty();

		this.advancedTableViewComponent = new AdvancedTableViewComponent({
			target: this.contentEl,
			props: {
				view: this,
				tableConfig: tableConfig,
			},
		});

		this.loadTable(tableConfig);
	}

	public async loadTable(tableConfig: TableConfig): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(tableConfig.file);
		if (!(file instanceof TFile)) {
			this.advancedTableViewComponent.setTableError(`invalid file path: ${tableConfig.file}`);
			return;
		}
		const fileContent: string = await this.app.vault.cachedRead(file);
		const tableData: TableData = this.plugin.tableParser.parseCSV(fileContent);

		this.table = new Table(this.plugin, tableData, tableConfig);

		this.table.addDataChangeListener(() => {
			this.saveTable();
		});

		this.table.addConfigChangeListener(() => {
			this.save();
		});

		this.advancedTableViewComponent.setTable(this.table);
	}

	public async saveTable(): Promise<void> {
		const csvString = this.plugin.tableParser.stringifyCSV(this.table.tableData);

		const file = this.app.vault.getAbstractFileByPath(this.table.tableConfig.file);
		if (!file) {
			await this.app.vault.create(this.table.tableConfig.file, csvString);
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

	protected async onClose(): Promise<void> {
		this.advancedTableViewComponent.$destroy();
	}
}
