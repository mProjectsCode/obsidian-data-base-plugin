import { ParserUtils } from '@opd-libs/opd-utils-lib/lib/ParserUtils';
import {RawTableColumn, TableColumnDataType, RawTableEntry, TableEntry, TableColumn, TableColumnConfig} from './Table';

export function trimString(str: string, trimString: string): string {
	if (!str || !trimString || str.length < trimString.length) {
		return str;
	}

	let i = 0;
	while (i < str.length) {
		if (!ParserUtils.isStringAt(str, trimString, i)) {
			break;
		}
		i += trimString.length;
	}

	let j = str.length;
	while (j >= 0) {
		j -= trimString.length;
		if (!ParserUtils.isStringAt(str, trimString, j)) {
			break;
		}
	}

	return str.substring(i, j + trimString.length);
}

export function compareStrings(a: string, b: string): number {
	return a.localeCompare(b);
}

export function compareNumbers(a: number, b: number): number {
	return a - b;
}

export function compareTableEntriesByColumns(a: TableEntry, b: TableEntry, columnConfig: TableColumnConfig): number {
	const aValue: string = a.data[columnConfig.columnId];
	const bValue: string = b.data[columnConfig.columnId];

	if (columnConfig.dataType === TableColumnDataType.STRING) {
		return compareStrings(aValue, bValue);
	} else if (columnConfig.dataType === TableColumnDataType.NUMBER) {
		const aNum: number = parseInt(aValue);
		const bNum: number = parseInt(bValue);

		// NaN equals Number.MIN_VALUE
		if (Number.isNaN(aNum)) {
			return Number.MIN_VALUE;
		} else if (Number.isNaN(bNum)) {
			return Number.MAX_VALUE;
		} else {
			return compareNumbers(aNum, bNum);
		}
	} else {
		return 0;
	}
}
