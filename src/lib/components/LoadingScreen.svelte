<script lang="ts">
	import { loadStore, taskCount } from '$lib/stores/loadStore';
	const showLoader = true;
	// Subscribe to the loadStore
	$: tasks = $loadStore;

	// Convert Set to Array for display
	$: taskArray = Array.from(tasks);
</script>

{#if $taskCount > 0}
	<!-- /loader -->
{/if}
