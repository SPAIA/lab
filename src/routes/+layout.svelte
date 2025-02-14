<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import type { LayoutData } from './$types';
	import { goto, invalidate } from '$app/navigation';
	import type { Session } from '@supabase/supabase-js';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';
	import ErrorNotification from '$lib/components/ErrorNotification.svelte';
	import { clearError } from '$lib/stores/errorStore';
	import { setUser, userStore } from '$lib/stores/userStore';
	import InfoNotification from '$lib/components/InfoNotification.svelte';
	let { children, data } = $props<{ data: LayoutData }>();
	let { session, supabase } = $derived(data);

	onMount(() => {
		clearError();
		const { data } = supabase.auth.onAuthStateChange((_: any, newSession: Session) => {
			console.log('New session:', newSession);
			setUser(newSession.user);
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

	const logout = () => {
		console.log('logout');
		const res = supabase.auth.signOut();
		console.log(res);
		setUser(null);
		goto('/');
	};
</script>

<div class="flex h-svh w-full max-w-full flex-col items-center bg-cover">
	<Header {logout} />
	<main class="flex w-full max-w-full flex-grow overflow-hidden">
		{@render children()}
	</main>
	<LoadingScreen />
	<ErrorNotification />
	<InfoNotification />
</div>
