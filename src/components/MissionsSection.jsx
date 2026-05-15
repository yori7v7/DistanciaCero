import { useEffect, useMemo, useState } from "react";
import SectionTitle from "./SectionTitle";
import { Target, Circle, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "ale-yori-missions-progress";

function MissionsSection({ missions }) {
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCompleted(JSON.parse(saved));
    }
  }, []);

  const toggleMission = (id) => {
    setCompleted((previous) => {
      const updated = {
        ...previous,
        [id]: !previous[id],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const progress = useMemo(() => {
    const done = missions.filter((mission) => completed[mission.id]).length;
    return {
      done,
      total: missions.length,
    };
  }, [missions, completed]);

  return (
    <section className="section" id="misiones">
      <SectionTitle
        eyebrow="Misiones"
        title="Checklist de pareja"
        text="Una lista de cosas bonitas por vivir, tachar y recordar."
      />

      <div className="missions-header fade-up">
        <div className="missions-progress">
          <Target size={20} />
          <span>
            {progress.done} / {progress.total} misiones completadas
          </span>
        </div>
      </div>

      <div className="missions-grid">
        {missions.map((mission) => {
          const isDone = completed[mission.id];

          return (
            <article
              key={mission.id}
              className={`mission-card fade-up ${isDone ? "done" : ""}`}
            >
              <button
                className="mission-toggle"
                onClick={() => toggleMission(mission.id)}
              >
                {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </button>

              <div>
                <span>{mission.category}</span>
                <h3>{mission.title}</h3>
                <p>{mission.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default MissionsSection;
