<script lang="ts">
	import { errorStore, clearError } from '$lib/stores/errorStore';
</script>

{#if $errorStore}
	<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
		<div class="relative w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
			<!-- Close button -->
			<button
				class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
				on:click={clearError}
			>
				✕
			</button>

			<!-- Modal Content -->
			<div class="p-4 text-center">
				<h3 class="mb-2 text-lg font-semibold text-red-600">Error</h3>
				<p class="text-sm text-gray-600">{$errorStore}</p>
			</div>

			<!-- Modal Footer -->
			<div class="flex justify-center p-4">
				<button
					class="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
					on:click={clearError}
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
