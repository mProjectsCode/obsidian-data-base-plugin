<script lang="ts">
	import Icon from '../utils/Icon.svelte';
	import {SortingMode, TableColumn, TableData} from '../utils/TableParser';
	import {onMount} from 'svelte';

	export let tableData: TableData;

	onMount(() => {
		console.log(tableData);

		if (tableData.columns.length > 0) {
			sort();
		}
	})

	function setSortingMode(column: TableColumn): void {
		const mode: SortingMode = tableData.sortingMode && tableData.sortingMode.column === column.name ? getNextSortingMode(tableData.sortingMode.mode) : getDefaultSortingMode();
		const columnName: string = mode === SortingMode.ASCENDING || mode === SortingMode.DESCENDING ? column.name : getDefaultSortingColumnName();

		tableData.sortingMode = {
			mode: mode,
			column: columnName,
		}

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

	function getDefaultSortingMode(): SortingMode {
		return SortingMode.DESCENDING;
	}

	function getDefaultSortingColumnName(): string {
		return tableData.columns[0].name;
	}

	function sort() {
		if (!tableData.sortingMode) {
			return;
		}

		console.log(tableData.sortingMode);

		tableData.entries.sort((a, b) => {
			if (tableData.sortingMode?.mode === SortingMode.ASCENDING) {
				return -1 * a[tableData.sortingMode?.column].localeCompare(b[tableData.sortingMode?.column]);
			} else {
				return a[tableData.sortingMode?.column].localeCompare(b[tableData.sortingMode?.column]);
			}
		})

		// tell svelte to update
		tableData = tableData;
	}
</script>

<table class="db-plugin-table">
	<thead class="db-plugin-th">
	<tr class="db-plugin-th-row">
		{#each tableData.columns as column}
			<th class="db-plugin-th-cell">
				<div class="db-plugin-th-cell-content">
					<span class="db-plugin-th-cell-content-text">{column.name}</span>
					<div class="db-plugin-clickable-icon-wrapper" on:click={() => setSortingMode(column)}>
						{#if tableData.sortingMode?.column === column.name && tableData.sortingMode?.mode === SortingMode.DESCENDING}
							<Icon class="db-plugin-th-cell-content-icon" iconName="chevron-down"></Icon>
						{:else if tableData.sortingMode?.column === column.name && tableData.sortingMode?.mode === SortingMode.ASCENDING}
							<Icon class="db-plugin-th-cell-content-icon" iconName="chevron-up"></Icon>
						{:else}
							<Icon class="db-plugin-th-cell-content-icon" iconName="chevrons-up-down"></Icon>
						{/if}
					</div>
					<div class="db-plugin-clickable-icon-wrapper">
						<Icon class="db-plugin-th-cell-content-icon" iconName="more-vertical"></Icon>
					</div>
				</div>
			</th>
		{/each}
	</tr>
	</thead>
	<tbody class="db-plugin-tb">
	{#each tableData.entries as entry}
		<tr class="db-plugin-tb-row">
			{#each tableData.columns as column}
				<td class="db-plugin-tb-cell">{entry[column.name]}</td>
			{/each}
		</tr>
	{/each}
	</tbody>
</table>
