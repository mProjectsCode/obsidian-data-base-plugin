import { EnclosingPair, ParserUtils } from '@opd-libs/opd-utils-lib/lib/ParserUtils';
import { isTruthy } from '@opd-libs/opd-utils-lib/lib/Utils';
import { trimString } from './Utils';
import { TableColumn, TableColumnDataType, TableData, TableEntry } from './Table';

export class TableParser {
	parseCSV(data: string): TableData {
		data = data.replaceAll('\r\n', '\n');
		const rows: string[] = ParserUtils.split(data, '\n', new EnclosingPair('"')).filter(x => isTruthy(x));
		const entries: string[][] = rows.map(x => ParserUtils.split(x, ',', new EnclosingPair('"')));

		if (entries.length === 0) {
			return {
				columns: [],
				entries: [],
			};
		} else {
			const tColumns: TableColumn[] = entries[0].map(x => ({
				id: crypto.randomUUID(),
				name: trimString(x, '"').trim(),
			}));

			const tEntries: TableEntry[] = entries.slice(1).map(x => {
				const entry: TableEntry = {
					id: crypto.randomUUID(),
					data: {},
				};

				for (let i = 0; i < tColumns.length; i++) {
					entry.data[tColumns[i].id] = trimString(x[i], '"').trim();
				}

				return entry;
			});

			return {
				columns: tColumns,
				entries: tEntries,
			};
		}
	}

	stringifyCSV(tableData: TableData): string {
		let str: string = '';

		for (let i = 0; i < tableData.columns.length; i++) {
			str += this.stringifyCSVCell(tableData.columns[i].name);
			str += i === tableData.columns.length - 1 ? '\n' : ',';
		}

		for (const entry of tableData.entries) {
			for (let i = 0; i < tableData.columns.length; i++) {
				str += this.stringifyCSVCell(entry.data[tableData.columns[i].id]);
				str += i === tableData.columns.length - 1 ? '\n' : ',';
			}
		}

		return str;
	}

	stringifyCSVCell(cell: string): string {
		const specialCharacters = [',', '\n', '\r', '"'];
		if (!cell) {
			return '';
		}

		for (const specialCharacter of specialCharacters) {
			if (cell.contains(specialCharacter)) {
				return `"${cell}"`;
			}
		}
		return cell;
	}
}
