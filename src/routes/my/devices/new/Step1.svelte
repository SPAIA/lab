<script lang="ts">
	import StepCard from '$lib/components/StepCard.svelte';
	import { Button, Card } from 'flowbite-svelte';
	export let nextPage: () => void;
</script>

<StepCard>
	<div class="h-full w-full scroll-auto">
		<p class="bb-4">Please complete these steps using the latest version opf google chrome.</p>
		<ul>
			<li>Prepare your device by takiing off the upper shell.</li>
			<li>
				Format your SD card. <a href="https://www.youtube.com/watch?v=OY28ANg_4hM" target="_blank"
					>here's a video</a
				>
			</li>
			<li>
				Make sure you have a data USB-C cable. (<i>
					Not all cables are created equal, some can't send data, only power.</i
				>)
			</li>
		</ul>
	</div>
	<Button on:click={nextPage}>Next</Button>
</StepCard>
