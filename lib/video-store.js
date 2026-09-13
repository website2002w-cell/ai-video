import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "videos.json");

async function readVideos() {
  try {
    const content = await readFile(dataFile, "utf8");
    const videos = JSON.parse(content);
    return Array.isArray(videos) ? videos : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeVideos(videos) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(videos, null, 2), "utf8");
}

export async function listVideos() {
  return readVideos();
}

export async function getVideo(id) {
  const videos = await readVideos();
  return videos.find((video) => video.id === id) || null;
}

export async function saveVideo(video) {
  const videos = await readVideos();
  const nextVideos = [video, ...videos.filter((item) => item.id !== video.id)];
  await writeVideos(nextVideos);
  return video;
}

export async function updateVideo(id, updates) {
  const videos = await readVideos();
  const index = videos.findIndex((video) => video.id === id);
  if (index === -1) return null;

  const updated = { ...videos[index], ...updates, updatedAt: new Date().toISOString() };
  videos[index] = updated;
  await writeVideos(videos);
  return updated;
}

export async function deleteVideo(id) {
  const videos = await readVideos();
  const nextVideos = videos.filter((video) => video.id !== id);
  if (nextVideos.length === videos.length) return false;
  await writeVideos(nextVideos);
  return true;
}
