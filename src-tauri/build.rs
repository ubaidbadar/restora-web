fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(
            tauri_build::AppManifest::new().commands(&["native_printers", "native_print"]),
        ),
    )
    .expect("Could not generate Restora's restricted native-print permissions");
}
