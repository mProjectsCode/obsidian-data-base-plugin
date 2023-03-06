import { Component, MarkdownRenderer, TFile } from 'obsidian';
import { compareTableEntriesByColumns, deepFreeze } from './Utils';
import { SimpleColumnEditModal } from '../modals/SimpleColumnEditModal';
import { DeleteConfirmModal } from '../modals/DeleteConfirmModal';
import * as fuzzysort from 'fuzzysort';
import DBPlugin from '../main';
import { EntryEditModal } from '../modals/EntryEditModal';
import * as Handlebars from 'handlebars';

/**
 * TableData models the underlying (CSV) file
 */
export interface RawTableData {
	columns: RawTableColumn[];
	entries: RawTableEntry[];
}

export type RawTableColumn = string;

export type RawTableEntry = Record<string, string | null>;

export interface TableData {
	columns: TableColumn[];
	entries: TableEntry[];
}

export interface TableColumn {
	name: RawTableColumn;
	id: TableColumnId;
}

export type TableColumnId = string;

export interface TableEntry {
	data: RawTableEntry;
	id: TableEntryId;
	visible: boolean;
	highlightedData: Record<string, string | undefined>;
}

export type TableEntryId = string;

/**
 * TableConfiguration models the data saved to a csvdb file
 */
export interface TableConfig {
	sortingConfig: SortingConfig;
	columnConfigs: TableColumnConfig[];
	entriesPerPage: number;
	file: string;
	entryViewTemplateFile: string;
}

export interface SortingConfig {
	mode: SortingMode;
	column: TableColumnId;
}

export enum SortingMode {
	NONE = 'none',
	ASCENDING = 'ascending',
	DESCENDING = 'descending',
}

export interface TableColumnConfig {
	columnId: TableColumnId;
	columnName: string;
	dataType: TableColumnDataType;
	width: number;
}

export enum TableColumnDataType {
	STRING = 'string',
	NUMBER = 'number',
}

export const DEFAULT_SORTING_CONFIG: SortingConfig = {
	column: '',
	mode: SortingMode.DESCENDING,
} as const;
deepFreeze(DEFAULT_SORTING_CONFIG);

export const DEFAULT_TABLE_CONFIG: TableConfig = {
	sortingConfig: DEFAULT_SORTING_CONFIG,
	columnConfigs: [] as TableColumnConfig[],
	entriesPerPage: 500,
	file: '',
	entryViewTemplateFile: '',
} as const;
deepFreeze(DEFAULT_TABLE_CONFIG);

export class Table {
	plugin: DBPlugin;

	tableData: TableData;
	tableConfig: TableConfig;

	file?: TFile;

	dataUpdateListeners: { id: string; callback: (tableData: TableData) => void }[];
	configUpdateListeners: { id: string; callback: (tableConfig: TableConfig) => void }[];

	constructor(plugin: DBPlugin, tableData: TableData, tableConfig: TableConfig) {
		this.plugin = plugin;
		this.tableData = tableData;
		this.tableConfig = tableConfig;

		console.log(this);

		this.initColumnConfigs(tableData);

		this.dataUpdateListeners = [];
		this.configUpdateListeners = [];
	}

	private initColumnConfigs(tableData: TableData): void {
		const newColumnConfig: TableColumnConfig[] = [];
		for (const column of tableData.columns) {
			const columnConfigIndex = this.getColumnConfigIndexByName(column.name);

			if (columnConfigIndex === -1) {
				newColumnConfig.push(this.createDefaultColumnConfig(column));
			} else {
				const oldColumnConfig: TableColumnConfig = this.tableConfig.columnConfigs[columnConfigIndex];
				const defaultColumnConfig: TableColumnConfig = this.createDefaultColumnConfig(column);

				newColumnConfig.push({
					columnId: defaultColumnConfig.columnId,
					columnName: defaultColumnConfig.columnName,
					dataType: oldColumnConfig.dataType ?? defaultColumnConfig.dataType,
					width: oldColumnConfig.width ?? defaultColumnConfig.width,
				});
			}
		}
		this.tableConfig.columnConfigs = newColumnConfig;
	}

