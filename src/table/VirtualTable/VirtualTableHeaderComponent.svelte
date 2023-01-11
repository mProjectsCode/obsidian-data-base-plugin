<script lang="ts">
	import Icon from '../../utils/Icon.svelte';
	import {SortingMode, Table, TableColumn, TableColumnId} from '../../utils/Table';
	import {onMount} from 'svelte';
	import {Menu} from 'obsidian';

	export let table: Table;
	export let columnWidths: Record<TableColumnId, number> = {};

	let dragStartPos: number = -1;
	let dragInitialWidth: number = -1;
	let dragColumnId: TableColumnId = '';

	onMount(() => {
		table.addDataChangeListener(() => {
			table.tableData = table.tableData;
		});

		table.addConfigChangeListener(() => {
			table.tableConfig = table.tableConfig;
		});
	});

	function showColumnActionsMenu(event: MouseEvent, column: TableColumn): void {
		new Menu()
			.addItem(item => {
				item.setTitle('Add Column to Left');
				item.setIcon('align-horizontal-justify-start');
				item.onClick(() => {
					console.log('TODO: add column to left');
				});
			})
			.addItem(item => {
				item.setTitle('Add Column to Right');
				item.setIcon('align-horizontal-justify-end');
				item.onClick(() => {
					console.log('TODO: add column to right');
				});
			})
			.addSeparator()
			.addItem(item => {
				item.setTitle('Edit');
				item.setIcon('edit');
				item.onClick(() => {
					table.editColumnWithModal(column.id);
				});
			})
			.addItem(item => {
				item.setTitle('Delete');
				item.setIcon('trash');
				item.onClick(() => {
					table.deleteColumnWithModal(column.id);
				});
			})
			.showAtMouseEvent(event);
	}

	function cycleSortingMode(column: TableColumn): void {
		table.cycleSortingModeForColumn(column);
	}

	function startDrag(event: MouseEvent, columnId: TableColumnId): void {
		// console.log('start drag', columnId);
		// console.log(columnWidths);

		dragStartPos = event.pageX;
		dragColumnId = columnId;
		dragInitialWidth = columnWidths[columnId];
	}

	function stopDrag(): void {
		if (!dragColumnId) {
			return;
		}

		// console.log('stop drag');

		table.setColumnWidth(dragColumnId, columnWidths[dragColumnId]);

		dragStartPos = -1;
		dragColumnId = '';
		dragInitialWidth = -1;
	}

	function updateDrag(event: MouseEvent): void {
		if (!dragColumnId) {
			return;
		}

		const delta = event.pageX - dragStartPos;
		// console.log('update drag', delta);
		columnWidths[dragColumnId] = Math.max(150, dragInitialWidth + delta);
	}
</script>

<svelte:window on:mouseup={stopDrag} />

<div class="db-plugin-th" on:mousemove={updateDrag}>
	{#each table.tableData.columns as column}
		<div class="db-plugin-th-cell" style={`width: ${columnWidths[column.id]}px`}>
			<div class="db-plugin-th-cell-content-text-container">
				<span class="db-plugin-th-cell-content-text">{column.name}</span>
				<span
					class="db-plugin-th-cell-content-text-secondary">{table.getColumnConfigById(column.id)?.dataType}
				</span>
			</div>
			<div class="db-plugin-clickable-icon-wrapper" on:click={() => cycleSortingMode(column)}>
				{#if table.tableConfig.sortingConfig.column === column.id && table.tableConfig.sortingConfig.mode === SortingMode.DESCENDING}
					<Icon iconName="chevron-down"></Icon>
				{:else if table.tableConfig.sortingConfig.column === column.id && table.tableConfig.sortingConfig.mode === SortingMode.ASCENDING}
					<Icon iconName="chevron-up"></Icon>
				{:else}
					<Icon iconName="chevrons-up-down"></Icon>
				{/if}
			</div>
			<div class="db-plugin-clickable-icon-wrapper"
				 on:click={(event) => showColumnActionsMenu(event, column)}>
				<Icon iconName="more-vertical"></Icon>
			</div>
			<span class={`db-plugin-th-cell-resize-handle ${dragColumnId === column.id ? 'db-plugin-th-cell-resize-handle-active' : ''}`} on:mousedown={event => startDrag(event, column.id)}></span>
		</div>
	{/each}
</div>
