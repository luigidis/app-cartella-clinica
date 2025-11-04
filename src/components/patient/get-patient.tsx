import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./get-patient.css";

interface Patient {
  id: number;
  nome: string;
  cognome: string;
  dataNascita: string;
  codiceFiscale: string | null;
  diagnosi: string | null;
  note: string | null;
  createdAt: string;
}

export default function GetPatient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await invoke<Patient[]>("search_patient", {
        query: searchQuery,
      });
      setPatients(result);
    } catch (err) {
      setError(err as string);
      console.error("Errore nella ricerca:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-patient-container">
      <h2 className="section-title">Cerca Pazienti</h2>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Nome, cognome, codice fiscale..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? "Ricerca..." : "Cerca"}
          </button>
        </div>
      </form>

      {error && <div className="error-message">Errore: {error}</div>}

      {patients.length > 0 && (
        <div className="results-container">
          <h3>Risultati ({patients.length})</h3>
          <div className="patients-table">
            <div className="table-header">
              <div className="table-header-cell">Nome</div>
              <div className="table-header-cell">Cognome</div>
              <div className="table-header-cell">Data di Nascita</div>
              <div className="table-header-cell">Codice Fiscale</div>
              <div className="table-header-cell">Diagnosi</div>
            </div>
            <div className="table-body">
              {patients.map((patient) => (
                <div key={patient.id} className="table-row">
                  <div className="table-cell" data-label="Nome">
                    {patient.nome}
                  </div>
                  <div className="table-cell" data-label="Cognome">
                    {patient.cognome}
                  </div>
                  <div className="table-cell" data-label="Data di Nascita">
                    {new Date(patient.dataNascita).toLocaleDateString()}
                  </div>
                  <div
                    className={`table-cell ${!patient.codiceFiscale ? "empty" : ""}`}
                    data-label="Codice Fiscale"
                  >
                    {patient.codiceFiscale || "-"}
                  </div>
                  <div
                    className={`table-cell ${!patient.diagnosi ? "empty" : ""}`}
                    data-label="Diagnosi"
                  >
                    {patient.diagnosi || "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && patients.length === 0 && searchQuery && (
        <div className="no-results">Nessun paziente trovato</div>
      )}
    </div>
  );
}
