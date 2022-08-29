extern crate kernel32;
extern crate winapi_old;

use std::io;
use libc::{c_void, wchar_t};

macro_rules! wide {
	($($ch:ident)*) => {
			[$(stringify!($ch).as_bytes()[0] as ::libc::wchar_t,)* 0]
	}
}

pub fn read(src: &[wchar_t]) -> String {
    let zero = src.iter().position(|&c| c == 0).unwrap_or(src.len());
    String::from_utf16_lossy(&src[..zero])
}

pub struct Map {
    handle: winapi_old::HANDLE,
    pub ptr: *mut c_void,
}

#[allow(dead_code)]
impl Map {
    pub fn new(size: usize) -> io::Result<Map> {
        unsafe {
            let handle = kernel32::OpenFileMappingW(
              winapi_old::FILE_MAP_ALL_ACCESS,
              winapi_old::FALSE,
                wide!(M u m b l e L i n k).as_ptr(),
            );
            if handle.is_null() {
                return Err(io::Error::last_os_error());
            }
            let ptr = kernel32::MapViewOfFile(
                handle,
                winapi_old::FILE_MAP_ALL_ACCESS,
                0,
                0,
                size as u64,
            );
            if ptr.is_null() {
                kernel32::CloseHandle(handle);
                return Err(io::Error::last_os_error());
            }
            Ok(Map {
                handle: handle,
                ptr: ptr as *mut c_void,
            })
        }
    }
}

impl Drop for Map {
    fn drop(&mut self) {
        unsafe {
            kernel32::CloseHandle(self.handle);
        }
    }
}