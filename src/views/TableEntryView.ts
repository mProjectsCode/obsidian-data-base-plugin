import { ItemView, MarkdownRenderer, WorkspaceLeaf } from 'obsidian';
import { Table, TableEntry } from '../utils/Table';
import DBPlugin from '../main';

export class TableEntryView extends ItemView {
	static type: string = 'db-plugin-table-entry-view';

	plugin: DBPlugin;

	entry: TableEntry | undefined;
	table: Table | undefined;

	constructor(plugin: DBPlugin, leaf: WorkspaceLeaf) {
		super(leaf);
		this.plugin = plugin;
	}

	public getDisplayText(): string {
		return 'Table Entry View';
	}

	public getViewType(): string {
		return TableEntryView.type;
	}

	setData(entry: TableEntry, table: Table): void {
		this.entry = entry;
		this.table = table;

		this.contentEl.empty();

		table.renderEntry(entry, this.contentEl, this);
	}

	protected async onOpen(): Promise<void> {}
}
