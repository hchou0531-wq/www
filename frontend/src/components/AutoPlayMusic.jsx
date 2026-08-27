import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2 } from "lucide-react";
import { api } from "../lib/api";
import { ease } from "./motion";

const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

export function AutoPlayMusic({ query, songUrl }) {
  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (songUrl) {
      setTrack({ preview_url: songUrl, name: query || "favorite song", artist: "uploaded by the page owner", image_url: null });
      return;
    }
    if (!query) return;
    api.get("/track/preview", { params: { q: query } }).then((r) => setTrack(r.data)).catch(() => {});
  }, [query, songUrl]);

  useEffect(() => {
    const a = audioRef.current;
    if (!track?.preview_url || !a) return;
    a.volume = volume;
    a.play().then(() => setPlaying(true)).catch(() => setBlocked(true));
  }, [track]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      a.play().then(() => setBlocked(false)).catch(() => {});
    }
  };

  if (!track) return null;

  const seek = (e) => {
    const a = audioRef.current;
    if (!a?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    a.currentTime = ratio * a.duration;
  };

  return (
    <>
      <audio
        ref={audioRef}
        data-testid="favorite-audio"
        src={track.preview_url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={() => {
          const a = audioRef.current;
          if (a?.duration) setDuration(a.duration);
        }}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (a?.duration) {
            setProgress(a.currentTime / a.duration);
            setElapsed(a.currentTime);
          }
        }}
      />
      <motion.div
        data-testid="music-player"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.4 }}
        className="fixed bottom-5 right-5 z-50 overflow-hidden rounded-2xl border border-border bg-card/90 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 px-3.5 pt-2.5">
          {track.image_url && <img src={track.image_url} alt="" className="h-9 w-9 rounded-lg object-cover" />}
          <div className="max-w-[130px] min-w-0">
            <p data-testid="music-player-name" className="truncate text-xs font-medium">{track.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{track.artist}</p>
          </div>
          <button
            data-testid="music-toggle-btn"
            onClick={toggle}
            title={playing ? "pause" : "play"}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${blocked && !playing ? "bg-[#8B5CF6] text-white soft-pulse" : "bg-secondary text-foreground hover:bg-border"}`}
          >
            {playing ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
          </button>
          <div className="flex items-center gap-1.5">
            <Volume2 size={13} className="shrink-0 text-muted-foreground" />
            <input
              data-testid="music-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              title="volume"
              className="w-16 accent-[#8B5CF6]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 px-3.5 pb-2.5 pt-2">
          <span data-testid="music-elapsed" className="w-7 text-right text-[10px] tabular-nums text-muted-foreground">{fmt(elapsed)}</span>
          <div
            data-testid="music-seek-bar"
            onClick={seek}
            title="click to seek"
            className="group relative h-3 w-40 cursor-pointer"
          >
            <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/10 transition-[height] duration-200 group-hover:h-[5px]" />
            <div data-testid="music-progress" className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#8B5CF6] transition-[height] duration-200 group-hover:h-[5px]" style={{ width: `${Math.min(progress, 1) * 100}%` }} />
            <div className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C4B5FD] opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100" style={{ left: `${Math.min(progress, 1) * 100}%` }} />
          </div>
          <span data-testid="music-duration" className="w-7 text-[10px] tabular-nums text-muted-foreground">{fmt(duration)}</span>
        </div>
      </motion.div>
      {blocked && !playing && (
        <motion.p
          data-testid="music-tap-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-[76px] right-5 z-50 rounded-full bg-card/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow backdrop-blur-xl"
        >
          tap to hear their favorite song
        </motion.p>
      )}
    </>
  );
}
