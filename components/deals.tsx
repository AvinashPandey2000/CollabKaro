"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  Download,
  FileSignature,
  IndianRupee,
  Info,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { creators, mergeCampaigns, posters } from "@/lib/api";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/format";
import {
  campaignBudget,
  contractLabel,
  contractStatus,
  dealPaid,
  dealTotal,
  nextDue,
  scheduleTemplates,
  splitMilestones,
  suggestRate,
} from "@/lib/budget";
import { usageOptions } from "@/lib/campaign-options";
import {
  CONTRACT_DISCLAIMER,
  buildContract,
  printContract,
} from "@/lib/contract";
import type { Application, Campaign, Deal, Milestone } from "@/types";
import { Dialog } from "./ui/dialog";

const usageName = (kind: string) =>
  usageOptions.find((o) => o.kind === kind)?.label ?? kind;
const today = () => new Date().toISOString().slice(0, 10);

export function ContractBadge({ deal }: { deal: Deal }) {
  const st = contractStatus(deal);
  return (
    <span className={`badge ${st === "signed" ? "lime" : "soft"}`}>
      <FileSignature size={12} /> {contractLabel[st]}
    </span>
  );
}

/* ---------------------------------------------------------------- Deal setup */

// Brand agrees the final fee, usage fees and payment schedule for one hire.
export function DealDialog({
  application,
  campaign,
  open,
  onOpenChange,
}: {
  application: Application;
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const s = useStore();
  const existing = s.deals.find((d) => d.applicationId === application.id);
  const creator = creators.find((c) => c.id === application.creatorId)!;
  const rate = suggestRate(campaign, creator);
  const rights = campaign.usageRights ?? [];
  const fixed = rights.filter((u) => u.pay === "fixed");
  const quoted = rights.filter((u) => u.pay === "quote");
  const locked = !!existing?.milestones.some((m) => m.status === "paid");
  const [amount, setAmount] = useState(
    String(existing?.amount ?? application.quote),
  );
  const [quotes, setQuotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      quoted.map((u) => [
        u.kind,
        String(
          existing?.usageFees.find((x) => x.kind === u.kind)?.amount ?? "",
        ),
      ]),
    ),
  );
  const [scheduleId, setScheduleId] = useState(existing?.scheduleId ?? "30-70");
  const [steps, setSteps] = useState(
    () =>
      existing?.milestones.map(({ label, percent }) => ({ label, percent })) ??
      scheduleTemplates[0].steps,
  );
  const fee = Number(amount) || 0;
  const usageFees = [
    ...fixed.map((u) => ({ kind: u.kind, amount: u.amount ?? 0 })),
    ...quoted.map((u) => ({
      kind: u.kind,
      amount: Number(quotes[u.kind]) || 0,
    })),
  ];
  const total = fee + usageFees.reduce((x, u) => x + u.amount, 0);
  const percent = steps.reduce((x, st) => x + (Number(st.percent) || 0), 0);
  const others = s.deals.filter((d) => d.id !== existing?.id);
  const before = campaignBudget(campaign, others);
  const leftAfter = before.left - total;
  const slotsAfter = Math.max(0, before.slots - 1);
  const avgAfter = slotsAfter
    ? Math.floor(Math.max(0, leftAfter) / slotsAfter)
    : 0;
  const pickTemplate = (id: string) => {
    setScheduleId(id);
    const t = scheduleTemplates.find((x) => x.id === id);
    if (t) setSteps(t.steps.map((x) => ({ ...x })));
  };
  const save = () => {
    if (fee <= 0) return toast.error("Enter the agreed creator fee.");
    if (percent !== 100)
      return toast.error("Payment milestones should add up to 100%.");
    if (steps.some((x) => !x.label.trim()))
      return toast.error("Give every milestone a name.");
    const now = new Date().toISOString();
    const milestones: Milestone[] = locked
      ? existing!.milestones
      : splitMilestones(total, steps, existing?.milestones);
    const changed =
      !!existing &&
      (existing.amount !== fee ||
        JSON.stringify(existing.usageFees) !== JSON.stringify(usageFees) ||
        JSON.stringify(existing.milestones.map((m) => [m.label, m.amount])) !==
          JSON.stringify(milestones.map((m) => [m.label, m.amount])));
    const deal: Deal = {
      id: existing?.id ?? crypto.randomUUID(),
      applicationId: application.id,
      campaignId: campaign.id,
      creatorId: creator.id,
      posterId: campaign.posterId,
      amount: fee,
      usageFees,
      scheduleId,
      milestones,
      // New terms need fresh signatures from both sides.
      brandSignature: changed ? undefined : existing?.brandSignature,
      creatorSignature: changed ? undefined : existing?.creatorSignature,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    s.saveDeal(deal);
    toast.success(
      changed
        ? "Deal updated. Both sides need to sign the new contract."
        : existing
          ? "Deal saved."
          : "Deal set up. Next, review and sign the contract.",
    );
    onOpenChange(false);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="wide"
      title={
        existing
          ? `Deal with ${creator.name}`
          : `Set up the deal with ${creator.name}`
      }
      description="Agree the final fee and when you’ll pay. This becomes the contract both of you sign."
    >
      <div className="deal-person">
        <Image
          src={creator.avatar}
          width={48}
          height={48}
          alt=""
          className="round"
        />
        <div>
          <strong>{creator.name}</strong>
          <small>
            {rate.tier.label} · {creator.followers.toLocaleString("en-IN")}{" "}
            followers · {creator.engagement}% engagement
          </small>
        </div>
        <span className="badge soft">
          Quoted {formatINR(application.quote)}
        </span>
      </div>
      {rate.suggested > 0 && (
        <div className="info-box">
          <Info size={18} />
          <span>
            Suggested fee <strong>{formatINR(rate.suggested)}</strong>, based on
            your {rate.tier.label} range ({formatINR(rate.min)} –{" "}
            {formatINR(rate.max)}) and their engagement.
            {rate.outsideTiers &&
              " This size isn’t one of your campaign’s tiers."}{" "}
            <button
              type="button"
              className="text-button"
              disabled={locked}
              onClick={() => setAmount(String(rate.suggested))}
            >
              Use suggestion
            </button>
          </span>
        </div>
      )}
      {locked && (
        <div className="info-box warn">
          <TriangleAlert size={18} />A payment is already recorded, so the fee
          and schedule are locked.
        </div>
      )}
      <div className="form-grid">
        <label className="field">
          <span>Agreed creator fee (₹)</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            disabled={locked}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        {quoted.map((u) => (
          <label className="field" key={u.kind}>
            <span>{usageName(u.kind)} fee (₹)</span>
            <input
              type="number"
              min={0}
              disabled={locked}
              placeholder="Creator’s quote"
              value={quotes[u.kind]}
              onChange={(e) =>
                setQuotes((q) => ({ ...q, [u.kind]: e.target.value }))
              }
            />
          </label>
        ))}
      </div>
      {fixed.length > 0 && (
        <p className="builder-help">
          Fixed usage fees included:{" "}
          {fixed
            .map((u) => `${usageName(u.kind)} ${formatINR(u.amount ?? 0)}`)
            .join(", ")}
          .
        </p>
      )}

      <h3>Payment schedule</h3>
      <label className="field">
        <span>Template</span>
        <select
          value={scheduleId}
          disabled={locked}
          onChange={(e) => pickTemplate(e.target.value)}
        >
          {scheduleTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </label>
      <div className="milestone-edit">
        {steps.map((st, i) => (
          <div className="milestone-edit-row" key={i}>
            <input
              aria-label={`Milestone ${i + 1} name`}
              value={st.label}
              disabled={locked}
              onChange={(e) => {
                setScheduleId("custom");
                setSteps((x) =>
                  x.map((y, j) =>
                    j === i ? { ...y, label: e.target.value } : y,
                  ),
                );
              }}
            />
            <div className="percent-input">
              <input
                type="number"
                min={0}
                max={100}
                aria-label={`Milestone ${i + 1} percent`}
                value={st.percent}
                disabled={locked}
                onChange={(e) => {
                  setScheduleId("custom");
                  setSteps((x) =>
                    x.map((y, j) =>
                      j === i ? { ...y, percent: Number(e.target.value) } : y,
                    ),
                  );
                }}
              />
              <span>%</span>
            </div>
            <span className="milestone-amount">
              {formatINR(Math.round((total * (Number(st.percent) || 0)) / 100))}
            </span>
            <button
              type="button"
              className="icon-button"
              aria-label={`Remove milestone ${i + 1}`}
              disabled={locked || steps.length === 1}
              onClick={() => {
                setScheduleId("custom");
                setSteps((x) => x.filter((_, j) => j !== i));
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {!locked && steps.length < 5 && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setScheduleId("custom");
              setSteps((x) => [...x, { label: "", percent: 0 }]);
            }}
          >
            <Plus size={15} /> Add milestone
          </button>
        )}
        <small className={percent === 100 ? "muted" : "error"}>
          Total {percent}% {percent === 100 ? "" : "(should be 100%)"}
        </small>
      </div>

      <div className={`deal-impact ${leftAfter < 0 ? "over" : ""}`}>
        <div>
          <small>Total for this creator</small>
          <strong>{formatINR(total)}</strong>
        </div>
        {before.total > 0 ? (
          <>
            <div>
              <small>Budget left after</small>
              <strong>{formatINR(leftAfter)}</strong>
            </div>
            <div>
              <small>
                {slotsAfter} slot{slotsAfter === 1 ? "" : "s"} left · avg each
              </small>
              <strong>{formatINR(avgAfter)}</strong>
            </div>
          </>
        ) : (
          <div>
            <small>Campaign budget</small>
            <strong>Not set</strong>
          </div>
        )}
      </div>
      {leftAfter < 0 && before.total > 0 && (
        <small className="error">
          This goes {formatINR(-leftAfter)} over your campaign budget.
        </small>
      )}
      <div className="row modal-actions">
        <button
          type="button"
          className="button secondary"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </button>
        <button type="button" className="button" onClick={save}>
          {existing ? "Save deal" : "Create deal & contract"}
          <ArrowUpRight size={16} />
        </button>
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ Contract */

export function ContractDialog({
  deal,
  party,
  open,
  onOpenChange,
}: {
  deal: Deal;
  party: "brand" | "creator";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const s = useStore();
  const campaign = mergeCampaigns(s.campaigns).find(
    (c) => c.id === deal.campaignId,
  );
  const creator = creators.find((c) => c.id === deal.creatorId);
  const poster = posters.find((p) => p.id === deal.posterId) ?? posters[0];
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  if (!campaign || !creator) return null;
  const doc = buildContract(deal, campaign, creator, poster);
  const mine = party === "brand" ? deal.brandSignature : deal.creatorSignature;
  const sig = (label: string, x?: { name: string; at: string }) => (
    <div className={`signature ${x ? "done" : ""}`}>
      <small>{label}</small>
      {x ? (
        <>
          <strong className="signature-name">{x.name}</strong>
          <small>Signed {new Date(x.at).toLocaleString("en-IN")}</small>
        </>
      ) : (
        <strong className="muted">Not signed yet</strong>
      )}
    </div>
  );
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="wide"
      title="Collaboration agreement"
      description={`${campaign.title} · ${contractLabel[contractStatus(deal)]}`}
    >
      <div className="info-box warn">
        <TriangleAlert size={18} />
        <span>{CONTRACT_DISCLAIMER}</span>
      </div>
      <article className="contract-doc" aria-label="Contract text">
        {doc.sections.map((sec) => (
          <section key={sec.heading}>
            <h4>{sec.heading}</h4>
            {sec.lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </section>
        ))}
      </article>
      <div className="signatures">
        {sig("Brand", deal.brandSignature)}
        {sig("Creator", deal.creatorSignature)}
      </div>
      {!mine && (
        <form
          className="sign-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 3)
              return toast.error("Type your full name to sign.");
            if (!agree) return toast.error("Tick the box to confirm.");
            s.signDeal(deal.id, party, name.trim());
            toast.success("Signed. We’ve let the other side know.");
          }}
        >
          <label className="field">
            <span>Type your full name to sign</span>
            <input
              value={name}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
              placeholder={
                party === "creator" ? creator.name : "Your full name"
              }
            />
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            I’ve read these terms and agree to them on behalf of{" "}
            {party === "brand" ? poster.name : "myself"}.
          </label>
          <button className="button" type="submit">
            <FileSignature size={16} />
            Sign agreement
          </button>
        </form>
      )}
      <div className="row modal-actions">
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            if (!printContract(doc, deal))
              toast.error(
                "Allow pop-ups to print or save the contract as PDF.",
              );
          }}
        >
          <Download size={16} />
          Print / save as PDF
        </button>
      </div>
    </Dialog>
  );
}

/* -------------------------------------------------------------- Record a payment */

export function PaymentDialog({
  deal,
  milestone,
  onClose,
}: {
  deal: Deal;
  milestone: Milestone;
  onClose: () => void;
}) {
  const s = useStore();
  const creator = creators.find((c) => c.id === deal.creatorId);
  const [paidOn, setPaidOn] = useState(today());
  const [reference, setReference] = useState("");
  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={`Record ${formatINR(milestone.amount)} paid`}
      description={`${milestone.label} for ${creator?.name}. This only updates your records; CollabKaro doesn’t move money yet.`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!paidOn) return toast.error("Pick the payment date.");
          s.recordPayment(deal.id, milestone.id, {
            paidOn,
            reference: reference.trim() || undefined,
          });
          toast.success("Payment recorded.");
          onClose();
        }}
      >
        <div className="form-grid">
          <label className="field">
            <span>Paid on</span>
            <input
              type="date"
              value={paidOn}
              max={today()}
              onChange={(e) => setPaidOn(e.target.value)}
            />
          </label>
          <label className="field">
            <span>UTR / reference (optional)</span>
            <input
              value={reference}
              maxLength={40}
              placeholder="e.g. UPI or bank transfer ref"
              onChange={(e) => setReference(e.target.value)}
            />
          </label>
        </div>
        {contractStatus(deal) !== "signed" && (
          <div className="info-box warn">
            <TriangleAlert size={18} />
            The contract isn’t signed by both sides yet.
          </div>
        )}
        <div className="row modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button" type="submit">
            <Check size={16} />
            Mark as paid
          </button>
        </div>
      </form>
    </Dialog>
  );
}

