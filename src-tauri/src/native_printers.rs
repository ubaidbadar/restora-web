//! First-party Windows printing. No localhost listener, agent process, or pairing protocol.
use crate::slips;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::HashSet,
    fs::{self, OpenOptions},
    io::Write,
    path::PathBuf,
    sync::Mutex,
};
use tauri::{State, WebviewWindow};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PrinterInfo {
    name: String,
    is_default: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrintRequest {
    branch_id: String,
    order_key: String,
    kind: String,
    order: slips::Order,
    #[serde(default)]
    header: slips::Header,
    #[serde(default)]
    logo_data: Option<Vec<u8>>,
    #[serde(default)]
    width: Option<usize>,
    #[serde(default)]
    copies: Option<u32>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PrintResult {
    printer: String,
    printed: bool,
    duplicate: bool,
}

pub struct PrintState {
    journal: PathBuf,
    printed: Mutex<Result<HashSet<String>, String>>,
}

impl PrintState {
    pub fn new(dir: PathBuf) -> Self {
        let journal = dir.join("printed_slips.log");
        let saved = match fs::read_to_string(&journal) {
            Ok(value) => Ok(value.lines().map(str::to_string).collect()),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(HashSet::new()),
            Err(error) => Err(format!("Cannot read native print history: {error}")),
        };
        Self {
            journal,
            printed: Mutex::new(saved),
        }
    }

    fn submit(&self, request: PrintRequest) -> Result<PrintResult, String> {
        if request.branch_id.trim().is_empty()
            || request.branch_id.len() > 100
            || request.order_key.trim().is_empty()
            || request.order_key.len() > 200
            || !matches!(request.kind.as_str(), "kitchen" | "receipt")
            || request.order.items.is_empty()
            || request.order.items.len() > 200
        {
            return Err("Invalid or unscoped print request".into());
        }
        let width = request.width.unwrap_or(48);
        if !matches!(width, 32 | 48) {
            return Err("Paper width must be 58 or 80 mm".into());
        }
        let copies = request.copies.unwrap_or(1);
        if !(1..=5).contains(&copies) {
            return Err("The maximum is five copies".into());
        }
        let printer =
            default_printer().ok_or("Set a Windows default thermal printer before printing")?;
        let installed = enumerate_printers()?;
        if !installed.iter().any(|name| name == &printer) {
            return Err("The Windows default printer is not currently installed".into());
        }

        let mut header = request.header;
        header.logo_file = request
            .logo_data
            .filter(|data| data.len() <= 2 * 1024 * 1024);
        let bytes = slips::render(&request.kind, &request.order, &header, width)
            .ok_or("Unsupported print job")?;
        if bytes.len() > 500_000 {
            return Err("Print job is too large".into());
        }

        // Serializes this desktop's printer submissions and repeated event deliveries.
        let mut saved = self
            .printed
            .lock()
            .map_err(|_| "Native print history lock failed")?;
        let keys = saved.as_mut().map_err(|e| e.clone())?;
        let mut printed_any = false;
        for copy in 0..copies {
            let mut hasher = Sha256::new();
            for part in [
                &request.branch_id,
                &request.order_key,
                &request.kind,
                &printer,
            ] {
                hasher.update(part.as_bytes());
                hasher.update([0]);
            }
            hasher.update(copy.to_le_bytes());
            let marker = format!("{:x}", hasher.finalize());
            if keys.contains(&marker) {
                continue;
            }

            submit_raw(&printer, &bytes)?;
            // Write and flush AFTER successful Windows submission, before returning
            // to JS. This prevents replay after normal app restarts.
            let parent = self
                .journal
                .parent()
                .ok_or("Invalid native print journal path")?;
            fs::create_dir_all(parent).map_err(|e| {
                format!("Windows accepted the slip, but cannot create print history: {e}")
            })?;
            let mut file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&self.journal)
                .map_err(|e| {
                    format!("Windows accepted the slip, but cannot open print history: {e}")
                })?;
            writeln!(file, "{marker}")
                .and_then(|()| file.sync_data())
                .map_err(|e| format!("Windows accepted the slip, but cannot save print history. Check the paper before retrying: {e}"))?;
            keys.insert(marker);
            printed_any = true;
        }

        Ok(PrintResult {
            printer,
            printed: printed_any,
            duplicate: !printed_any,
        })
    }
}

fn trusted_caller(webview: &WebviewWindow) -> Result<(), String> {
    let url = webview.url().map_err(|e| e.to_string())?;
    let production = url.scheme() == "https" && url.host_str() == Some("app.restora.live");
    let local_dev = cfg!(debug_assertions)
        && url.scheme() == "http"
        && matches!(url.host_str(), Some("localhost") | Some("127.0.0.1"))
        && url.port() == Some(3000);
    if webview.label() != "main" || !(production || local_dev) {
        return Err("Native printers are available only to Restora POS".into());
    }
    Ok(())
}

/// Only React can mark the desktop UI ready; the Windows test checks the
/// native window title, not merely that the process or WebView2 shell exists.
#[tauri::command]
pub fn native_desktop_ready(webview: WebviewWindow) -> Result<(), String> {
    trusted_caller(&webview)?;
    webview
        .set_title("Restora POS - Ready")
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn native_printers(webview: WebviewWindow) -> Result<Vec<PrinterInfo>, String> {
    trusted_caller(&webview)?;
    tauri::async_runtime::spawn_blocking(|| {
        let default = default_printer();
        Ok(enumerate_printers()?
            .into_iter()
            .map(|name| PrinterInfo {
                is_default: default.as_deref() == Some(name.as_str()),
                name,
            })
            .collect())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn native_print(
    webview: WebviewWindow,
    state: State<'_, std::sync::Arc<PrintState>>,
    request: PrintRequest,
) -> Result<PrintResult, String> {
    trusted_caller(&webview)?;
    // Windows spooler calls block (including bad printer drivers); isolate from UI.
    // State is owned by the Tauri process, not a background network server.
    let worker = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || worker.submit(request))
        .await
        .map_err(|error| error.to_string())?
}

#[cfg(windows)]
fn default_printer() -> Option<String> {
    use windows::Win32::Graphics::Printing::GetDefaultPrinterW;
    use windows::core::PWSTR;
    let mut required = 0u32;
    let _ = unsafe { GetDefaultPrinterW(None, &mut required) };
    if required == 0 || required > 4096 {
        return None;
    }
    let mut buffer = vec![0u16; required as usize];
    if !unsafe { GetDefaultPrinterW(Some(PWSTR(buffer.as_mut_ptr())), &mut required) }.as_bool() {
        return None;
    }
    let end = buffer.iter().position(|c| *c == 0).unwrap_or(buffer.len());
    String::from_utf16(&buffer[..end])
        .ok()
        .filter(|name| !name.is_empty())
}

#[cfg(not(windows))]
fn default_printer() -> Option<String> {
    None
}

#[cfg(windows)]
fn enumerate_printers() -> Result<Vec<String>, String> {
    use windows::Win32::Graphics::Printing::{
        EnumPrintersW, PRINTER_ENUM_CONNECTIONS, PRINTER_ENUM_LOCAL, PRINTER_INFO_4W,
    };
    use windows::core::PWSTR;
    let mut needed = 0u32;
    let mut count = 0u32;
    let flags = PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS;
    let _ = unsafe { EnumPrintersW(flags, PWSTR::null(), 4, None, &mut needed, &mut count) };
    if needed == 0 {
        return Ok(Vec::new());
    }
    // u64-backed storage ensures pointer alignment for PRINTER_INFO_4W.
    let mut storage = vec![0u64; (needed as usize).div_ceil(8)];
    let bytes = unsafe {
        std::slice::from_raw_parts_mut(storage.as_mut_ptr().cast::<u8>(), storage.len() * 8)
    };
    unsafe {
        EnumPrintersW(
            flags,
            PWSTR::null(),
            4,
            Some(bytes),
            &mut needed,
            &mut count,
        )
    }
    .map_err(|error| format!("Windows printer discovery failed: {error}"))?;
    let records = unsafe {
        std::slice::from_raw_parts(storage.as_ptr().cast::<PRINTER_INFO_4W>(), count as usize)
    };
    Ok(records
        .iter()
        .filter_map(|row| unsafe { row.pPrinterName.to_string().ok() })
        .filter(|name| !name.is_empty())
        .collect())
}

#[cfg(not(windows))]
fn enumerate_printers() -> Result<Vec<String>, String> {
    Err("Native printer discovery requires Windows".into())
}

fn printer_problem(status: u32) -> Option<&'static str> {
    const STATUS: &[(u32, &str)] = &[
        (0x0000_0080, "Windows reports the printer is offline"),
        (0x0000_0001, "Windows reports the printer is paused"),
        (0x0000_0010, "Windows reports the printer is out of paper"),
        (0x0000_0008, "Windows reports a paper jam"),
        (0x0000_0040, "Windows reports a paper problem"),
        (0x0040_0000, "Windows reports the printer cover is open"),
        (0x0010_0000, "Windows reports the printer needs attention"),
        (0x0000_1000, "Windows reports the printer is unavailable"),
        (0x0000_0002, "Windows reports a printer error"),
    ];
    STATUS
        .iter()
        .find(|(flag, _)| status & flag != 0)
        .map(|(_, message)| *message)
}

#[cfg(windows)]
fn submit_raw(printer: &str, bytes: &[u8]) -> Result<(), String> {
    use windows::Win32::Graphics::Printing::{
        AbortPrinter, ClosePrinter, DOC_INFO_1W, EndDocPrinter, EndPagePrinter, GetPrinterW,
        OpenPrinterW, PRINTER_HANDLE, StartDocPrinterW, StartPagePrinter, WritePrinter,
    };
    use windows::core::{PCWSTR, PWSTR};
    let utf16 = |value: &str| value.encode_utf16().chain(Some(0)).collect::<Vec<u16>>();
    let name = utf16(printer);
    let mut handle = PRINTER_HANDLE::default();
    unsafe { OpenPrinterW(PCWSTR(name.as_ptr()), &mut handle, None) }
        .map_err(|e| format!("Cannot open Windows printer: {e}"))?;
    let result = (|| {
        let mut needed = 0u32;
        let _ = unsafe { GetPrinterW(handle, 6, None, &mut needed) };
        if needed == 4 {
            let mut status = [0u8; 4];
            if unsafe { GetPrinterW(handle, 6, Some(&mut status), &mut needed) }.is_ok()
                && let Some(problem) = printer_problem(u32::from_le_bytes(status))
            {
                return Err(problem.to_string());
            }
        }
        let mut title = utf16("Restora POS receipt");
        let mut datatype = utf16("RAW");
        let document = DOC_INFO_1W {
            pDocName: PWSTR(title.as_mut_ptr()),
            pOutputFile: PWSTR::null(),
            pDatatype: PWSTR(datatype.as_mut_ptr()),
        };
        if unsafe { StartDocPrinterW(handle, 1, &document) } == 0 {
            return Err("Windows could not start the print job".into());
        }
        if !unsafe { StartPagePrinter(handle) }.as_bool() {
            unsafe {
                let _ = AbortPrinter(handle);
            }
            return Err("Windows could not begin the print page".into());
        }
        let mut written = 0u32;
        let write_ok = unsafe {
            WritePrinter(
                handle,
                bytes.as_ptr().cast(),
                bytes.len() as u32,
                &mut written,
            )
        }
        .as_bool()
            && written as usize == bytes.len();
        let page_ok = unsafe { EndPagePrinter(handle) }.as_bool();
        if !write_ok || !page_ok {
            unsafe {
                let _ = AbortPrinter(handle);
            }
            return Err("The Windows printer did not accept the complete slip".into());
        }
        if !unsafe { EndDocPrinter(handle) }.as_bool() {
            unsafe {
                let _ = AbortPrinter(handle);
            }
            return Err("Windows could not finish the print job".into());
        }
        Ok(())
    })();
    unsafe {
        let _ = ClosePrinter(handle);
    }
    result
}

#[cfg(not(windows))]
fn submit_raw(_printer: &str, _bytes: &[u8]) -> Result<(), String> {
    Err("Native receipt printing requires Windows".into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn identifies_known_offline_states_without_guessing() {
        assert!(printer_problem(0x80).is_some());
        assert!(printer_problem(0x10).is_some());
        assert!(printer_problem(0x400000).is_some());
        assert_eq!(printer_problem(0), None);
    }

    #[test]
    fn journal_survives_restart_and_prevents_duplicate_key() {
        let dir =
            std::env::temp_dir().join(format!("restora-native-print-test-{}", std::process::id()));
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("printed_slips.log"), "abc123\n").unwrap();
        let state = PrintState::new(dir.clone());
        assert!(
            state
                .printed
                .lock()
                .unwrap()
                .as_ref()
                .unwrap()
                .contains("abc123")
        );
        let _ = fs::remove_dir_all(dir);
    }
}
