<script lang="ts">
	import { tokenStore } from '$lib/stores/userStore';
	import { Button, Checkbox, Label, Radio, Input, Textarea } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let currentSlide = $state(0);

	let form = $state({
		date: '',
		time: '',
		location: '',
		weather: '',
		temperature: '',
		wind: '',
		season: '',
		sightings: [],
		reflection: '',
		consent: false
	});

	const totalSlides = $derived(3 + form.sightings.length); // Introduction + Context + Sightings + Reflection

	function goNext() {
		if (currentSlide < totalSlides - 1) currentSlide++;
	}

	function goBack() {
		if (currentSlide > 0) currentSlide--;
	}

	function goToSlide(index: number) {
		currentSlide = index;
	}

	function addSightingAndAdvance() {
		form.sightings = [
			...form.sightings,
			{ group: '', count: '', behavior: '', where: '', notes: '' }
		];
		form = form; // Trigger reactivity
		// We need to wait for reactivity to update totalSlides before setting currentSlide
		setTimeout(() => {
			currentSlide = form.sightings.length + 1; // Adjust for intro and context slides
		}, 0);
	}

	function goToReflection() {
		currentSlide = totalSlides - 1; // Go to the last slide (reflection)
	}

	async function submitForm() {
		try {
			// Transform form data to match API schema
			const submissionData = {
				user_id: '', // Will be populated from auth
				type: 'transect',
				date: form.date,
				time: form.time,
				location: form.location,
				weather: form.weather,
				temperature: parseInt(form.temperature) || 0,
				wind: form.wind,
				season: form.season,
				consent: form.consent,
				sightings: form.sightings.map((s) => ({
					group_name: s.group,
					estimated_count: parseInt(s.count) || 0,
					behavior: s.behavior,
					location_seen: s.where,
					notes: s.notes,
					photo_url: '' // Can be added later if photos are implemented
				}))
			};
			const token = get(tokenStore);
			const response = await fetch('https://beta.api.spaia.earth/submissions', {
				method: 'POST',
				headers: {
					authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(submissionData)
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Submission failed');
			}

			const result = await response.json();
			console.log('Submission successful:', result);
			alert('Thank you for your submission!');

			// Reset form after successful submission
			form = {
				date: '',
				time: '',
				location: '',
				weather: '',
				temperature: '',
				wind: '',
				season: '',
				sightings: [{ group: '', count: '', behavior: '', where: '', notes: '' }],
				reflection: '',
				consent: false
			};
			currentSlide = 0;
		} catch (error) {
			console.error('Submission error:', error);
			let message = 'Submission failed';
			if (error instanceof Error) {
				message = error.message;
			} else if (typeof error === 'string') {
				message = error;
			}
			alert(`Submission failed: ${message}`);
		}
	}

	function startSurvey() {
		// Set current date and time
		const now = new Date();
		form.date = now.toISOString().split('T')[0]; // Format as YYYY-MM-DD
		form.time = now.toTimeString().slice(0, 5); // Format as HH:MM

		// Ask for location
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					form.location = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
					form = form; // Trigger reactivity
				},
				(error) => {
					console.error('Error getting location:', error);
					alert('Unable to get your location. Please enter it manually.');
				}
			);
		} else {
			alert('Geolocation is not supported by your browser. Please enter your location manually.');
		}
		console.log('geo');
		// Move to the next slide
		goNext();
	}
</script>

