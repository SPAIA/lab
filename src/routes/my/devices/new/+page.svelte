<script lang="ts">
	import type { DeviceSettings } from '$lib/types';
	import Step1 from './Step1.svelte';
	import Step2 from './Step2.svelte';
	import Step3 from './Step3A.svelte';
	import Step4 from './Step4.svelte';
	let settings: DeviceSettings = { uploadFrequency: 'daily' };
	let currentStep = 1;
	const steps = [Step1, Step2, Step3, Step4];
	const nextPage = () => {
		if (currentStep < steps.length) {
			currentStep += 1;
		}
	};
	$: CurrentStepComponent = steps[currentStep - 1];
</script>

<div class="flex min-h-screen w-full">
	<div class="flex h-full w-full items-center justify-center p-20">
		<div class="h-4/5 w-2/3 max-w-md space-y-4">
			<svelte:component this={CurrentStepComponent} {nextPage} {settings} />
		</div>
	</div>
</div>
