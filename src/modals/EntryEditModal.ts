import { App, Modal, Setting } from 'obsidian';
import { Table, TableColumnDataType, TableEntry } from '../utils/Table';
import { deepCopy } from '../utils/Utils';
import DBPlugin from '../main';

export class EntryEditModal extends Modal {
	plugin: DBPlugin;
	entry: TableEntry;
	table: Table;
	onSubmit: (entry: TableEntry) => void;
	onCancel: () => void;

	constructor(table: Table, entry: TableEntry, onSubmit: (entry: TableEntry) => void, onCancel: () => void) {
		super(table.plugin.app);

		this.plugin = table.plugin;

		this.entry = deepCopy(entry);
		this.table = table;

		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
	}

	public onOpen(): void {
		this.contentEl.empty();
		this.contentEl.createEl('h2', { text: 'Edit Entry' });
		this.contentEl.createEl('p', { text: `Entry ID: ${this.entry.id}` });

		for (const column of this.table.tableData.columns) {
			const columnConfig = this.table.getColumnConfigById(column.id);
			if (!columnConfig) {
				continue;
			}

			const set = new Setting(this.contentEl);
			set.setName(column.name);

			if (columnConfig.dataType === TableColumnDataType.STRING) {
				set.addText(component => {
					component.setValue(this.entry.data[column.id] ?? '');
					component.onChange(value => {
						this.entry.data[column.id] = value;
					});
				});
			}

			if (columnConfig.dataType === TableColumnDataType.NUMBER) {
				set.addText(component => {
					component.inputEl.type = 'number';
					component.setValue(this.entry.data[column.id] ?? '');
					component.onChange(value => {
						this.entry.data[column.id] = value;
					});
				});
			}
		}

		const buttonSetting = new Setting(this.contentEl);
		buttonSetting.addButton(component => {
			component.setButtonText('Apply');
			component.setCta();
			component.onClick(() => {
				this.onSubmit(this.entry);
				this.close();
			});
		});
		buttonSetting.addButton(component => {
			component.setButtonText('Cancel');
			component.onClick(() => {
				this.onCancel();
				this.close();
			});
		});
	}
}
