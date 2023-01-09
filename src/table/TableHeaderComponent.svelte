<script lang="ts">
	import {SortingMode, TableColumn, TableData} from '../utils/TableParser';
	import {createEventDispatcher} from 'svelte';
	import Icon from '../utils/Icon.svelte';

	export let tableData: TableData;

	const dispatch = createEventDispatcher();

	function editColumn(column: TableColumn) {
		dispatch('editColumn', {
			column: column,
		});
	}

	function cycleSortingMode(column: TableColumn) {
		dispatch('cycleSortingMode', {
			column: column,
		});
	}
</script>

<thead class="db-plugin-th">
<tr class="db-plugin-th-row">
	{#each tableData.columns as column}
		<th class="db-plugin-th-cell">
			<div class="db-plugin-th-cell-content">
				<div class="db-plugin-th-cell-content-text-container">
					<span class="db-plugin-th-cell-content-text">{column.name}</span>
					<span class="db-plugin-th-cell-content-text-secondary">{column.dataType}</span>
				</div>
				<div class="db-plugin-clickable-icon-wrapper" on:click={() => cycleSortingMode(column)}>
					{#if tableData.sortingMode?.column === column && tableData.sortingMode?.mode === SortingMode.DESCENDING}
						<Icon class="db-plugin-th-cell-content-icon" iconName="chevron-down"></Icon>
					{:else if tableData.sortingMode?.column === column && tableData.sortingMode?.mode === SortingMode.ASCENDING}
						<Icon class="db-plugin-th-cell-content-icon" iconName="chevron-up"></Icon>
					{:else}
						<Icon class="db-plugin-th-cell-content-icon" iconName="chevrons-up-down"></Icon>
					{/if}
				</div>
				<div class="db-plugin-clickable-icon-wrapper" on:click={() => editColumn(column)}>
					<Icon class="db-plugin-th-cell-content-icon" iconName="more-vertical"></Icon>
				</div>
			</div>
		</th>
	{/each}
</tr>
</thead>
