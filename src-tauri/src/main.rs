#![cfg_attr(all(windows, not(debug_assertions)), windows_subsystem = "windows")]
mod escpos;
mod logo;
mod native_printers;
mod slips;

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, webview::NewWindowResponse};

const APP_URL: &str = "https://app.restora.live/index.html";

fn trusted_navigation(url: &tauri::Url) -> bool {
    if url.as_str() == "about:blank" {
        return true;
    }
    if cfg!(debug_assertions)
        && url.scheme() == "http"
        && url.port() == Some(3000)
        && matches!(url.host_str(), Some("localhost") | Some("127.0.0.1"))
    {
        return true;
    }
    url.scheme() == "https"
        && matches!(
            url.host_str(),
            Some("app.restora.live")
                | Some("restora.live")
                | Some("accounts.google.com")
                | Some("www.facebook.com")
                | Some("business.facebook.com")
        )
}

/// Open safe external links in the user's default browser. New Tauri
/// webviews would not have our local-file mapping and could expose untrusted UI.
fn external_link(url: &tauri::Url) -> bool {
    matches!(url.scheme(), "https" | "mailto" | "tel")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            native_printers::native_printers,
            native_printers::native_print,
            native_printers::native_desktop_ready,
        ])
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            app.manage(std::sync::Arc::new(native_printers::PrintState::new(app.path().app_local_data_dir()?)));

            // Development uses Vite. The production window starts blank so it
            // cannot make a network request before local assets are mapped.
            let url = if cfg!(debug_assertions) {
                WebviewUrl::App("index.html".into())
            } else {
                WebviewUrl::External("about:blank".parse()?)
            };
            let window = WebviewWindowBuilder::new(app, "main", url)
                .title("Restora POS")
                .inner_size(1320.0, 880.0)
                .min_inner_size(900.0, 620.0)
                .background_color(tauri::window::Color(246, 247, 249, 255))
                .initialization_script(
                    "if (location.origin === 'https://app.restora.live' || (location.origin === 'http://localhost:3000' || location.origin === 'http://127.0.0.1:3000')) { Object.defineProperty(window, '__RESTORA_DESKTOP__', { value: true }); }",
                )
                .on_navigation(trusted_navigation)
                .on_new_window(|url, _| {
                    // WhatsApp, support, maps and email links should work in
                    // the system browser without creating remote Tauri windows.
                    if external_link(&url) {
                        let _ = tauri_plugin_opener::open_url(url.as_str(), None::<&str>);
                    }
                    NewWindowResponse::Deny
                })
                .build()?;

            #[cfg(windows)]
            if !cfg!(debug_assertions) {
                use webview2_com::Microsoft::Web::WebView2::Win32::{
                    COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND, ICoreWebView2_3,
                };
                use windows::core::{HSTRING, Interface};

                // WebView2 serves the compiled React assets from the installer
                // but retains their https://app.restora.live origin. Better Auth
                // HTTP-only cookies and POS device cookies therefore keep their
                // existing same-site semantics, even on an offline cold start.
                let files = app.path().resource_dir()?.join("web");
                if !files.join("index.html").is_file() {
                    return Err(std::io::Error::new(
                        std::io::ErrorKind::NotFound,
                        format!("Packaged Restora React assets missing: {}", files.display()),
                    )
                    .into());
                }
                let path = files.to_string_lossy().into_owned();
                // Map *and navigate* in the same WebView2 UI-thread callback.
                // with_webview dispatches asynchronously; a separate
                // window.navigate() could race the mapping, leaving index.html
                // or its module imports served by the live website instead of
                // by the installed React bundle.
                window.with_webview(move |webview| unsafe {
                    let core = webview
                        .controller()
                        .CoreWebView2()
                        .expect("WebView2 controller unavailable");
                    core.cast::<ICoreWebView2_3>()
                        .expect("WebView2 virtual-host support missing")
                        .SetVirtualHostNameToFolderMapping(
                            &HSTRING::from("app.restora.live"),
                            &HSTRING::from(&path),
                            COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND(2),
                        )
                        .expect("Could not mount bundled React assets");
                })?;
                // Virtual-host mappings are propagated into WebView2 resource
                // loader processes asynchronously. Opening index.html in the
                // same dispatch cycle can load HTML before CSS/JS resolve,
                // leaving only the loading logo. Defer the first navigation.
                let opening_window = window.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(600));
                    if let Ok(url) = APP_URL.parse() {
                        if let Err(error) = opening_window.navigate(url) {
                            eprintln!("Restora POS: bundled page navigation failed: {error}");
                        }
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Failed to start Restora POS");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unsafe_external_links_never_launch_from_the_native_app() {
        for url in [
            "https://wa.me/923001234567",
            "https://maps.google.com/",
            "mailto:help@restora.live",
            "tel:+923001234567",
        ] {
            assert!(external_link(&url.parse().unwrap()), "{url}");
        }
        for url in [
            "file:///C:/Windows",
            "javascript:alert(1)",
            "http://untrusted.example",
        ] {
            assert!(!external_link(&url.parse().unwrap()), "{url}");
        }
    }

    #[test]
    fn keeps_native_window_on_trusted_origins() {
        if cfg!(debug_assertions) {
            assert!(trusted_navigation(
                &"http://localhost:3000/orders/new".parse().unwrap()
            ));
            assert!(trusted_navigation(
                &"http://127.0.0.1:3000/".parse().unwrap()
            ));
        }
        assert!(!trusted_navigation(
            &"http://localhost:3001/".parse().unwrap()
        ));
        for url in [
            "about:blank",
            "https://app.restora.live/index.html",
            "https://app.restora.live/orders/new",
            "https://accounts.google.com/o/oauth2/v2/auth",
        ] {
            assert!(trusted_navigation(&url.parse().unwrap()), "{url}");
        }
        for url in [
            "http://app.restora.live",
            "https://app.restora.live.evil.example",
            "https://untrusted.example",
            "file:///C:/Windows/win.ini",
            "javascript:alert(1)",
        ] {
            assert!(!trusted_navigation(&url.parse().unwrap()), "{url}");
        }
    }
}
