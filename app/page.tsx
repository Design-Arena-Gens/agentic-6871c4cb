"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type PriorityKey = "focus" | "flow" | "spark";
type StatusKey = "queued" | "in-progress" | "complete";

type Task = {
  id: string;
  title: string;
  note: string;
  priority: PriorityKey;
  status: StatusKey;
  createdAt: string;
};

const PRIORITY_VARIANTS: Record<
  PriorityKey,
  { label: string; description: string; accent: string; glow: string }
> = {
  focus: {
    label: "Focus Pulse",
    description: "High-impact actions that demand your sharpest attention.",
    accent: "rgba(82, 213, 255, 0.8)",
    glow: "rgba(82, 213, 255, 0.35)"
  },
  flow: {
    label: "Flow State",
    description: "Satisfying momentum builders; keep your rhythm glowing.",
    accent: "rgba(187, 159, 255, 0.85)",
    glow: "rgba(187, 159, 255, 0.35)"
  },
  spark: {
    label: "Spark Joy",
    description: "Creative sparks or quick wins that re-energize the map.",
    accent: "rgba(245, 111, 183, 0.85)",
    glow: "rgba(245, 111, 183, 0.35)"
  }
};

const STATUS_LABELS: Record<StatusKey, { label: string; accent: string }> = {
  queued: { label: "Queued", accent: "rgba(255,255,255,0.75)" },
  "in-progress": { label: "In Orbit", accent: "rgba(82, 213, 255, 0.8)" },
  complete: { label: "Completed", accent: "rgba(164, 240, 203, 0.9)" }
};

const STATUS_FLOW: StatusKey[] = ["queued", "in-progress", "complete"];

type FilterKey = StatusKey | "all";

const STORAGE_KEY = "lumen_tasks";

