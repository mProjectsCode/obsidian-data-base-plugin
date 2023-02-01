import { TFile } from 'obsidian';
import { compareTableEntriesByColumns, deepFreeze } from './Utils';
import { SimpleColumnEditModal } from '../modals/SimpleColumnEditModal';
import { DeleteConfirmModal } from '../modals/DeleteConfirmModal';

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
} as const;
deepFreeze(DEFAULT_TABLE_CONFIG);

export class Table {
	tableData: TableData;
	tableConfig: TableConfig;

	file?: TFile;

	dataUpdateListeners: { id: string; callback: (tableData: TableData) => void }[];
	configUpdateListeners: { id: string; callback: (tableConfig: TableConfig) => void }[];

	constructor(tableData: TableData, tableConfig: TableConfig) {
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
			app,
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
			app,
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
			app,
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
}
