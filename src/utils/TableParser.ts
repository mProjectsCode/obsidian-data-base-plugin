import { EnclosingPair, ParserUtils } from '@opd-libs/opd-utils-lib/lib/ParserUtils';
import { isTruthy } from '@opd-libs/opd-utils-lib/lib/Utils';
import { TFile } from 'obsidian';

export interface TableData {
	file?: TFile;

	sortingMode?: { mode: SortingMode; column: string };

	columns: TableColumn[];
	entries: Record<string, string>[];
}

export interface TableColumn {
	name: string;
}

export enum SortingMode {
	NONE = 'none',
	ASCENDING = 'ascending',
	DESCENDING = 'descending',
}

export class TableParser {
	parseCSV(data: string): TableData {
		const rows: string[] = ParserUtils.split(data, '\n', new EnclosingPair('"')).filter(x => isTruthy(x));
		const entries = rows.map(x => ParserUtils.split(x, ',', new EnclosingPair('"')));

		if (entries.length === 0) {
			return {
				file: undefined,
				columns: [],
				entries: [],
			};
		} else {
			const tColumns: TableColumn[] = entries[0].map(x => ({ name: x }));
			const tEntries: Record<string, string>[] = entries.slice(1).map(x => {
				const entry: Record<string, string> = {};
				for (let i = 0; i < tColumns.length; i++) {
					entry[tColumns[i].name] = x[i];
				}
				return entry;
			});

			return {
				file: undefined,
				columns: tColumns,
				entries: tEntries,
			};
		}
	}

	stringifyCSV(tableData: TableData): string {
		let str = '';

		for (let i = 0; i < tableData.columns.length; i++) {
			str += this.stringifyCSVCell(tableData.columns[i].name) + (i === tableData.columns.length - 1 ? '\n' : ',');
		}

		for (const entry of tableData.entries) {
			const entryValues = Object.values(entry);
			for (let i = 0; i < entryValues.length; i++) {
				str += this.stringifyCSVCell(entryValues[i]) + (i === entryValues.length - 1 ? '\n' : ',');
			}
		}

		return str;
	}

	stringifyCSVCell(cell: string): string {
		const specialCharacters = [',', '\n', '\r', '"'];
		for (const specialCharacter of specialCharacters) {
			if (cell.contains(specialCharacter)) {
				return `"${cell}"`;
			}
		}
		return cell;
	}
}
