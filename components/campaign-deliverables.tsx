"use client";
import {
  useFieldArray,
  type UseFormReturn,
  type UseFormSetValue,
} from "react-hook-form";
import { Check, Info, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { platforms } from "@/lib/api";
import {
  OTHER_FORMAT,
  ORGANIC_USAGE,
  deliverableFormats,
  durationLabel,
  findFormat,
  payLabels,
  usageCost,
  usageDurations,
  usageOptions,
  type DeliverableFormat,
} from "@/lib/campaign-options";
import { formatINR } from "@/lib/format";
import type { UsageRight } from "@/types";
import { PlatformIcon } from "./cards";
import type { CampaignValues } from "./forms";

const MAX_QTY = 20;
type Row = CampaignValues["deliverables"][number];

/** "2 Reels (30-60 sec), 3 Stories" for one platform's rows. */
export function rowSummary(rows: Row[]) {
  return rows
    .map((d) => {
      const f = findFormat(d.platform, d.format);
      const name = f
        ? d.quantity === 1
          ? f.label
          : f.plural
        : d.custom.trim() || "Custom deliverable";
      return `${d.quantity || 0} ${name}${d.duration ? ` (${d.duration})` : ""}`;
    })
    .join(", ");
}

// Step 2 of the campaign builder: platforms, per-platform deliverables, usage.
export function DeliverablesStep({
  form,
}: {
  form: UseFormReturn<CampaignValues>;
}) {
  const { control, register, setValue, watch, formState } = form;
  const errors = formState.errors;
  const rows = useFieldArray({ control, name: "deliverables" });
  const usage = useFieldArray({ control, name: "usage" });
  const v = watch();
  const set: UseFormSetValue<CampaignValues> = (name, value) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: true });

  const addFormat = (platform: string, f: DeliverableFormat) => {
    const duration = f.durations?.[0] ?? "";
    const i = v.deliverables.findIndex(
      (d) =>
        d.platform === platform && d.format === f.id && d.duration === duration,
    );
    if (i >= 0)
      set(
        `deliverables.${i}.quantity`,
        Math.min(MAX_QTY, (v.deliverables[i].quantity || 0) + 1),
      );
    else
      rows.append({
        platform,
        format: f.id,
        duration,
        custom: "",
        quantity: 1,
      });
  };
  const togglePlatform = (p: string) => {
    if (!v.platforms.includes(p)) {
      set(
        "platforms",
        platforms.filter((x) => x === p || v.platforms.includes(x)),
      );
      addFormat(p, deliverableFormats[p][0]);
      return;
    }
    if (v.platforms.length === 1) return;
    const remaining = v.platforms.filter((x) => x !== p);
    set("platforms", remaining);
    rows.remove(
      v.deliverables.flatMap((d, i) => (d.platform === p ? [i] : [])),
    );
    usage.remove(
      v.usage.flatMap((u, i) => {
        const o = usageOptions.find((x) => x.kind === u.kind);
        return o?.platforms && !o.platforms.some((x) => remaining.includes(x))
          ? [i]
          : [];
      }),
    );
  };
  const available = usageOptions.filter(
    (o) => !o.platforms || o.platforms.some((p) => v.platforms.includes(p)),
  );
  const cost = usageCost(v.usage as UsageRight[]);
  const runsAds = v.usage.some(
    (u) => u.kind === "paid-ads" || u.kind === "whitelisting",
  );
  const listError =
    errors.deliverables?.message || errors.deliverables?.root?.message;

  return (
    <>
      <fieldset className="builder-section">
        <legend>Platforms</legend>
        <p className="builder-help">
          Pick every platform you want content on. You can mix them.
        </p>
        <div className="niche-picker platform-picker">
          {platforms.map((p) => {
            const on = v.platforms.includes(p);
            return (
              <button
                key={p}
                type="button"
                aria-pressed={on}
                className={on ? "selected" : ""}
                title={
                  on && v.platforms.length === 1
                    ? "Keep at least one platform"
                    : undefined
                }
                onClick={() => togglePlatform(p)}
              >
                <PlatformIcon platform={p} size={16} />
                {p}
                {on && <Check size={14} />}
              </button>
            );
          })}
        </div>
        {errors.platforms && (
          <small className="error">{errors.platforms.message}</small>
        )}
      </fieldset>

      <fieldset className="builder-section">
        <legend>Deliverables per creator</legend>
        <p className="builder-help">
          Add what each creator makes on each platform, for example 2 long
          videos and 1 Short on YouTube, plus 3 Stories on Instagram.
        </p>
        {v.platforms.map((p) => {
          const mine = rows.fields
            .map((f, i) => ({ f, i }))
            .filter(({ i }) => v.deliverables[i]?.platform === p);
          return (
            <div className="platform-block" key={p}>
              <div className="platform-block-head">
                <PlatformIcon platform={p} size={16} />
                <strong>{p}</strong>
                <small>
                  {mine.length
                    ? rowSummary(mine.map(({ i }) => v.deliverables[i]))
                    : "Nothing added yet"}
                </small>
              </div>
              {mine.map(({ f, i }) => {
                const d = v.deliverables[i];
                const format = findFormat(p, d.format);
                const err = errors.deliverables?.[i];
                const name = format?.label || "deliverable";
                return (
                  <div className="deliverable-row" key={f.id}>
                    <label className="field">
                      <span>Format</span>
                      <select
                        {...register(`deliverables.${i}.format`, {
                          onChange: (e) =>
                            set(
                              `deliverables.${i}.duration`,
                              findFormat(p, e.target.value)?.durations?.[0] ??
                                "",
                            ),
                        })}
                      >
                        {deliverableFormats[p].map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                        <option value={OTHER_FORMAT}>Other (describe)</option>
                      </select>
                    </label>
                    {d.format === OTHER_FORMAT ? (
                      <label className="field">
                        <span>Describe it</span>
                        <input
                          placeholder="e.g. Unboxing with link sticker"
                          {...register(`deliverables.${i}.custom`)}
                        />
                        {err?.custom && (
                          <small className="error">{err.custom.message}</small>
                        )}
                      </label>
                    ) : format?.durations ? (
                      <label className="field">
                        <span>Length</span>
                        <select {...register(`deliverables.${i}.duration`)}>
                          {format.durations.map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <div className="field" aria-hidden />
                    )}
                    <div className="field">
                      <span>Quantity</span>
                      <div className="stepper">
                        <button
                          type="button"
                          aria-label={`Fewer ${name} on ${p}`}
                          disabled={(d.quantity || 0) <= 1}
                          onClick={() =>
                            set(
                              `deliverables.${i}.quantity`,
                              Math.max(1, (d.quantity || 1) - 1),
                            )
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={MAX_QTY}
                          aria-label={`${name} quantity on ${p}`}
                          {...register(`deliverables.${i}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                        <button
                          type="button"
                          aria-label={`More ${name} on ${p}`}
                          disabled={(d.quantity || 0) >= MAX_QTY}
                          onClick={() =>
                            set(
                              `deliverables.${i}.quantity`,
                              Math.min(MAX_QTY, (d.quantity || 0) + 1),
                            )
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {err?.quantity && (
                        <small className="error">{err.quantity.message}</small>
                      )}
                    </div>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Remove ${name} on ${p}`}
                      onClick={() => rows.remove(i)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
              <div className="quick-add" aria-label={`Add to ${p}`}>
                {deliverableFormats[p].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => addFormat(p, o)}
                  >
                    <Plus size={13} />
                    {o.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    rows.append({
                      platform: p,
                      format: OTHER_FORMAT,
                      duration: "",
                      custom: "",
                      quantity: 1,
                    })
                  }
                >
                  <Plus size={13} />
                  Other
                </button>
              </div>
            </div>
          );
        })}
        {listError && <small className="error">{listError}</small>}
      </fieldset>

      <fieldset className="builder-section">
        <legend>Content usage rights</legend>
        <div className="usage-base">
          <ShieldCheck size={18} />
          <div>
            <strong>Organic use: included</strong>
            <small>{ORGANIC_USAGE}</small>
          </div>
        </div>
        <p className="builder-help">
          Need more than organic use? Extra usage usually costs more, on top of
          the creator fee. Pick only what you need and for how long.
        </p>
        {available.map((o) => {
          const i = v.usage.findIndex((u) => u.kind === o.kind);
          const u = i >= 0 ? v.usage[i] : undefined;
          const err = i >= 0 ? errors.usage?.[i] : undefined;
          return (
            <div key={o.kind} className={`usage-option ${u ? "on" : ""}`}>
              <label className="usage-toggle">
                <input
                  type="checkbox"
                  checked={!!u}
                  onChange={() =>
                    u
                      ? usage.remove(i)
                      : usage.append({
                          kind: o.kind,
                          days: o.timed ? 30 : 0,
                          pay: "quote",
                          amount: 0,
                        })
                  }
                />
                <span>
                  <strong>{o.label}</strong>
                  <small>{o.help}</small>
                </span>
              </label>
              {u && (
                <div className="usage-terms">
                  {o.timed && (
                    <label className="field">
                      <span>For how long</span>
                      <select
                        value={u.days}
                        onChange={(e) =>
                          set(`usage.${i}.days`, Number(e.target.value))
                        }
                      >
                        {usageDurations.map((d) => (
                          <option key={d} value={d}>
                            {durationLabel(d)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="field">
                    <span>Who pays for it</span>
                    <div
                      className="segmented"
                      role="radiogroup"
                      aria-label={`Payment for ${o.label}`}
                    >
                      {(["fixed", "quote", "included"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          role="radio"
                          aria-checked={u.pay === p}
                          className={u.pay === p ? "selected" : ""}
                          onClick={() => set(`usage.${i}.pay`, p)}
                        >
                          {payLabels[p]}
                        </button>
                      ))}
                    </div>
                  </div>
                  {u.pay === "fixed" && (
                    <label className="field">
                      <span>Extra per creator (₹)</span>
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={u.amount || ""}
                        onChange={(e) =>
                          set(`usage.${i}.amount`, Number(e.target.value) || 0)
                        }
                      />
                      {err?.amount && (
                        <small className="error">{err.amount.message}</small>
                      )}
                    </label>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <label className="field">
          <span>Other usage terms (optional)</span>
          <textarea
            rows={3}
            placeholder="e.g. Keep the post live for at least 6 months."
            {...register("usageNotes")}
          />
          {errors.usageNotes && (
            <small className="error">{errors.usageNotes.message}</small>
          )}
        </label>
        {v.usage.length > 0 && (
          <div className="info-box">
            <Info size={18} />
            <span>
              On top of the creator fee:{" "}
              {[
                cost.fixed > 0 && `${formatINR(cost.fixed)} per creator`,
                cost.quotes > 0 &&
                  `${cost.quotes} item${cost.quotes > 1 ? "s" : ""} the creator will quote`,
              ]
                .filter(Boolean)
                .join(" + ") || "nothing extra (included in the fee)"}
              . Agree the final terms in writing before content goes live.
              {runsAds &&
                " Ads with creator content still need a clear “Ad” or “Paid partnership” label."}
            </span>
          </div>
        )}
      </fieldset>
    </>
  );
}
