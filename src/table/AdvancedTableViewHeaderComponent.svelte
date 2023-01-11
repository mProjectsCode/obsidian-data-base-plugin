<script lang="ts">
	import {AdvancedTableView} from '../views/AdvancedTableView';
	import {TextFieldModal} from '../modals/TextFieldModal';
	import {TableConfig} from '../utils/Table';
	import {onMount} from 'svelte';

	export let tableConfig: TableConfig;
	export let view: AdvancedTableView;

	onMount(() => {

	});

	function editFilePath() {
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
	</div>
</div>
