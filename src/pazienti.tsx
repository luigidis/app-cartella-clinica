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

      const res = await core.invoke("crea_paziente", { data: form });
      console.log("Paziente creato:", res);
      alert("Paziente salvato!");
    } catch (err) {
      console.error("Errore nel salvataggio:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Nuovo Paziente</h2>
      <input name="nome" placeholder="Nome" onChange={handleChange} />
      <input name="cognome" placeholder="Cognome" onChange={handleChange} />
      <input name="data_nascita" type="date" onChange={handleChange} />
      <input name="codice_fiscale" placeholder="Codice Fiscale" onChange={handleChange} />
      <textarea name="diagnosi" placeholder="Diagnosi" onChange={handleChange} />
      <textarea name="note" placeholder="Note" onChange={handleChange} />
      <button onClick={salva}>Salva</button>
    </div>
  );
}
