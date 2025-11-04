import { useState } from "react";
import { core } from "@tauri-apps/api";

export default function AggiungiPaziente() {
  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    data_nascita: "",
    codice_fiscale: "",
    diagnosi: "",
    note: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget; // currentTarget è tipizzato correttamente
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const salva = async () => {
    try {
      console.log({ data: form })

      const res = await core.invoke("create_patient", { data: form });
      console.log("Paziente creato:", res);
      alert("Paziente salvato!");
    } catch (err) {
      console.error("Errore nel salvataggio:", err);
    }
  };

  return (
    <div className="patient-form-container">
      <form className="patient-form" onSubmit={(e) => { e.preventDefault(); salva(); }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input
            name="nome"
            placeholder="Inserisci il nome"
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cognome *</label>
          <input
            name="cognome"
            placeholder="Inserisci il cognome"
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Data di Nascita *</label>
          <input
            name="data_nascita"
            type="date"
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Codice Fiscale</label>
          <input
            name="codice_fiscale"
            placeholder="Inserisci il codice fiscale"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Diagnosi</label>
          <textarea
            name="diagnosi"
            placeholder="Inserisci la diagnosi"
            onChange={handleChange}
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Note</label>
          <textarea
            name="note"
            placeholder="Inserisci eventuali note"
            onChange={handleChange}
            className="form-textarea"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="form-button primary">
            Salva Paziente
          </button>
        </div>
      </form>
    </div>
  );
}
