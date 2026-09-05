fx_version 'cerulean'
game 'gta5'

author 'FINAN STUDIOS'
description 'A modern, framework-agnostic notification system for FiveM.'
version '1.0.2'

ui_page 'html/index.html'

shared_scripts {
    'config.lua',
    'locales/*.lua'
}

client_script 'client/client.lua'
server_script 'server/server.lua'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js'
}

escrow_ignore {
    'config.lua',
    'locales/*.lua'
}