const INITIAL_FORM = {
  title: "",
  note: "",
  priority: "focus" as PriorityKey
};

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Task[];
        setTasks(parsed);
      }
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to persist tasks", error);
    }
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "complete").length;
    const active = tasks.filter((task) => task.status === "in-progress").length;
    const focus = tasks.filter((task) => task.priority === "focus").length;
    return { total, completed, active, focus };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [filter, tasks]);

  const timeline = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [tasks]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = form.title.trim();
    const trimmedNote = form.note.trim();
    if (!trimmedTitle) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      note: trimmedNote,
      priority: form.priority,
      status: "queued",
      createdAt: new Date().toISOString()
    };

    setTasks((prev) => [newTask, ...prev]);
    setForm(INITIAL_FORM);
  };

  const updateStatus = (id: string, direction: "forward" | "reset") => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        if (direction === "reset") {
          return { ...task, status: "queued" };
        }
        const currentIndex = STATUS_FLOW.indexOf(task.status);
        const next = STATUS_FLOW[Math.min(currentIndex + 1, STATUS_FLOW.length - 1)];
        return { ...task, status: next };
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const softFormatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <main className={styles.scene}>
      <div className={styles.shell}>
        <span className={styles.aurora} aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />

        <section className={`${styles.panel} ${styles.deck}`}>
          <header className={styles.headline}>
            <div>
              <h1 className={styles.headlineTitle}>Lumen Task Studio</h1>
              <p className={styles.headlineSub}>
                Conduct your personal mission control with a responsive, living interface.
                Sculpt focus pulses, track orbital progress, and celebrate completed constellations.
              </p>
              <div className={styles.glassRibbon}>
                <span className={styles.pulseDot} />
                Ambient productivity · Neo-glass interface
              </div>
            </div>
            <span className={styles.glint} aria-hidden="true" />
          </header>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputField}>
              <label htmlFor="task-title">What&apos;s lighting up next?</label>
              <input
                id="task-title"
                name="title"
                placeholder="Design the onboarding ritual..."
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                autoComplete="off"
                required
              />
            </div>
            <div className={styles.inputField}>
              <label htmlFor="task-note">Add atmospheric notes</label>
              <textarea
                id="task-note"
                name="note"
                placeholder="Outline the experience, define the sensory cues, map the interactions..."
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              />
            </div>
            <div>
              <span className={styles.statLabel}>Priority Spectrum</span>
              <div className={styles.priorityList}>
                {(Object.keys(PRIORITY_VARIANTS) as PriorityKey[]).map((priority) => {
                  const { label, description } = PRIORITY_VARIANTS[priority];
                  return (
                    <button
                      key={priority}
                      type="button"
                      className={styles.priorityButton}
                      data-active={form.priority === priority}
                      onClick={() => setForm((prev) => ({ ...prev, priority }))}
                    >
                      <span className={styles.priorityTag}>{label}</span>
                      <span className={styles.priorityDescription}>{description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button className={styles.submitButton} type="submit">
              Launch Task Beacon
            </button>
          </form>
          <span className={styles.arc} aria-hidden="true" />
        </section>

        <section className={`${styles.panel} ${styles.grid}`}>
          <div className={styles.filters}>
            {(["all", "queued", "in-progress", "complete"] as FilterKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className={styles.filterPill}
                data-active={filter === key}
                onClick={() => setFilter(key)}
              >
                {key === "all" ? "All Constellations" : STATUS_LABELS[key].label}
              </button>
            ))}
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Nodes</span>
              <span className={styles.statValue}>{stats.total}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Active Orbit</span>
              <span className={styles.statValue}>{stats.active}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Focus Pulse</span>
              <span className={styles.statValue}>{stats.focus}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Constellations Complete</span>
              <span className={styles.statValue}>
                {stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)}%
              </span>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              Chart your next task to light up this space.
            </div>
          ) : (
            <div className={styles.taskList}>
              {filteredTasks.map((task) => {
                const priorityMeta = PRIORITY_VARIANTS[task.priority];
                const statusMeta = STATUS_LABELS[task.status];
                const statusIndex = STATUS_FLOW.indexOf(task.status);
                const canAdvance = statusIndex < STATUS_FLOW.length - 1;

                return (
                  <article
                    key={task.id}
                    className={styles.taskCard}
                    data-status={task.status}
                    style={{ borderColor: priorityMeta.glow }}
                  >
                    <div className={styles.taskHeader}>
                      <h2 className={styles.taskTitle}>{task.title}</h2>
                      <span
                        className={styles.priorityBadge}
                        style={{
                          color: priorityMeta.accent,
                          borderColor: priorityMeta.glow
                        }}
                      >
                        {priorityMeta.label}
                      </span>
                    </div>
                    <div className={styles.taskMeta}>
                      <span
                        className={styles.statusTicker}
                        style={{ borderColor: `${statusMeta.accent}33` }}
                      >
                        <span />
                        {statusMeta.label}
                      </span>
                      <time dateTime={task.createdAt}>{softFormatDate(task.createdAt)}</time>
                    </div>
                    {task.note && <p className={styles.taskBody}>{task.note}</p>}
                    <div className={styles.taskActions}>
                      {canAdvance ? (
                        <button
                          type="button"
                          className={styles.orbitButton}
                          onClick={() => updateStatus(task.id, "forward")}
                        >
                          Advance Orbit
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`${styles.orbitButton} ${styles.complete}`}
                          onClick={() => updateStatus(task.id, "reset")}
                        >
                          Reset Orbit
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.orbitButton}
                        onClick={() => deleteTask(task.id)}
                      >
                        Dissolve
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className={styles.timeline}>
            <span className={styles.timelineDot} aria-hidden="true" />
            <div className={styles.timelineItem}>
              <span>Latest Signals</span>
              <strong>Recent Orbital Activity</strong>
            </div>
            {timeline.map((task) => (
              <div key={task.id} className={styles.timelineItem}>
                <span>{softFormatDate(task.createdAt)}</span>
                <strong>
                  {task.title} · {PRIORITY_VARIANTS[task.priority].label}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
