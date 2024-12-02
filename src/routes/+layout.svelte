<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<div class="flex h-svh w-full max-w-full flex-col items-center bg-cover">
	<Header />
	<main class="flex w-full max-w-full flex-grow overflow-hidden">
		{@render children()}
	</main>
</div>
