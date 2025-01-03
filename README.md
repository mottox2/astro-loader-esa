# astro-loader-esa

A loader for Astro’s Content Layer designed to work seamlessly with esa.io data.

## Installation

```bash
npm install astro-loader-esa
```

## Usage

First, you need to create a new Personal Access Token in your esa.io account. You can do this by going to your account settings and creating a new token. Make sure to copy the token as you won't be able to see it again.

Next, You can find this by looking at the URL of your esa.io team. For example, if your team URL is `https://your-team.esa.io`, then your team name is `your-team`.

Finally, you need to add the following to your `astro.config.mjs` file:

```javascript
import { defineCollection } from "astro:content";
import { esaLoader } from "astro-loader-esa";

const esaPosts = defineCollection({
  loader: esaLoader({
    accessToken: getSecret("ESA_ACCESS_TOKEN"),
    teamName: getSecret("ESA_TEAM_NAME"),
    params: {
      q: "wip:false",
    },
  }),
});
```

## Example

You can then use the collection in your `.astro` files like so: `src/page/index.astro`

```astro
---
import { getCollection } from "astro:content";
const posts = getCollection("esaPosts");
---

{posts.map((post) => (
  <article>
    <h2>{post.data.number} {post.data.name}</h2>
    <p>{post.data.bodyMd}</p>
  </article>
))}
```

You can use the single like this: `src/page/posts/[number].astro`

```astro
---
export const getStaticPaths: GetStaticPaths = async () => {
	const items = await getCollection("esaPosts");
	return items.map((item) => ({ params: { number: item.data.number } }));
};

const { number } = Astro.params;
const post = await getEntry("esaPosts", String(number));

const { Content } = await render(post);
---

<h1>{post.data.name}</h1>

<Content />
```

