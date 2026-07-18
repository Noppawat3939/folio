import { useState, useEffect, useMemo } from "react";
import type { Entry, FetchedData } from "~/types";
import { api } from "~/services/api";
import { fmt, currentPeriod } from "~/utils/format";
import { tcfg, abbr } from "~/utils/typeConfig";
import { isUnlocked } from "~/utils/pin";
import PinGate from "~/components/PinGate";
import EntryModal from "~/components/EntryModal";
import ConfirmDeleteModal from "~/components/ConfirmDeleteModal";
import { PortfolioIcon, AnalyticsIcon } from "~/components/NavIcons";
import MonthPicker from "~/components/MonthPicker";

type View = "monthly" | "yearly";
type ModalState = null | "add" | Entry;

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [view, setView] = useState<View>("monthly");
  const [period, setPeriod] = useState(currentPeriod);
  const [data, setData] = useState<FetchedData>({
    entries: [],
    monthly: [],
    yearly: [],
  });
  const [loadedPeriod, setLoaded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const year = period.slice(0, 4);
  const loading = loadedPeriod !== period;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.entries.list(period),
      api.summary.monthly(period),
      api.summary.yearly(year),
    ])
      .then(([entries, monthly, yearly]) => {
        if (cancelled) return;
        setError(null);
        setData({
          entries: Array.isArray(entries) ? entries : [],
          monthly: Array.isArray(monthly) ? monthly : [],
          yearly: Array.isArray(yearly) ? yearly : [],
        });
        setLoaded(period);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(String(e));
          setLoaded(period);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [period, year, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  function handleDelete(e: Entry) {
    setDeleteTarget(e);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.entries.delete(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      alert(String(err));
    } finally {
      setDeleting(false);
    }
  }

  const { entries, monthly, yearly } = data;
  const total = monthly.reduce((s, m) => s + m.total, 0);
  const yearTotal = yearly.reduce((s, y) => s + y.total, 0);
  const maxBar = useMemo(
    () => yearly.reduce((a, s) => Math.max(a, s.total), 1),
    [yearly],
  );
  const donutArcs = useMemo(() => {
    if (!monthly.length || !total) return [];
    const C = 2 * Math.PI * 38;
    let off = 0;
    return monthly.map((s) => {
      const pct = s.total / total;
      const arc = { type: s.type, dashLen: Math.max(pct * C - 2, 0), offset: off, pct: pct * 100 };
      off += pct * C;
      return arc;
    });
  }, [monthly, total]);

  if (!unlocked) {
    return <PinGate onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0d0f17] text-white pb-28 select-none">
      {/* ─── Header ─────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#5e6180] text-sm">{greet()}</p>
            <h1 className="text-white font-bold text-xl mt-0.5 tracking-tight">
              Folio
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <MonthPicker value={period} onChange={setPeriod} />
            <button
              onClick={() => setModal("add")}
              className="w-9 h-9 bg-linear-to-br from-[#6367FF] to-[#8494FF] hover:from-[#7476FF] hover:to-[#96A4FF] active:from-[#5254E8] active:to-[#7282E8] rounded-xl flex items-center justify-center text-white font-bold text-xl leading-none"
            >
              +
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 space-y-4">
        {error && (
          <div className="bg-red-950/40 border border-red-900/40 rounded-2xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ══════════ MONTHLY ══════════ */}
        {view === "monthly" ? (
          <>
            {/* Portfolio card */}
            <div className="bg-linear-to-br from-[#141e24] to-[#0f161c] rounded-3xl p-5 border border-[#1d2830]">
              <p className="text-[#5e6180] text-[10px] font-semibold uppercase tracking-widest mb-3">
                พอร์ตลงทุน · {period}
              </p>
              <p className="text-[42px] font-bold tracking-tight leading-none">
                ฿{fmt(total)}
              </p>
              {monthly.length > 0 && (
                <p className="text-[#454768] text-xs mt-2">
                  {monthly.length} ประเภทสินทรัพย์
                </p>
              )}

              {donutArcs.length > 0 && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#1e2240" strokeWidth="12" />
                      {donutArcs.map(({ type, dashLen, offset }) => (
                        <circle
                          key={type}
                          cx="50" cy="50" r="38"
                          fill="none"
                          stroke={tcfg(type).accent}
                          strokeWidth="12"
                          strokeDasharray={`${dashLen} ${2 * Math.PI * 38}`}
                          strokeDashoffset={-offset}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[9px] text-[#5e6180]">รวม</span>
                      <span className="text-sm font-bold text-white leading-tight">
                        ฿{fmt(total)}
                      </span>
                    </div>
                  </div>
                  <div className="flex mt-3 flex-wrap justify-center gap-x-3 gap-y-1">
                    {donutArcs.map(({ type, pct }) => (
                      <div key={type} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tcfg(type).accent }} />
                        <span className="text-[10px] text-[#5e6180]">
                          {abbr(type)} <span className="text-[#3e4060]">{pct.toFixed(1)}%</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Type summary cards — horizontal scroll */}
            {monthly.length > 0 && (
              <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
                {monthly.map((s) => {
                  const c = tcfg(s.type);
                  const pct =
                    total > 0 ? ((s.total / total) * 100).toFixed(1) : "0.0";
                  return (
                    <div
                      key={s.type}
                      className="shrink-0 w-44 bg-[#141824] rounded-2xl p-4 border border-[#1d2030]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}
                        >
                          <span className={`text-[10px] font-bold ${c.text}`}>
                            {abbr(s.type)}
                          </span>
                        </div>
                        <span className="text-[#22c55e] text-xs font-semibold">
                          {pct}%
                        </span>
                      </div>
                      <p className="text-white font-semibold text-sm leading-tight truncate">
                        {s.type}
                      </p>
                      <p className="text-[#5e6180] text-xs mt-0.5">
                        ฿{fmt(s.total)}
                      </p>
                      <div className="mt-3">
                        <div className="h-1 bg-[#1d2030] rounded-full">
                          <div
                            className="h-1 rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: c.accent,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Entry watchlist */}
            <div className="bg-[#141824] rounded-2xl border border-[#1d2030] overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-[#1d2030]">
                <p className="text-white font-semibold text-sm">My Watchlist</p>
                <span className="text-[#404360] text-xs">
                  {entries.length} รายการ
                </span>
              </div>

              {loading ? (
                <p className="text-center py-10 text-sm text-[#404360]">
                  Loading…
                </p>
              ) : entries.length === 0 ? (
                <p className="text-center py-10 text-sm text-[#404360]">
                  No entries for {period}
                </p>
              ) : (
                <div className="divide-y divide-[#1d2030]">
                  {entries.map((e) => {
                    const c = tcfg(e.type);

                    return (
                      <div
                        key={e.id}
                        className="px-5 py-3.5 flex items-center gap-3"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}
                        >
                          <span className={`text-[10px] font-bold ${c.text}`}>
                            {abbr(e.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium leading-tight truncate">
                            {e.name ?? e.type}
                          </p>
                          <p className="text-[#404360] text-xs mt-0.5 truncate">
                            {e.type}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-white font-semibold text-sm">
                            ฿{fmt(e.amount)}
                          </p>
                          <div className="flex items-center gap-1.5 justify-end mt-1">
                            <button
                              onClick={() => setModal(e)}
                              className="text-[10px] text-[#404360] hover:text-[#8494FF]"
                            >
                              Edit
                            </button>
                            <span className="text-[#252840] text-[10px]">
                              ·
                            </span>
                            <button
                              onClick={() => handleDelete(e)}
                              className="text-[10px] text-[#404360] hover:text-red-400"
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* ══════════ YEARLY ══════════ */
          <div className="space-y-4">
            <div className="bg-[#141824] rounded-2xl border border-[#1d2030] p-5">
              <p className="text-[#5e6180] text-[10px] font-semibold uppercase tracking-widest mb-1">
                ภาพรวมรายปี
              </p>
              <p className="text-3xl font-bold text-white">฿{fmt(yearTotal)}</p>
              <p className="text-[#404360] text-xs mt-0.5">{year}</p>

              {yearly.length === 0 ? (
                <p className="text-center py-8 text-sm text-[#404360]">
                  No data for {year}
                </p>
              ) : (
                <div className="flex items-end gap-1 h-40 mt-6">
                  {yearly.map((s) => {
                    const on = s.period.slice(0, 7) === period;
                    return (
                      <div
                        key={s.period}
                        className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                        onClick={() => {
                          setPeriod(s.period.slice(0, 7));
                          setView("monthly");
                        }}
                      >
                        {on && (
                          <span className="text-[9px] text-[#8494FF] font-mono leading-none mb-0.5">
                            {fmt(s.total)}
                          </span>
                        )}
                        <div
                          className={`w-full rounded-xs ${on ? "bg-linear-to-t from-[#6367FF] to-[#8494FF]" : "bg-[#1e2240] hover:bg-[#252d35]"}`}
                          style={{
                            height: `${Math.max((s.total / maxBar) * 100, 5)}%`,
                          }}
                          title={`${s.period.slice(0, 7)}: ฿${fmt(s.total)}`}
                        />
                        <span
                          className={`text-[9px] ${on ? "text-[#8494FF]" : "text-[#333657]"}`}
                        >
                          {s.period.slice(5, 7)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {yearly.length > 0 && (
              <div className="bg-[#141824] rounded-2xl border border-[#1d2030] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1d2030]">
                  <p className="text-white font-semibold text-sm">รายเดือน</p>
                </div>
                <div className="divide-y divide-[#1d2030]">
                  {yearly.map((s) => {
                    const on = s.period.slice(0, 7) === period;
                    const pct =
                      yearTotal > 0
                        ? ((s.total / yearTotal) * 100).toFixed(1)
                        : "0.0";
                    return (
                      <div
                        key={s.period}
                        className={`px-5 py-3.5 flex items-center justify-between cursor-pointer ${
                          on ? "bg-[#141e24]" : "hover:bg-[#141a1e]"
                        }`}
                        onClick={() => {
                          setPeriod(s.period.slice(0, 7));
                          setView("monthly");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${on ? "bg-[#8494FF]" : "bg-[#252840]"}`}
                          />
                          <span
                            className={`text-sm ${on ? "text-white font-semibold" : "text-[#6b6e8e]"}`}
                          >
                            {s.period.slice(0, 7)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[#404360] text-xs">{pct}%</span>
                          <span
                            className={`text-sm font-mono font-semibold ${on ? "text-white" : "text-[#6b6e8e]"}`}
                          >
                            ฿{fmt(s.total)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 py-4 border-t border-[#252840] flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">
                    รวมทั้งปี
                  </span>
                  <span className="text-white font-bold font-mono">
                    ฿{fmt(yearTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Bottom nav ────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0f17]/95 backdrop-blur-sm border-t border-[#1d2030]">
        <div className="max-w-lg mx-auto flex">
          {[
            { id: "monthly" as View, label: "Portfolio", Icon: PortfolioIcon },
            { id: "yearly" as View, label: "Analytics", Icon: AnalyticsIcon },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex-1 flex flex-col items-center gap-1.5 pt-3 pb-6 text-xs font-medium ${
                view === id ? "text-[#8494FF]" : "text-[#35395a]"
              }`}
            >
              <Icon on={view === id} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {modal != null && (
        <EntryModal
          period={period}
          entry={typeof modal === "string" ? undefined : modal}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            refresh();
          }}
        />
      )}

      {deleteTarget != null && (
        <ConfirmDeleteModal
          entry={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
