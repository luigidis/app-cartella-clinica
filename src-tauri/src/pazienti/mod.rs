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
pub fn create_patient(data: PazienteInput) -> Result<String, String> {
    db::create_patient(data)
}

#[tauri::command]
pub fn get_pazienti() -> Result<Vec<serde_json::Value>, String> {
    db::get_pazienti()
}

#[tauri::command]
pub fn search_patient(query: String) -> Result<Vec<serde_json::Value>, String> {
    db::search_patient(query)
}
