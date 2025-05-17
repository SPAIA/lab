<script lang="ts">
	import { loadStore, taskCount } from '$lib/stores/loadStore';
	const showLoader = true;
	// Subscribe to the loadStore
	$: tasks = $loadStore;

	// Convert Set to Array for display
	$: taskArray = Array.from(tasks);
</script>

{#if $taskCount > 0}
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
		<!-- Spinner -->
		<div
			class="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
		></div>

		<!-- Loading Tasks List -->
		<div class="max-h-96 w-full max-w-md overflow-y-auto rounded-lg bg-white p-4">
			<h3 class="mb-2 text-lg font-semibold">Loading tasks:</h3>
			<ul class="space-y-1">
				{#each taskArray as task}
					<li class="flex items-center">
						<span class="mr-2 h-2 w-2 rounded-full bg-blue-500"></span>
						<span class="text-gray-700">{task}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}
