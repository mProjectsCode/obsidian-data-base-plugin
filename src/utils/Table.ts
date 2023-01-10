import { TFile } from 'obsidian';
import { compareTableEntriesByColumns } from './Utils';
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

export type RawTableEntry = Record<string, string>;

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
	columnConfig: TableColumnConfig[];
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
}

export enum TableColumnDataType {
	STRING = 'string',
	NUMBER = 'number',
}

export const DEFAULT_SORTING_CONFIG: SortingConfig = {
	column: '',
	mode: SortingMode.DESCENDING,
};

export const DEFAULT_TABLE_CONFIG: TableConfig = {
	sortingConfig: DEFAULT_SORTING_CONFIG,
	columnConfig: [],
	entriesPerPage: 500,
	file: '',
};

export class Table {
	tableData: TableData;
	tableConfig: TableConfig;

	file?: TFile;

	dataUpdateListeners: { id: string; callback: (tableData: TableData) => void }[];
	configUpdateListeners: { id: string; callback: (tableConfig: TableConfig) => void }[];

	constructor(tableData: TableData, tableConfig: TableConfig) {
		this.tableData = tableData;
		this.tableConfig = tableConfig;

		const newColumnConfig: TableColumnConfig[] = [];
		for (const column of tableData.columns) {
			const columnConfigIndex = this.getColumnConfigIndexByName(column.name);

			if (columnConfigIndex === -1) {
				newColumnConfig.push({ columnId: column.id, columnName: column.name, dataType: TableColumnDataType.STRING });
			} else {
				newColumnConfig.push({ columnId: column.id, columnName: column.name, dataType: this.tableConfig.columnConfig[columnConfigIndex].dataType });
			}
		}
		this.tableConfig.columnConfig = newColumnConfig;

		this.dataUpdateListeners = [];
		this.configUpdateListeners = [];
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
		for (const tableDataUpdateCallback of this.dataUpdateListeners) {
			tableDataUpdateCallback.callback(this.tableData);
		}
	}

	notifyConfigChangeListeners(): void {
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
		return this.tableConfig.columnConfig.find(x => x.columnId === id);
	}

	getColumnIndexById(id: TableColumnId): number {
		return this.tableData.columns.findIndex(x => x.id === id);
	}

	getColumnConfigIndexById(id: TableColumnId): number {
		return this.tableConfig.columnConfig.findIndex(x => x.columnId === id);
	}

	getColumnConfigIndexByName(name: string): number {
		return this.tableConfig.columnConfig.findIndex(x => x.columnName === name);
	}

	insetColumnAtEnd(column: TableColumn): void {
		this.insertColumnAtIndex(column, this.tableData.columns.length - 1);
	}

	insertColumnToTheRight(column: TableColumn, reference: TableColumnId): void {
		const refIndex = this.getColumnIndexById(reference);
		if (refIndex === -1) {
			throw new Error(`can not insert column to the right of '${reference}'. A column with this id does not exist.`);
		}
		this.insertColumnAtIndex(column, refIndex + 1);
	}

	insertColumnToTheLeft(column: TableColumn, reference: TableColumnId): void {
		const refIndex = this.getColumnIndexById(reference);
		if (refIndex === -1) {
			throw new Error(`can not insert column to the left of '${reference}'. A column with this id does not exist.`);
		}
		this.insertColumnAtIndex(column, refIndex);
	}

	// TODO: update config and table entries
	insertColumnAtIndex(column: TableColumn, index: number): void {
		this.tableData.columns.splice(index, 0, column);

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

		this.tableConfig.columnConfig[columnConfigIndex] = updatedColumnConfig;

		this.notifyConfigChangeListeners();
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

				console.log(updatedColumn, updatedColumnConfig);

				if (this.tableConfig.sortingConfig.column === column.id) {
					this.sort();
				}
			},
			() => {}
		);

		editModal.open();
	}

	deleteColumnWithModal(columnId: TableColumnId): void {
		const column: TableColumn | undefined = this.getColumnById(columnId);

		if (!column) {
			throw new Error(`can not edit column '${columnId}'. A column with this id does not exist.`);
		}

		new DeleteConfirmModal(
			app,
			'column',
			() => {
				console.log('TODO: delete column');
			},
			() => {}
		).open();
	}
}
