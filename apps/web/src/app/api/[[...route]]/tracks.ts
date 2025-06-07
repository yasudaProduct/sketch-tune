import { Hono } from "hono";

// サンプルデータ（実際の実装では外部APIやデータベースから取得）
const sampleTracks = [
    {
        id: "track1",
        title: "Midnight Groove (WIP)",
        artist: {
            id: "user1",
            name: "Demo User",
            avatar:
                "https://images.pexels.com/photos/1056553/pexels-photo-1056553.jpeg?auto=compress&cs=tinysrgb&w=150",
        },
        coverImage:
            "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=600",
        url: "https://cdn.freesound.org/previews/476/476580_6142149-lq.mp3",
        genre: "Lofi Hip-Hop",
        daw: "Ableton Live",
        productionStage: "Sketch",
        duration: 185,
        createdAt: "2024-06-15T12:00:00Z",
        plays: 78,
        comments: 12,
        likes: 34,
    },
    {
        id: "track2",
        title: "Sunset Chillwave",
        artist: {
            id: "user2",
            name: "LoFi Producer",
            avatar:
                "https://images.pexels.com/photos/4048277/pexels-photo-4048277.jpeg?auto=compress&cs=tinysrgb&w=150",
        },
        coverImage:
            "https://images.pexels.com/photos/2118563/pexels-photo-2118563.jpeg?auto=compress&cs=tinysrgb&w=600",
        url: "https://cdn.freesound.org/previews/439/439085_9158243-lq.mp3",
        genre: "Chillwave",
        daw: "FL Studio",
        productionStage: "Demo",
        duration: 147,
        createdAt: "2024-06-10T18:30:00Z",
        plays: 42,
        comments: 8,
        likes: 16,
    },
    {
        id: "track3",
        title: "Electronic Dreams",
        artist: {
            id: "user3",
            name: "SynthWave",
            avatar:
                "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=150",
        },
        coverImage:
            "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600",
        url: "https://cdn.freesound.org/previews/514/514847_11421361-lq.mp3",
        genre: "Synthwave",
        daw: "Logic Pro",
        productionStage: "Work in Progress",
        duration: 215,
        createdAt: "2024-06-05T09:15:00Z",
        plays: 128,
        comments: 24,
        likes: 56,
    },
];

export const app = new Hono()
    // 全トラック取得
    .get("/", async (c) => {
        try {
            // APIレスポンス用にランダムな遅延をシミュレート（実際のAPI処理時間）
            await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 400));

            return c.json({
                tracks: sampleTracks,
                total: sampleTracks.length,
                page: 1,
                limit: 10
            });
        } catch (error) {
            console.error("Error fetching tracks:", error);
            return c.json({ error: "Failed to fetch tracks" }, 500);
        }
    })
    // 特定のトラック取得
    .get("/:id", async (c) => {
        try {
            const trackId = c.req.param("id");
            const track = sampleTracks.find(t => t.id === trackId);

            if (!track) {
                return c.json({ error: "Track not found" }, 404);
            }

            return c.json({ track });
        } catch (error) {
            console.error("Error fetching track:", error);
            return c.json({ error: "Failed to fetch track" }, 500);
        }
    });

export type TracksAPIType = typeof app; 