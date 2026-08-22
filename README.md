# FINAN Notify

FINAN Notify is a polished, lightweight notification resource for FiveM. It provides a consistent UI for standalone servers and projects using ESX, QBCore, or Qbox—without requiring any framework.

**Version:** 1.0.0  
**Category:** Free Resource  
**Author:** FINAN STUDIOS

## Features

- Four notification types: `success`, `error`, `info`, and `warning`
- Framework-agnostic client event and export APIs
- Server export for trusted server-side resources
- Queue with configurable simultaneous notification limit
- Bounded waiting queue with oldest-entry replacement
- Responsive black-and-white interface with accessible live regions
- Automatic dismissal, progress indicator, and pause on hover
- Configurable position, duration, dimensions, spacing, and animation speed
- Input validation and text length limits
- No runtime dependencies and no polling loops
- English and German default titles
- Asset Escrow-ready manifest with editable configuration and locales

## Installation

1. Download the release archive and extract `finan_notify` into your server's `resources` directory.
2. Keep the folder name exactly `finan_notify` so export calls remain consistent.
3. Add the following line to `server.cfg`:

   ```cfg
   ensure finan_notify
   ```

4. Restart the server or run `ensure finan_notify` in the server console.

No database, build step, or framework is required.

## Configuration

All public settings are in `config.lua`.

| Setting | Purpose | Default |
| --- | --- | --- |
| `Config.Locale` | Default title language (`en` or `de`) | `en` |
| `Config.Debug` | Enables rejected-input diagnostics | `false` |
| `Config.Defaults` | Default type and duration | `info`, `5000` ms |
| `Config.UI.position` | Stack position on screen | `top-right` |
| `Config.UI.maxVisible` | Maximum visible notifications | `5` |
| `Config.UI.maxQueued` | Maximum waiting notifications | `25` |
| `Config.UI.showProgress` | Shows the lifetime indicator | `true` |
| `Config.UI.pauseOnHover` | Pauses dismissal while hovered | `true` |
| `Config.Limits` | Duration and text safety limits | See file |

Supported positions are `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, and `bottom-right`.

## Client export

The positional API is the quickest integration:

```lua
exports['finan_notify']:Notify(
    'success',
    'Garage',
    'Vehicle retrieved successfully',
    5000
)
```

The same export accepts a table:

```lua
exports['finan_notify']:Notify({
    type = 'warning',
    title = 'Fuel',
    message = 'Your fuel level is low',
    duration = 6500
})
```

The export returns `true` when the notification was accepted and `false` when validation rejected it.

## Events

### Client event

Use this from client code, or trigger it from trusted server code for a player:

```lua
TriggerEvent('finan_notify:notify', {
    type = 'info',
    title = 'Dispatch',
    message = 'A new call is available'
})
```

```lua
TriggerClientEvent('finan_notify:notify', source, {
    type = 'success',
    title = 'Garage',
    message = 'Vehicle retrieved successfully'
})
```

## Server export

Server scripts can send a notification without triggering the event directly:

```lua
exports['finan_notify']:NotifyPlayer(source, {
    type = 'success',
    title = 'Payment',
    message = 'Payment received',
    duration = 4000
})
```

## Framework usage

FINAN Notify does not import or initialize a framework. Use its API inside any framework callback or event.

### ESX

```lua
ESX.RegisterServerCallback('garage:storeVehicle', function(source, cb)
    -- Your garage logic
    exports['finan_notify']:NotifyPlayer(source, {
        type = 'success', title = 'Garage', message = 'Vehicle stored'
    })
    cb(true)
end)
```

### QBCore

```lua
QBCore.Functions.CreateCallback('garage:server:store', function(source, cb)
    exports['finan_notify']:NotifyPlayer(source, {
        type = 'success', title = 'Garage', message = 'Vehicle stored'
    })
    cb(true)
end)
```

### Qbox

```lua
lib.callback.register('garage:server:store', function(source)
    exports['finan_notify']:NotifyPlayer(source, {
        type = 'success', title = 'Garage', message = 'Vehicle stored'
    })
    return true
end)
```

The Qbox example uses its existing callback facility; FINAN Notify itself does not depend on `ox_lib`.

## Troubleshooting

**The UI does not appear**  
Confirm the folder is named `finan_notify`, the resource is started, and the F8 console contains no resource errors. Test with the client event example.

**An export cannot be found**  
Start FINAN Notify before the calling resource. Use `dependency 'finan_notify'` in the caller's manifest when the integration requires it.

**A notification is rejected**  
Only the four documented lowercase types are accepted and `message` must not be empty. Set `Config.Debug = true` temporarily for client diagnostics.

**Notifications are cut short or remain too long**  
Requested durations are clamped between `Config.Limits.minDuration` and `Config.Limits.maxDuration`.

**The title is unexpected**  
Omitting `title` uses the matching entry in the configured locale. Add another locale file and set `Config.Locale` to its key to localize it.

## Performance and security

The resource has no permanent Lua loop. Work is performed only on resource startup or when a notification arrives, so idle client script time should report approximately `0.00 ms`. NUI content is written using `textContent`; notification text is never interpreted as HTML. Both Lua and NUI validate notification types, text, and duration. The bounded waiting queue prevents unrestrained memory growth during bursts. FINAN Notify intentionally exposes no client-to-server notification event; clients should use the local export or event, while trusted server resources use `NotifyPlayer`.

## License

Copyright © 2026 FINAN STUDIOS. Distributed under the proprietary [FINAN STUDIOS License](LICENSE). Commercial server use is permitted under its terms; redistribution, resale, and authorship claims are prohibited.

## Support

When reporting an issue, include the FINAN Notify version, FiveM artifact version, framework (if any), reproduction steps, and relevant console output. Do not include credentials or server secrets.
