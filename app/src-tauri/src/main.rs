#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use enigo::*;
use mumblelink_reader::mumble_link::{MumbleLinkDataReader, MumbleLinkReader};
use mumblelink_reader::mumble_link_handler::MumbleLinkHandler;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::time::SystemTime;
use std::{thread, time};

#[derive(Copy, Clone, Debug)]
#[repr(C)]
struct GuildwarsContext {
    pub server_address: [u8; 28],
    pub map_id: u32,
    pub map_type: u32,
    pub shard_id: u32,
    pub instance: u32,
    pub build_id: u32,
    pub ui_state: u32,
    pub compass_width: u16,
    pub compass_height: u16,
    pub compass_rotation: f32,
    pub player_x: f32,
    pub player_y: f32,
    pub map_center_x: f32,
    pub map_center_y: f32,
    pub map_scale: f32,
    pub process_id: u32,
    pub mount_index: u8,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GW2Identity {
    pub name: String,
    pub profession: u16,
    pub spec: u16,
    pub race: u16,
    pub map_id: u16,
    pub world_id: u32,
    pub team_color_id: u16,
    pub commander: bool,
    pub map: u16,
    pub fov: f32,
    pub uisz: u16,
}

#[tauri::command]
fn get_mumble() -> String {
    let handler = MumbleLinkHandler::new().unwrap();
    let linked_memory = handler.read().unwrap();
    let context = linked_memory.read_context_into_struct::<GuildwarsContext>();

    let identity: Result<GW2Identity, serde_json::Error> =
        serde_json::from_str(&linked_memory.identity);
    let default_identity: GW2Identity = GW2Identity {
        name: String::from(""),
        profession: 0,
        spec: 0,
        race: 0,
        map_id: 0,
        world_id: 0,
        team_color_id: 0,
        commander: false,
        map: 0,
        fov: 0.0,
        uisz: 0,
    };
    let safe_identity = identity.unwrap_or(default_identity);

    let result = json!({
        "type": "link",
        "ui_version": linked_memory.ui_version,
        "ui_tick": linked_memory.ui_tick,
        "avatar": {
            "position": linked_memory.avatar.position,
            "front": linked_memory.avatar.front,
            "top": linked_memory.avatar.top
        },
        "name": linked_memory.name,
        "identity": {
            "name": safe_identity.name,
            "profession": safe_identity.profession,
            "spec": safe_identity.spec,
            "race": safe_identity.race,
            "map_id": safe_identity.map_id,
            "world_id": safe_identity.world_id,
            "team_color_id": safe_identity.team_color_id,
            "commander": safe_identity.commander,
            "map": safe_identity.map,
            "fov": safe_identity.fov,
            "uisz": safe_identity.uisz,
        },
        "camera": {
            "position": linked_memory.camera.position,
            "front": linked_memory.camera.front,
            "top": linked_memory.camera.top
        },
        "context_len": linked_memory.context_len,
        "context": {
            "server_address": context.server_address,
            "map_id": context.map_id,
            "map_type": context.map_type,
            "shard_id": context.shard_id,
            "instance": context.instance,
            "build_id": context.build_id,
            "ui_state": context.ui_state,
            "compass_width": context.compass_width,
            "compass_height": context.compass_height,
            "compass_rotation": context.compass_rotation,
            "player_x": context.player_x,
            "player_y": context.player_y,
            "map_center_x": context.map_center_x,
            "map_center_y": context.map_center_y,
            "map_scale": context.map_scale,
            "process_id": context.process_id,
            "mount_index": context.mount_index,
        },
        "description": linked_memory.description,
    })
    .to_string();

    if safe_identity.name == String::from("") {
        return json!({"error": "No identity"}).to_string();
    } else {
        return result;
    }
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
