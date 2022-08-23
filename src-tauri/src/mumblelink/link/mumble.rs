use libc::{c_float, wchar_t};

#[cfg_attr(windows, path="imp.rs")]
mod imp;



// Try to figure out if we're just not matching https://github.com/maael/observatory/blob/main/app/python/mumblelink/dessa.py

#[derive(Copy, Clone)]
#[repr(C)]
pub struct Position {
	/// The character's position in space.
	pub position: [f32; 3],
	/// A unit vector pointing out of the character's eyes.
	pub front: [f32; 3],
	/// A unit vector pointing out of the top of the character's head.
	pub top: [f32; 3]
}

// `f32` is used above for tidyness; assert that it matches c_float.
const _ASSERT_CFLOAT_IS_F32: c_float = 0f32;

impl Default for Position {
	fn default() -> Self {
		Position {
			position: [0., 0., 0.],
			front: [0., 0., 1.],
			top: [0., 1., 0.],
		}
	}
}

#[derive(Copy, Clone)]
#[repr(C)]
pub struct Context {
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

impl Default for Context {
	fn default() -> Self {
		Context {
			server_address: [0; 28],
			map_id: 0,
			map_type: 0,
			shard_id: 0,
			instance: 0,
			build_id: 0,
			ui_state: 0,
			compass_width: 0,
			compass_height: 0,
			compass_rotation: 0.,
			player_x: 0.,
			player_y: 0.,
			map_center_x: 0.,
			map_center_y: 0.,
			map_scale: 0.,
			process_id: 0,
			mount_index: 0,
		}
	}
}

#[derive(Copy)]
#[repr(C)]
pub struct LinkedMem {
	ui_version: u32,
	ui_tick: u32,
	avatar: Position,
	name: [wchar_t; 256],
	camera: Position,
	identity: [wchar_t; 256],
	context_len: u32,
	context: Context,
	description: [wchar_t; 2048],
}

#[allow(dead_code)]
impl LinkedMem {
	pub fn ui_version(&self) -> u32 {
		self.ui_version
	}

	pub fn ui_tick(&self) -> u32 {
		self.ui_tick
	}

	pub fn avatar(&self) -> Position {
		self.avatar.clone()
	}

	pub fn name(&self) -> String {
		imp::read(&self.name)
	}

	pub fn camera(&self) -> Position {
		self.camera.clone()
	}

	pub fn identity(&self) -> String {
		imp::read(&self.identity)
	}

	pub fn context_len(&self) -> u32 {
		self.context_len
	}

	pub fn context(&self) -> Context {
		self.context.clone()
	}

	pub fn description(&self) -> String {
		imp::read(&self.description)
	}
}

impl Default for LinkedMem {
	fn default() -> Self {
		LinkedMem {
			ui_version: 0,
			ui_tick: 0,
			avatar: Position::default(),
			name: [0; 256],
			camera: Position::default(),
			identity: [0; 256],
			context_len: 0,
			context: Context::default(),
			description: [0; 2048]
		}
	}
}

impl Clone for LinkedMem {
	fn clone(&self) -> Self {
		*self
	}
}