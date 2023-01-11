<script lang="ts">
	import {onMount} from 'svelte';
	import TableHeaderComponent from './TableHeaderComponent.svelte';
	import {AbstractTableView} from '../views/AbstractTableView';
	import {Table, TableColumnId, TableEntry} from '../utils/Table';
	import TablePaginationComponent from './TablePaginationComponent.svelte';
	import {clamp} from '../utils/Utils';
	import VirtualTableComponent from './VirtualTable/VirtualTableComponent.svelte';
	import VirtualTableHeaderComponent from './VirtualTable/VirtualTableHeaderComponent.svelte';

	export let table: Table;
	export let view: AbstractTableView;

	let page: number = 1;
	let visibleEntries: TableEntry[] = [];

	let searchTerm: string;
	let searchColumn: TableColumnId = table.tableData.columns[0].id;

	let columnWidths: Record<TableColumnId, number> = {};

	$: page, table.tableData.entries, calculateVisibleEntries();

	onMount(() => {
		calculateVisibleEntries();

		table.addDataChangeListener(() => {
			table.tableData = table.tableData;
		});

		table.addConfigChangeListener(() => {
			table.tableConfig = table.tableConfig;
		});

		columnWidths = {};
		for (const tableColumnConfig of table.tableConfig.columnConfig) {
			columnWidths[tableColumnConfig.columnId] = tableColumnConfig.width;
		}
	});

	function calculateVisibleEntries(): void {
		if (!page) {
			visibleEntries = [];
			return;
		}
		page = clamp(page, 1, getNumberOfPages());
		visibleEntries = table.tableData.entries.slice((page - 1) * table.tableConfig.entriesPerPage, Math.min(page * table.tableConfig.entriesPerPage, table.tableData.entries.length));
		// console.log(visibleEntries);
	}

	function getNumberOfPages(): number {
		return Math.ceil(table.tableData.entries.length / table.tableConfig.entriesPerPage);
	}
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
	<TablePaginationComponent bind:page={page} numberOfPages={getNumberOfPages()}></TablePaginationComponent>
</div>

<div class="db-plugin-table-wrapper">
	<VirtualTableHeaderComponent bind:table={table} bind:columnWidths={columnWidths}></VirtualTableHeaderComponent>
	<VirtualTableComponent
		entries={table.tableData.entries}
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


