local RESOURCE_NAME = GetCurrentResourceName()
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