<div class="relative mx-auto h-full w-full overflow-hidden py-14">
	<!-- Slide Container -->
	<div
		class="flex h-full max-h-full transition-transform duration-300 ease-in-out"
		style={`width: ${totalSlides * 100}%; transform: translateX(-${(currentSlide / totalSlides) * 100}%);`}
	>
		<!-- Introduction Slide -->
		<div class="h-full flex-shrink-0 px-4" style={`width: ${100 / totalSlides}%`}>
			<div class="h-full space-y-6 overflow-y-scroll rounded-3xl bg-white p-6 shadow">
				<h2 class="text-2xl font-bold">Urban Biodiversity Field Observation</h2>
				<div class="space-y-4">
					<p class="font-medium">How to conduct your transect survey:</p>
					<ol class="list-decimal space-y-2 pl-5">
						<li>Choose a straight path around 20–30 meters long</li>
						<li>Walk slowly along the line, observing about 1 meter to either side</li>
						<li>Look for insects — flying, crawling, feeding, resting</li>
						<li>
							For each sighting, record:
							<ul class="mt-2 list-disc space-y-1 pl-5">
								<li>
									Insect group (if known)—Bees, Butterflies & Moths, Flies, Beetles, Ants, Wasps,
									Other e.g. dragonflies, grasshoppers, unknowns)
								</li>
								<li>What it was doing (e.g. flying, feeding, mating)</li>
								<li>Where you saw it (e.g. on flower, in air, on bark)</li>
							</ul>
						</li>
						<li>
							If possible, take a photo of interesting sightings — this helps with identification
							later
						</li>
					</ol>
				</div>

				<div class="flex justify-center pt-6">
					<Button on:click={startSurvey} class="w-full md:w-auto">Start Survey</Button>
				</div>
			</div>
		</div>

		<!-- Context Slide -->
		<div class="h-full flex-shrink-0 px-4" style={`width: ${100 / totalSlides}%`}>
			<div class="h-full space-y-6 overflow-y-scroll rounded-3xl bg-white p-6 shadow">
				<h2 class="text-2xl font-bold">Urban Biodiversity Field Observation</h2>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Input bind:value={form.date} type="date" placeholder="Date" />
					<Input bind:value={form.time} type="time" placeholder="Time" />
					<Input bind:value={form.location} placeholder="Location (GPS coordinates)" />
				</div>

				<div>
					<Label class="mb-2 block">Weather</Label>
					<div class="flex flex-wrap gap-4">
						{#each ['Sunny', 'Partly cloudy', 'Overcast', 'Rainy'] as condition}
							<div class="flex items-center gap-2">
								<Radio name="weather" value={condition} bind:group={form.weather} />
								<span>{condition}</span>
							</div>
						{/each}
					</div>

					<div class="mt-4 grid grid-cols-2 gap-4">
						<Input bind:value={form.temperature} type="number" placeholder="Temperature (°C)" />
						<div>
							<Label class="mb-2 block">Wind</Label>
							<div class="flex flex-wrap gap-4">
								{#each ['None', 'Light breeze', 'Moderate', 'Strong'] as wind}
									<div class="flex items-center gap-2">
										<Radio name="wind" value={wind} bind:group={form.wind} />
										<span>{wind}</span>
									</div>
								{/each}
							</div>
						</div>
						<Input bind:value={form.season} placeholder="Season" />
					</div>
				</div>

				<div class="flex justify-end">
					<Button
						on:click={() => {
							addSightingAndAdvance();
						}}
						class="mt-4">Add Sighting</Button
					>
				</div>
			</div>
		</div>

		<!-- Sighting Slides -->
		{#each form.sightings as sighting, i (i)}
			<div
				class="h-full flex-shrink-0 overflow-y-scroll px-4"
				style={`width: ${100 / totalSlides}%`}
			>
				<div class="h-auto space-y-6 overflow-y-scroll rounded-3xl bg-white p-6 shadow">
					<h3 class="text-xl font-semibold">Sighting #{i + 1}</h3>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Input bind:value={sighting.group} placeholder="Insect Group (e.g. Bees, Flies)" />
						<Input bind:value={sighting.count} type="number" placeholder="Estimated Count" />
						<Input bind:value={sighting.behavior} placeholder="Behavior (e.g. flying, feeding)" />
						<Input bind:value={sighting.where} placeholder="Where Seen (e.g. flower, bark)" />
						<Textarea
							bind:value={sighting.notes}
							rows={2}
							placeholder="Notes"
							class="md:col-span-2"
						/>
					</div>

					<div class="flex justify-between pt-4">
						{#if i === form.sightings.length - 1}
							<Button on:click={addSightingAndAdvance} color="light" outline>
								Add Another Sighting
							</Button>
						{:else}
							<div></div>
							<!-- Spacer -->
						{/if}
					</div>

					{#if i === form.sightings.length - 1}
						<div class="flex justify-between">
							<Button on:click={goToReflection} color="blue">Done</Button>
							<Button on:click={addSightingAndAdvance} color="light" outline
								>Add Another Sighting</Button
							>
						</div>
					{/if}
				</div>
			</div>
		{/each}
		<!-- Reflection slide -->
		<div class="h-full flex-shrink-0 px-4" style={`width: ${100 / totalSlides}%`}>
			<div class="h-full space-y-6 overflow-y-scroll rounded-3xl bg-white p-6 shadow">
				<h3 class="text-xl font-semibold">Final Reflection</h3>
				<p>
					Did anything today shift your sense of connection—with this place, its inhabitants, or
					yourself?
				</p>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Textarea
						bind:value={form.reflection}
						rows={2}
						placeholder="Notes"
						class="md:col-span-2"
					/>
				</div>

				<div class="flex justify-between pt-4">
					<Button onclick={submitForm} color="light" outline>Submit</Button>
					<div class="flex items-start gap-2">
						<Checkbox bind:checked={form.consent} />
						<Label class="ml-2">
							I consent to my observations being used anonymously for ecological monitoring and
							citizen science.
						</Label>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Navigation -->
	<div class="mt-2 flex items-center justify-between">
		<Button onclick={goBack} disabled={currentSlide === 0} color="light">Previous</Button>
		<div class="flex gap-2">
			{#each Array(totalSlides) as _, i}
				<button
					on:click={() => goToSlide(i)}
					class="h-2 w-2 rounded-full transition-colors"
					class:bg-blue-600={currentSlide === i}
					class:bg-gray-300={currentSlide !== i}
					aria-label={`Go to slide ${i + 1}`}
				></button>
			{/each}
		</div>
		<Button on:click={goNext} disabled={currentSlide >= totalSlides - 1} color="light">Next</Button>
	</div>
</div>
