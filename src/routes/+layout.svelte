<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import type { LayoutData } from './$types';
	import { invalidate } from '$app/navigation';
	import type { Session } from '@supabase/supabase-js';
	let { children, data } = $props<{ data: LayoutData }>();
	let { session, supabase } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_: any, newSession: Session) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<div class="flex h-svh w-full max-w-full flex-col items-center bg-cover">
	<Header />
	<main class="flex w-full max-w-full flex-grow overflow-hidden">
		{@render children()}
	</main>
</div>
