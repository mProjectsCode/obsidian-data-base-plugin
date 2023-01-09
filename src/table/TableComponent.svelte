<script lang="ts">
	import {SortingMode, TableColumn, TableData} from '../utils/TableParser';
	import {onMount} from 'svelte';
	import * as Clusterize from 'clusterize.js';
	import {compareTableEntriesByColumns} from '../utils/Utils';
	import {SimpleColumnEditModal} from '../modals/SimpleColumnEditModal';
	import TableHeaderComponent from './TableHeaderComponent.svelte';
	import {AbstractTableView} from '../views/AbstractTableView';

	export let tableData: TableData;
	export let view: AbstractTableView;

	let clusterizeRows: string[] = [];
	let clusterize;
	let clusterizeScrollElement: HTMLElement;
	let clusterizeContentElement: HTMLElement;

	onMount(() => {
		console.log(tableData);

		if (tableData.columns.length > 0) {
			sort();
		}

		clusterize = new Clusterize.prototype.constructor({
			rows: clusterizeRows,
			scrollElem: clusterizeScrollElement,
			contentElem: clusterizeContentElement,
		});

		updateClusterize();
	});

	function cycleSortingMode(event: CustomEvent): void {
		const column = event.detail.column;

		const mode: SortingMode = tableData.sortingMode && tableData.sortingMode.column === column ? getNextSortingMode(tableData.sortingMode.mode) : getDefaultSortingMode().mode;
		const columnName: TableColumn = column;

		tableData.sortingMode = {
			mode: mode,
			column: columnName,
		};

		sort();
	}

	function getNextSortingMode(sortingMode: SortingMode): SortingMode {
		if (sortingMode === SortingMode.NONE) {
			return SortingMode.DESCENDING;
		} else if (sortingMode === SortingMode.DESCENDING) {
			return SortingMode.ASCENDING;
		} else if (sortingMode === SortingMode.ASCENDING) {
			return SortingMode.NONE;
		}
	}

	function getDefaultSortingMode(): { mode: SortingMode, column: TableColumn } {
		return {
			mode: SortingMode.DESCENDING,
			column: tableData.columns[0],
		};
	}

	function sort() {
		if (!tableData.sortingMode) {
			return;
		}

		if (tableData.sortingMode.mode === SortingMode.NONE) {
			tableData.sortingMode = getDefaultSortingMode();
		}

		console.log(tableData.sortingMode);

		tableData.entries.sort((a, b) => {
			if (!tableData.sortingMode) {
				return 0;
			}

			if (tableData.sortingMode.mode === SortingMode.ASCENDING) {
				return -1 * compareTableEntriesByColumns(a, b, tableData.sortingMode.column);
			} else if (tableData.sortingMode.mode === SortingMode.DESCENDING) {
				return compareTableEntriesByColumns(a, b, tableData.sortingMode.column);
			} else {
				return 0;
			}
		});

		// tell svelte to update
		updateClusterize();
		view.saveTable();
		tableData = tableData;
	}

	function updateClusterize() {
		clusterizeRows = [];

		for (const entry of tableData.entries) {
			let str = '<tr class="db-plugin-tb-row">';

			for (const column of tableData.columns) {
				str += `<td class="db-plugin-tb-cell">${entry[column.name]}</td>`;
			}

			str += '</tr>';
			clusterizeRows.push(str);
		}

		clusterize?.update(clusterizeRows);
	}

	function editColumn(event: CustomEvent) {
		const column = event.detail.column;

		const editModal = new SimpleColumnEditModal(
			view.app,
			column,
			updatedColumn => {
				const index = tableData.columns.indexOf(column);
				tableData.columns[index] = updatedColumn;
				if (tableData.sortingMode && tableData.sortingMode.column === column) {
					tableData.sortingMode.column = updatedColumn;
					sort();
				} else {
					view.saveTable();
				}
			},
			() => {
			},
		);

		editModal.open();
	}
</script>

<div class="clusterize">
	<div class="clusterize-scroll" bind:this={clusterizeScrollElement}>
		<table class="db-plugin-table">
			<TableHeaderComponent bind:tableData={tableData} on:editColumn={editColumn}
								  on:cycleSortingMode={cycleSortingMode}></TableHeaderComponent>
			<tbody class="db-plugin-tb clusterize-content" bind:this={clusterizeContentElement}>
			<tr class="clusterize-no-data">
				<td>Loading data…</td>
			</tr>
			</tbody>
		</table>
	</div>
</div>

