<script lang="ts">
	import {onMount} from 'svelte';
	import * as Clusterize from 'clusterize.js';
	import TableHeaderComponent from './TableHeaderComponent.svelte';
	import {AbstractTableView} from '../views/AbstractTableView';
	import {Table} from '../utils/Table';

	export let table: Table;
	export let view: AbstractTableView;

	let clusterizeRows: string[] = [];
	let clusterize: any;
	let clusterizeScrollElement: HTMLElement;
	let clusterizeContentElement: HTMLElement;

	$: table.tableData.entries, updateClusterize();

	onMount(() => {
		clusterize = new Clusterize.prototype.constructor({
			rows: clusterizeRows,
			scrollElem: clusterizeScrollElement,
			contentElem: clusterizeContentElement,
		});

		updateClusterize();

		table.addDataChangeListener(() => {
			table.tableData = table.tableData;
		});

		table.addConfigChangeListener(() => {
			table.tableConfig = table.tableConfig;
		});
	});

	function updateClusterize() {
		clusterizeRows = [];

		for (const entry of table.tableData.entries) {
			let str = '<tr class="db-plugin-tb-row">';

			for (const column of table.tableData.columns) {
				str += `<td class="db-plugin-tb-cell">${entry.data[column.id]}</td>`;
			}

			str += '</tr>';
			clusterizeRows.push(str);
		}

		clusterize?.update(clusterizeRows);
	}
</script>

<div class="clusterize">
	<div class="clusterize-scroll" bind:this={clusterizeScrollElement}>
		<table class="db-plugin-table">
			<TableHeaderComponent bind:table={table}></TableHeaderComponent>

			<tbody class="db-plugin-tb clusterize-content" bind:this={clusterizeContentElement}>
			<tr class="clusterize-no-data">
				<td>Loading data…</td>
			</tr>
			</tbody>
		</table>
	</div>
</div>

