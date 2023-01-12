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
		columnWidths = {};
		for (const tableColumnConfig of table.tableConfig.columnConfig) {
			columnWidths[tableColumnConfig.columnId] = tableColumnConfig.width;
		}

		table.addDataChangeListener(() => {
			console.log('update table');
			virtualTable?.update();
		})
	})

</script>

<VirtualTableHeaderComponent bind:table={table} bind:columnWidths={columnWidths}></VirtualTableHeaderComponent>
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

