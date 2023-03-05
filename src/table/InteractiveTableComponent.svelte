<script lang="ts">
	import {onMount} from 'svelte';
	import {AbstractTableView} from '../views/AbstractTableView';
	import {Table, TableColumn, TableColumnId, TableEntry} from '../utils/Table';
	import VirtualTableComponent from './VirtualTable/VirtualTableComponent.svelte';
	import VirtualTableHeaderComponent from './VirtualTable/VirtualTableHeaderComponent.svelte';
	import {Menu} from 'obsidian';

	export let table: Table;
	export let view: AbstractTableView;

	let virtualTable: VirtualTableComponent;

	let searchTerm: string;
	let searchColumn: TableColumnId = table.tableData.columns[0].id;

	let columnWidths: Record<TableColumnId, number> = {};

	let visibleEntries: TableEntry[] = [];

	onMount(() => {
		table.addDataChangeListener(updateTableData.bind(this));

		table.addConfigChangeListener(updateTableConfig.bind(this));

		columnWidths = {};
		for (const tableColumnConfig of table.tableConfig.columnConfigs) {
			columnWidths[tableColumnConfig.columnId] = tableColumnConfig.width;
		}
	});

	function updateTableData(): void {
		table.tableData = table.tableData;

		// @ts-ignore
		virtualTable.$set({entries: table.tableData.entries.filter(x => x.visible)});
		virtualTable.update();

		console.log('test');
	}

	function updateTableConfig(): void {
		table.tableConfig = table.tableConfig;
	}

	function showEntryActionsMenu(event: MouseEvent, entry: TableEntry): void {
		new Menu()
			.addItem(item => {
				item.setTitle('Add Entry Below');
				item.setIcon('align-horizontal-justify-start');
				item.onClick(() => {
					table;
				});
			})
			.addItem(item => {
				item.setTitle('Add Entry Above');
				item.setIcon('align-horizontal-justify-end');
				item.onClick(() => {
					table;
				});
			})
			.addSeparator()
			.addItem(item => {
				item.setTitle('Move Down');
				item.setIcon('chevron-left');
				item.onClick(() => {
					table;
				});
			})
			.addItem(item => {
				item.setTitle('Move Up');
				item.setIcon('chevron-right');
				item.onClick(() => {
					table;
				});
			})
			.addSeparator()
			.addItem(item => {
				item.setTitle('Edit');
				item.setIcon('edit');
				item.onClick(() => {
					table.editEntryWithModal(entry.id);
				});
			})
			.addItem(item => {
				item.setTitle('Delete');
				item.setIcon('trash');
				item.onClick(() => {
					table;
				});
			})
			.showAtMouseEvent(event);
	}
</script>

<div class="db-plugin-table-toolbar">
	<div class="db-plugin-table-search-bar">
		<input type="text" bind:value={searchTerm} placeholder="search" on:input={() => table.filter(searchColumn, searchTerm, true)}>
		<select class="dropdown" bind:value={searchColumn} on:change={() => table.filter(searchColumn, searchTerm, true)}>
			{#each table.tableData.columns as column}
				<option value={column.id}>{column.name}</option>
			{/each}
		</select>
		<button class="btn" on:click={() => {table.clearFilter(); searchTerm = '' }}>Clear</button>
	</div>
</div>

<div class="db-plugin-table-wrapper">
	<VirtualTableHeaderComponent
		bind:table={table}
		bind:columnWidths={columnWidths}
	></VirtualTableHeaderComponent>
	<VirtualTableComponent
		entries={table.tableData.entries.filter(x => x.visible)}
		bind:this={virtualTable}
		debug={true}
	>
		<div class="db-plugin-tb-row" slot="entry" let:entry={entry} on:contextmenu={(event) => showEntryActionsMenu(event, entry)}>
			{#each table.tableData.columns as column}
				<div class="db-plugin-tb-cell" style={`width: ${columnWidths[column.id]}px`}>
					{#if entry.highlightedData[column.id] === undefined}
						{entry.data[column.id]}
					{:else}
						{@html entry.highlightedData[column.id]}
					{/if}
				</div>
			{/each}
		</div>
	</VirtualTableComponent>
</div>


