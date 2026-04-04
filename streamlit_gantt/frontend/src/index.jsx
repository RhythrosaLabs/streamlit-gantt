import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Streamlit } from "streamlit-component-lib";

const C = {
  bg: "#0f0f1a", panel: "#161625", surface: "#1a1a2e",
  border: "rgba(255,255,255,0.08)", text: "#e2e8f0", dim: "#64748b",
  accent: "#6366f1", accentGlow: "rgba(99,102,241,0.3)",
  red: "#ef4444", green: "#10b981", amber: "#f59e0b",
};

const TASK_COLORS = ["#6366f1","#ec4899","#10b981","#f59e0b","#22d3ee","#a78bfa","#f87171","#34d399"];
const ROW_H = 40;
const HEADER_W = 200;
const DAY_W = 36;
const HEADER_H = 48;

let _uid = 100;
function uid() { return `t${_uid++}`; }

function defaultTasks() {
  return [
    { id: "t1", name: "Research & Planning", start: 0, duration: 5, progress: 100, color: TASK_COLORS[0], deps: [] },
    { id: "t2", name: "UI/UX Design", start: 4, duration: 7, progress: 80, color: TASK_COLORS[1], deps: ["t1"] },
    { id: "t3", name: "Backend API", start: 6, duration: 10, progress: 45, color: TASK_COLORS[2], deps: ["t1"] },
    { id: "t4", name: "Frontend Dev", start: 10, duration: 12, progress: 30, color: TASK_COLORS[3], deps: ["t2"] },
    { id: "t5", name: "Database Setup", start: 6, duration: 4, progress: 90, color: TASK_COLORS[4], deps: ["t1"] },
    { id: "t6", name: "Integration Testing", start: 18, duration: 5, progress: 0, color: TASK_COLORS[5], deps: ["t3", "t4"] },
    { id: "t7", name: "Performance Tuning", start: 22, duration: 3, progress: 0, color: TASK_COLORS[6], deps: ["t6"] },
    { id: "t8", name: "Launch", start: 25, duration: 1, progress: 0, color: TASK_COLORS[7], deps: ["t7"], milestone: true },
  ];
}

