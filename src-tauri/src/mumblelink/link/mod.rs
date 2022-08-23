//! Guild Wars 2 Mumble Link API.

pub mod mumble;

use kernel32;
use winapi_old;
use serde::{Deserialize, Serialize};

use std::{io, mem, ptr};
use libc::{c_void, wchar_t};

use self::mumble::*;

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
	pub uisz: u16
}

pub struct GW2 {
	last_tick: u32,
	handle: winapi_old::HANDLE,
	linked_mem: *mut c_void
}

impl GW2 {
	pub fn new() -> Result<Self, io::Error> {
		let linked_mem_size = mem::size_of::<LinkedMem>();
		let mut shared_file: Vec<wchar_t> = "MumbleLink".chars()
			.map(|c| c as wchar_t)
			.collect();

		// NULL terminated string
		shared_file.push(0);

		unsafe {
			let handle = kernel32::CreateFileMappingW(
				winapi_old::shlobj::INVALID_HANDLE_VALUE,
				0 as *mut winapi_old::minwinbase::SECURITY_ATTRIBUTES,
				winapi_old::winnt::PAGE_READWRITE,
				0,
				linked_mem_size as u32,
				shared_file.as_ptr()
			);
			if handle.is_null() {
				return Err(io::Error::last_os_error().into());
			}

			let pointer = kernel32::MapViewOfFile(
				handle,
				winapi_old::FILE_READ_ACCESS,
				0,
				0,
				linked_mem_size as u64,
			);
			if pointer.is_null() {
				kernel32::CloseHandle(handle);
				return Err(io::Error::last_os_error().into());
			}

			Ok(GW2 {
				last_tick: 0,
				handle: handle,
				linked_mem: pointer as *mut c_void
			})
		}
	}

	pub fn tick(&mut self) -> Option<LinkedMem> {
		let link = unsafe { ptr::read_volatile(self.linked_mem as *const LinkedMem) };

		match link.ui_tick() > self.last_tick {
			true => {
				self.last_tick = link.ui_tick();
				Some(link)
			},
			false => None
		}
	}
}

impl Drop for GW2 {
	fn drop(&mut self) {
		unsafe {
			kernel32::CloseHandle(self.handle);
		}
	}
}