<script>
	// @ts-nocheck
	import Icon from "@iconify/svelte";
	import github from "@iconify/icons-mdi/github";
	import npm from "@iconify/icons-mdi/npm-variant";

	import Metadata from "../components/Metadata.svelte";

	import SiteAll from "../rendered-content/site-all.svx";
	import SiteTOC from "../rendered-content/site-toc.svx";

	import { localStore } from "local-store";
	
	const theme = localStore("theme", process.browser ? "system" : undefined);

	let themeOptions = [];
	if (process.browser) {
		themeOptions = ["light", "dark"]
		if (matchMedia("(prefers-color-scheme: light)").matches || matchMedia("(prefers-color-scheme: dark)").matches) themeOptions = [...themeOptions, "system"];
	}

	$: if (process.browser) {
		if ($theme === "system") document.documentElement.removeAttribute("data-theme");
		else document.documentElement.setAttribute("data-theme", $theme);
	}
</script>

<Metadata  />

<div class="flex flex-col h-screen overflow-y-hidden">
	<header class="z-20 flex items-baseline justify-between bg-header shadow-header">
		<!-- Homepage link -->
		<div class="p-5 pl-10">
			<a href="/" class="text-xl font-medium hocus:underline">Tailwind CSS Theme Variants</a>
		</div>
		<!-- End homepage link -->
		
		<!-- Theme selection -->
		<div class="px-5 text-on-primary-faint-100">
			{#if themeOptions.length > 0}
				<span id="theme-label">Theme:</span>
			{/if}
			{#each themeOptions as themeOption}
				<div class="inline-block">
					<button aria-labelledby="theme-label" class="px-2 py-5 group" on:click={() => $theme = themeOption}>
						<span class="p-1 -m-1 rounded transition-theme {$theme === themeOption ? 'font-semibold bg-primary-faint-200' : 'group-hocus:bg-primary-faint-200'}">
							{themeOption.slice(0, 1).toUpperCase()}{themeOption.slice(1)}
						</span>
					</button>
				</div>
			{/each}
		</div>
		<!-- End theme selection -->

		<!-- External links for the package -->
		<div class="pr-5">
			{#each [[github, "GitHub", "https://github.com/JakeNavith/tailwindcss-theme-variants"], [npm, "NPM", "https://www.npmjs.com/package/tailwindcss-theme-variants"]] as [icon, name, link]}
				<a class="p-5 group text-on-primary-faint-200 hocus:text-on-primary transition-theme" href={link}><Icon {icon} style="font-size: 150%" class="inline align-middle text-on-primary-faint-300 group-hocus:text-on-primary transition-theme" /><span class="pl-1 align-middle group-hocus:underline">{name}</span></a>
			{/each}
		</div>
		<!-- End external links for the package -->
	</header>

	<div class="flex flex-1 flex-shrink-0 overflow-y-hidden">
		<!-- Left sidebar for navigation -->
		<aside class="hidden max-w-xs overflow-y-auto xl:max-w-md 2xl:max-w-xl lg:block">
			<nav class="p-10 sidebar">
				<SiteTOC />
			</nav>
		</aside>
		<!-- End left sidebar for navigation -->

		<!-- Main page content -->
		<div class="flex-1 overflow-y-auto">
			<div class="flex justify-center p-10">
				<article class="prose-sm prose md:prose 2xl:prose-lg">
					<SiteAll />
				</article>
			</div>
		</div>
		<!-- End main page content -->
	</div>
</div>