	private createDefaultColumnConfig(column: TableColumn): TableColumnConfig {
		return {
			columnId: column.id,
			columnName: column.name,
			dataType: TableColumnDataType.STRING,
			width: 150,
		};
	}

	// region Listeners

	addDataChangeListener(callback: (tableData: TableData) => void): string {
		const id = crypto.randomUUID();
		this.dataUpdateListeners.push({ id: id, callback: callback });
		return id;
	}

	addConfigChangeListener(callback: (tableConfig: TableConfig) => void): string {
		const id = crypto.randomUUID();
		this.configUpdateListeners.push({ id: id, callback: callback });
		return id;
	}

	removeDataChangeListener(id: string): void {
		this.dataUpdateListeners = this.dataUpdateListeners.filter(x => x.id !== id);
	}

	removeConfigChangeListener(id: string): void {
		this.configUpdateListeners = this.configUpdateListeners.filter(x => x.id !== id);
	}

	notifyDataChangeListeners(): void {
		console.debug('notifying data change listeners');
		for (const tableDataUpdateCallback of this.dataUpdateListeners) {
			tableDataUpdateCallback.callback(this.tableData);
		}
	}

	notifyConfigChangeListeners(): void {
		console.debug('notifying config change listeners');
		for (const tableConfigUpdateCallbacks of this.configUpdateListeners) {
			tableConfigUpdateCallbacks.callback(this.tableConfig);
		}
	}

	// endregion

	cycleSortingModeForColumn(column: TableColumn): void {
		this.tableConfig.sortingConfig = {
			mode: this.getNextSortingMode(this.tableConfig.sortingConfig.column === column.id ? this.tableConfig.sortingConfig.mode : SortingMode.NONE),
			column: column.id,
		};
		this.notifyConfigChangeListeners();

		this.sort();
	}

	getNextSortingMode(sortingMode: SortingMode): SortingMode {
		if (sortingMode === SortingMode.NONE) {
			return SortingMode.DESCENDING;
		} else if (sortingMode === SortingMode.DESCENDING) {
			return SortingMode.ASCENDING;
		} else if (sortingMode === SortingMode.ASCENDING) {
			return SortingMode.NONE;
		}

		return SortingMode.NONE;
	}

	getDefaultSortingConfig(): SortingConfig {
		return {
			mode: DEFAULT_SORTING_CONFIG.mode,
			column: this.tableData.columns[0].id,
		};
	}

	sort(): void {
		if (this.tableConfig.sortingConfig.mode === SortingMode.NONE) {
			this.tableConfig.sortingConfig = this.getDefaultSortingConfig();
			this.notifyConfigChangeListeners();
		}

		const columnConfig: TableColumnConfig | undefined = this.getColumnConfigById(this.tableConfig.sortingConfig.column);
		if (!columnConfig) {
			console.warn(new Error(`can not sort column by column id '${this.tableConfig.sortingConfig.column}'. A column with this id does not exist.`));
			return;
		}

		this.tableData.entries.sort((a, b) => {
			if (this.tableConfig.sortingConfig.mode === SortingMode.ASCENDING) {
				return -1 * compareTableEntriesByColumns(a, b, columnConfig);
			} else if (this.tableConfig.sortingConfig.mode === SortingMode.DESCENDING) {
				return compareTableEntriesByColumns(a, b, columnConfig);
			} else {
				return 0;
			}
		});

		this.notifyDataChangeListeners();
	}

	filter(columnId: TableColumnId, searchTerm: string, fuzzy: boolean): void {
		if (!searchTerm) {
			this.clearFilter();
			return;
		}

		const searchResults: Fuzzysort.KeyResults<TableEntry> = fuzzysort.go(searchTerm, this.tableData.entries, { key: `data.${columnId}` });
		for (const tableEntry of this.tableData.entries) {
			tableEntry.visible = false;
			tableEntry.highlightedData = {};
		}
		for (const searchResult of searchResults) {
			searchResult.obj.visible = true;
			searchResult.obj.highlightedData[columnId] = fuzzysort.highlight(searchResult, '<span class="db-plugin-highlight">', '</span>') ?? undefined;
		}

		this.notifyDataChangeListeners();
	}

