import type { Loader } from "astro/loaders";
export declare function esaLoader({ accessToken, teamName, params, }: {
    accessToken?: string;
    teamName?: string;
    params?: {
        q?: string;
        include?: string;
        sort?: "updated" | "created" | "number" | "stars" | "watchs" | "comments" | "best_match";
        order?: "asc" | "desc";
    };
}): Loader;
