<script lang="ts">
	import Icon from '../utils/Icon.svelte';

	export let page: number;
	export let numberOfPages: number;

</script>

<div class="db-plugin-table-pagination">
	<span>Page</span>
	<div
		class="db-plugin-clickable-icon-wrapper"
		style="display: inline"
		on:click={() => page = Math.max(page - 1, 1)}
	>
		<Icon class="db-plugin-th-cell-content-icon" iconName="chevron-left"></Icon>
	</div>
	<input type="number" bind:value={page}>
	<div
		class="db-plugin-clickable-icon-wrapper"
		style="display: inline"
		on:click={() => page = Math.min(page + 1, numberOfPages)}
	>
		<Icon class="db-plugin-th-cell-content-icon" iconName="chevron-right"></Icon>
	</div>
	<span>out of {numberOfPages}</span>
</div>
