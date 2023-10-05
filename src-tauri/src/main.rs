// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

pub fn main() {
  run_app()
}

#[cfg(mobile)]
fn run_app() {
  app::AppBuilder::new().run();
}

#[cfg(desktop)]
fn run_app() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
