<script lang="ts">
	import {onMount} from 'svelte';
	import TableHeaderComponent from './TableHeaderComponent.svelte';
	import {AbstractTableView} from '../views/AbstractTableView';
	import {Table, TableColumnId, TableEntry} from '../utils/Table';
	import TablePaginationComponent from './TablePaginationComponent.svelte';

	export let table: Table;
	export let view: AbstractTableView;

	let page: number = 1;
	let visibleEntries: TableEntry[] = [];

	let searchTerm: string;
	let searchColumn: TableColumnId = table.tableData.columns[0].id;

	$: page, table.tableData.entries, calculateVisibleEntries();

	onMount(() => {
		calculateVisibleEntries();

		table.addDataChangeListener(() => {
			table.tableData = table.tableData;
		});

		table.addConfigChangeListener(() => {
			table.tableConfig = table.tableConfig;
		});
	});

	function calculateVisibleEntries(): void {
		if (!page) {
			visibleEntries = [];
			return;
		}
		page = Math.clamp(page, 1, getNumberOfPages());
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
	<table class="db-plugin-table">
		<TableHeaderComponent bind:table={table}></TableHeaderComponent>

		<tbody class="db-plugin-tb">
		{#each visibleEntries as entry}
			<tr class="db-plugin-tb-row">
				{#each table.tableData.columns as column}
					<td class="db-plugin-tb-cell">
						{entry.data[column.id]}
					</td>
				{/each}
			</tr>
		{/each}
		</tbody>
	</table>
</div>


