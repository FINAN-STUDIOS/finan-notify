# FINAN Notify v1.0.2

Version 1.0.2 fixes the opaque background that could appear when FINAN Notify was embedded as a FiveM NUI. The forced dark color scheme has been removed while the notification cards retain their original black-and-white design.

This update also adds French and Spanish default notification titles alongside English and German. Missing, blank, invalid, or unknown translations fall back to English. Existing exports and events remain unchanged.

The downloadable archive is now deliberately minimal and ready for Cfx Asset Escrow processing: development tests, internal release documents, and repository metadata are no longer shipped to customers.

## Upgrade

Back up `config.lua`, replace the resource files, merge your settings, and restart `finan_notify`. Set `Config.Locale` to `en`, `de`, `fr`, or `es`.
