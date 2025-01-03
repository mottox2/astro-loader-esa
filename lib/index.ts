import type { Loader, LoaderContext } from "astro/loaders";
import { z } from "astro/zod";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";

export function esaLoader({
	accessToken,
	teamName,
	params,
}: {
	accessToken?: string;
	teamName?: string;
	params?: {
		q?: string;
		include?: string;
		sort?:
			| "updated"
			| "created"
			| "number"
			| "stars"
			| "watchs"
			| "comments"
			| "best_match";
		order?: "asc" | "desc";
	};
}): Loader {
	return {
		name: "esa-loader",
		load: async (context: LoaderContext) => {
			const { config, store, logger, parseData, generateDigest } =
				context;
			if (!accessToken) {
				logger.error("Missing required `accessToken` option for `esaLoader`");
				return;
			}
			if (!teamName) {
				logger.error("Missing required `teamName` option for `esaLoader`");
				return;
			}
			const processor = await createMarkdownProcessor(config.markdown);

			store.clear();
			let nextPage = 1;
			while (nextPage) {
				const url = new URL(`https://api.esa.io/v1/teams/${teamName}/posts`);
				url.searchParams.append("page", nextPage.toString());
				if (params) {
					params.q && url.searchParams.append("q", params.q);
					params.include && url.searchParams.append("include", params.include);
					params.sort && url.searchParams.append("sort", params.sort);
					params.order && url.searchParams.append("order", params.order);
				}

				const res = await fetch(url, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				logger.info(`fetching page ${nextPage}, status: ${res.status}`);
				const data = await res.json();
				for (const post of data.posts) {
					const id = post.number;
					const data = {
						number: post.number,
						name: post.name,
						body: post.body_md,
						bodyHtml: post.body_html,
						createdAt: post.created_at,
						message: post.message,
						updatedAt: post.updated_at,
						tags: post.tags,
						category: post.category,
						revisionNumber: post.revision_number,
						url: post.url,
					};
					const digest = generateDigest(id.toString() + data.updatedAt);
					// 合わせてschemaをexportしておく
					// if (typeof context.processData === 'function') {
					// data = await context.processData(data);
					// }
					const parsedData = await parseData({ id, data });
					const result = await processor.render(post.body_md, {
						frontmatter: data,
					});
					store.set({
						id,
						data: parsedData,
						digest,
						rendered: {
							html: result.code,
							metadata: result.metadata,
						},
					});
				}
				nextPage = data.next_page;
			}
		},
		schema: z.object({
			number: z.number(),
			name: z.string(),
			body: z.string(),
			bodyHtml: z.string(),
			createdAt: z.coerce.date(),
			message: z.string(),
			updatedAt: z.coerce.date(),
			tags: z.array(z.string()),
			category: z.string(),
			revisionNumber: z.number(),
			url: z.string(),
		}),
	};
}
