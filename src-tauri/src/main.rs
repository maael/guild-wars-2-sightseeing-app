#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use enigo::*;
use std::time::SystemTime;
use std::{thread, time};
mod mumblelink;

#[tauri::command]
fn get_mumble() -> String {
    let result = mumblelink::get_data();
    result
}

#[tauri::command]
fn screenshot() -> SystemTime {
    let mut enigo = Enigo::new();
    let wait_time = time::Duration::from_millis(500);

    enigo.key_down(Key::Alt);
    enigo.key_click(Key::Tab);
    enigo.key_up(Key::Alt);

    thread::sleep(wait_time);

    enigo.key_down(Key::Control);
    enigo.key_down(Key::Shift);
    enigo.key_click(Key::Layout('h'));
    enigo.key_up(Key::Shift);
    enigo.key_up(Key::Control);

    thread::sleep(wait_time);

    enigo.key_down(Key::Alt);
    enigo.key_click(Key::Layout('p'));
    enigo.key_up(Key::Alt);

    thread::sleep(wait_time);

    enigo.key_down(Key::Control);
    enigo.key_down(Key::Shift);
    enigo.key_click(Key::Layout('h'));
    enigo.key_up(Key::Shift);
    enigo.key_up(Key::Control);

    thread::sleep(wait_time);

    enigo.key_down(Key::Alt);
    enigo.key_click(Key::Tab);
    enigo.key_up(Key::Alt);

    SystemTime::now()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_mumble, screenshot])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
