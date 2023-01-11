<script lang="ts">
	import AdvancedTableHeaderComponent from './AdvancedTableViewHeaderComponent.svelte';
	import {Table, TableConfig} from '../utils/Table';
	import {AdvancedTableView} from '../views/AdvancedTableView';
	import InteractiveTableComponent from './InteractiveTableComponent.svelte';

	export let view: AdvancedTableView;
	export let tableConfig: TableConfig;

	let table: Table | undefined;
	let tableError: string | undefined;

	export function setTable(t: Table): void {
		table = t;
	}

	export function setTableError(e: string): void {
		tableError = e;
	}
</script>

<AdvancedTableHeaderComponent bind:tableConfig={tableConfig} bind:view={view}></AdvancedTableHeaderComponent>
{#if table}
	<InteractiveTableComponent bind:table={table} bind:view={view}></InteractiveTableComponent>
{:else if tableError}
	<p>{tableError}</p>
{:else}
	<p>Loading Table...</p>
{/if}

