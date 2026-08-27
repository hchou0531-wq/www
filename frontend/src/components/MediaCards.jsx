import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Twitch, ExternalLink, Play } from "lucide-react";
import { api } from "../lib/api";
import { ease } from "./motion";

const cardCls = "overflow-hidden rounded-3xl border border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.03)]";
const headCls = "inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground";

export function YouTubeCard({ input }) {
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!input) return;
    setVideo(null);
    setError(null);
    api
      .get("/youtube/resolve", { params: { input } })
      .then((r) => setVideo(r.data))
      .catch(() => setError("couldn't load that video"));
  }, [input]);

  if (!input) return null;

  return (
    <motion.div data-testid="youtube-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.1 }} className={cardCls}>
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <span className={headCls}>
          <Youtube size={13} /> {video?.mode === "channel" ? "latest upload" : "youtube"}
        </span>
        {video?.channel && (
          <a data-testid="youtube-channel-link" href={`https://www.youtube.com/${video.channel}`} target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      {error ? (
        <p data-testid="youtube-error" className="px-5 pb-5 text-sm text-muted-foreground">{error}</p>
      ) : video ? (
        <>
          <div className="aspect-video w-full bg-black/20">
            <iframe
              data-testid="youtube-embed"
              src={`https://www.youtube-nocookie.com/embed/${video.video_id}`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video"
            />
          </div>
          {video.title && <p data-testid="youtube-title" className="truncate px-5 py-3 text-sm font-medium">{video.title}</p>}
        </>
      ) : (
        <div className="mx-5 mb-5 aspect-video animate-pulse rounded-2xl bg-secondary" />
      )}
    </motion.div>
  );
}

export function TwitchCard({ channel }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!channel) return;
    const load = () => api.get(`/twitch/${channel}`).then((r) => setStatus(r.data)).catch(() => setStatus({ error: true }));
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [channel]);

  if (!channel) return null;
  const parent = window.location.hostname;

  return (
    <motion.div data-testid="twitch-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.14 }} className={cardCls}>
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <span className={headCls}>
          <Twitch size={13} /> twitch
        </span>
        {status?.live ? (
          <span data-testid="twitch-live-badge" className="inline-flex items-center gap-1.5 rounded-full bg-[#EB0400]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#EB0400]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EB0400] soft-pulse" /> live now
          </span>
        ) : (
          <a href={`https://twitch.tv/${channel}`} target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      {status?.live ? (
        <iframe data-testid="twitch-embed" src={`https://player.twitch.tv/?channel=${channel}&parent=${parent}&autoplay=false`} className="aspect-video w-full border-0" allowFullScreen title="Twitch stream" />
      ) : status?.vod_id ? (
        <>
          <iframe data-testid="twitch-vod-embed" src={`https://player.twitch.tv/?video=v${status.vod_id}&parent=${parent}&autoplay=false`} className="aspect-video w-full border-0" allowFullScreen title="Twitch latest broadcast" />
          <p className="px-5 py-3 text-xs text-muted-foreground">offline right now — showing the latest broadcast</p>
        </>
      ) : status?.clip ? (
        <>
          <iframe data-testid="twitch-clip-embed" src={`https://clips.twitch.tv/embed?clip=${status.clip.slug}&parent=${parent}&autoplay=false`} className="aspect-video w-full border-0" allowFullScreen title="Twitch top clip" />
          <p data-testid="twitch-clip-title" className="truncate px-5 py-3 text-xs text-muted-foreground">offline right now — top clip: {status.clip.title}</p>
        </>
      ) : status ? (
        <p data-testid="twitch-offline" className="px-5 pb-5 text-sm text-muted-foreground">
          offline right now — <a className="underline underline-offset-4" href={`https://twitch.tv/${channel}`} target="_blank" rel="noreferrer">twitch.tv/{channel}</a>
        </p>
      ) : (
        <div className="mx-5 mb-5 aspect-video animate-pulse rounded-2xl bg-secondary" />
      )}
    </motion.div>
  );
}

export function MusicVideoCard({ query }) {
  const [video, setVideo] = useState(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!query) return;
    setVideo(null);
    setFailed(false);
    setPlaying(false);
    api
      .get("/music-video", { params: { q: query } })
      .then((r) => setVideo(r.data))
      .catch(() => setFailed(true));
  }, [query]);

  if (!query || failed) return null;

  return (
    <motion.div data-testid="music-video-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.18 }} className={cardCls}>
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <span className={headCls}>
          <Youtube size={13} /> the video
        </span>
        {video?.video_id && (
          <a data-testid="music-video-link" href={`https://www.youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      {video ? (
        playing ? (
          <div className="aspect-video w-full bg-black/20">
            <iframe
              data-testid="music-video-embed"
              src={`https://www.youtube-nocookie.com/embed/${video.video_id}`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Music video"
            />
          </div>
        ) : (
          <button data-testid="music-video-play" onClick={() => setPlaying(true)} className="group relative block aspect-video w-full overflow-hidden bg-black/20">
            <img src={`https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8B5CF6] text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-transform duration-300 group-hover:scale-110">
                <Play size={20} className="ml-0.5" />
              </span>
            </span>
          </button>
        )
      ) : (
        <div className="mx-5 mb-5 aspect-video animate-pulse rounded-2xl bg-secondary" />
      )}
      <p className="truncate px-5 py-3 text-xs text-muted-foreground">favorite song, on film — {query}</p>
    </motion.div>
  );
}

