local RESOURCE_NAME = GetCurrentResourceName()
local lastRequest = {}

local function notifyPlayer(target, payload)
    target = tonumber(target)
    if not target or target <= 0 then
        print(('[%s] NotifyPlayer received an invalid player ID.'):format(RESOURCE_NAME))
        return false
    end

    if type(payload) ~= 'table' then
        print(('[%s] NotifyPlayer requires a notification table.'):format(RESOURCE_NAME))
        return false
    end

    TriggerClientEvent('finan_notify:notify', target, payload)
    return true
end

exports('NotifyPlayer', notifyPlayer)

RegisterNetEvent('finan_notify:server:notify', function(payload)
    if not Config.ServerEvent.enabled then return end

    local playerId = source
    local now = GetGameTimer()
    if lastRequest[playerId] and now - lastRequest[playerId] < Config.ServerEvent.cooldown then return end

    lastRequest[playerId] = now
    notifyPlayer(playerId, payload)
end)

AddEventHandler('playerDropped', function()
    lastRequest[source] = nil
end)

