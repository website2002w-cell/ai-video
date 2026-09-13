import { NextResponse } from "next/server";
import { getVideo, saveVideo, updateVideo } from "../../../lib/video-store";

const API = "https://api.replicate.com/v1";
const MODEL = process.env.REPLICATE_VIDEO_MODEL || "heygen/video-agent";

function authHeaders() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not configured.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

export async function POST(request) {
  try {
    const {
      script,
      voice,
      presenter,
      visualStyle,
      aspectRatio = "9:16",
      subtitles = true
    } = await request.json();

    if (!script || typeof script !== "string") {
      return NextResponse.json({ error: "Script is required." }, { status: 400 });
    }

    if (script.length > 30000) {
      return NextResponse.json(
        { error: "Script மிக நீளமாக உள்ளது. 30,000 characters-க்கு குறைக்கவும்." },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString();
    const id = `video_${Date.now()}`;
    const record = {
      id,
      script: script.trim(),
      voice: voice || "தமிழ் பெண் குரல்",
      presenter: presenter || "தமிழ் பெண்",
      visualStyle: visualStyle || "நவீன",
      aspectRatio,
      subtitles: Boolean(subtitles),
      status: "starting",
      videoUrl: "",
      createdAt,
      updatedAt: createdAt
    };

    if (!process.env.REPLICATE_API_TOKEN) {
      await saveVideo({ ...record, status: "succeeded", demo: true });
      return NextResponse.json({ id, status: "succeeded", demo: true });
    }

    // The video-agent model can create a complete video from a text prompt.
    // We explicitly tell it to preserve the supplied Tamil script as narration/content.
    const prompt = [
      "Create a finished MP4 video, not a storyboard or image sequence.",
      "Use the following exact Tamil script as the narration and preserve its meaning.",
      `Narration: ${record.voice}. Presenter/avatar: ${record.presenter}.`,
      `Visual style: ${record.visualStyle}. Output aspect ratio: ${record.aspectRatio}.`,
      record.subtitles
        ? "Add accurate Tamil subtitles synchronized to the narration."
        : "Do not add subtitles.",
      "Automatically select relevant images, scenes, transitions, and background music.",
      "Render a polished social-media-ready video with natural Tamil pronunciation.",
      "",
      "TAMIL SCRIPT:",
      script.trim()
    ].join("\n");

    const response = await fetch(`${API}/models/${MODEL}/predictions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ input: { prompt } })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Replicate API error." },
        { status: response.status }
      );
    }

    await saveVideo({ ...record, id: data.id, status: data.status });
    return NextResponse.json({ id: data.id, status: data.status });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Server error." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const id = new URL(request.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Prediction id is required." }, { status: 400 });
    }

    const storedVideo = await getVideo(id);
    if (storedVideo?.demo) {
      return NextResponse.json({ id, status: storedVideo.status, videoUrl: "" });
    }

    const response = await fetch(`${API}/predictions/${encodeURIComponent(id)}`, {
      headers: authHeaders(),
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Status API error." },
        { status: response.status }
      );
    }

    let videoUrl = "";

    if (data.status === "succeeded") {
      if (typeof data.output === "string") {
        videoUrl = data.output;
      } else if (Array.isArray(data.output) && data.output.length) {
        videoUrl = data.output[0];
      } else if (data.output?.url) {
        videoUrl = data.output.url;
      }
    }

    await updateVideo(id, { status: data.status, videoUrl });
    return NextResponse.json({
      id: data.id,
      status: data.status,
      videoUrl
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Server error." },
      { status: 500 }
    );
  }
}
