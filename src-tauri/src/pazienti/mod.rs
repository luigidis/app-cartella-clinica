pub mod db;

use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct PazienteInput {
    pub nome: String,
    pub cognome: String,
    pub data_nascita: String,
    pub codice_fiscale: Option<String>,
    pub diagnosi: Option<String>,
    pub note: Option<String>,
}

#[tauri::command]
pub fn crea_paziente(data: PazienteInput) -> Result<String, String> {
    db::crea_paziente(data)
}

#[tauri::command]
pub fn get_pazienti() -> Result<Vec<serde_json::Value>, String> {
    db::get_pazienti()
}