/* ------------------------------------------------------- Milestone list (both) */

function Milestones({
  deal,
  onPay,
}: {
  deal: Deal;
  onPay?: (m: Milestone) => void;
}) {
  const s = useStore();
  return (
    <ul className="milestone-list">
      {deal.milestones.map((m) => (
        <li key={m.id} className={m.status}>
          <span className="milestone-dot" aria-hidden>
            {m.status === "paid" ? <Check size={12} /> : null}
          </span>
          <span>
            <strong>{m.label}</strong>
            <small>
              {m.percent}% ·{" "}
              {m.status === "paid"
                ? `Paid ${new Date(m.paidOn!).toLocaleDateString("en-IN")}${m.reference ? ` · Ref ${m.reference}` : ""}`
                : "Due"}
            </small>
          </span>
          <strong>{formatINR(m.amount)}</strong>
          {onPay &&
            (m.status === "due" ? (
              <button
                type="button"
                className="button small"
                onClick={() => onPay(m)}
              >
                Mark paid
              </button>
            ) : (
              <button
                type="button"
                className="text-button"
                aria-label={`Undo payment for ${m.label}`}
                onClick={() => {
                  s.recordPayment(deal.id, m.id, null);
                  toast("Payment marked as due again.");
                }}
              >
                Undo
              </button>
            ))}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------- Campaign budget (brand) */

// Sits above the applicant board: budget, commitments, payments and contracts.
export function BudgetPanel({
  campaign,
  onEditDeal,
}: {
  campaign: Campaign;
  onEditDeal: (applicationId: string) => void;
}) {
  const s = useStore();
  const b = campaignBudget(campaign, s.deals);
  const [contract, setContract] = useState<string | null>(null);
  const [paying, setPaying] = useState<{ deal: Deal; m: Milestone } | null>(
    null,
  );
  const contractDeal = s.deals.find((d) => d.id === contract);
  return (
    <section className="panel budget-board" aria-label="Budget and payments">
      <div className="row between">
        <h2>
          <Wallet size={20} /> Budget & payments
        </h2>
        <Link
          className="text-button"
          href={`/a/campaigns/new?edit=${campaign.id}`}
        >
          <Pencil size={14} /> Edit budget
        </Link>
      </div>
      <div className="budget-stats">
        {[
          ["Total budget", b.total ? formatINR(b.total) : "Not set"],
          ["Committed", formatINR(b.committed)],
          ["Paid", formatINR(b.paid)],
          ["Due", formatINR(b.due)],
          ["Left to allocate", b.total ? formatINR(b.left) : "—"],
          [
            `${b.slots} slot${b.slots === 1 ? "" : "s"} left · avg`,
            b.total && b.slots ? formatINR(b.perSlot) : "—",
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {b.total > 0 && (
        <div className="budget-bar" aria-hidden>
          <span
            className="paid"
            style={{ width: `${Math.min(100, (b.paid / b.total) * 100)}%` }}
          />
          <span
            className="committed"
            style={{
              width: `${Math.min(100, (Math.max(0, b.committed - b.paid) / b.total) * 100)}%`,
            }}
          />
        </div>
      )}
      {(b.overBudget || b.tight) && (
        <div className="info-box warn">
          <TriangleAlert size={18} />
          {b.overBudget
            ? `You’ve committed ${formatINR(-b.left)} more than the budget.`
            : `The remaining ${formatINR(b.perSlot)} average per slot is below your lowest tier fee (${formatINR(b.lowest!)}). Raise the budget or hire fewer creators.`}
        </div>
      )}
      {b.deals.length ? (
        <div className="deal-rows">
          {b.deals.map((d) => {
            const c = creators.find((x) => x.id === d.creatorId)!;
            const total = dealTotal(d);
            const paid = dealPaid(d);
            const due = nextDue(d);
            return (
              <div className="deal-row" key={d.id}>
                <div className="deal-who">
                  <Image
                    src={c.avatar}
                    width={36}
                    height={36}
                    alt=""
                    className="round"
                  />
                  <span>
                    <strong>{c.name}</strong>
                    <small>
                      {formatINR(paid)} of {formatINR(total)} paid
                    </small>
                  </span>
                </div>
                <div
                  className="deal-progress"
                  aria-label={`${Math.round((paid / total) * 100)}% paid`}
                >
                  <span style={{ width: `${(paid / total) * 100}%` }} />
                </div>
                <ContractBadge deal={d} />
                <div className="deal-actions">
                  {due && (
                    <button
                      type="button"
                      className="button small"
                      onClick={() => setPaying({ deal: d, m: due })}
                    >
                      <IndianRupee size={14} /> Pay {formatINR(due.amount)}
                    </button>
                  )}
                  <button
                    type="button"
                    className="button secondary small"
                    onClick={() => setContract(d.id)}
                  >
                    Contract
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Edit deal with ${c.name}`}
                    onClick={() => onEditDeal(d.applicationId)}
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="builder-help">
          Move a creator to Hired to set up their deal, contract and payments.
        </p>
      )}
      {contractDeal && (
        <ContractDialog
          deal={contractDeal}
          party="brand"
          open
          onOpenChange={(o) => !o && setContract(null)}
        />
      )}
      {paying && (
        <PaymentDialog
          deal={paying.deal}
          milestone={paying.m}
          onClose={() => setPaying(null)}
        />
      )}
    </section>
  );
}

/* --------------------------------------------------- Payments page (brand) */

export function Payments() {
  const s = useStore();
  const own = mergeCampaigns(s.campaigns).filter(
    (c) => c.posterId === s.me.posterId,
  );
  const deals = s.deals.filter((d) => own.some((c) => c.id === d.campaignId));
  const [filter, setFilter] = useState<"all" | "due" | "paid">("all");
  const [paying, setPaying] = useState<{ deal: Deal; m: Milestone } | null>(
    null,
  );
  const [contract, setContract] = useState<string | null>(null);
  const rows = deals.flatMap((d) =>
    d.milestones
      .filter((m) => filter === "all" || m.status === filter)
      .map((m) => ({ d, m })),
  );
  const budgets = own
    .map((c) => ({ c, b: campaignBudget(c, deals) }))
    .filter(({ c, b }) => b.deals.length || c.totalBudget);
  const sum = (k: "total" | "committed" | "paid" | "due") =>
    budgets.reduce((x, { b }) => x + b[k], 0);
  const csv = () => {
    const lines = [
      [
        "Campaign",
        "Creator",
        "Milestone",
        "Amount",
        "Status",
        "Paid on",
        "Reference",
      ],
      ...deals.flatMap((d) =>
        d.milestones.map((m) => [
          own.find((c) => c.id === d.campaignId)?.title ?? "",
          creators.find((c) => c.id === d.creatorId)?.name ?? "",
          m.label,
          String(m.amount),
          m.status,
          m.paidOn ?? "",
          m.reference ?? "",
        ]),
      ),
    ]
      .map((r) => r.map((x) => `"${x.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv_bom + lines], { type: "text/csv" }),
    );
    a.download = "collabkaro-payments.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const contractDeal = s.deals.find((d) => d.id === contract);
  return (
    <>
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">MONEY, MADE CLEAR</span>
          <h1>Payments & contracts</h1>
          <p>
            Budgets, what you’ve agreed, and what’s paid, across every campaign.
            You record payments here; CollabKaro doesn’t move money yet.
          </p>
        </div>
        <button
          className="button secondary"
          onClick={csv}
          disabled={!deals.length}
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>
      <div className="dashboard-stats">
        {[
          ["Total budgets", sum("total")],
          ["Committed", sum("committed")],
          ["Paid", sum("paid")],
          ["Due", sum("due")],
        ].map(([label, n]) => (
          <div className="panel" key={label}>
            <span>
              <Wallet size={14} />
              {label}
            </span>
            <strong>{formatINR(n as number)}</strong>
          </div>
        ))}
      </div>
      <section className="panel workspace-section">
        <h2>By campaign</h2>
        {budgets.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Budget</th>
                  <th>Committed</th>
                  <th>Paid</th>
                  <th>Left</th>
                  <th>Hired</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {budgets.map(({ c, b }) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>{b.total ? formatINR(b.total) : "Not set"}</td>
                    <td>{formatINR(b.committed)}</td>
                    <td>{formatINR(b.paid)}</td>
                    <td className={b.left < 0 ? "error" : ""}>
                      {b.total ? formatINR(b.left) : "—"}
                    </td>
                    <td>
                      {b.deals.length}/{c.needed}
                    </td>
                    <td>
                      <Link
                        className="text-button"
                        href={`/a/campaigns/${c.id}/applicants`}
                      >
                        Open
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="builder-help">
            No deals yet. Hire a creator from a campaign’s applicants to start.
          </p>
        )}
      </section>
      <section className="panel workspace-section">
        <div className="row between">
          <h2>Payment ledger</h2>
          <div
            className="segmented"
            role="tablist"
            aria-label="Filter payments"
          >
            {(["all", "due", "paid"] as const).map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={filter === f ? "selected" : ""}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "due" ? "Due" : "Paid"}
              </button>
            ))}
          </div>
        </div>
        {rows.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Campaign</th>
                  <th>Milestone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Contract</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ d, m }) => (
                  <tr key={m.id}>
                    <td>{creators.find((c) => c.id === d.creatorId)?.name}</td>
                    <td>{own.find((c) => c.id === d.campaignId)?.title}</td>
                    <td>{m.label}</td>
                    <td>{formatINR(m.amount)}</td>
                    <td>
                      {m.status === "paid" ? (
                        <span className="badge lime">
                          Paid {new Date(m.paidOn!).toLocaleDateString("en-IN")}
                        </span>
                      ) : (
                        <span className="badge coral">Due</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => setContract(d.id)}
                      >
                        {contractLabel[contractStatus(d)]}
                      </button>
                    </td>
                    <td>
                      {m.status === "due" && (
                        <button
                          type="button"
                          className="button small"
                          onClick={() => setPaying({ deal: d, m })}
                        >
                          Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="builder-help">Nothing here yet.</p>
        )}
      </section>
      {paying && (
        <PaymentDialog
          deal={paying.deal}
          milestone={paying.m}
          onClose={() => setPaying(null)}
        />
      )}
      {contractDeal && (
        <ContractDialog
          deal={contractDeal}
          party="brand"
          open
          onOpenChange={(o) => !o && setContract(null)}
        />
      )}
    </>
  );
}
// Excel needs a BOM to read ₹ and Indian names correctly.
const csv_bom = "﻿";

/* -------------------------------------------- Creator's view of their deal */

export function CreatorDeal({ campaignId }: { campaignId: string }) {
  const s = useStore();
  const deal = s.deals.find(
    (d) => d.campaignId === campaignId && d.creatorId === s.me.creatorId,
  );
  const [open, setOpen] = useState(false);
  if (!deal)
    return (
      <div className="panel workspace-section">
        <h2>Your deal</h2>
        <p className="builder-help">
          The brand hasn’t set up your fee, payment schedule and contract yet.
          You’ll get a notification when it’s ready to sign.
        </p>
      </div>
    );
  const total = dealTotal(deal);
  const paid = dealPaid(deal);
  const st = contractStatus(deal);
  return (
    <div className="panel workspace-section creator-deal">
      <div className="row between">
        <h2>Your deal</h2>
        <ContractBadge deal={deal} />
      </div>
      <div className="budget-stats">
        <div>
          <small>Creator fee</small>
          <strong>{formatINR(deal.amount)}</strong>
        </div>
        {deal.usageFees.some((u) => u.amount > 0) && (
          <div>
            <small>Usage fees</small>
            <strong>
              {formatINR(deal.usageFees.reduce((x, u) => x + u.amount, 0))}
            </strong>
          </div>
        )}
        <div>
          <small>Total</small>
          <strong>{formatINR(total)}</strong>
        </div>
        <div>
          <small>Received (as recorded by brand)</small>
          <strong>{formatINR(paid)}</strong>
        </div>
      </div>
      <Milestones deal={deal} />
      <button
        type="button"
        className={
          st === "brand" || st === "unsigned" ? "button" : "button secondary"
        }
        onClick={() => setOpen(true)}
      >
        <FileSignature size={16} />
        {deal.creatorSignature ? "View contract" : "Review & sign contract"}
      </button>
      {open && (
        <ContractDialog
          deal={deal}
          party="creator"
          open
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
}

/** Brand-side milestone list with payment actions, for the deal drawer. */
export function DealMilestones({ deal }: { deal: Deal }) {
  const [paying, setPaying] = useState<Milestone | null>(null);
  return (
    <>
      <Milestones deal={deal} onPay={setPaying} />
      {paying && (
        <PaymentDialog
          deal={deal}
          milestone={paying}
          onClose={() => setPaying(null)}
        />
      )}
    </>
  );
}
