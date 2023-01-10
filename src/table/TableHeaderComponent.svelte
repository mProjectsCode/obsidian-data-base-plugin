<script lang="ts">
	import Icon from '../utils/Icon.svelte';
	import {SortingMode, Table, TableColumn} from '../utils/Table';
	import {onMount} from 'svelte';

	export let table: Table;

	onMount(() => {
		table.addDataChangeListener(() => {
			table.tableData = table.tableData;
		})

		table.addConfigChangeListener(() => {
			table.tableConfig = table.tableConfig;
		})
	})

	function editColumn(column: TableColumn) {
		table.editColumnWithModal(column.id);
	}

	function cycleSortingMode(column: TableColumn) {
		table.cycleSortingModeForColumn(column);
	}
</script>

<thead class="db-plugin-th">
<tr class="db-plugin-th-row">
	{#each table.tableData.columns as column}
		<th class="db-plugin-th-cell">
			<div class="db-plugin-th-cell-content">
				<div class="db-plugin-th-cell-content-text-container">
					<span class="db-plugin-th-cell-content-text">{column.name}</span>
					<span class="db-plugin-th-cell-content-text-secondary">{table.getColumnConfigById(column.id)?.dataType}</span>
				</div>
				<div class="db-plugin-clickable-icon-wrapper" on:click={() => cycleSortingMode(column)}>
					{#if table.tableConfig.sortingConfig.column === column.id && table.tableConfig.sortingConfig.mode === SortingMode.DESCENDING}
						<Icon class="db-plugin-th-cell-content-icon" iconName="chevron-down"></Icon>
					{:else if table.tableConfig.sortingConfig.column === column.id && table.tableConfig.sortingConfig.mode === SortingMode.ASCENDING}
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
