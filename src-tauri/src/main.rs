#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod mumblelink;

#[tauri::command]
fn get_mumble() -> String {
    let result = mumblelink::get_data();
    result
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_mumble])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
