Config = {}

Config.Locale = 'en'
Config.Debug = false

Config.Defaults = {
    type = 'info',
    title = nil,
    duration = 5000
}

Config.UI = {
    position = 'top-right', -- top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    maxVisible = 5,
    maxQueued = 25, -- oldest queued notification is replaced when this limit is reached
    gap = 10,
    edgeOffset = 24,
    width = 380,
    animationDuration = 320,
    showProgress = true,
    pauseOnHover = true,
    playSound = false,
    soundVolume = 0.18
}

Config.Limits = {
    minDuration = 1000,
    maxDuration = 30000,
    titleLength = 64,
    messageLength = 280
}
