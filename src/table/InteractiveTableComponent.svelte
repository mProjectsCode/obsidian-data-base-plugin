<script lang="ts">
	import Icon from '../utils/Icon.svelte';
	import {SortingMode, TableColumn, TableData, TableEntry} from '../utils/TableParser';
	import {onMount} from 'svelte';
	import {compareTableEntriesByColumns} from '../utils/Utils';
	import {SimpleColumnEditModal} from '../modals/SimpleColumnEditModal';
	import TableHeaderComponent from './TableHeaderComponent.svelte';
	import {AbstractTableView} from '../views/AbstractTableView';

	export let tableData: TableData;
	export let view: AbstractTableView;

	let entriesPerPage: number = 1000;
	let page: number = 1;
	let visibleEntries: TableEntry[] = [];

	$: page, tableData.entries, calculateVisibleEntries();

	onMount(() => {
		if (tableData.columns.length > 0) {
			sort();
		}

		calculateVisibleEntries();
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


		view.saveTable();
		tableData = tableData;
	}


	function editColumn(event: CustomEvent) {
		const column = event.detail.column;

		const editModal = new SimpleColumnEditModal(view.app, column, updatedColumn => {
			const index = tableData.columns.indexOf(column);
			tableData.columns[index] = updatedColumn;
			if (tableData.sortingMode && tableData.sortingMode.column === column) {
				tableData.sortingMode.column = updatedColumn;
				sort();
			} else {
				view.save();
			}
		}, () => {
		});

		editModal.open();
	}

	function calculateVisibleEntries(): void {
		visibleEntries = tableData.entries.slice((page - 1) * entriesPerPage, Math.min(page * entriesPerPage, tableData.entries.length));
		console.log(visibleEntries);
	}

	function getNumberOfPages(): number {
		return Math.ceil(tableData.entries.length / entriesPerPage);
	}
</script>

<div>
	<div class="db-plugin-table-pagination">
		<span>Page</span>
		<div class="db-plugin-clickable-icon-wrapper" style="display: inline"
			 on:click={() => page = Math.max(page - 1, 1)}>
			<Icon class="db-plugin-th-cell-content-icon" iconName="chevron-left"></Icon>
		</div>
		<span>{page}</span>
		<div class="db-plugin-clickable-icon-wrapper" style="display: inline"
			 on:click={() => page = Math.min(page + 1, getNumberOfPages())}>
			<Icon class="db-plugin-th-cell-content-icon" iconName="chevron-right"></Icon>
		</div>
		<span>out of {getNumberOfPages()}</span>
	</div>

	<table class="db-plugin-table">
		<TableHeaderComponent bind:tableData={tableData} on:editColumn={editColumn}
							  on:cycleSortingMode={cycleSortingMode}></TableHeaderComponent>
		<tbody class="db-plugin-tb">
		{#each visibleEntries as entry}
			<tr class="db-plugin-tb-row">
				{#each tableData.columns as column}
					<td class="db-plugin-tb-cell">
						{entry[column.name]}
					</td>
				{/each}
			</tr>
		{/each}
		</tbody>
	</table>
</div>


