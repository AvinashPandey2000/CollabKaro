"use client";
import type { UseFormReturn, UseFormSetValue } from "react-hook-form";
import { Info, TriangleAlert } from "lucide-react";
import { tierCatalog } from "@/lib/budget";
import { usageCost } from "@/lib/campaign-options";
import { formatCount, formatINR } from "@/lib/format";
import type { CampaignValues } from "./forms";

const band = (from: number, to: number) =>
  to === Infinity
    ? `${formatCount(from)}+ followers`
    : `${formatCount(from)}–${formatCount(to)} followers`;

/** Enabled tiers' overall range, used for the card's "₹x - ₹y per creator". */
export function tierRange(tiers: CampaignValues["tiers"]) {
  const on = tiers.filter((t) => t.enabled);
  if (!on.length) return { min: 0, max: 0 };
  return {
    min: Math.min(...on.map((t) => t.min || 0)),
    max: Math.max(...on.map((t) => t.max || 0)),
  };
}

// Step 3 for paid campaigns: one total budget, plus a fee range per follower
// tier. Final fees are set per creator when they're hired.
export function BudgetStep({ form }: { form: UseFormReturn<CampaignValues> }) {
  const { setValue, watch, register, formState } = form;
  const errors = formState.errors;
  const v = watch();
  const set: UseFormSetValue<CampaignValues> = (name, value) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: true });
  const on = v.tiers.filter((t) => t.enabled);
  const { min, max } = tierRange(v.tiers);
  const needed = v.needed || 0;
  const total = v.totalBudget || 0;
  const even = needed ? Math.floor(total / needed) : 0;
  const usage = usageCost(v.usage);
  const floor = needed * (min + usage.fixed);
  return (
    <>
      <div className="form-grid">
        <label className="field">
          <span>Total campaign budget (₹)</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            {...register("totalBudget", { valueAsNumber: true })}
          />
          <small>
            Everything you plan to spend: creator fees plus usage fees.
          </small>
          {errors.totalBudget && (
            <small className="error">{errors.totalBudget.message}</small>
          )}
        </label>
        <label className="field">
          <span>Creators needed</span>
          <input
            type="number"
            min={1}
            {...register("needed", { valueAsNumber: true })}
          />
          {errors.needed && (
            <small className="error">{errors.needed.message}</small>
          )}
        </label>
      </div>

      <fieldset className="builder-section">
        <legend>Fee range by creator size</legend>
        <p className="builder-help">
          Pick the creator sizes you want and what you’d pay each. These are
          starting suggestions, so set your own. When you hire, you agree each
          creator’s final fee, and stronger engagement can justify the top of
          the range.
        </p>
        <div className="tier-table" role="table" aria-label="Fee range by tier">
          {v.tiers.map((t, i) => {
            const info = tierCatalog.find((x) => x.id === t.id)!;
            const err = errors.tiers?.[i];
            return (
              <div
                key={t.id}
                role="row"
                className={`tier-row ${t.enabled ? "on" : ""}`}
              >
                <label className="tier-name" role="cell">
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={(e) =>
                      set(`tiers.${i}.enabled`, e.target.checked)
                    }
                  />
                  <span>
                    <strong>{info.label}</strong>
                    <small>{band(info.from, info.to)}</small>
                  </span>
                </label>
                <label className="field" role="cell">
                  <span>Min ₹</span>
                  <input
                    type="number"
                    min={0}
                    disabled={!t.enabled}
                    aria-label={`${info.label} minimum fee`}
                    {...register(`tiers.${i}.min`, { valueAsNumber: true })}
                  />
                </label>
                <label className="field" role="cell">
                  <span>Max ₹</span>
                  <input
                    type="number"
                    min={0}
                    disabled={!t.enabled}
                    aria-label={`${info.label} maximum fee`}
                    {...register(`tiers.${i}.max`, { valueAsNumber: true })}
                  />
                </label>
                {err?.max && (
                  <small className="error tier-error">{err.max.message}</small>
                )}
              </div>
            );
          })}
        </div>
        {errors.tiers?.message && (
          <small className="error">{errors.tiers.message}</small>
        )}
      </fieldset>

      {on.length > 0 && total > 0 && needed > 0 && (
        <div className={`info-box ${floor > total ? "warn" : ""}`}>
          {floor > total ? <TriangleAlert size={20} /> : <Info size={20} />}
          <span>
            {formatINR(total)} across {needed} creators is about{" "}
            <strong>{formatINR(even)} each</strong>. Your fee range is{" "}
            {formatINR(min)} – {formatINR(max)}
            {usage.fixed > 0 &&
              `, plus ${formatINR(usage.fixed)} fixed usage per creator`}
            .
            {floor > total
              ? ` Even at the lowest fee you’d need ${formatINR(floor)}. Raise the budget or hire fewer creators.`
              : ` You can pay some creators more (say ${formatINR(Math.min(max, even * 2))}) and the remaining average adjusts as you hire.`}
            {usage.quotes > 0 &&
              ` Keep room for ${usage.quotes} usage item${usage.quotes > 1 ? "s" : ""} creators will quote.`}
          </span>
        </div>
      )}
    </>
  );
}
