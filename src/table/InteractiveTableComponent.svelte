<script lang="ts">
	import {onMount} from 'svelte';
	import {AbstractTableView} from '../views/AbstractTableView';
	import {Table, TableColumnId} from '../utils/Table';
	import VirtualTableComponent from './VirtualTable/VirtualTableComponent.svelte';
	import VirtualTableHeaderComponent from './VirtualTable/VirtualTableHeaderComponent.svelte';

	export let table: Table;
	export let view: AbstractTableView;

	let virtualTable: VirtualTableComponent;

	let searchTerm: string;
	let searchColumn: TableColumnId = table.tableData.columns[0].id;

	let columnWidths: Record<TableColumnId, number> = {};

	onMount(() => {
		table.addDataChangeListener(() => {
			table.tableData = table.tableData;
			virtualTable?.update();
		});

		table.addConfigChangeListener(() => {
			table.tableConfig = table.tableConfig;
		});

		columnWidths = {};
		for (const tableColumnConfig of table.tableConfig.columnConfigs) {
			columnWidths[tableColumnConfig.columnId] = tableColumnConfig.width;
		}
	});
</script>


<div class="db-plugin-table-toolbar">
	<div class="db-plugin-table-search-bar">
		<input type="text" bind:value={searchTerm} placeholder="search">
		<select class="dropdown" bind:value={searchColumn} on:change={() => searchTerm = ''}>
			{#each table.tableData.columns as column}
				<option value={column.id}>{column.name}</option>
			{/each}
		</select>
		<button class="btn">Search</button>
	</div>
</div>

<div class="db-plugin-table-wrapper">
	<VirtualTableHeaderComponent
		bind:table={table}
		bind:columnWidths={columnWidths}
	></VirtualTableHeaderComponent>
	<VirtualTableComponent
		bind:entries={table.tableData.entries}
		bind:this={virtualTable}
		debug={true}
	>
		<div class="db-plugin-tb-row" slot="entry" let:entry={entry}>
			{#each table.tableData.columns as column}
				<div class="db-plugin-tb-cell" style={`width: ${columnWidths[column.id]}px`}>
					{entry.data[column.id]}
				</div>
			{/each}
		</div>
	</VirtualTableComponent>
</div>


