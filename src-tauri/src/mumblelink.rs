mod link;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Deserialize, Debug)]
pub struct LinkContext {
    pub map_id: u16,
    pub player_x: f32,
    pub player_y: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LinkedMem {
    pub context: LinkContext,
    pub identity: link::GW2Identity,
}

pub fn get_data() -> std::string::String {
    let mut gw2 = link::GW2::new().expect("Unable to link to Guild Wars 2");

    if let Some(link) = gw2.tick() {
        let identity: link::GW2Identity =
            serde_json::from_str(&link.identity().to_string()).unwrap();
        return json!({
          "type": "link",
          "ui_version": link.ui_version(),
          "ui_tick": link.ui_tick(),
          "avatar": {
            "front": link.avatar().front,
            "position": link.avatar().position,
            "top": link.avatar().top
          },
          "name": link.name(),
          "camera": {
            "front": link.camera().front,
            "position": link.camera().position,
            "top": link.camera().top
          },
          "identity": identity,
          "context_len": link.context_len(),
          "context": {
            "server_address": link.context().server_address,
            "map_id": link.context().map_id,
            "map_type": link.context().map_type,
            "shard_id": link.context().shard_id,
            "instance": link.context().instance,
            "build_id": link.context().build_id,
            "ui_state": link.context().ui_state,
            "compass_width": link.context().compass_width,
            "compass_height": link.context().compass_height,
            "compass_rotation": link.context().compass_rotation,
            "player_x": link.context().player_x,
            "player_y": link.context().player_y,
            "map_center_x": link.context().map_center_x,
            "map_center_y": link.context().map_center_y,
            "map_scale": link.context().map_scale,
            "process_id": link.context().process_id,
            "mount_index": link.context().mount_index,
          },
          "description": link.description(),
        })
        .to_string();
    } else {
        return String::from("{}");
    }
}
