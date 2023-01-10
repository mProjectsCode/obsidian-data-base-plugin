import { WorkspaceLeaf } from 'obsidian';
import DBPlugin from '../main';
import TableComponent from '../table/FastTableComponent.svelte';
import { AbstractTableView } from './AbstractTableView';
import { DEFAULT_TABLE_CONFIG, Table, TableData } from '../utils/Table';

export class TableView extends AbstractTableView {
	static type: string = 'db-plugin-csv-view';

	plugin: DBPlugin;
	// @ts-ignore
	table: Table;

	constructor(plugin: DBPlugin, leaf: WorkspaceLeaf) {
		super(leaf);
		this.plugin = plugin;
	}

	public getDisplayText(): string {
		return TableView.type;
	}

	public getViewType(): string {
		return TableView.type;
	}

	public getViewData(): string {
		console.log('get view data');
		return this.plugin.tableParser.stringifyCSV(this.table.tableData);
	}

	public setViewData(data: string, clear: boolean): void {
		console.log('set view data');
		const tableData: TableData = this.plugin.tableParser.parseCSV(data);
		this.table = new Table(tableData, DEFAULT_TABLE_CONFIG);

		this.contentEl.empty();
		new TableComponent({
			target: this.contentEl,
			props: {
				view: this,
				table: this.table,
			},
		});
	}

	public async saveTable(): Promise<void> {
		return this.save();
	}

	public clear(): void {
		this.data = '';
	}

	protected async onOpen(): Promise<void> {}

	protected async onClose(): Promise<void> {}
}
