import { App, Modal, Setting } from 'obsidian';
import { TableColumn, TableColumnDataType } from '../utils/TableParser';

export class SimpleColumnEditModal extends Modal {
	column: TableColumn;
	onSubmit: (column: TableColumn) => void;
	onCancel: () => void;

	constructor(app: App, column: TableColumn, onSubmit: (column: TableColumn) => void, onCancel: () => void) {
		super(app);

		// deep copy
		this.column = JSON.parse(JSON.stringify(column));
		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
	}

	public onOpen(): void {
		this.contentEl.empty();
		this.contentEl.createEl('h2', { text: 'Edit Column' });
		this.contentEl.createEl('p', { text: 'Changes to the column name will be saved, but not changes to the data type.' });

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
			component.setValue(this.column.dataType);
			for (const dataType of Object.values(TableColumnDataType)) {
				component.addOption(dataType, dataType);
			}
			component.onChange(value => {
				this.column.dataType = value as TableColumnDataType;
			});
		});

		const buttonSetting = new Setting(this.contentEl);
		buttonSetting.addButton(component => {
			component.setButtonText('Apply');
			component.setCta();
			component.onClick(() => {
				this.onSubmit(this.column);
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
