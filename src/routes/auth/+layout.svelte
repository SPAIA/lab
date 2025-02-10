<script>
	import ErrorNotification from '$lib/components/ErrorNotification.svelte';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';

	let { children } = $props();
</script>

<!-- <header>
	<nav>
		<a href="/">Home</a>
	</nav>
</header> -->

{@render children()}
