<script lang="ts">
	import {AbstractTableView} from '../../views/AbstractTableView';
	import {Table} from '../../utils/Table';
	import VirtualTableComponent from './VirtualTableComponent.svelte';

	export let table: Table;
	export let view: AbstractTableView;

</script>

<VirtualTableComponent
	entries={table.tableData.entries}
	debug={true}
>
	<div class="db-plugin-tb-row" slot="entry" let:entry={entry}>
		{#each table.tableData.columns as column}
			<div class="db-plugin-tb-cell">
				{entry.data[column.id]}
			</div>
		{/each}
	</div>
</VirtualTableComponent>

