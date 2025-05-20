<script lang="ts">
	import dayjs from 'dayjs';
	import 'dayjs/locale/de'; // Import German locale
	import 'dayjs/locale/en'; // Import English locale
	import localizedFormat from 'dayjs/plugin/localizedFormat';

	dayjs.extend(localizedFormat);

	export let date: string | Date;
	export let format: string = 'LL';
	export let locale: string = 'de';
	export let showTime: boolean = false; // New prop
	export let timeFormat: string = 'LTS'; // Optional time format prop

	function formatDate(inputDate: string | Date, formatString: string, loc: string): string {
		let finalFormat = formatString;
		if (showTime) {
			finalFormat += ' ' + timeFormat;
		}
		return dayjs(inputDate).locale(loc).format(finalFormat);
	}
</script>

<span>{formatDate(date, format, locale)}</span>
