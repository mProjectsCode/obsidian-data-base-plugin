<script lang="ts">
	import {AdvancedTableSettings, AdvancedTableView} from '../views/AdvancedTableView';
	import {TextFieldModal} from '../modals/TextFieldModal';

	export let tableSettings: AdvancedTableSettings;
	export let view: AdvancedTableView;

	function editFilePath() {
		const modal = new TextFieldModal(
			view.app,
			tableSettings.file,
			'Edit CSV File Path',
			'CSV File Path',
			'',
			value => {
				tableSettings.file = value;
				view.save();
				view.loadTable();
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

<div>
	<div class="db-plugin-file-header">
		<div class="flex-row">
			<span>{tableSettings.file}</span>
			<button class="btn" on:click={editFilePath}>Edit</button>
		</div>
	</div>
</div>
