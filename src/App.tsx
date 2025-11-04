import { useState } from "react";
import AggiungiPaziente from "./components/patient/create-patient";
import GetPatient from "./components/patient/get-patient";
import "./App.css";

function App() {
  const [showAddPatient, setShowAddPatient] = useState(false);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Cartella Clinica</h1>
          <p className="app-subtitle">CriDp Medical Records</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="home-container">
          {/* Search Section */}
          <section className="search-section">
            <GetPatient/>
          </section>

          {/* Quick Actions */}
          <section className="actions-section">
            <button
              className="action-button primary"
              onClick={() => setShowAddPatient(true)}
            >
              <span className="button-icon">+</span>
              Nuovo Paziente
            </button>
          </section>          
        </div>
      </main>

      {/* Modal for Adding Patient (placeholder) */}
      {showAddPatient && (
        <div className="modal-overlay" onClick={() => setShowAddPatient(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Aggiungi Nuovo Paziente</h2>
              <button
                className="close-button"
                onClick={() => setShowAddPatient(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <AggiungiPaziente/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
