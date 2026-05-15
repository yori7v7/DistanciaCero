import { useState } from "react";
import { MessageCircleHeart, X } from "lucide-react";
import emergencyMessages from "../data/emergencyMessages.json";

function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [outputMessage, setOutputMessage] = useState("");

  const handleMoodClick = (mood) => {
    const randomIndex = Math.floor(Math.random() * mood.messages.length);
    setSelectedMood(mood.label);
    setOutputMessage(mood.messages[randomIndex]);
  };

  return (
    <>
      <button
        className="floating-emergency-button"
        onClick={() => setOpen(true)}
      >
        <MessageCircleHeart size={18} />
        Necesito un abrazo
      </button>

      {open && (
        <div
          className="emergency-modal-backdrop"
          onClick={() => setOpen(false)}
        >
          <div
            className="emergency-card"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="close-emergency" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>

            <div className="emergency-header">
              <MessageCircleHeart size={26} />
              <h3>Modo contención emocional</h3>
              <p>Elige cómo te sientes y esta página te responde bonito.</p>
            </div>

            <div className="mood-grid">
              {emergencyMessages.map((mood) => (
                <button
                  key={mood.id}
                  className={`mood-button ${selectedMood === mood.label ? "selected" : ""}`}
                  onClick={() => handleMoodClick(mood)}
                >
                  {mood.label}
                </button>
              ))}
            </div>

            {outputMessage && (
              <div className="comfort-output">
                <h4>{selectedMood}</h4>
                <p>{outputMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default EmergencyButton;
