<script lang="ts">
	import { page } from '$app/stores';
	import { userStore } from '$lib/stores/userStore';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, Input } from 'flowbite-svelte';
	$: activeUrl = $page.url.pathname;
	export let logout = () => {};
</script>

<header class="z-50 w-full">
	<Navbar>
		<NavBrand href="/">
			<img
				src="/images/SPAIA-logo-whiteonblue.webp"
				class="absolute top-2 z-30 mr-3 h-24 rounded-full drop-shadow-lg sm:h-24"
				alt="SPAIA"
			/>
		</NavBrand>
		<div class="flex md:order-2">
			{#if $userStore}
				<Button size="sm" on:click={logout}>logout</Button>
			{:else}
				<Button size="sm">Get started</Button>
			{/if}
			<NavHamburger />
		</div>
		<NavUl class="order-1">
			<NavLi href="/my/lab" activeClass="font-bold">Home</NavLi>
			<NavLi href="/bugzoo">Bug Zoo</NavLi>
			<NavLi href="/emulator">Emulator</NavLi>
			<!-- <NavLi href="/docs/components/navbar">Navbar</NavLi>
			<NavLi href="/pricing">Pricing</NavLi>
			<NavLi href="/contact">Contact</NavLi> -->
		</NavUl>
	</Navbar>
</header>
