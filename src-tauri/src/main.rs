#![cfg_attr(all(windows, not(debug_assertions)), windows_subsystem = "windows")]

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, webview::NewWindowResponse};

const APP_URL: &str = "https://app.restora.live/index.html";

fn trusted_navigation(url: &tauri::Url) -> bool {
    if url.as_str() == "about:blank" {
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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            // Rust printing lives in this process, not in a second Windows agent.
            restora_pc_agent::start_embedded().map_err(std::io::Error::other)?;

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
                    "if (location.origin === 'https://app.restora.live' || location.origin === 'http://localhost:3000') { Object.defineProperty(window, '__RESTORA_DESKTOP__', { value: true }); if (location.pathname === '/index.html') history.replaceState(history.state, '', '/'); }",
                )
                .on_navigation(trusted_navigation)
                .on_new_window(|url, _| {
                    if trusted_navigation(&url) {
                        NewWindowResponse::Allow
                    } else {
                        NewWindowResponse::Deny
                    }
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
                window.with_webview(move |webview| unsafe {
                    webview
                        .controller()
                        .CoreWebView2()
                        .expect("WebView2 controller unavailable")
                        .cast::<ICoreWebView2_3>()
                        .expect("WebView2 virtual-host support missing")
                        .SetVirtualHostNameToFolderMapping(
                            &HSTRING::from("app.restora.live"),
                            &HSTRING::from(&path),
                            COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND(2),
                        )
                        .expect("Could not mount bundled React assets");
                })?;
                window.navigate(APP_URL.parse()?)?;
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
    fn keeps_native_window_on_trusted_origins() {
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
