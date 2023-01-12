<script lang="ts">
	import {AbstractTableView} from '../../views/AbstractTableView';
	import {Table, TableColumnId} from '../../utils/Table';
	import VirtualTableComponent from './VirtualTableComponent.svelte';
	import VirtualTableHeaderComponent from './VirtualTableHeaderComponent.svelte';
	import {onMount} from 'svelte';

	export let table: Table;
	export let view: AbstractTableView;

	let columnWidths: Record<TableColumnId, number> = {};
	let virtualTable;

	onMount(() => {
		console.log('mounted virtual table view');

		columnWidths = {};
		for (const tableColumnConfig of table.tableConfig.columnConfigs) {
			columnWidths[tableColumnConfig.columnId] = tableColumnConfig.width;
		}

		table.addDataChangeListener(() => {
			console.log('update table');
			virtualTable?.update();
		});
	});

</script>

<VirtualTableHeaderComponent bind:table={table} bind:columnWidths={columnWidths}
							 allowEdits={false}></VirtualTableHeaderComponent>
<VirtualTableComponent
	bind:entries={table.tableData.entries}
	bind:this={virtualTable}
	fixedHeight={true}
	entryHeight={36.5}
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

