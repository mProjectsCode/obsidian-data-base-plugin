<script lang="ts">
	import {AdvancedTableView} from '../views/AdvancedTableView';
	import {TextFieldModal} from '../modals/TextFieldModal';
	import {TableConfig} from '../utils/Table';
	import {onMount} from 'svelte';

	export let tableConfig: TableConfig;
	export let view: AdvancedTableView;

	onMount(() => {

	});

	function editFilePath(): void {
		const modal = new TextFieldModal(
			view.app,
			tableConfig.file,
			'Edit CSV File Path',
			'CSV File Path',
			'',
			value => {
				tableConfig.file = value;
				view.save();
				view.loadTable(tableConfig);
			},
			() => {
			},
		);

		modal.open();
	}

	function editEntryViewTemplateFilePath(): void {
		const modal = new TextFieldModal(
			view.app,
			tableConfig.entryViewTemplateFile,
			'Edit Entry View Template File Path',
			'Entry View Template File Path',
			'',
			value => {
				tableConfig.entryViewTemplateFile = value;
				view.save();
			},
			() => {
			},
		);

		modal.open();
	}
</script>

<style>
	.flex-row {
		display:        flex;
		flex-direction: row;
		gap:            var(--size-4-2);
		align-items:    center;
	}
</style>


<div class="db-plugin-file-header">
	<div class="flex-row">
		<span>{tableConfig.file}</span>
		<button class="btn" on:click={editFilePath}>Edit</button>
		<span>{tableConfig.entryViewTemplateFile}</span>
		<button class="btn" on:click={editEntryViewTemplateFilePath}>Edit</button>
	</div>
</div>
