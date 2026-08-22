# Changelog

All notable changes to FINAN Notify are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-08-22

### Added

- Standalone notification API with ESX, QBCore, and Qbox compatibility
- Success, error, information, and warning variants
- Client event and positional/table export interfaces
- Server export for trusted server-side resources
- Responsive NUI with queueing, stacking, progress, hover pause, and motion preferences
- English and German default-title locales
- Central configuration, validation, documentation, and release package checks

### Security

- Removed the unnecessary public client-to-server notification relay
- Added a configurable bounded waiting queue with oldest-entry replacement
- Added complete defense-in-depth NUI schema validation
- Rejected non-finite durations before forwarding data to the NUI

[1.0.0]: https://github.com/FINAN-STUDIOS/finan-notify/releases/tag/v1.0.0
