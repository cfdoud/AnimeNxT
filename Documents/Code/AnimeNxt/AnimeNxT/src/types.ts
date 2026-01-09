export type AniListMedia = {
    id: number;
    title: { romaji: string; english?: string };
    coverImage: { large: string };
    genres: string[];
    tags: { name: string }[];
    description: string;
    recommendations: {
        edges: {
            node: {
                mediaRecommendation: {
                    id: number;
                    title: { romaji: string; english?: string };
                    coverImage: { large: string };
                };
            };
        }[];             
    };
    averageScore?: number;
};
