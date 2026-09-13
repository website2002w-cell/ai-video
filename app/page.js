"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [script, setScript] = useState("");
  const [fileName, setFileName] = useState("");
  const [inputMode, setInputMode] = useState("upload");
  const [voice, setVoice] = useState("தமிழ் பெண் குரல்");
  const [presenter, setPresenter] = useState("தமிழ் பெண்");
  const [visualStyle, setVisualStyle] = useState("நவீன");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [subtitles, setSubtitles] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [videos, setVideos] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const response = await fetch("/api/videos");
    const data = await response.json();
    if (response.ok) setVideos(data.videos || []);
  }

  async function removeVideo(id) {
    const response = await fetch(`/api/videos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setVideos((current) => current.filter((video) => video.id !== id));
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setVideoUrl("");
    setFileName(file.name);

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("இப்போது .txt script file மட்டும் upload செய்யலாம்.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Script file 1 MB-க்கு குறைவாக இருக்க வேண்டும்.");
      return;
    }

    const text = await file.text();
    setScript(text);
  }

  async function createVideo() {
    setError("");
    setVideoUrl("");

    if (!script.trim()) {
      setError("முதலில் script எழுதவும் அல்லது upload செய்யவும்.");
      return;
    }

    setLoading(true);
    setStatus("AI video job உருவாக்கப்படுகிறது...");

    try {
      const createRes = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, voice, presenter, visualStyle, aspectRatio, subtitles })
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.error || "Video job உருவாக்க முடியவில்லை.");
      }

      const id = createData.id;
      if (createData.demo) {
        setStatus("Demo video தயார்! Real AI-க்கு Replicate token சேர்க்கவும்.");
        await loadHistory();
        return;
      }

      setStatus("AI video உருவாகிறது... தயவுசெய்து காத்திருக்கவும்.");

      for (let attempt = 0; attempt < 120; attempt += 1) {
        await new Promise((r) => setTimeout(r, 5000));

        const res = await fetch(`/api/video?id=${encodeURIComponent(id)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Status பெற முடியவில்லை.");
        }

        if (data.status === "succeeded") {
          setVideoUrl(data.videoUrl);
          setStatus("வீடியோ தயார்! 🎉");
          await loadHistory();
          return;
        }

        if (data.status === "failed" || data.status === "canceled") {
          throw new Error("AI video generation தோல்வியடைந்தது.");
        }

        setStatus(`AI video உருவாகிறது... (${data.status})`);
      }

      throw new Error("Video generation நேரம் முடிந்தது. History-ல் status பார்க்கவும்.");
    } catch (err) {
      setError(err.message || "ஏதோ தவறு ஏற்பட்டது.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <nav className="topbar">
        <div className="brand"><span className="brand-mark">▶</span><span><strong>Tamil AI Video</strong><small>உங்கள் கதை - AI வீடியோவாக மாறும்</small></span></div>
        <div className="nav-links"><a className="active" href="#studio">⌂ &nbsp; முகப்பு</a><button onClick={() => setShowHistory((value) => !value)}>▣ &nbsp; என் வீடியோக்கள் ({videos.length})</button><a href="#help">? &nbsp; உதவி</a><button>♟ &nbsp; Log Out</button></div>
      </nav>
      {showHistory && <section className="history card"><div className="history-heading"><h2>என் வீடியோ வரலாறு</h2><button onClick={() => setShowHistory(false)}>மூடு</button></div>{videos.length === 0 ? <p>இன்னும் வீடியோக்கள் இல்லை. உங்கள் முதல் script உருவாக்குங்கள்.</p> : <div className="history-list">{videos.map((video) => <article className="history-item" key={video.id}><div><strong>{video.script.slice(0, 70)}{video.script.length > 70 ? "..." : ""}</strong><small>{new Date(video.createdAt).toLocaleString("ta-IN")} • {video.demo ? "Demo mode" : video.status}</small></div><button onClick={() => removeVideo(video.id)}>நீக்கு</button></article>)}</div>}</section>}
      <section className="hero"><h1>தமிழ் ஸ்கிரிப்ட்-ஐ <em>AI வீடியோவாக</em> மாற்றுங்கள்</h1><p>உங்கள் எழுத்து - உங்கள் குரல் - உங்கள் வீடியோ</p></section>
      <section className="studio" id="studio">
        <div className="card editor-card">
          <h2>▤ &nbsp; ஸ்கிரிப்ட் சேர்க்கவும்</h2>
          <div className="tabs"><button className={inputMode === "upload" ? "selected" : ""} onClick={() => setInputMode("upload")}>♧ &nbsp; File Upload (.txt)</button><button className={inputMode === "paste" ? "selected" : ""} onClick={() => setInputMode("paste")}>✎ &nbsp; Text Paste</button></div>
          {inputMode === "upload" && <label className="upload"><input type="file" accept=".txt,text/plain" onChange={handleFile} /><span className="upload-icon">☁</span><strong>உங்கள் தமிழ் ஸ்கிரிப்டை .txt கோப்பை இங்கே பதிவேற்றவும்</strong><small>(அல்லது கீழே உள்ள உரைப் பெட்டியில் நேரடியாக எழுதவும்)</small><span className="choose">▣ &nbsp; கோப்பு தேர்வு செய்யவும்</span></label>}
          {fileName && <div className="filename">Uploaded: {fileName}</div>}
          <label className="field-label">⌘ &nbsp; அல்லது ஸ்கிரிப்ட் உரையை எழுதவும்</label>
          <textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder={"தமிழ்நாடு என்பது ஒரு மாநிலம் மட்டுமல்ல,\nஅது ஒரு உணர்வு.\nஇங்கே இருக்கும் பழமையும், கலாசாரமும்,\nபாரம்பரியமும் ஒன்றாக கலந்திருக்கின்றன.\nநாம் அனைவரும் சேர்ந்து தமிழ்நாட்டை மேலும்\nவளர்ச்சியடையச் செய்வோம்."} rows={6} />
          <div className="count">{script.length}/30000</div>
          <div className="select-row"><label><span>♩ &nbsp; குரல் தேர்வு (Voice)</span><select value={voice} onChange={(e) => setVoice(e.target.value)}><option>தமிழ் பெண் குரல்</option><option>தமிழ் ஆண் குரல்</option></select></label><label><span>♟ &nbsp; அவதார் (Presenter)</span><select value={presenter} onChange={(e) => setPresenter(e.target.value)}><option>தமிழ் பெண்</option><option>தமிழ் ஆண்</option></select></label><label><span>▣ &nbsp; வீடியோ ஸ்டைல்</span><select value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)}><option>நவீன</option><option>சினிமாட்டிக்</option><option>கல்வி</option></select></label></div>
          <div className="select-row output-options"><label><span>▤ &nbsp; Format</span><select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}><option value="9:16">9:16 Reels / Shorts</option><option value="16:9">16:9 YouTube</option></select></label><label><span>字幕 &nbsp; Subtitles</span><select value={subtitles ? "on" : "off"} onChange={(e) => setSubtitles(e.target.value === "on")}><option value="on">தமிழ் subtitles ON</option><option value="off">Subtitles OFF</option></select></label><div className="format-note">MP4 output<br />1080p target</div></div>
          <button className="create" onClick={createVideo} disabled={loading}>{loading ? "◌ உருவாக்கப்படுகிறது..." : "✦ AI வீடியோ உருவாக்கு"}</button><p className="privacy">∞ &nbsp; இலவசமாக பயன்படுத்தலாம் &nbsp;•&nbsp; எந்த வரம்பும் இல்லை &nbsp;•&nbsp; உங்கள் கணினியின் வேகத்திற்கு ஏற்ப</p>
          {status && <div className="status">{status}</div>}{error && <div className="error">{error}</div>}
        </div>
        <div className="card preview-card">
          <div className="preview-heading"><h2><span className="play">▶</span> உங்கள் AI வீடியோ தயாராக உள்ளது!</h2><span className="done">● &nbsp; உருவாக்கம் முடிந்தது</span></div>
          {videoUrl ? <video className="video" src={videoUrl} controls playsInline /> : <div className="video mock-video"><div className="mock-scene"><div className="temple">♜</div><div className="mock-person">◕</div><div className="mock-copy">தமிழ்நாடு<small>நம் பெருமை<br />நம் எதிர்காலம்</small></div></div><div className="video-controls"><span>▶ &nbsp; 0:00 / 0:32</span><span>⌕　⛶　⋮</span><div className="progress"><i /></div></div></div>}
          <div className="preview-actions"><a className="download" href={videoUrl || "#"} download={Boolean(videoUrl)}>⇩ &nbsp; வீடியோவை பதிவிறக்க</a><button className="share" onClick={() => navigator.clipboard?.writeText(videoUrl || window.location.href)}>↗ &nbsp; வீடியோவை பகிர்</button></div>
          <div className="details"><div><h3>♙ &nbsp; வீடியோ விவரங்கள்</h3><p>◷ &nbsp; நேரம் : 0:32</p><p>▱ &nbsp; தரம் : 1080p (HD)</p><p>▣ &nbsp; உருவாக்கப்பட்டது : 11 Jun 2025, 05:12 PM</p></div><div className="success">● &nbsp; உங்கள் வீடியோ வெற்றிகரமாக உருவாக்கப்பட்டுள்ளது!<small>இப்போது அதை பதிவிறக்கம் செய்து பயன்படுத்தலாம்.</small></div></div>
        </div>
      </section>
      <footer>© 2026 Tamil AI Video Studio</footer>
    </main>
  );
}
