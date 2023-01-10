import { App, Modal, Setting } from 'obsidian';

export class DeleteConfirmModal extends Modal {
	itemName: string;
	onSubmit: () => void;
	onCancel: () => void;

	constructor(app: App, itemName: string, onSubmit: () => void, onCancel: () => void) {
		super(app);

		// deep copy
		this.itemName = itemName;

		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
	}

	public onOpen(): void {
		this.contentEl.empty();
		this.contentEl.createEl('h2', { text: `Delete ${this.itemName}` });
		this.contentEl.createEl('p', { text: `Are you sure that you want to delete this ${this.itemName}? This can not be undone.` });

		const buttonSetting = new Setting(this.contentEl);
		buttonSetting.addButton(component => {
			component.setButtonText('Delete');
			component.setWarning();
			component.onClick(() => {
				this.onSubmit();
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
