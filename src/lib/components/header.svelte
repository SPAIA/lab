<script lang="ts">
	import { page } from '$app/stores';

	$: activeUrl = $page.url.pathname;
</script>

<header class="w-full">
	<div class="flex h-16 w-full justify-start p-2">
		<a href="/">
			<img
				src="/images/SPAIA-logo-whiteonblue.webp"
				class="absolute z-30 mr-3 h-24 rounded-full drop-shadow-lg sm:h-24"
				alt="SPAIA Logo"
			/>
		</a>
	</div>
</header>
