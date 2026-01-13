import type { AniListMedia } from "../types";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";


type GraphQlResponse<T> = {
    data?: T;
    errors?: Array<{ message: string }>;
};

async function gql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const res = await fetch(ANILIST_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
        throw new Error(`AniList API error: ${res.status} ${res.statusText}`);
    }

    const json: GraphQlResponse<T> = await res.json();

    if (json.errors && json.errors.length > 0) {
        throw new Error(`AniList GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`);
    }

    if (!json.data) {
        throw new Error("AniList API returned no data");
    }

    return json.data;
}



// - - -- - - - - -  SEARCH -- - -- - - - -  - -

export async function searchAnime(search: string, perPage = 5): Promise<AniListMedia[]> {
    const query = `
          query ($search: String) {
            Page(perPage: 5) {
              media(search: $search, type: ANIME) {
                id
                coverImage {
                  large
                }
                genres
                tags {
                  name
                }
                averageScore
                popularity
                title {
                  romaji
                  english
                }
                relations {
                  edges {
                    relationType
                    node {
                      id
                      title {
                        romaji
                        english
                      }
                      format
                      season
                      seasonYear
                    }
                  }
                }
              }
            }
          }
        `;

        const data = await gql<{
            Page: { media: AniListMedia[] }
        }>(query, { search, perPage });

        return data.Page.media ?? [];
}


//--------------------Candidate Pool

export type PoolSort = "POPULARITY_DESC" | "SCORE_DESC" | "TRENDING_DESC";

export async function fetchCandidatePool(options?: {
    pagesPerSort?: number;
    perPage?: number;
    sorts?: PoolSort[];
}): Promise<AniListMedia[]> {
    const pagesPerSort = options?.pagesPerSort ?? 2;
    const perPage = options?.perPage ?? 50;
    const sorts = options?.sorts ?? ["POPULARITY_DESC", "SCORE_DESC"];

    const query = `
        query ($page: Int, $perPage: Int, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
            media(type: ANIME, sort: $sort) {
            id
            title { romaji english }
            coverImage { large }
            genres
            tags { name }
            averageScore
            popularity
            format
            relations {
                edges { relationType }
            }
            }
        }
        }
    `;

    const requests: Promise<AniListMedia[]>[] = [];
    for (const sort of sorts) {
        for (let page = 1; page <= pagesPerSort; page++) {
        requests.push(
            gql<{ Page: { media: AniListMedia[] } }>(query, { page, perPage, sort: [sort] })
            .then((d) => d.Page.media ?? [])
        );
        }
    }

    const chunks = await Promise.all(requests);
    const merged = chunks.flat();

    // de-dupe by id
    const map = new Map<number, AniListMedia>();
    for (const m of merged) {
        if (m?.id) map.set(m.id, m);
    }

    return Array.from(map.values());
}






