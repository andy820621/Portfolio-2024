<template>
  <!-- // TODO: Check what i can do more with this. -->
	<article
		class="prose dark:prose-invert prose-pre:bg-gray-100 prose-pre:text-gray-700 dark:prose-pre:bg-gray-800 dark:prose-pre:text-gray-300 max-w-none"
	>
		<ContentDoc>
			<template #not-found>
				<h1>Document not found (404)</h1>
				<p>This blog post could not be found.</p>
				<p>
					You may want to head back to the
					<NuxtLink to="/blog">Blog Lists Page</NuxtLink>.
				</p>
			</template>

			<template #default="{ doc }">
				<div class="grid grid-cols-6 gap-16">
					<div
						:class="{
							'col-span-6 md:col-span-4': doc.toc,
							'col-span-6': !doc.toc,
						}"
					>
						<ContentRenderer :value="doc" />
					</div>
					<div class="hidden md:block md:col-span-2 not-prose" v-if="doc.toc">
						<aside class="sticky top-8">
							<div class="font-semibold mb-2">Table of Contents</div>
							<nav>
								<TocLinks
									:links="doc.body?.toc?.links || []"
									:active-id="activeId"
								/>
							</nav>
						</aside>
					</div>
				</div>
			</template>
		</ContentDoc>
	</article>
</template>

<script setup lang="ts">
const activeId = ref("");

onMounted(() => {
	const observer = new IntersectionObserver(callback, {
		root: null,
		threshold: 0.5,
	});

	const elements = document.querySelectorAll("h2, h3");

	for (const element of elements) observer.observe(element);

	function callback(entries: IntersectionObserverEntry[]) {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				activeId.value = entry.target.id;
				break;
			}
		}
	}

	onBeforeUnmount(() => {
		for (const element of elements) observer.unobserve(element);
	});
});
</script>

<style scoped></style>
