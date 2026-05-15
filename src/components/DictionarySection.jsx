import SectionTitle from "./SectionTitle";
import { BookOpen } from "lucide-react";

function DictionarySection({ entries }) {
  return (
    <section className="section" id="diccionario">
      <SectionTitle
        eyebrow="Diccionario"
        title="Diccionario Ale & Yori"
        text="Una colección de palabras, apodos y conceptos que solo ustedes entienden del todo."
      />

      <div className="dictionary-grid">
        {entries.map((entry) => (
          <article className="dictionary-card fade-up" key={entry.id}>
            <div className="dictionary-top">
              <BookOpen size={20} />
              <span className="dictionary-word">{entry.word}</span>
            </div>

            <p>{entry.definition}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DictionarySection;
