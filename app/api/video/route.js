import { NextResponse } from "next/server";
import { createVideo, getVideoStatus } from "../../../lib/video-provider";
import { getVideo, saveVideo, updateVideo } from "../../../lib/video-store";

const ASPECT_RATIOS = new Set(["9:16", "16:9"]);
const DURATIONS = new Set([15, 30, 60, 90, 120]);

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const {
      script,
      voice,
      presenter,
      visualStyle,
      aspectRatio = "9:16",
      subtitles = true,
      duration = 30,
      avatarId = ""
    } = await request.json();

    if (!script || typeof script !== "string" || !script.trim()) {
      return NextResponse.json({ error: "Script is required." }, { status: 400 });
    }
    if (script.length > 30000) {
      return NextResponse.json({ error: "Script மிக நீளமாக உள்ளது. 30,000 characters-க்கு குறைக்கவும்." }, { status: 400 });
    }
    if (!ASPECT_RATIOS.has(aspectRatio)) {
      return NextResponse.json({ error: "Aspect ratio must be 9:16 or 16:9." }, { status: 400 });
    }

    const durationSeconds = Number(duration);
    if (!DURATIONS.has(durationSeconds)) {
      return NextResponse.json({ error: "Duration must be 15, 30, 60, 90, or 120 seconds." }, { status: 400 });
    }

    const createdAt = new Date().toISOString();
    const record = {
      id: `video_${Date.now()}`,
      script: script.trim(),
      voice: voice || "தமிழ் பெண் குரல்",
      presenter: presenter || "தமிழ் பெண்",
      visualStyle: visualStyle || "நவீன",
      aspectRatio,
      subtitles: Boolean(subtitles),
      duration: durationSeconds,
      avatarId: typeof avatarId === "string" ? avatarId.trim() : "",
      status: "starting",
      videoUrl: "",
      createdAt,
      updatedAt: createdAt
    };

    const prompt = [
      "Create a finished MP4 video, not a storyboard or image sequence.",
      "Use the exact Tamil script as narration and preserve its meaning.",
      `Natural Tamil narration: ${record.voice}. Presenter/avatar: ${record.presenter}.`,
      `Visual style: ${record.visualStyle}. Target duration: ${record.duration} seconds.`,
      `Output aspect ratio: ${record.aspectRatio}.`,
      record.subtitles ? "Add accurate synchronized Tamil subtitles." : "Do not add subtitles.",
      "Automatically select relevant images, scenes, transitions, and background music.",
      "Render a polished social-media-ready video.",
      "",
      "TAMIL SCRIPT:",
      record.script
    ].join("\n");

    const input = {
      prompt,
      orientation: record.aspectRatio === "16:9" ? "landscape" : "portrait",
      duration_sec: record.duration
    };
    if (record.avatarId) input.avatar_id = record.avatarId;

    const result = await createVideo(input);
    await saveVideo({
      ...record,
      id: result.id,
      provider: result.provider,
      status: result.status,
      videoUrl: result.videoUrl || "",
      demo: result.provider === "demo"
    });

    return NextResponse.json({
      id: result.id,
      status: result.status,
      provider: result.provider,
      demo: result.provider === "demo"
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Server error." }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Prediction id is required." }, { status: 400 });

    const storedVideo = await getVideo(id);
    if (!storedVideo) return NextResponse.json({ error: "Video job not found." }, { status: 404 });
    if (storedVideo.demo) return NextResponse.json({ id, status: storedVideo.status, videoUrl: "" });

    const data = await getVideoStatus(storedVideo.provider, id);
    const videoUrl = data.videoUrl || "";

    if (data.status === "succeeded" && !videoUrl) {
      await updateVideo(id, { status: "failed", error: "Provider completed without returning an MP4 URL." });
      return NextResponse.json({ error: "AI provider completed without returning an MP4 URL." }, { status: 502 });
    }

    await updateVideo(id, { status: data.status, videoUrl, error: data.error || "" });
    return NextResponse.json({ id, status: data.status, videoUrl, error: data.error || "" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Server error." }, { status: 500 });
  }
}