	clearFilter(): void {
		for (const tableEntry of this.tableData.entries) {
			tableEntry.visible = true;
			tableEntry.highlightedData = {};
		}

		this.notifyDataChangeListeners();
	}

	// region Columns

	getColumnById(id: TableColumnId): TableColumn | undefined {
		return this.tableData.columns.find(x => x.id === id);
	}

	getColumnConfigById(id: TableColumnId): TableColumnConfig | undefined {
		return this.tableConfig.columnConfigs.find(x => x.columnId === id);
	}

	getColumnIndexById(id: TableColumnId): number {
		return this.tableData.columns.findIndex(x => x.id === id);
	}

	getColumnConfigIndexById(id: TableColumnId): number {
		return this.tableConfig.columnConfigs.findIndex(x => x.columnId === id);
	}

	getColumnConfigIndexByName(name: string): number {
		return this.tableConfig.columnConfigs.findIndex(x => x.columnName === name);
	}

	insertColumnAtIndex(column: TableColumn, columnConfig: TableColumnConfig, index: number): void {
		this.tableData.columns.splice(index, 0, column);
		this.tableConfig.columnConfigs.push(columnConfig);

		for (const entry of this.tableData.entries) {
			entry.data[column.id] = null;
		}

		this.notifyConfigChangeListeners();
		this.notifyDataChangeListeners();
	}

	updateColumn(columnId: TableColumnId, updatedColumn: TableColumn): void {
		const columnIndex = this.getColumnIndexById(columnId);
		if (columnIndex === -1) {
			throw new Error(`can not update column '${columnId}'. A column with this id does not exist.`);
		}

		this.tableData.columns[columnIndex] = updatedColumn;

		this.notifyDataChangeListeners();
	}

	updateColumnConfig(columnId: TableColumnId, updatedColumnConfig: TableColumnConfig): void {
		const columnConfigIndex = this.getColumnConfigIndexById(columnId);
		if (columnConfigIndex === -1) {
			throw new Error(`can not update column config '${columnId}'. A column config with this id does not exist.`);
		}

		this.tableConfig.columnConfigs[columnConfigIndex] = updatedColumnConfig;

		this.notifyConfigChangeListeners();
	}

	createColumnAtEnd(): void {
		this.createColumnAtIndexWithModal(this.tableData.columns.length - 1);
	}

	createColumnToTheRight(reference: TableColumnId): void {
		const refIndex = this.getColumnIndexById(reference);
		if (refIndex === -1) {
			throw new Error(`can not insert column to the right of '${reference}'. A column with this id does not exist.`);
		}
		this.createColumnAtIndexWithModal(refIndex + 1);
	}

	createColumnToTheLeft(reference: TableColumnId): void {
		const refIndex = this.getColumnIndexById(reference);
		if (refIndex === -1) {
			throw new Error(`can not insert column to the left of '${reference}'. A column with this id does not exist.`);
		}
		this.createColumnAtIndexWithModal(refIndex);
	}

	createColumnAtIndexWithModal(index: number): void {
		const id: string = crypto.randomUUID();
		const column: TableColumn = { name: `Column ${id}`, id: id };
		const columnConfig: TableColumnConfig = this.createDefaultColumnConfig(column);

		const editModal = new SimpleColumnEditModal(
			this,
			column,
			columnConfig,
			(updatedColumn, updatedColumnConfig) => {
				this.insertColumnAtIndex(updatedColumn, updatedColumnConfig, index);
			},
			() => {}
		);

		editModal.open();
	}

