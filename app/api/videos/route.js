import { NextResponse } from "next/server";
import { deleteVideo, listVideos } from "../../../lib/video-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ videos: await listVideos() });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not load video history." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Video id is required." }, { status: 400 });
    const deleted = await deleteVideo(id);
    if (!deleted) return NextResponse.json({ error: "Video not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not delete video." }, { status: 500 });
  }
}
