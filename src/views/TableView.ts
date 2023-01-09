import { WorkspaceLeaf } from 'obsidian';
import DBPlugin from '../main';
import TableComponent from '../table/TableComponent.svelte';
import { TableData } from '../utils/TableParser';
import { AbstractTableView } from './AbstractTableView';

export class TableView extends AbstractTableView {
	static type: string = 'db-plugin-csv-view';

	plugin: DBPlugin;
	// @ts-ignore
	tableData: TableData;

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
		return this.plugin.tableParser.stringifyCSV(this.tableData);
	}

	public setViewData(data: string, clear: boolean): void {
		console.log('set view data');
		this.tableData = this.plugin.tableParser.parseCSV(data);

		this.contentEl.empty();
		new TableComponent({
			target: this.contentEl,
			props: {
				view: this,
				tableData: this.tableData,
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
