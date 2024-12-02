<script lang="ts">
	import { page } from '$app/stores';

	$: activeUrl = $page.url.pathname;
</script>

<header class="w-full">
	<div class="flex h-16 w-full justify-start">
		<a href="/">
			<img src="/images/SPAIA-logo-whiteonblue.webp" class="mr-3 h-16 sm:h-16" alt="SPAIA Logo" />
		</a>
	</div>
</header>
