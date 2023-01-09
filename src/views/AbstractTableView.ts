import { TextFileView } from 'obsidian';

export abstract class AbstractTableView extends TextFileView {
	abstract saveTable(): Promise<void>;
}
