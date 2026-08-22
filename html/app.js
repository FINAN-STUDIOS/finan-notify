(() => {
    'use strict';

    const container = document.getElementById('notifications');
    const allowedPositions = new Set(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']);
    const allowedTypes = new Set(['success', 'error', 'info', 'warning']);
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 12 4 4L19 6"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4 3.5 19h17L12 4Z"/><path d="M12 9v4M12 16v.5"/></svg>'
    };
    const state = {
        maxVisible: 5,
        maxQueued: 25,
        animationDuration: 320,
        showProgress: true,
        pauseOnHover: true,
        minDuration: 1000,
        maxDuration: 30000,
        titleLength: 64,
        messageLength: 280,
        queue: [],
        visible: new Map(),
        nextId: 1
    };

    const clamp = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;

    function configure(config = {}, limits = {}) {
        const position = allowedPositions.has(config.position) ? config.position : 'top-right';
        container.className = `notifications position-${position}`;
        state.maxVisible = Math.round(clamp(config.maxVisible, 1, 10, 5));
        state.maxQueued = Math.round(clamp(config.maxQueued, 0, 100, 25));
        state.animationDuration = Math.round(clamp(config.animationDuration, 100, 1000, 320));
        state.minDuration = Math.round(clamp(limits.minDuration, 100, 30000, 1000));
        state.maxDuration = Math.round(clamp(limits.maxDuration, state.minDuration, 120000, 30000));
        state.titleLength = Math.round(clamp(limits.titleLength, 1, 256, 64));
        state.messageLength = Math.round(clamp(limits.messageLength, 1, 2000, 280));
        state.showProgress = config.showProgress !== false;
        state.pauseOnHover = config.pauseOnHover !== false;
        document.documentElement.style.setProperty('--notify-width', `${clamp(config.width, 280, 560, 380)}px`);
        document.documentElement.style.setProperty('--notify-gap', `${clamp(config.gap, 4, 24, 10)}px`);
        document.documentElement.style.setProperty('--edge-offset', `${clamp(config.edgeOffset, 8, 80, 24)}px`);
        document.documentElement.style.setProperty('--animation-duration', `${state.animationDuration}ms`);
        drainQueue();
    }

    function buildElement(item, id) {
        const element = document.createElement('article');
        element.className = `notification notification--${item.type}`;
        element.dataset.id = String(id);
        element.setAttribute('role', item.type === 'error' || item.type === 'warning' ? 'alert' : 'status');

        const accent = document.createElement('div');
        accent.className = 'notification__accent';
        const icon = document.createElement('div');
        icon.className = 'notification__icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = icons[item.type] || icons.info;
        const content = document.createElement('div');
        content.className = 'notification__content';
        const title = document.createElement('p');
        title.className = 'notification__eyebrow';
        title.textContent = item.title;
        const message = document.createElement('p');
        message.className = 'notification__message';
        message.textContent = item.message;
        content.append(title, message);
        element.append(accent, icon, content);

        if (state.showProgress) {
            const progress = document.createElement('div');
            progress.className = `notification__progress${state.pauseOnHover ? ' is-paused' : ''}`;
            progress.style.animationDuration = `${item.duration}ms`;
            element.append(progress);
        }
        return element;
    }

    function show(item) {
        const id = state.nextId++;
        const element = buildElement(item, id);
        const entry = { element, timer: null, remaining: item.duration, startedAt: performance.now() };
        state.visible.set(id, entry);
        container.append(element);

        const schedule = () => {
            entry.startedAt = performance.now();
            entry.timer = window.setTimeout(() => dismiss(id), entry.remaining);
        };
        if (state.pauseOnHover) {
            element.addEventListener('mouseenter', () => {
                clearTimeout(entry.timer);
                entry.remaining = Math.max(0, entry.remaining - (performance.now() - entry.startedAt));
            });
            element.addEventListener('mouseleave', schedule);
        }
        schedule();
    }

    function dismiss(id) {
        const entry = state.visible.get(id);
        if (!entry || entry.element.classList.contains('is-leaving')) return;
        clearTimeout(entry.timer);
        entry.element.classList.add('is-leaving');
        window.setTimeout(() => {
            entry.element.remove();
            state.visible.delete(id);
            drainQueue();
        }, state.animationDuration);
    }

    function drainQueue() {
        while (state.visible.size < state.maxVisible && state.queue.length) show(state.queue.shift());
    }

    function normalizeNotification(notification) {
        if (!notification || Object.prototype.toString.call(notification) !== '[object Object]') return null;
        if (!allowedTypes.has(notification.type)) return null;
        if (typeof notification.title !== 'string' || typeof notification.message !== 'string') return null;
        if (!Number.isFinite(notification.duration)) return null;

        const title = notification.title.trim().slice(0, state.titleLength);
        const message = notification.message.trim().slice(0, state.messageLength);
        if (!title || !message) return null;

        return {
            type: notification.type,
            title,
            message,
            duration: Math.round(clamp(notification.duration, state.minDuration, state.maxDuration, state.minDuration))
        };
    }

    function enqueue(notification) {
        const normalized = normalizeNotification(notification);
        if (!normalized) return;

        if (state.visible.size < state.maxVisible) {
            show(normalized);
            return;
        }

        if (state.maxQueued === 0) return;
        if (state.queue.length >= state.maxQueued) state.queue.shift();
        state.queue.push(normalized);
    }

    window.addEventListener('message', ({ data }) => {
        if (!data || typeof data !== 'object') return;
        if (data.action === 'configure') configure(data.config, data.limits);
        if (data.action === 'notify') enqueue(data.notification);
    });

    const resourceName = typeof GetParentResourceName === 'function' ? GetParentResourceName() : null;
    if (resourceName) {
        fetch(`https://${resourceName}/ready`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: '{}'
        }).catch(() => {});
    }
})();
