const REPLICATE_API = "https://api.replicate.com/v1";
const MODEL = "heygen/video-agent";

function outputUrl(output) {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) {
    const first = output[0];
    return typeof first === "string" ? first : first?.url || "";
  }
  return output?.url || "";
}

function replicateHeaders() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not configured.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

export async function createVideo(input) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return { provider: "demo", id: `demo_${Date.now()}`, status: "succeeded", videoUrl: "" };
  }

  const response = await fetch(`${REPLICATE_API}/models/${MODEL}/predictions`, {
    method: "POST",
    headers: replicateHeaders(),
    body: JSON.stringify({ input })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || data.error || "Replicate API error.");
  if (!data.id) throw new Error("Replicate did not return a prediction id.");
  return { provider: "replicate", id: data.id, status: data.status };
}

export async function getVideoStatus(provider, id) {
  if (provider !== "replicate") {
    throw new Error("This video job was not created by Replicate.");
  }

  const response = await fetch(`${REPLICATE_API}/predictions/${encodeURIComponent(id)}`, {
    headers: replicateHeaders(),
    cache: "no-store"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || data.error || "Replicate status API error.");
  return {
    id: data.id,
    status: data.status,
    videoUrl: outputUrl(data.output),
    error: data.error || ""
  };
}