export default function GanttChart() {
  const [tasks, setTasks] = useState(null);
  const [height, setHeight] = useState(500);
  const [selected, setSelected] = useState(null);
  const [todayLine, ] = useState(3); // "today" offset in days for demo

  useEffect(() => {
    const onRender = (event) => {
      const { args } = event.detail;
      if (args.height) setHeight(args.height);
      if (!tasks) setTasks(args.tasks || defaultTasks());
      Streamlit.setFrameHeight(args.height || 500);
    };
    Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, onRender);
    Streamlit.setComponentReady();
    return () => Streamlit.events.removeEventListener(Streamlit.RENDER_EVENT, onRender);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendState = useCallback((t) => {
    Streamlit.setComponentValue({ tasks: t });
  }, []);

  const totalDays = useMemo(() => {
    if (!tasks) return 30;
    let max = 0;
    tasks.forEach((t) => { const e = t.start + t.duration; if (e > max) max = e; });
    return max + 5;
  }, [tasks]);

  /* ── drag move & resize ── */
  const startDrag = useCallback((e, taskId, mode) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const tasksCopy = JSON.parse(JSON.stringify(tasks));
    const task = tasksCopy.find((t) => t.id === taskId);
    if (!task) return;
    const origStart = task.start;
    const origDur = task.duration;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dd = Math.round(dx / DAY_W);
      const next = JSON.parse(JSON.stringify(tasksCopy));
      const t = next.find((t) => t.id === taskId);
      if (mode === "move") {
        t.start = Math.max(0, origStart + dd);
      } else if (mode === "resize") {
        t.duration = Math.max(1, origDur + dd);
      }
      setTasks(next);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setTasks((cur) => { sendState(cur); return cur; });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [tasks, sendState]);

  const addTask = () => {
    setTasks((prev) => {
      let maxEnd = 0;
      prev.forEach((t) => { const e = t.start + t.duration; if (e > maxEnd) maxEnd = e; });
      const next = [...prev, {
        id: uid(),
        name: "New Task",
        start: maxEnd,
        duration: 3,
        progress: 0,
        color: TASK_COLORS[prev.length % TASK_COLORS.length],
        deps: [],
      }];
      sendState(next);
      return next;
    });
  };

  const deleteTask = () => {
    if (!selected) return;
    setTasks((prev) => {
      const next = prev
        .filter((t) => t.id !== selected)
        .map((t) => ({ ...t, deps: t.deps.filter((d) => d !== selected) }));
      sendState(next);
      return next;
    });
    setSelected(null);
  };

  const updateProgress = (id, delta) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, progress: Math.min(100, Math.max(0, t.progress + delta)) } : t
      );
      sendState(next);
      return next;
    });
  };

  if (!tasks) return null;

  const gridW = totalDays * DAY_W;

  /* ── dependency arrows (SVG) ── */
  const arrows = [];
  tasks.forEach((task, ti) => {
    if (!task.deps) return;
    task.deps.forEach((depId) => {
      const depIdx = tasks.findIndex((t) => t.id === depId);
      if (depIdx < 0) return;
      const dep = tasks[depIdx];
      const x1 = (dep.start + dep.duration) * DAY_W;
      const y1 = depIdx * ROW_H + ROW_H / 2;
      const x2 = task.start * DAY_W;
      const y2 = ti * ROW_H + ROW_H / 2;
      const midX = (x1 + x2) / 2;
      arrows.push(
        <g key={`${depId}-${task.id}`}>
          <path
            d={`M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`}
            fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth={1.5}
            strokeDasharray="4,3"
          />
          <circle cx={x2} cy={y2} r={3} fill={C.accent} opacity={0.5} />
        </g>
      );
    });
  });

  /* ── generate date labels ── */
  const dateLabels = [];
  const baseDate = new Date(2026, 3, 1); // Apr 1 2026
  for (let d = 0; d < totalDays; d++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + d);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    dateLabels.push({ day: d, label: date.getDate(), month: date.toLocaleString("en", { month: "short" }), isWeekend, isFirst: date.getDate() === 1 || d === 0 });
  }

  return (
    <div style={{
      fontFamily: "'DM Sans',sans-serif", background: C.bg,
      borderRadius: 12, border: `1px solid ${C.border}`,
      overflow: "hidden", height, display: "flex", flexDirection: "column",
      color: C.text, userSelect: "none",
    }}>
      {/* toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
        background: C.panel, borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Gantt Chart</span>
        <span style={{ fontSize: 10, color: C.dim }}>{tasks.length} tasks</span>
        <div style={{ flex: 1 }} />
        <Btn onClick={addTask}>+ Add Task</Btn>
        {selected && (
          <>
            <Btn onClick={() => updateProgress(selected, 10)}>Progress +10%</Btn>
            <Btn danger onClick={deleteTask}>🗑 Delete</Btn>
          </>
        )}
      </div>

      {/* chart area */}
      <div style={{ flex: 1, overflow: "auto", display: "flex" }}>
        {/* task list */}
        <div style={{ width: HEADER_W, flexShrink: 0, background: C.panel, borderRight: `1px solid ${C.border}`, position: "sticky", left: 0, zIndex: 10 }}>
          <div style={{ height: HEADER_H, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 10, color: C.dim, fontFamily: "'Space Mono',monospace", letterSpacing: "0.1em" }}>
            TASK
          </div>
          {tasks.map((t) => (
            <div key={t.id} onClick={() => setSelected(selected === t.id ? null : t.id)} style={{
              height: ROW_H, display: "flex", alignItems: "center", gap: 8,
              padding: "0 12px", borderBottom: `1px solid ${C.border}`,
              background: selected === t.id ? "rgba(99,102,241,0.08)" : "transparent",
              cursor: "pointer",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: t.milestone ? 2 : "50%", background: t.color, flexShrink: 0, transform: t.milestone ? "rotate(45deg)" : "none" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                <div style={{ fontSize: 9, color: C.dim }}>{t.duration}d · {t.progress}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* grid + bars */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* date header */}
          <div style={{ height: HEADER_H, display: "flex", position: "sticky", top: 0, zIndex: 5, background: C.panel, borderBottom: `1px solid ${C.border}` }}>
            {dateLabels.map((d) => (
              <div key={d.day} style={{
                width: DAY_W, flexShrink: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", borderRight: `1px solid ${C.border}`,
                background: d.isWeekend ? "rgba(255,255,255,0.02)" : "transparent",
              }}>
                {d.isFirst && <span style={{ fontSize: 8, color: C.dim, lineHeight: 1 }}>{d.month}</span>}
                <span style={{ fontSize: 11, color: d.isWeekend ? C.dim : C.text }}>{d.label}</span>
              </div>
            ))}
          </div>

          {/* rows & bars */}
          <div style={{ position: "relative", minWidth: gridW }}>
            {/* grid columns */}
            {dateLabels.map((d) => (
              <div key={d.day} style={{
                position: "absolute", left: d.day * DAY_W, top: 0, bottom: 0,
                width: DAY_W, borderRight: `1px solid ${C.border}`,
                background: d.isWeekend ? "rgba(255,255,255,0.015)" : "transparent",
                height: tasks.length * ROW_H,
              }} />
            ))}

            {/* today line */}
            <div style={{
              position: "absolute", left: todayLine * DAY_W + DAY_W / 2, top: 0,
              width: 2, height: tasks.length * ROW_H,
              background: C.red, opacity: 0.4, zIndex: 4,
            }} />

            {/* row backgrounds */}
            {tasks.map((_, i) => (
              <div key={i} style={{
                height: ROW_H, borderBottom: `1px solid ${C.border}`,
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
              }} />
            ))}

            {/* SVG dependency arrows */}
            <svg style={{ position: "absolute", top: 0, left: 0, width: gridW, height: tasks.length * ROW_H, pointerEvents: "none", zIndex: 2 }}>
              {arrows}
            </svg>

            {/* task bars */}
            {tasks.map((t, i) => (
              <div key={t.id} style={{
                position: "absolute",
                left: t.start * DAY_W,
                top: i * ROW_H + 8,
                height: ROW_H - 16,
                width: t.milestone ? ROW_H - 16 : t.duration * DAY_W,
                zIndex: 3,
              }}>
                {t.milestone ? (
                  <div
                    onClick={() => setSelected(selected === t.id ? null : t.id)}
                    style={{
                      width: "100%", height: "100%",
                      background: t.color, borderRadius: 4,
                      transform: "rotate(45deg)",
                      boxShadow: selected === t.id ? `0 0 12px ${C.accentGlow}` : "none",
                      cursor: "pointer",
                    }}
                  />
                ) : (
                  <div
                    onClick={() => setSelected(selected === t.id ? null : t.id)}
                    onMouseDown={(e) => startDrag(e, t.id, "move")}
                    style={{
                      width: "100%", height: "100%",
                      background: `linear-gradient(90deg, ${t.color}30, ${t.color}18)`,
                      border: `1px solid ${selected === t.id ? C.accent : t.color + "40"}`,
                      borderRadius: 6, cursor: "grab",
                      overflow: "hidden", position: "relative",
                      boxShadow: selected === t.id ? `0 0 12px ${C.accentGlow}` : "none",
                    }}
                  >
                    {/* progress fill */}
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: `${t.progress}%`,
                      background: `${t.color}40`,
                      borderRadius: "6px 0 0 6px",
                    }} />
                    {/* label */}
                    <div style={{
                      position: "relative", zIndex: 1, padding: "0 8px",
                      fontSize: 10, lineHeight: `${ROW_H - 18}px`,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {t.name}
                    </div>
                    {/* resize handle */}
                    <div
                      onMouseDown={(e) => startDrag(e, t.id, "resize")}
                      style={{
                        position: "absolute", right: 0, top: 0, bottom: 0, width: 6,
                        cursor: "ew-resize", background: selected === t.id ? `${C.accent}40` : "transparent",
                        borderRadius: "0 6px 6px 0",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* status */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "6px 14px",
        background: C.panel, borderTop: `1px solid ${C.border}`,
        fontSize: 10, color: C.dim, fontFamily: "'Space Mono',monospace",
      }}>
        <span>{tasks.length} tasks</span>
        <span>·</span>
        <span>{tasks.filter((t) => t.progress === 100).length} completed</span>
        <span>·</span>
        <span>{Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length)}% overall</span>
        <div style={{ flex: 1 }} />
        <span>Drag to move · Edge to resize · Click to select</span>
      </div>
    </div>
  );
}

function Btn({ children, danger, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick} style={{
      padding: "4px 10px", fontSize: 11, border: "none", borderRadius: 6, cursor: "pointer",
      background: danger ? (h ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.08)")
        : (h ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"),
      color: danger ? "#ef4444" : "#e2e8f0", fontFamily: "inherit",
    }}>
      {children}
    </button>
  );
}
