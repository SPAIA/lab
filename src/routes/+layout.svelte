<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import '../app.css';
	import type { LayoutData } from './$types';
	let { children } = $props();
	export let data: LayoutData;

	$: ({ supabase, session } = data);

	onMount(() => {
		if (!supabase) return;
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<div class="flex h-svh w-full max-w-full flex-col items-center bg-cover">
	<Header />
	<main class="flex w-full max-w-full flex-grow overflow-hidden">
		{@render children()}
	</main>
</div>
