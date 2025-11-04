use std::process::Command;
use std::env;
use crate::pazienti::PazienteInput;

pub fn create_patient(p: PazienteInput) -> Result<String, String> {
    let json = serde_json::to_string(&p).map_err(|e| format!("JSON serialization error: {}", e))?;

    // Get current directory for script path and working directory
    let current_dir = env::current_dir().map_err(|e| format!("Failed to get current directory: {}", e))?;
    let script_path = current_dir.join("api").join("createPatient.js");

    // Execute the Node.js script
    let output = Command::new("node")
        .arg(&script_path)
        .arg(&json)
        .current_dir(&current_dir)
        .output()
        .map_err(|e| format!("Failed to execute node: {}\nScript: {:?}\nCWD: {:?}", e, script_path, current_dir))?;

    // Check if the command executed successfully
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(format!(
            "Node script failed:\nScript: {:?}\nSTDERR: {}\nSTDOUT: {}",
            script_path, stderr, stdout
        ));
    }

    let result = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(result)
}

pub fn get_pazienti() -> Result<Vec<serde_json::Value>, String> {
    let current_dir = env::current_dir().map_err(|e| format!("Failed to get current directory: {}", e))?;
    let script_path = current_dir.join("api").join("getPatient.js");

    let output = Command::new("node")
        .arg(&script_path)
        .current_dir(&current_dir)
        .output()
        .map_err(|e| format!("Failed to execute node: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(format!("Node script failed:\nSTDERR: {}\nSTDOUT: {}", stderr, stdout));
    }

    let result_str = String::from_utf8_lossy(&output.stdout);
    let pazienti: Vec<serde_json::Value> = serde_json::from_str(&result_str)
        .map_err(|e| format!("Failed to parse JSON: {}\nOutput: {}", e, result_str))?;

    Ok(pazienti)
}

pub fn search_patient(query: String) -> Result<Vec<serde_json::Value>, String> {
    let current_dir = env::current_dir().map_err(|e| format!("Failed to get current directory: {}", e))?;
    let script_path = current_dir.join("api").join("getPatient.js");

    let output = Command::new("node")
        .arg(&script_path)
        .arg(&query)
        .current_dir(&current_dir)
        .output()
        .map_err(|e| format!("Failed to execute node: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(format!("Node script failed:\nSTDERR: {}\nSTDOUT: {}", stderr, stdout));
    }

    let result_str = String::from_utf8_lossy(&output.stdout);
    let pazienti: Vec<serde_json::Value> = serde_json::from_str(&result_str)
        .map_err(|e| format!("Failed to parse JSON: {}\nOutput: {}", e, result_str))?;

    Ok(pazienti)
}
