"use client";
import { useEffect, useRef, useState } from "react";
import {
  CalendarPlus,
  Mic,
  Pause,
  Phone,
  Play,
  Send,
  Square,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import type { CallInvite } from "@/types";
import { ApiError, backendEnabled, remote } from "@/lib/backend";
import { Dialog } from "./ui/dialog";

const MAX_SECONDS = 120;
const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
/** Demo: keep the note as a data URL. Backend: upload it and use the hosted URL. */
const storeVoice = async (blob: Blob) =>
  backendEnabled
    ? (await remote.upload(blob, "voice-note.webm", "voice")).url
    : blobToDataUrl(blob);

/* --------------------------------------------------------------- Voice notes */

// Mic button that turns into a recording bar. Calls onSend with the clip.
export function VoiceRecorder({
  disabled,
  onSend,
  onRecordingChange,
}: {
  disabled?: boolean;
  onSend: (voice: { url: string; seconds: number }) => void;
  onRecordingChange?: (recording: boolean) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const started = useRef(0);
  const keep = useRef(true);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTracks = () =>
    recorder.current?.stream.getTracks().forEach((t) => t.stop());
  useEffect(
    () => () => {
      keep.current = false;
      if (tick.current) clearInterval(tick.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stopTracks();
    },
    [],
  );
  const setRec = (on: boolean) => {
    setRecording(on);
    onRecordingChange?.(on);
  };
  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window))
      return toast.error("Voice notes aren’t supported in this browser.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      keep.current = true;
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = async () => {
        stopTracks();
        if (tick.current) clearInterval(tick.current);
        const secs = Math.round((Date.now() - started.current) / 1000);
        setRec(false);
        setSeconds(0);
        if (!keep.current || secs < 1) return;
        const blob = new Blob(chunks.current, {
          type: rec.mimeType || "audio/webm",
        });
        try {
          onSend({ url: await storeVoice(blob), seconds: secs });
        } catch (err) {
          toast.error(
            err instanceof ApiError
              ? err.message
              : "Couldn't send the voice note. Please try again.",
          );
        }
      };
      recorder.current = rec;
      started.current = Date.now();
      rec.start();
      setRec(true);
      tick.current = setInterval(() => {
        const secs = (Date.now() - started.current) / 1000;
        setSeconds(secs);
        if (secs >= MAX_SECONDS) rec.stop();
      }, 250);
    } catch {
      toast.error("Allow microphone access to record a voice note.");
    }
  };
  const stop = (send: boolean) => {
    keep.current = send;
    if (recorder.current?.state === "recording") recorder.current.stop();
  };
  if (!recording)
    return (
      <button
        type="button"
        className="icon-button"
        aria-label="Record a voice note"
        disabled={disabled}
        onClick={start}
      >
        <Mic size={20} />
      </button>
    );
  return (
    <div className="voice-recording" role="status" aria-live="polite">
      <button
        type="button"
        className="icon-button"
        aria-label="Discard voice note"
        onClick={() => stop(false)}
      >
        <Trash2 size={18} />
      </button>
      <span className="rec-dot" aria-hidden />
      <span>
        Recording {clock(seconds)} / {clock(MAX_SECONDS)}
      </span>
      <small>Keep phone numbers and emails out until you’re hired.</small>
      <button
        type="button"
        className="button icon-button"
        aria-label="Stop and send voice note"
        onClick={() => stop(true)}
      >
        <Send size={18} />
      </button>
    </div>
  );
}

export function VoiceNote({ url, seconds }: { url: string; seconds: number }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  return (
    <div className="voice-note">
      <button
        type="button"
        className="icon-button"
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        onClick={() => {
          const a = audio.current;
          if (!a) return;
          if (a.paused)
            a.play().catch(() => toast.error("Can’t play this clip."));
          else a.pause();
        }}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <input
        type="range"
        min={0}
        max={seconds}
        step={0.1}
        value={Math.min(at, seconds)}
        aria-label="Voice note position"
        onChange={(e) => {
          if (audio.current) audio.current.currentTime = Number(e.target.value);
        }}
      />
      <small>{clock(playing || at ? at : seconds)}</small>
      <audio
        ref={audio}
        src={url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setAt(0);
        }}
        onTimeUpdate={(e) => setAt(e.currentTarget.currentTime)}
      />
    </div>
  );
}

/* --------------------------------------------------------------------- Calls */

