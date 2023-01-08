import { TextFileView, WorkspaceLeaf } from 'obsidian';
import DBPlugin from './main';
import TableComponent from './table/TableComponent.svelte';
import { TableData } from './utils/TableParser';

export class CSVView extends TextFileView {
	static type: string = 'db-plugin-csv-view';

	plugin: DBPlugin;
	// @ts-ignore
	tableData: TableData;

	constructor(plugin: DBPlugin, leaf: WorkspaceLeaf) {
		super(leaf);
		this.plugin = plugin;
	}

	public getDisplayText(): string {
		return CSVView.type;
	}

	public getViewType(): string {
		return CSVView.type;
	}

	public getViewData(): string {
		return this.plugin.tableParser.stringifyCSV(this.tableData);
	}

	public setViewData(data: string, clear: boolean): void {
		this.tableData = this.plugin.tableParser.parseCSV(data);

		this.contentEl.empty();
		new TableComponent({
			target: this.contentEl,
			props: {
				tableData: this.tableData,
			},
		});
	}

	public clear(): void {
		this.data = '';
	}

	protected async onOpen(): Promise<void> {}

	protected async onClose(): Promise<void> {}
}
