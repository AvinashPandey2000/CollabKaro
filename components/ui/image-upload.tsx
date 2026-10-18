"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, X, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { api, dataUrlBytes, type UploadedImage } from "@/lib/api";
import { formatBytes } from "@/lib/format";

const MAX_MB = 10;
const ratioLabel = (w: number, h: number) => {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
};

// Lets the user pick an image from their device gallery (or drop one in).
// The file goes through api.uploadImage, so swapping in a real upload endpoint
// later doesn't change this component.
export function ImageUpload({
  label,
  hint,
  value,
  onChange,
  variant = "cover",
  recommended,
  error,
}: {
  label: string;
  hint: string;
  value?: string;
  onChange: (url: string) => void;
  variant?: "cover" | "logo";
  /** Ideal size in px; larger images are scaled down to fit this. */
  recommended: { width: number; height: number };
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Details of the current image. Only trusted while it matches `value`.
  const [meta, setMeta] = useState<
    Partial<UploadedImage> & { url: string; width: number; height: number }
  >();
  const info = meta && meta.url === value ? meta : undefined;
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const uploaded = await api.uploadImage(
        file,
        Math.max(recommended.width, recommended.height),
      );
      setMeta(uploaded);
      onChange(uploaded.url);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "We couldn’t read that image.",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  const source = info?.original ?? info;
  const lowRes = source && source.width < recommended.width * 0.66;
  const targetRatio = recommended.width / recommended.height;
  const offRatio =
    source && Math.abs(source.width / source.height - targetRatio) > 0.15;
  return (
    <div className="field">
      <span>{label}</span>
      <div
        className={`image-upload ${variant} ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="image-upload-preview">
          {value ? (
            <Image
              src={value}
              alt={`${label} preview`}
              fill
              sizes={
                variant === "logo" ? "72px" : "(max-width: 768px) 100vw, 50vw"
              }
              onLoad={(e) => {
                // Saved images (e.g. editing a draft) have no upload details yet.
                if (info) return;
                const img = e.currentTarget;
                setMeta({
                  url: value,
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                  bytes: value.startsWith("data:")
                    ? dataUrlBytes(value)
                    : undefined,
                });
              }}
            />
          ) : (
            <ImagePlus size={variant === "logo" ? 22 : 28} />
          )}
        </div>
        <div className="image-upload-body">
          <small>{hint}</small>
          <small className="image-upload-spec">
            Recommended: {recommended.width} × {recommended.height} px (
            {ratioLabel(recommended.width, recommended.height)}) · JPG, PNG or
            WebP · up to {MAX_MB} MB
          </small>
          {info && (
            <dl className="image-upload-meta" aria-live="polite">
              {info.original && (
                <div>
                  <dt>Your file</dt>
                  <dd>
                    {info.original.width} × {info.original.height} px ·{" "}
                    {formatBytes(info.original.bytes)}
                  </dd>
                </div>
              )}
              <div>
                <dt>{info.original ? "Saved as" : "Current image"}</dt>
                <dd>
                  {info.width} × {info.height} px
                  {info.bytes !== undefined && ` · ${formatBytes(info.bytes)}`}
                </dd>
              </div>
            </dl>
          )}
          {(lowRes || offRatio) && (
            <small className="image-upload-warning">
              <TriangleAlert size={13} />
              {lowRes
                ? `Low resolution. Use at least ${Math.round(recommended.width * 0.66)} px wide so it stays sharp.`
                : `Different shape from ${ratioLabel(recommended.width, recommended.height)}, so the edges will be cropped on cards.`}
            </small>
          )}
          <div className="row">
            <button
              type="button"
              className="button secondary small"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              {busy
                ? "Uploading…"
                : value
                  ? "Change image"
                  : "Choose from gallery"}
            </button>
            {value && (
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove ${label.toLowerCase()}`}
                onClick={() => onChange("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          aria-label={label}
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
      {error && <small className="error">{error}</small>}
    </div>
  );
}
