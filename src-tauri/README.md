# Restora POS — native Windows printing

This Tauri 2 project is part of **restora-web**, the sole source of its React UI.
It has **no dependency on restora-pc-agent**, no Electron wrapper, no background
print-agent service, no pairing code, and no localhost HTTP listener or port 17777.

Native commands `native_printers` and `native_print` run in the same Rust
process and call the Windows Print Spooler directly, selecting the Windows default
printer without a test print or a duplicate printer-settings screen. Thermal
kitchen and receipt slips use ESC/POS bytes (58/80 mm), with a local durable
print history for offline/duplicate suppression. An accepted spooler job is not
proof that paper physically exited the printer.

The React frontend is compiled from this repository and bundled in the Windows
NSIS installer. The WebView2 virtual-host mapping keeps its cookie/session
origin. The native capability is limited to the main window and only two
commands. The normal hosted website/PWA path remains unchanged.

Native print on order creation happens in the installed POS. Other devices'
cloud-created orders still need a deliberate printer-routing design; do not
assume that this desktop is a central print server. Real 58/80 mm and USB/network
printer testing is required before production deployment.
