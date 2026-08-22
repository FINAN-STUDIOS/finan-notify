local RESOURCE_NAME = GetCurrentResourceName()
local VALID_TYPES = { success = true, error = true, info = true, warning = true }

local function debugLog(message)
    if Config.Debug then
        print(('[%s] %s'):format(RESOURCE_NAME, message))
    end
end

local function cleanText(value, maximumLength)
    if value == nil then return nil end

    local text = tostring(value):gsub('^%s+', ''):gsub('%s+$', '')
    if text == '' then return nil end

    return text:sub(1, maximumLength)
end

local function defaultTitle(notificationType)
    local locale = Locales[Config.Locale] or Locales.en or {}
    return locale[notificationType] or notificationType
end

local function normalize(payload, title, message, duration)
    if type(payload) ~= 'table' then
        payload = {
            type = payload,
            title = title,
            message = message,
            duration = duration
        }
    end

    local notificationType = tostring(payload.type or Config.Defaults.type):lower()
    if not VALID_TYPES[notificationType] then
        debugLog(('Rejected unsupported notification type: %s'):format(notificationType))
        return nil
    end

    local normalizedMessage = cleanText(payload.message, Config.Limits.messageLength)
    if not normalizedMessage then
        debugLog('Rejected notification without a message')
        return nil
    end

    local normalizedDuration = tonumber(payload.duration) or Config.Defaults.duration
    normalizedDuration = math.floor(math.max(Config.Limits.minDuration, math.min(Config.Limits.maxDuration, normalizedDuration)))

    return {
        type = notificationType,
        title = cleanText(payload.title, Config.Limits.titleLength) or defaultTitle(notificationType),
        message = normalizedMessage,
        duration = normalizedDuration
    }
end

local function notify(payload, title, message, duration)
    local notification = normalize(payload, title, message, duration)
    if not notification then return false end

    SendNUIMessage({ action = 'notify', notification = notification })
    return true
end

RegisterNetEvent('finan_notify:notify', function(payload)
    notify(payload)
end)

exports('Notify', notify)

local function configureUI()
    SendNUIMessage({
        action = 'configure',
        config = Config.UI
    })
end

RegisterNUICallback('ready', function(_, callback)
    configureUI()
    callback({ ok = true })
end)

CreateThread(configureUI)
