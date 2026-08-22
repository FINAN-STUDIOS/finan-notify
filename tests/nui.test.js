'use strict';

const assert = require('node:assert/strict');

class TestElement {
    constructor() {
        this.children = [];
        this.dataset = {};
        this.style = {};
        this.parent = null;
        this.textContent = '';
        this.listeners = {};
        this._classes = new Set();
        this.classList = {
            add: (name) => this._classes.add(name),
            contains: (name) => this._classes.has(name)
        };
    }

    set className(value) { this._classes = new Set(String(value).split(/\s+/).filter(Boolean)); }
    get className() { return [...this._classes].join(' '); }
    setAttribute() {}
    addEventListener(name, callback) { this.listeners[name] = callback; }
    append(...elements) {
        for (const element of elements) {
            element.parent = this;
            this.children.push(element);
        }
    }
    remove() {
        if (!this.parent) return;
        this.parent.children = this.parent.children.filter((child) => child !== this);
        this.parent = null;
    }
}

const container = new TestElement();
const messageListeners = [];
const timers = new Map();
let nextTimer = 1;
let now = 0;
const shownTitles = [];
const originalAppend = container.append.bind(container);
container.append = (...elements) => {
    originalAppend(...elements);
    for (const element of elements) shownTitles.push(element.children[2].children[0].textContent);
};

global.document = {
    getElementById: () => container,
    createElement: () => new TestElement(),
    documentElement: { style: { setProperty() {} } }
};
global.performance = { now: () => ++now };
global.window = {
    addEventListener: (name, callback) => { if (name === 'message') messageListeners.push(callback); },
    setTimeout: (callback) => { const id = nextTimer++; timers.set(id, callback); return id; },
    clearTimeout: (id) => timers.delete(id)
};

require('../html/app.js');

const post = (data) => messageListeners.forEach((listener) => listener({ data }));
const notify = (type, title, message, duration = 1000) => post({
    action: 'notify',
    notification: { type, title, message, duration }
});
const runTimers = () => {
    let guard = 0;
    while (timers.size && guard++ < 100) {
        const pending = [...timers.entries()];
        timers.clear();
        pending.forEach(([, callback]) => callback());
    }
    assert.ok(guard < 100, 'timer processing did not settle');
};

post({
    action: 'configure',
    config: { maxVisible: 2, maxQueued: 3, animationDuration: 100 },
    limits: { minDuration: 100, maxDuration: 2000, titleLength: 64, messageLength: 280 }
});

notify('invalid', 'Bad', 'Rejected');
notify('success', '', 'Rejected');
notify('success', 'Bad', '', 1000);
notify('success', 'Bad', 'Rejected', Number.NaN);
assert.equal(container.children.length, 0, 'invalid schemas must be rejected');

for (const title of ['A', 'B', 'C', 'D', 'E', 'F']) {
    notify('info', title, `Message ${title}`);
}

assert.equal(container.children.length, 2, 'maxVisible must be enforced');
runTimers();
assert.deepEqual(shownTitles, ['A', 'B', 'D', 'E', 'F'], 'oldest queued notification must be replaced');
assert.equal(container.children.length, 0, 'all accepted notifications must dismiss');

console.log('NUI validation and queue tests passed.');