const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const callWhen = (c: CallInvite) =>
  new Date(c.at).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export function CallDialog({
  open,
  onOpenChange,
  partner,
  phoneAllowed,
  initial,
  onSchedule,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: string;
  /** Phone calls share numbers, so they unlock only after hire. */
  phoneAllowed: boolean;
  initial?: CallInvite;
  onSchedule: (call: CallInvite) => void;
}) {
  const tomorrow = new Date(Date.now() + 86_400_000);
  const [topic, setTopic] = useState(initial?.topic ?? "Discuss the brief");
  const [date, setDate] = useState(localDate(tomorrow));
  const [time, setTime] = useState("16:00");
  const [minutes, setMinutes] = useState(initial?.minutes ?? 30);
  const [mode, setMode] = useState<CallInvite["mode"]>(
    initial?.mode === "phone" && phoneAllowed ? "phone" : "video",
  );
  const [link, setLink] = useState(initial?.link ?? "");
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        initial ? "Suggest another time" : `Schedule a call with ${partner}`
      }
      description="They’ll get an invite in this chat to accept or decline."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const at = new Date(`${date}T${time}`);
          if (Number.isNaN(at.getTime()) || at.getTime() < Date.now())
            return toast.error("Pick a time in the future.");
          if (link && !/^https:\/\/\S+$/.test(link.trim()))
            return toast.error("Meeting links should start with https://");
          onSchedule({
            at: at.toISOString(),
            minutes,
            mode,
            topic: topic.trim() || "Call",
            link: mode === "video" && link.trim() ? link.trim() : undefined,
            status: "proposed",
          });
          onOpenChange(false);
        }}
      >
        <label className="field">
          <span>What’s it about?</span>
          <input
            value={topic}
            maxLength={80}
            onChange={(e) => setTopic(e.target.value)}
          />
        </label>
        <div className="form-grid">
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              min={localDate(new Date())}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Time</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Length</span>
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              {[15, 30, 45, 60].map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
          </label>
          <div className="field">
            <span>Type</span>
            <div className="segmented" role="radiogroup" aria-label="Call type">
              <button
                type="button"
                role="radio"
                aria-checked={mode === "video"}
                className={mode === "video" ? "selected" : ""}
                onClick={() => setMode("video")}
              >
                <Video size={15} /> Video
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={mode === "phone"}
                className={mode === "phone" ? "selected" : ""}
                disabled={!phoneAllowed}
                title={
                  phoneAllowed
                    ? undefined
                    : "Phone calls unlock after hire, so numbers stay private."
                }
                onClick={() => setMode("phone")}
              >
                <Phone size={15} /> Phone
              </button>
            </div>
          </div>
        </div>
        {mode === "video" ? (
          <label className="field">
            <span>Meeting link (optional)</span>
            <input
              type="url"
              placeholder="https://meet.google.com/… or Zoom link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <small>
              Paste a Google Meet, Zoom or Teams link, or add it later.
            </small>
          </label>
        ) : (
          <p className="builder-help">
            You’re hired, so numbers can be shared. Agree who calls whom in the
            chat.
          </p>
        )}
        {!phoneAllowed && (
          <p className="builder-help">
            Phone calls unlock after hire, so numbers stay private until then.
          </p>
        )}
        <div className="row modal-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button className="button" type="submit">
            <CalendarPlus size={16} />
            Send invite
          </button>
        </div>
      </form>
    </Dialog>
  );
}

/** Downloads an .ics file so the call lands in Google/Apple/Outlook calendars. */
function addToCalendar(c: CallInvite, partner: string) {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const start = new Date(c.at);
  const end = new Date(start.getTime() + c.minutes * 60_000);
  const text = (s: string) =>
    s.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CollabKaro//Call//EN",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}-${Math.random().toString(36).slice(2)}@collabkaro`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${text(`${c.topic} with ${partner}`)}`,
    `DESCRIPTION:${text(c.mode === "video" ? `Video call${c.link ? `: ${c.link}` : ""}` : "Phone call")}`,
    ...(c.link ? [`URL:${c.link}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "collabkaro-call.ics";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function CallCard({
  call,
  mine,
  partner,
  onStatus,
  onReschedule,
}: {
  call: CallInvite;
  mine: boolean;
  partner: string;
  onStatus: (status: CallInvite["status"]) => void;
  onReschedule: () => void;
}) {
  const past = new Date(call.at).getTime() + call.minutes * 60_000 < Date.now();
  const label = {
    proposed: mine ? "Waiting for a reply" : "Invite",
    accepted: "Confirmed",
    declined: "Declined",
    cancelled: "Cancelled",
  }[call.status];
  return (
    <div className={`call-card ${call.status}`}>
      <div className="call-card-head">
        {call.mode === "video" ? <Video size={16} /> : <Phone size={16} />}
        <strong>{call.topic}</strong>
        <span
          className={`badge ${call.status === "accepted" ? "lime" : "soft"}`}
        >
          {label}
        </span>
      </div>
      <p>
        {callWhen(call)} · {call.minutes} min ·{" "}
        {call.mode === "video" ? "Video call" : "Phone call"}
      </p>
      {call.status === "proposed" && !mine && !past && (
        <div className="call-actions">
          <button
            type="button"
            className="button small"
            onClick={() => onStatus("accepted")}
          >
            Accept
          </button>
          <button
            type="button"
            className="button secondary small"
            onClick={onReschedule}
          >
            Suggest another time
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => onStatus("declined")}
          >
            Decline
          </button>
        </div>
      )}
      {call.status === "proposed" && mine && (
        <div className="call-actions">
          <button
            type="button"
            className="text-button"
            onClick={() => onStatus("cancelled")}
          >
            Cancel invite
          </button>
        </div>
      )}
      {call.status === "accepted" && (
        <div className="call-actions">
          {call.link && !past && (
            <a
              className="button small"
              href={call.link}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Video size={14} /> Join call
            </a>
          )}
          <button
            type="button"
            className="button secondary small"
            onClick={() => addToCalendar(call, partner)}
          >
            <CalendarPlus size={14} /> Add to calendar
          </button>
          {!past && (
            <button
              type="button"
              className="text-button"
              onClick={() => onStatus("cancelled")}
            >
              <Square size={12} /> Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
