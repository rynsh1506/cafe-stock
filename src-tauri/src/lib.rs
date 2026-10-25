use std::fs;
use std::path::PathBuf;
use tauri::Manager;

fn get_db_file_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app_data_dir: {}", e))?;
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create app_data_dir: {}", e))?;
    }
    dir.push("inventory_kernel_storage.db.json");
    Ok(dir)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn db_load_snapshot(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = get_db_file_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read database file: {}", e))?;
    Ok(Some(content))
}

#[tauri::command]
fn db_save_snapshot(app: tauri::AppHandle, payload: String) -> Result<String, String> {
    let path = get_db_file_path(&app)?;
    fs::write(&path, payload.as_bytes())
        .map_err(|e| format!("Failed to write database file: {}", e))?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn db_clear_snapshot(app: tauri::AppHandle) -> Result<(), String> {
    let path = get_db_file_path(&app)?;
    if path.exists() {
        fs::remove_file(&path)
            .map_err(|e| format!("Failed to remove database file: {}", e))?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            db_load_snapshot,
            db_save_snapshot,
            db_clear_snapshot
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
