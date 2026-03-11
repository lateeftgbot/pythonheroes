import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const LearningPrefetcher = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const prefetchData = async () => {
            try {
                // Pre-fetch Problem Sets
                await queryClient.prefetchQuery({
                    queryKey: ["problem-sets"],
                    queryFn: async () => {
                        const res = await fetch("/api/learning/problem-sets");
                        if (!res.ok) throw new Error("Failed to fetch problem sets");
                        return res.json();
                    },
                    staleTime: 1000 * 60 * 30, // 30 minutes
                });

                // Pre-fetch Categories
                await queryClient.prefetchQuery({
                    queryKey: ["learning-categories"],
                    queryFn: async () => {
                        const res = await fetch("/api/learning/categories");
                        if (!res.ok) throw new Error("Failed to fetch categories");
                        return res.json();
                    },
                    staleTime: 1000 * 60 * 60, // 1 hour
                });

                // Pre-fetch Initial Code Predictions (Bulk for "All" difficulty)
                await queryClient.prefetchQuery({
                    queryKey: ["code-predictions", "all"],
                    queryFn: async () => {
                        const res = await fetch("/api/learning/code-predictions?page=0&limit=2000");
                        if (!res.ok) throw new Error("Failed to fetch code predictions");
                        return res.json();
                    },
                    staleTime: 1000 * 60 * 15, // 15 minutes
                });

                console.log("Learning optimization patterns synchronized.");
            } catch (error) {
                console.error("Prefetcher sync failed:", error);
            }
        };

        // Execute pre-fetch with a slight delay to ensure initial mount is smooth
        const timeoutId = setTimeout(prefetchData, 2000);
        return () => clearTimeout(timeoutId);
    }, [queryClient]);

    return null; // This component doesn't render anything
};

export default LearningPrefetcher;
