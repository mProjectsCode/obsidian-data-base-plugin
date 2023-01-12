<!--DEPRECATED-->

<script lang="ts">
	import Icon from '../utils/Icon.svelte';

	export let page: number;
	export let numberOfPages: number;

	// function calculateVisibleEntries(): void {
	// 	if (!page) {
	// 		visibleEntries = [];
	// 		return;
	// 	}
	// 	page = clamp(page, 1, getNumberOfPages());
	// 	visibleEntries = table.tableData.entries.slice((page - 1) * table.tableConfig.entriesPerPage, Math.min(page * table.tableConfig.entriesPerPage, table.tableData.entries.length));
	// 	// console.log(visibleEntries);
	// }
	//
	// function getNumberOfPages(): number {
	// 	return Math.ceil(table.tableData.entries.length / table.tableConfig.entriesPerPage);
	// }

</script>

<div class="db-plugin-table-pagination">
	<span>Page</span>
	<div
		class="db-plugin-clickable-icon-wrapper"
		style="display: inline"
		on:click={() => page = Math.max(page - 1, 1)}
	>
		<Icon iconName="chevron-left"></Icon>
	</div>
	<input type="number" bind:value={page}>
	<div
		class="db-plugin-clickable-icon-wrapper"
		style="display: inline"
		on:click={() => page = Math.min(page + 1, numberOfPages)}
	>
		<Icon iconName="chevron-right"></Icon>
	</div>
	<span>out of {numberOfPages}</span>
</div>