	editColumnWithModal(columnId: TableColumnId): void {
		const column: TableColumn | undefined = this.getColumnById(columnId);

		if (!column) {
			throw new Error(`can not edit column '${columnId}'. A column with this id does not exist.`);
		}

		const columnConfig: TableColumnConfig | undefined = this.getColumnConfigById(columnId);

		if (!columnConfig) {
			throw new Error(`can not edit column '${columnId}'. A column config with this id does not exist.`);
		}

		const editModal = new SimpleColumnEditModal(
			this,
			column,
			columnConfig,
			(updatedColumn, updatedColumnConfig) => {
				this.updateColumn(column.id, updatedColumn);
				this.updateColumnConfig(column.id, updatedColumnConfig);

				// console.log(updatedColumn, updatedColumnConfig);

				if (this.tableConfig.sortingConfig.column === column.id) {
					this.sort();
				}
			},
			() => {}
		);

		editModal.open();
	}

	deleteColumnWithModal(columnId: TableColumnId): void {
		const columnIndex: number = this.getColumnIndexById(columnId);

		if (columnIndex === -1) {
			throw new Error(`can not delete column '${columnId}'. A column with this id does not exist.`);
		}

		const columnConfigIndex: number = this.getColumnConfigIndexById(columnId);

		if (columnConfigIndex === -1) {
			throw new Error(`can not delete column '${columnId}'. A column config with this id does not exist.`);
		}

		new DeleteConfirmModal(
			this.plugin.app,
			'column',
			() => {
				this.tableData.columns.splice(columnIndex, 1);
				this.tableConfig.columnConfigs.splice(columnConfigIndex, 1);

				this.notifyConfigChangeListeners();
				this.notifyDataChangeListeners();
			},
			() => {}
		).open();
	}

	setColumnWidth(columnId: TableColumnId, width: number): void {
		const columnConfigIndex: number = this.getColumnConfigIndexById(columnId);

		if (columnConfigIndex === -1) {
			throw new Error(`can not edit column '${columnId}'. A column config with this id does not exist.`);
		}

		this.tableConfig.columnConfigs[columnConfigIndex].width = width;

		this.notifyConfigChangeListeners();
	}

	moveColumnLeft(columnId: TableColumnId): void {
		const colIndex = this.getColumnIndexById(columnId);
		const swapIndex = colIndex - 1;
		if (swapIndex < 0) {
			return;
		}

		this.swapColumnsAtIndex(colIndex, swapIndex);
	}

	moveColumnRight(columnId: TableColumnId): void {
		const colIndex = this.getColumnIndexById(columnId);
		const swapIndex = colIndex + 1;
		if (swapIndex >= this.tableData.columns.length) {
			return;
		}

		this.swapColumnsAtIndex(colIndex, swapIndex);
	}

	swapColumnsAtIndex(index1: number, index2: number): void {
		[this.tableData.columns[index1], this.tableData.columns[index2]] = [this.tableData.columns[index2], this.tableData.columns[index1]];

		this.notifyDataChangeListeners();
	}

	// endregion

	// region Entries

	getEntryById(id: TableEntryId): TableEntry | undefined {
		return this.tableData.entries.find(x => x.id === id);
	}

	getEntryIndexById(id: TableEntryId): number {
		return this.tableData.entries.findIndex(x => x.id === id);
	}

	insertEntryAtIndex(entry: TableEntry, index: number): void {
		this.tableData.entries.splice(index, 0, entry);

		this.notifyDataChangeListeners();
	}

	updateEntry(entryId: TableEntryId, updatedEntry: TableEntry): void {
		const entryIndex = this.getEntryIndexById(entryId);
		if (entryIndex === -1) {
			throw new Error(`can not update entry '${entryId}'. A entry with this id does not exist.`);
		}

		this.tableData.entries[entryIndex] = updatedEntry;

		this.notifyDataChangeListeners();
	}

	createEntryAtEnd(): void {
		this.createEntryAtIndexWithModal(this.tableData.columns.length - 1);
	}

