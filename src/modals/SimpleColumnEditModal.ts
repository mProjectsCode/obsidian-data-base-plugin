import { App, Modal, Setting } from 'obsidian';
import { Table, TableColumn, TableColumnConfig, TableColumnDataType } from '../utils/Table';
import { deepCopy } from '../utils/Utils';
import DBPlugin from '../main';

export class SimpleColumnEditModal extends Modal {
	plugin: DBPlugin;
	column: TableColumn;
	columnConfig: TableColumnConfig;
	onSubmit: (column: TableColumn, columnConfig: TableColumnConfig) => void;
	onCancel: () => void;

	constructor(
		table: Table,
		column: TableColumn,
		columnConfig: TableColumnConfig,
		onSubmit: (column: TableColumn, columnConfig: TableColumnConfig) => void,
		onCancel: () => void
	) {
		super(table.plugin.app);

		this.plugin = table.plugin;

		// deep copy
		this.column = deepCopy(column);
		this.columnConfig = deepCopy(columnConfig);

		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
	}

	public onOpen(): void {
		this.contentEl.empty();
		this.contentEl.createEl('h2', { text: 'Edit Column' });

		const columnNameSetting = new Setting(this.contentEl);
		columnNameSetting.setName('Column Name');
		columnNameSetting.setDesc('Change the name of the Column');
		columnNameSetting.addText(component => {
			component.setValue(this.column.name);
			component.setPlaceholder('column name');
			component.onChange(value => {
				this.column.name = value;
			});
		});

		const columnDataTypeSetting = new Setting(this.contentEl);
		columnDataTypeSetting.setName('Column Data Type');
		columnDataTypeSetting.setDesc('Change the data type of the Column');
		columnDataTypeSetting.addDropdown(component => {
			for (const dataType of Object.values(TableColumnDataType)) {
				component.addOption(dataType, dataType);
			}
			component.setValue(this.columnConfig.dataType);
			component.onChange(value => {
				this.columnConfig.dataType = value as TableColumnDataType;
			});
		});

		const buttonSetting = new Setting(this.contentEl);
		buttonSetting.addButton(component => {
			component.setButtonText('Apply');
			component.setCta();
			component.onClick(() => {
				this.onSubmit(this.column, this.columnConfig);
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