	createEntryAbove(reference: TableEntryId): void {
		const refIndex = this.getEntryIndexById(reference);
		if (refIndex === -1) {
			throw new Error(`can not insert entry above '${reference}'. A entry with this id does not exist.`);
		}
		this.createEntryAtIndexWithModal(refIndex);
	}

	createEntryBelow(reference: TableEntryId): void {
		const refIndex = this.getEntryIndexById(reference);
		if (refIndex === -1) {
			throw new Error(`can not insert entry below '${reference}'. A entry with this id does not exist.`);
		}
		this.createEntryAtIndexWithModal(refIndex + 1);
	}

	createEntryAtIndexWithModal(index: number): void {
		const entry: TableEntry = {
			data: {},
			id: crypto.randomUUID(),
			visible: true,
			highlightedData: {},
		};

		for (const column of this.tableData.columns) {
			entry.data[column.id] = '';
		}

		const editModal = new EntryEditModal(
			this,
			entry,
			updatedEntry => {
				this.insertEntryAtIndex(updatedEntry, index);
			},
			() => {}
		);

		editModal.open();
	}

	editEntryWithModal(entryId: TableEntryId): void {
		const entry: TableEntry | undefined = this.getEntryById(entryId);

		if (!entry) {
			throw new Error(`can not edit entry '${entryId}'. A entry with this id does not exist.`);
		}

		const editModal = new EntryEditModal(
			this,
			entry,
			updatedEntry => {
				this.updateEntry(updatedEntry.id, updatedEntry);
			},
			() => {}
		);

		editModal.open();
	}

	deleteEntryWithModal(entryId: TableEntryId): void {
		const entryIndex: number = this.getEntryIndexById(entryId);

		if (entryIndex === -1) {
			throw new Error(`can not delete entry '${entryId}'. A entry with this id does not exist.`);
		}

		new DeleteConfirmModal(
			this.plugin.app,
			'entry',
			() => {
				this.tableData.entries.splice(entryIndex, 1);

				this.notifyDataChangeListeners();
			},
			() => {}
		).open();
	}

	moveEntryUp(entryId: TableEntryId): void {
		const entryIndex = this.getEntryIndexById(entryId);
		const swapIndex = entryIndex - 1;
		if (swapIndex < 0) {
			return;
		}

		this.swapEntriesAtIndex(entryIndex, swapIndex);
	}

	moveEntryDown(entryId: TableEntryId): void {
		const colIndex = this.getEntryIndexById(entryId);
		const swapIndex = colIndex + 1;
		if (swapIndex >= this.tableData.entries.length) {
			return;
		}

		this.swapEntriesAtIndex(colIndex, swapIndex);
	}

	swapEntriesAtIndex(index1: number, index2: number): void {
		[this.tableData.entries[index1], this.tableData.entries[index2]] = [this.tableData.entries[index2], this.tableData.entries[index1]];

		this.notifyDataChangeListeners();
	}

	viewEntry(entryId: TableEntryId): void {
		const entry: TableEntry | undefined = this.getEntryById(entryId);

		if (!entry) {
			throw new Error(`can not view entry '${entryId}'. A entry with this id does not exist.`);
		}

		this.plugin.openEntryView(entry, this);
	}

	async renderEntry(entry: TableEntry, container: HTMLElement, component: Component): Promise<void> {
		const templateFile = this.plugin.app.vault.getAbstractFileByPath(this.tableConfig.entryViewTemplateFile);
		if (!templateFile || !(templateFile instanceof TFile)) {
			container.createEl('p', { text: `Invalid entry template file path '${this.tableConfig.entryViewTemplateFile}'` });
			return;
		}

		const formattedEntry: Record<string, string> = {};
		for (const column of this.tableData.columns) {
			formattedEntry[column.name] = entry.data[column.id] ?? '';
		}

		const templateContent = await this.plugin.app.vault.cachedRead(templateFile);
		const template = Handlebars.compile(templateContent);
		const content = template(formattedEntry);

		await MarkdownRenderer.renderMarkdown(content, container, this.tableConfig.entryViewTemplateFile, component);
	}

	// endregion
}
