
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.38.2 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (251:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		const newState = { ...history.state };
    		delete newState["__svelte_spa_router_scrollX"];
    		delete newState["__svelte_spa_router_scrollY"];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute("href");

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == "/") {
    		// Add # to the href attribute
    		href = "#" + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != "#/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	node.setAttribute("href", href);

    	node.addEventListener("click", event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute("href"));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == "string") {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener("popstate", popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == "object" && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener("popstate", popStateChanged);
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("popStateChanged" in $$props) popStateChanged = $$props.popStateChanged;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function getNextPageIndexLimited(currentPageIndex, pagesCount) {
      if (pagesCount < 1) throw new Error('pagesCount must be at least 1')
      return Math.min(Math.max(currentPageIndex + 1, 0), pagesCount - 1)
    }

    function getNextPageIndexInfinte(currentPageIndex, pagesCount) {
      if (pagesCount < 1) throw new Error('pagesCount must be at least 1')
      const newCurrentPageIndex = Math.max(currentPageIndex, 0) + 1;
      return newCurrentPageIndex > pagesCount - 1 ? 0 : Math.max(newCurrentPageIndex, 0)
    }

    function getNextPageIndexFn(infinite) {
      return infinite ? getNextPageIndexInfinte : getNextPageIndexLimited
    }

    function getPrevPageIndexLimited(currentPageIndex, pagesCount) {
      if (pagesCount < 1) throw new Error('pagesCount must be at least 1')
      return Math.max(Math.min(currentPageIndex - 1, pagesCount - 1), 0)
    }

    function getPrevPageIndexInfinte(currentPageIndex, pagesCount) {
      if (pagesCount < 1) throw new Error('pagesCount must be at least 1')
      const newCurrentPageIndex = Math.min(currentPageIndex, pagesCount - 1) - 1;
      return newCurrentPageIndex >= 0 ? Math.min(newCurrentPageIndex, pagesCount - 1) : pagesCount - 1
    }

    function getPrevPageIndexFn(infinite) {
      return infinite ? getPrevPageIndexInfinte : getPrevPageIndexLimited
    }

    function getPageIndex(pageIndex, pagesCount) {
      if (pagesCount < 1) throw new Error('pagesCount must be at least 1')
      return pageIndex < 0 ? 0 : Math.min(pageIndex, pagesCount - 1)
    }

    function getAdjacentIndexes(pageIndex, pagesCount, infinite) {
      if (pagesCount < 1) throw new Error('pagesCount must be at least 1')
      const _pageIndex = Math.max(0, Math.min(pageIndex, pagesCount - 1));
      let rangeStart = _pageIndex - 1;
      let rangeEnd = _pageIndex + 1;
      rangeStart = rangeStart < 0
        ? infinite
          ? pagesCount - 1
          : 0
        : rangeStart; 
      rangeEnd = rangeEnd > pagesCount - 1
        ? infinite
            ? 0
            : pagesCount - 1
        : rangeEnd;
      return [...new Set([rangeStart, rangeEnd, _pageIndex])].sort((a, b) => a - b)
    }

    const initState = {
      currentPageIndex: 0,
    };

    function createStore() {
      const { subscribe, set, update } = writable(initState);

      function init(initialPageIndex) {
        set({
          ...initState,
          currentPageIndex: initialPageIndex
        });
      }

      function setCurrentPageIndex(index) {
        update(store => ({
          ...store,
          currentPageIndex: index,
        }));
      }

      function moveToPage({ pageIndex, pagesCount }) {
        update(store => {
          return {
            ...store,
            currentPageIndex: getPageIndex(pageIndex, pagesCount),
          }
        });
      }

      function next({ infinite, pagesCount }) {
        update(store => {
          const newCurrentPageIndex = getNextPageIndexFn(infinite)(store.currentPageIndex, pagesCount);
          return {
            ...store,
            currentPageIndex: newCurrentPageIndex,
          }
        });
      }

      function prev({ infinite, pagesCount }) {
        update(store => {
          const newCurrentPageIndex = getPrevPageIndexFn(infinite)(store.currentPageIndex, pagesCount);
          return {
            ...store,
            currentPageIndex: newCurrentPageIndex,
          }
        });
      }

      return {
        subscribe,
        next,
        prev,
        setCurrentPageIndex,
        init,
        moveToPage,
      };
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* node_modules\svelte-carousel\src\components\Dot\Dot.svelte generated by Svelte v3.38.2 */
    const file$6 = "node_modules\\svelte-carousel\\src\\components\\Dot\\Dot.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "sc-carousel-dot__dot svelte-18q6rl6");
    			set_style(div0, "height", /*$size*/ ctx[1] + "px");
    			set_style(div0, "width", /*$size*/ ctx[1] + "px");
    			toggle_class(div0, "sc-carousel-dot__dot_active", /*active*/ ctx[0]);
    			add_location(div0, file$6, 23, 2, 459);
    			attr_dev(div1, "class", "sc-carousel-dot__container svelte-18q6rl6");
    			add_location(div1, file$6, 22, 0, 415);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$size*/ 2) {
    				set_style(div0, "height", /*$size*/ ctx[1] + "px");
    			}

    			if (dirty & /*$size*/ 2) {
    				set_style(div0, "width", /*$size*/ ctx[1] + "px");
    			}

    			if (dirty & /*active*/ 1) {
    				toggle_class(div0, "sc-carousel-dot__dot_active", /*active*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const DOT_SIZE_PX = 5;
    const ACTIVE_DOT_SIZE_PX = 8;

    function instance$6($$self, $$props, $$invalidate) {
    	let $size;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dot", slots, []);
    	const size = tweened(DOT_SIZE_PX, { duration: 250, easing: cubicInOut });
    	validate_store(size, "size");
    	component_subscribe($$self, size, value => $$invalidate(1, $size = value));
    	let { active = false } = $$props;
    	const writable_props = ["active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dot> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({
    		tweened,
    		cubicInOut,
    		DOT_SIZE_PX,
    		ACTIVE_DOT_SIZE_PX,
    		size,
    		active,
    		$size
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*active*/ 1) {
    			{
    				size.set(active ? ACTIVE_DOT_SIZE_PX : DOT_SIZE_PX);
    			}
    		}
    	};

    	return [active, $size, size, click_handler];
    }

    class Dot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { active: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dot",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get active() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-carousel\src\components\Dots\Dots.svelte generated by Svelte v3.38.2 */
    const file$5 = "node_modules\\svelte-carousel\\src\\components\\Dots\\Dots.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (23:2) {#each Array(pagesCount) as _, pageIndex (pageIndex)}
    function create_each_block$1(key_1, ctx) {
    	let div;
    	let dot;
    	let t;
    	let current;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*pageIndex*/ ctx[7]);
    	}

    	dot = new Dot({
    			props: {
    				active: /*currentPageIndex*/ ctx[1] === /*pageIndex*/ ctx[7]
    			},
    			$$inline: true
    		});

    	dot.$on("click", click_handler);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(dot.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "sc-carousel-dots__dot-container svelte-ru127d");
    			add_location(div, file$5, 23, 4, 515);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(dot, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const dot_changes = {};
    			if (dirty & /*currentPageIndex, pagesCount*/ 3) dot_changes.active = /*currentPageIndex*/ ctx[1] === /*pageIndex*/ ctx[7];
    			dot.$set(dot_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(dot);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(23:2) {#each Array(pagesCount) as _, pageIndex (pageIndex)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = Array(/*pagesCount*/ ctx[0]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*pageIndex*/ ctx[7];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "sc-carousel-dots__container svelte-ru127d");
    			add_location(div, file$5, 21, 0, 411);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentPageIndex, Array, pagesCount, handleDotClick*/ 7) {
    				each_value = Array(/*pagesCount*/ ctx[0]);
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dots", slots, []);
    	const dispatch = createEventDispatcher();
    	let { pagesCount = 1 } = $$props;
    	let { currentPageIndex = 0 } = $$props;

    	function handleDotClick(pageIndex) {
    		dispatch("pageChange", pageIndex);
    	}

    	const writable_props = ["pagesCount", "currentPageIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dots> was created with unknown prop '${key}'`);
    	});

    	const click_handler = pageIndex => handleDotClick(pageIndex);

    	$$self.$$set = $$props => {
    		if ("pagesCount" in $$props) $$invalidate(0, pagesCount = $$props.pagesCount);
    		if ("currentPageIndex" in $$props) $$invalidate(1, currentPageIndex = $$props.currentPageIndex);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Dot,
    		dispatch,
    		pagesCount,
    		currentPageIndex,
    		handleDotClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagesCount" in $$props) $$invalidate(0, pagesCount = $$props.pagesCount);
    		if ("currentPageIndex" in $$props) $$invalidate(1, currentPageIndex = $$props.currentPageIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagesCount, currentPageIndex, handleDotClick, click_handler];
    }

    class Dots extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { pagesCount: 0, currentPageIndex: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dots",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get pagesCount() {
    		throw new Error("<Dots>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagesCount(value) {
    		throw new Error("<Dots>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentPageIndex() {
    		throw new Error("<Dots>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentPageIndex(value) {
    		throw new Error("<Dots>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const PREV = 'prev';
    const NEXT = 'next';

    /* node_modules\svelte-carousel\src\components\Arrow\Arrow.svelte generated by Svelte v3.38.2 */
    const file$4 = "node_modules\\svelte-carousel\\src\\components\\Arrow\\Arrow.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			attr_dev(i, "class", "sc-carousel-arrow__arrow svelte-tycflj");
    			toggle_class(i, "sc-carousel-arrow__arrow-next", /*direction*/ ctx[0] === NEXT);
    			toggle_class(i, "sc-carousel-arrow__arrow-prev", /*direction*/ ctx[0] === PREV);
    			add_location(i, file$4, 19, 2, 371);
    			attr_dev(div, "class", "sc-carousel-arrow__circle svelte-tycflj");
    			toggle_class(div, "sc-carousel-arrow__circle_disabled", /*disabled*/ ctx[1]);
    			add_location(div, file$4, 14, 0, 256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*direction, NEXT*/ 1) {
    				toggle_class(i, "sc-carousel-arrow__arrow-next", /*direction*/ ctx[0] === NEXT);
    			}

    			if (dirty & /*direction, PREV*/ 1) {
    				toggle_class(i, "sc-carousel-arrow__arrow-prev", /*direction*/ ctx[0] === PREV);
    			}

    			if (dirty & /*disabled*/ 2) {
    				toggle_class(div, "sc-carousel-arrow__circle_disabled", /*disabled*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Arrow", slots, []);
    	let { direction = NEXT } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ["direction", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Arrow> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ NEXT, PREV, direction, disabled });

    	$$self.$inject_state = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [direction, disabled, click_handler];
    }

    class Arrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { direction: 0, disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Arrow",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get direction() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // start event
    function addStartEventListener(source, cb) {
      source.addEventListener('mousedown', cb);
      source.addEventListener('touchstart', cb);
    }
    function removeStartEventListener(source, cb) {
      source.removeEventListener('mousedown', cb);
      source.removeEventListener('touchstart', cb);
    }

    // end event
    function addEndEventListener(source, cb) {
      source.addEventListener('mouseup', cb);
      source.addEventListener('touchend', cb);
    }
    function removeEndEventListener(source, cb) {
      source.removeEventListener('mouseup', cb);
      source.removeEventListener('touchend', cb);
    }

    // move event
    function addMoveEventListener(source, cb) {
      source.addEventListener('mousemove', cb);
      source.addEventListener('touchmove', cb);
    }
    function removeMoveEventListener(source, cb) {
      source.removeEventListener('mousemove', cb);
      source.removeEventListener('touchmove', cb);
    }

    // resize event
    function addResizeEventListener(cb) {
      window.addEventListener('resize', cb);
    }
    function removeResizeEventListener(cb) {
      window.removeEventListener('resize', cb);
    }

    function createDispatcher(source) {
      function dispatch(event, data) {
        source.dispatchEvent(
          new CustomEvent(event, {
            detail: data,
          })
        );
      }
      return dispatch
    }

    function getCoords(event) {
      if ('TouchEvent' in window && event instanceof TouchEvent) {
        const touch = event.touches[0];
        return {
          x: touch ? touch.clientX : 0,
          y: touch ? touch.clientY : 0,
        }
      }
      return {
        x: event.clientX,
        y: event.clientY,
      }
    }

    function swipeable(node, { thresholdProvider }) {
      const dispatch = createDispatcher(node);
      let x;
      let y;
      let moved = 0;

      function handleMousedown(event) {
        moved = 0;
        const coords = getCoords(event);
        x = coords.x;
        y = coords.y;
        dispatch('start', { x, y });
        addMoveEventListener(window, handleMousemove);
        addEndEventListener(window, handleMouseup);
      }

      function handleMousemove(event) {
        const coords = getCoords(event);
        const dx = coords.x - x;
        const dy = coords.y - y;
        x = coords.x;
        y = coords.y;
        dispatch('move', { x, y, dx, dy });

        if (dx !== 0 && Math.sign(dx) !== Math.sign(moved)) {
          moved = 0;
        }
        moved += dx;
        if (Math.abs(moved) > thresholdProvider()) {
          dispatch('threshold', { direction: moved > 0 ? PREV : NEXT });
          removeEndEventListener(window, handleMouseup);
          removeMoveEventListener(window, handleMousemove);
        }
      }

      function handleMouseup(event) {
        const coords = getCoords(event);
        x = coords.x;
        y = coords.y;
        dispatch('end', { x, y });
        removeEndEventListener(window, handleMouseup);
        removeMoveEventListener(window, handleMousemove);
      }

      addStartEventListener(node, handleMousedown);
      return {
        destroy() {
          removeStartEventListener(node, handleMousedown);
        },
      }
    }

    // focusin event
    function addFocusinEventListener(source, cb) {
      source.addEventListener('mouseenter', cb);
      source.addEventListener('touchstart', cb);
    }
    function removeFocusinEventListener(source, cb) {
      source.removeEventListener('mouseenter', cb);
      source.removeEventListener('touchstart', cb);
    }

    // focusout event
    function addFocusoutEventListener(source, cb) {
      source.addEventListener('mouseleave', cb);
      source.addEventListener('touchend', cb);
      source.addEventListener('touchcancel', cb);
    }
    function removeFocusoutEventListener(source, cb) {
      source.removeEventListener('mouseleave', cb);
      source.removeEventListener('touchend', cb);
      source.removeEventListener('touchcancel', cb);
    }

    function focusable(node) {
      const dispatch = createDispatcher(node);

      function handleFocusin() {
        dispatch('focused', { value: true });
      }

      function handleFocusout() {
        dispatch('focused', { value: false });
      }

      addFocusinEventListener(node, handleFocusin);
      addFocusoutEventListener(node, handleFocusout);

      return {
        destroy() {
          removeFocusinEventListener(node, handleFocusin);
          removeFocusoutEventListener(node, handleFocusout);
        },
      }
    }

    /* node_modules\svelte-carousel\src\components\Carousel\Carousel.svelte generated by Svelte v3.38.2 */
    const file$3 = "node_modules\\svelte-carousel\\src\\components\\Carousel\\Carousel.svelte";

    const get_dots_slot_changes = dirty => ({
    	currentPageIndex: dirty[0] & /*originalCurrentPageIndex*/ 16,
    	pagesCount: dirty[0] & /*originalPagesCount*/ 32,
    	loaded: dirty[0] & /*loaded*/ 2048
    });

    const get_dots_slot_context = ctx => ({
    	currentPageIndex: /*originalCurrentPageIndex*/ ctx[4],
    	pagesCount: /*originalPagesCount*/ ctx[5],
    	showPage: /*handlePageChange*/ ctx[12],
    	loaded: /*loaded*/ ctx[11]
    });

    const get_next_slot_changes = dirty => ({ loaded: dirty[0] & /*loaded*/ 2048 });

    const get_next_slot_context = ctx => ({
    	showNextPage: /*showNextPage*/ ctx[14],
    	loaded: /*loaded*/ ctx[11]
    });

    const get_default_slot_changes = dirty => ({ loaded: dirty[0] & /*loaded*/ 2048 });
    const get_default_slot_context = ctx => ({ loaded: /*loaded*/ ctx[11] });
    const get_prev_slot_changes = dirty => ({ loaded: dirty[0] & /*loaded*/ 2048 });

    const get_prev_slot_context = ctx => ({
    	showPrevPage: /*showPrevPage*/ ctx[13],
    	loaded: /*loaded*/ ctx[11]
    });

    // (229:4) {#if arrows}
    function create_if_block_2(ctx) {
    	let current;
    	const prev_slot_template = /*#slots*/ ctx[30].prev;
    	const prev_slot = create_slot(prev_slot_template, ctx, /*$$scope*/ ctx[29], get_prev_slot_context);
    	const prev_slot_or_fallback = prev_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (prev_slot_or_fallback) prev_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (prev_slot_or_fallback) {
    				prev_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prev_slot) {
    				if (prev_slot.p && (!current || dirty[0] & /*$$scope, loaded*/ 536872960)) {
    					update_slot(prev_slot, prev_slot_template, ctx, /*$$scope*/ ctx[29], dirty, get_prev_slot_changes, get_prev_slot_context);
    				}
    			} else {
    				if (prev_slot_or_fallback && prev_slot_or_fallback.p && dirty[0] & /*infinite, originalCurrentPageIndex*/ 20) {
    					prev_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prev_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prev_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prev_slot_or_fallback) prev_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(229:4) {#if arrows}",
    		ctx
    	});

    	return block;
    }

    // (230:39)           
    function fallback_block_2(ctx) {
    	let div;
    	let arrow;
    	let current;

    	arrow = new Arrow({
    			props: {
    				direction: "prev",
    				disabled: !/*infinite*/ ctx[2] && /*originalCurrentPageIndex*/ ctx[4] === 0
    			},
    			$$inline: true
    		});

    	arrow.$on("click", /*showPrevPage*/ ctx[13]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(arrow.$$.fragment);
    			attr_dev(div, "class", "sc-carousel__arrow-container svelte-1pac7rj");
    			add_location(div, file$3, 230, 8, 5901);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(arrow, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const arrow_changes = {};
    			if (dirty[0] & /*infinite, originalCurrentPageIndex*/ 20) arrow_changes.disabled = !/*infinite*/ ctx[2] && /*originalCurrentPageIndex*/ ctx[4] === 0;
    			arrow.$set(arrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(arrow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(230:39)           ",
    		ctx
    	});

    	return block;
    }

    // (263:4) {#if arrows}
    function create_if_block_1(ctx) {
    	let current;
    	const next_slot_template = /*#slots*/ ctx[30].next;
    	const next_slot = create_slot(next_slot_template, ctx, /*$$scope*/ ctx[29], get_next_slot_context);
    	const next_slot_or_fallback = next_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (next_slot_or_fallback) next_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (next_slot_or_fallback) {
    				next_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (next_slot) {
    				if (next_slot.p && (!current || dirty[0] & /*$$scope, loaded*/ 536872960)) {
    					update_slot(next_slot, next_slot_template, ctx, /*$$scope*/ ctx[29], dirty, get_next_slot_changes, get_next_slot_context);
    				}
    			} else {
    				if (next_slot_or_fallback && next_slot_or_fallback.p && dirty[0] & /*infinite, originalCurrentPageIndex, originalPagesCount*/ 52) {
    					next_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(next_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(next_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (next_slot_or_fallback) next_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(263:4) {#if arrows}",
    		ctx
    	});

    	return block;
    }

    // (264:39)           
    function fallback_block_1(ctx) {
    	let div;
    	let arrow;
    	let current;

    	arrow = new Arrow({
    			props: {
    				direction: "next",
    				disabled: !/*infinite*/ ctx[2] && /*originalCurrentPageIndex*/ ctx[4] === /*originalPagesCount*/ ctx[5] - 1
    			},
    			$$inline: true
    		});

    	arrow.$on("click", /*showNextPage*/ ctx[14]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(arrow.$$.fragment);
    			attr_dev(div, "class", "sc-carousel__arrow-container svelte-1pac7rj");
    			add_location(div, file$3, 264, 8, 6925);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(arrow, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const arrow_changes = {};
    			if (dirty[0] & /*infinite, originalCurrentPageIndex, originalPagesCount*/ 52) arrow_changes.disabled = !/*infinite*/ ctx[2] && /*originalCurrentPageIndex*/ ctx[4] === /*originalPagesCount*/ ctx[5] - 1;
    			arrow.$set(arrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(arrow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(264:39)           ",
    		ctx
    	});

    	return block;
    }

    // (275:2) {#if dots}
    function create_if_block(ctx) {
    	let current;
    	const dots_slot_template = /*#slots*/ ctx[30].dots;
    	const dots_slot = create_slot(dots_slot_template, ctx, /*$$scope*/ ctx[29], get_dots_slot_context);
    	const dots_slot_or_fallback = dots_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (dots_slot_or_fallback) dots_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (dots_slot_or_fallback) {
    				dots_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dots_slot) {
    				if (dots_slot.p && (!current || dirty[0] & /*$$scope, originalCurrentPageIndex, originalPagesCount, loaded*/ 536873008)) {
    					update_slot(dots_slot, dots_slot_template, ctx, /*$$scope*/ ctx[29], dirty, get_dots_slot_changes, get_dots_slot_context);
    				}
    			} else {
    				if (dots_slot_or_fallback && dots_slot_or_fallback.p && dirty[0] & /*originalPagesCount, originalCurrentPageIndex*/ 48) {
    					dots_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dots_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dots_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (dots_slot_or_fallback) dots_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(275:2) {#if dots}",
    		ctx
    	});

    	return block;
    }

    // (281:5)         
    function fallback_block(ctx) {
    	let dots_1;
    	let current;

    	dots_1 = new Dots({
    			props: {
    				pagesCount: /*originalPagesCount*/ ctx[5],
    				currentPageIndex: /*originalCurrentPageIndex*/ ctx[4]
    			},
    			$$inline: true
    		});

    	dots_1.$on("pageChange", /*pageChange_handler*/ ctx[34]);

    	const block = {
    		c: function create() {
    			create_component(dots_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dots_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dots_1_changes = {};
    			if (dirty[0] & /*originalPagesCount*/ 32) dots_1_changes.pagesCount = /*originalPagesCount*/ ctx[5];
    			if (dirty[0] & /*originalCurrentPageIndex*/ 16) dots_1_changes.currentPageIndex = /*originalCurrentPageIndex*/ ctx[4];
    			dots_1.$set(dots_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dots_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dots_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dots_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(281:5)         ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div3;
    	let div2;
    	let t0;
    	let div1;
    	let div0;
    	let swipeable_action;
    	let t1;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*arrows*/ ctx[1] && create_if_block_2(ctx);
    	const default_slot_template = /*#slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[29], get_default_slot_context);
    	let if_block1 = /*arrows*/ ctx[1] && create_if_block_1(ctx);
    	let if_block2 = /*dots*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "sc-carousel__pages-container svelte-1pac7rj");
    			set_style(div0, "transform", "translateX(" + /*offset*/ ctx[8] + "px)");
    			set_style(div0, "transition-duration", /*_duration*/ ctx[6] + "ms");
    			set_style(div0, "transition-timing-function", /*timingFunction*/ ctx[0]);
    			add_location(div0, file$3, 245, 6, 6310);
    			attr_dev(div1, "class", "sc-carousel__pages-window svelte-1pac7rj");
    			add_location(div1, file$3, 239, 4, 6158);
    			attr_dev(div2, "class", "sc-carousel__content-container svelte-1pac7rj");
    			add_location(div2, file$3, 227, 2, 5788);
    			attr_dev(div3, "class", "sc-carousel__carousel-container svelte-1pac7rj");
    			add_location(div3, file$3, 226, 0, 5739);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[32](div0);
    			/*div1_binding*/ ctx[33](div1);
    			append_dev(div2, t1);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div3, t2);
    			if (if_block2) if_block2.m(div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(swipeable_action = swipeable.call(null, div0, {
    						thresholdProvider: /*swipeable_function*/ ctx[31]
    					})),
    					listen_dev(div0, "start", /*handleSwipeStart*/ ctx[15], false, false, false),
    					listen_dev(div0, "move", /*handleSwipeMove*/ ctx[17], false, false, false),
    					listen_dev(div0, "end", /*handleSwipeEnd*/ ctx[18], false, false, false),
    					listen_dev(div0, "threshold", /*handleThreshold*/ ctx[16], false, false, false),
    					action_destroyer(focusable.call(null, div1)),
    					listen_dev(div1, "focused", /*handleFocused*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*arrows*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*arrows*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope, loaded*/ 536872960)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[29], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}

    			if (!current || dirty[0] & /*offset*/ 256) {
    				set_style(div0, "transform", "translateX(" + /*offset*/ ctx[8] + "px)");
    			}

    			if (!current || dirty[0] & /*_duration*/ 64) {
    				set_style(div0, "transition-duration", /*_duration*/ ctx[6] + "ms");
    			}

    			if (!current || dirty[0] & /*timingFunction*/ 1) {
    				set_style(div0, "transition-timing-function", /*timingFunction*/ ctx[0]);
    			}

    			if (swipeable_action && is_function(swipeable_action.update) && dirty[0] & /*pageWidth*/ 128) swipeable_action.update.call(null, {
    				thresholdProvider: /*swipeable_function*/ ctx[31]
    			});

    			if (/*arrows*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*arrows*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*dots*/ ctx[3]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*dots*/ 8) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div3, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[32](null);
    			/*div1_binding*/ ctx[33](null);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let originalCurrentPageIndex;
    	let originalPagesCount;
    	let loaded;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Carousel", slots, ['prev','default','next','dots']);
    	const dispatch = createEventDispatcher();

    	const directionFnDescription = {
    		[NEXT]: showNextPage,
    		[PREV]: showPrevPage
    	};

    	let { timingFunction = "ease-in-out" } = $$props;
    	let { arrows = true } = $$props;
    	let { infinite = true } = $$props;
    	let { initialPageIndex = 0 } = $$props;
    	let { duration = 500 } = $$props;
    	let _duration = duration;
    	let { autoplay = false } = $$props;
    	let { autoplayDuration = 3000 } = $$props;
    	let { autoplayDirection = NEXT } = $$props;
    	let { pauseOnFocus = false } = $$props;
    	let { dots = true } = $$props;
    	let store = createStore();
    	let currentPageIndex = 0;
    	let pagesCount = 0;
    	let pageWidth = 0;
    	let offset = 0;
    	let pageWindowElement;
    	let pagesElement;
    	let focused = false;
    	let autoplayInterval = null;

    	function applyPageSizes() {
    		const children = pagesElement.children;
    		$$invalidate(7, pageWidth = pageWindowElement.clientWidth);
    		$$invalidate(27, pagesCount = children.length);

    		for (let pageIndex = 0; pageIndex < pagesCount; pageIndex++) {
    			children[pageIndex].style.minWidth = `${pageWidth}px`;
    			children[pageIndex].style.maxWidth = `${pageWidth}px`;
    		}

    		offsetPage(false);
    	}

    	function applyAutoplay() {
    		if (autoplay && !autoplayInterval) {
    			autoplayInterval = setInterval(
    				() => {
    					directionFnDescription[autoplayDirection]();
    				},
    				autoplayDuration
    			);
    		}
    	}

    	function clearAutoplay() {
    		clearInterval(autoplayInterval);
    		autoplayInterval = null;
    	}

    	function addClones() {
    		const first = pagesElement.children[0];
    		const last = pagesElement.children[pagesElement.children.length - 1];
    		pagesElement.prepend(last.cloneNode(true));
    		pagesElement.append(first.cloneNode(true));
    	}

    	let cleanupFns = [];

    	onMount(() => {
    		(async () => {
    			await tick();

    			cleanupFns.push(store.subscribe(value => {
    				$$invalidate(26, currentPageIndex = value.currentPageIndex);
    			}));

    			if (pagesElement && pageWindowElement) {
    				// load first and last child to clone them 
    				$$invalidate(11, loaded = [0, pagesElement.children.length - 1]);

    				await tick();
    				infinite && addClones();
    				store.init(initialPageIndex + Number(infinite));
    				applyPageSizes();
    			}

    			applyAutoplay();
    			addResizeEventListener(applyPageSizes);
    		})();
    	});

    	onDestroy(() => {
    		clearAutoplay();
    		removeResizeEventListener(applyPageSizes);
    		cleanupFns.filter(fn => fn && typeof fn === "function").forEach(fn => fn());
    	});

    	function handlePageChange(pageIndex) {
    		showPage(pageIndex + Number(infinite), { offsetDelay: 0, animated: true });
    	}

    	function offsetPage(animated) {
    		$$invalidate(6, _duration = animated ? duration : 0);
    		$$invalidate(8, offset = -currentPageIndex * pageWidth);

    		if (infinite) {
    			if (currentPageIndex === 0) {
    				showPage(pagesCount - 2, { offsetDelay: duration, animated: false });
    			} else if (currentPageIndex === pagesCount - 1) {
    				showPage(1, { offsetDelay: duration, animated: false });
    			}
    		}
    	}

    	let disabled = false;

    	function safeChangePage(cb) {
    		if (disabled) return;
    		cb();
    		disabled = true;

    		setTimeout(
    			() => {
    				disabled = false;
    			},
    			duration
    		);
    	}

    	function showPage(pageIndex, { offsetDelay, animated }) {
    		safeChangePage(() => {
    			store.moveToPage({ pageIndex, pagesCount });

    			setTimeout(
    				() => {
    					offsetPage(animated);
    				},
    				offsetDelay
    			);
    		});
    	}

    	function showPrevPage() {
    		safeChangePage(() => {
    			store.prev({ infinite, pagesCount });
    			offsetPage(true);
    		});
    	}

    	function showNextPage() {
    		safeChangePage(() => {
    			store.next({ infinite, pagesCount });
    			offsetPage(true);
    		});
    	}

    	// gestures
    	function handleSwipeStart() {
    		$$invalidate(6, _duration = 0);
    	}

    	function handleThreshold(event) {
    		directionFnDescription[event.detail.direction]();
    	}

    	function handleSwipeMove(event) {
    		$$invalidate(8, offset += event.detail.dx);
    	}

    	function handleSwipeEnd() {
    		showPage(currentPageIndex, { offsetDelay: 0, animated: true });
    	}

    	function handleFocused(event) {
    		$$invalidate(28, focused = event.detail.value);
    	}

    	const writable_props = [
    		"timingFunction",
    		"arrows",
    		"infinite",
    		"initialPageIndex",
    		"duration",
    		"autoplay",
    		"autoplayDuration",
    		"autoplayDirection",
    		"pauseOnFocus",
    		"dots"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	const swipeable_function = () => pageWidth / 3;

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			pagesElement = $$value;
    			$$invalidate(10, pagesElement);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			pageWindowElement = $$value;
    			$$invalidate(9, pageWindowElement);
    		});
    	}

    	const pageChange_handler = event => handlePageChange(event.detail);

    	$$self.$$set = $$props => {
    		if ("timingFunction" in $$props) $$invalidate(0, timingFunction = $$props.timingFunction);
    		if ("arrows" in $$props) $$invalidate(1, arrows = $$props.arrows);
    		if ("infinite" in $$props) $$invalidate(2, infinite = $$props.infinite);
    		if ("initialPageIndex" in $$props) $$invalidate(20, initialPageIndex = $$props.initialPageIndex);
    		if ("duration" in $$props) $$invalidate(21, duration = $$props.duration);
    		if ("autoplay" in $$props) $$invalidate(22, autoplay = $$props.autoplay);
    		if ("autoplayDuration" in $$props) $$invalidate(23, autoplayDuration = $$props.autoplayDuration);
    		if ("autoplayDirection" in $$props) $$invalidate(24, autoplayDirection = $$props.autoplayDirection);
    		if ("pauseOnFocus" in $$props) $$invalidate(25, pauseOnFocus = $$props.pauseOnFocus);
    		if ("dots" in $$props) $$invalidate(3, dots = $$props.dots);
    		if ("$$scope" in $$props) $$invalidate(29, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		tick,
    		createEventDispatcher,
    		createStore,
    		Dots,
    		Arrow,
    		NEXT,
    		PREV,
    		swipeable,
    		focusable,
    		addResizeEventListener,
    		removeResizeEventListener,
    		getAdjacentIndexes,
    		dispatch,
    		directionFnDescription,
    		timingFunction,
    		arrows,
    		infinite,
    		initialPageIndex,
    		duration,
    		_duration,
    		autoplay,
    		autoplayDuration,
    		autoplayDirection,
    		pauseOnFocus,
    		dots,
    		store,
    		currentPageIndex,
    		pagesCount,
    		pageWidth,
    		offset,
    		pageWindowElement,
    		pagesElement,
    		focused,
    		autoplayInterval,
    		applyPageSizes,
    		applyAutoplay,
    		clearAutoplay,
    		addClones,
    		cleanupFns,
    		handlePageChange,
    		offsetPage,
    		disabled,
    		safeChangePage,
    		showPage,
    		showPrevPage,
    		showNextPage,
    		handleSwipeStart,
    		handleThreshold,
    		handleSwipeMove,
    		handleSwipeEnd,
    		handleFocused,
    		originalCurrentPageIndex,
    		originalPagesCount,
    		loaded
    	});

    	$$self.$inject_state = $$props => {
    		if ("timingFunction" in $$props) $$invalidate(0, timingFunction = $$props.timingFunction);
    		if ("arrows" in $$props) $$invalidate(1, arrows = $$props.arrows);
    		if ("infinite" in $$props) $$invalidate(2, infinite = $$props.infinite);
    		if ("initialPageIndex" in $$props) $$invalidate(20, initialPageIndex = $$props.initialPageIndex);
    		if ("duration" in $$props) $$invalidate(21, duration = $$props.duration);
    		if ("_duration" in $$props) $$invalidate(6, _duration = $$props._duration);
    		if ("autoplay" in $$props) $$invalidate(22, autoplay = $$props.autoplay);
    		if ("autoplayDuration" in $$props) $$invalidate(23, autoplayDuration = $$props.autoplayDuration);
    		if ("autoplayDirection" in $$props) $$invalidate(24, autoplayDirection = $$props.autoplayDirection);
    		if ("pauseOnFocus" in $$props) $$invalidate(25, pauseOnFocus = $$props.pauseOnFocus);
    		if ("dots" in $$props) $$invalidate(3, dots = $$props.dots);
    		if ("store" in $$props) store = $$props.store;
    		if ("currentPageIndex" in $$props) $$invalidate(26, currentPageIndex = $$props.currentPageIndex);
    		if ("pagesCount" in $$props) $$invalidate(27, pagesCount = $$props.pagesCount);
    		if ("pageWidth" in $$props) $$invalidate(7, pageWidth = $$props.pageWidth);
    		if ("offset" in $$props) $$invalidate(8, offset = $$props.offset);
    		if ("pageWindowElement" in $$props) $$invalidate(9, pageWindowElement = $$props.pageWindowElement);
    		if ("pagesElement" in $$props) $$invalidate(10, pagesElement = $$props.pagesElement);
    		if ("focused" in $$props) $$invalidate(28, focused = $$props.focused);
    		if ("autoplayInterval" in $$props) autoplayInterval = $$props.autoplayInterval;
    		if ("cleanupFns" in $$props) cleanupFns = $$props.cleanupFns;
    		if ("disabled" in $$props) disabled = $$props.disabled;
    		if ("originalCurrentPageIndex" in $$props) $$invalidate(4, originalCurrentPageIndex = $$props.originalCurrentPageIndex);
    		if ("originalPagesCount" in $$props) $$invalidate(5, originalPagesCount = $$props.originalPagesCount);
    		if ("loaded" in $$props) $$invalidate(11, loaded = $$props.loaded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*currentPageIndex, infinite*/ 67108868) {
    			$$invalidate(4, originalCurrentPageIndex = currentPageIndex - Number(infinite));
    		}

    		if ($$self.$$.dirty[0] & /*originalCurrentPageIndex*/ 16) {
    			dispatch("pageChange", originalCurrentPageIndex);
    		}

    		if ($$self.$$.dirty[0] & /*pagesCount, infinite*/ 134217732) {
    			$$invalidate(5, originalPagesCount = Math.max(pagesCount - (infinite ? 2 : 0), 1)); // without clones
    		}

    		if ($$self.$$.dirty[0] & /*pauseOnFocus, focused*/ 301989888) {
    			{
    				if (pauseOnFocus) {
    					if (focused) {
    						clearAutoplay();
    					} else {
    						applyAutoplay();
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*originalCurrentPageIndex, originalPagesCount, infinite*/ 52) {
    			// used for lazy loading images, preloaded only current, adjacent and cloanable images
    			$$invalidate(11, loaded = getAdjacentIndexes(originalCurrentPageIndex, originalPagesCount, infinite));
    		}
    	};

    	return [
    		timingFunction,
    		arrows,
    		infinite,
    		dots,
    		originalCurrentPageIndex,
    		originalPagesCount,
    		_duration,
    		pageWidth,
    		offset,
    		pageWindowElement,
    		pagesElement,
    		loaded,
    		handlePageChange,
    		showPrevPage,
    		showNextPage,
    		handleSwipeStart,
    		handleThreshold,
    		handleSwipeMove,
    		handleSwipeEnd,
    		handleFocused,
    		initialPageIndex,
    		duration,
    		autoplay,
    		autoplayDuration,
    		autoplayDirection,
    		pauseOnFocus,
    		currentPageIndex,
    		pagesCount,
    		focused,
    		$$scope,
    		slots,
    		swipeable_function,
    		div0_binding,
    		div1_binding,
    		pageChange_handler
    	];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				timingFunction: 0,
    				arrows: 1,
    				infinite: 2,
    				initialPageIndex: 20,
    				duration: 21,
    				autoplay: 22,
    				autoplayDuration: 23,
    				autoplayDirection: 24,
    				pauseOnFocus: 25,
    				dots: 3
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get timingFunction() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set timingFunction(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arrows() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arrows(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get infinite() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set infinite(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initialPageIndex() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initialPageIndex(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoplay() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoplay(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoplayDuration() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoplayDuration(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoplayDirection() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoplayDirection(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pauseOnFocus() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pauseOnFocus(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dots() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dots(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\About.svelte generated by Svelte v3.38.2 */

    const file$2 = "src\\components\\About.svelte";

    function create_fragment$2(ctx) {
    	let article;
    	let div7;
    	let header;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let main;
    	let div4;
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t4;
    	let div6;
    	let div5;
    	let p1;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div7 = element("div");
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "ABOUT I SAINT THE POET";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "__";
    			t3 = space();
    			main = element("main");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t4 = space();
    			div6 = element("div");
    			div5 = element("div");
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut vel distinctio ullam ducimus vero molestias? Autem sed nisi magni obcaecati blanditiis. Perspiciatis ea animi, tenetur nobis accusamus maxime ducimus enim provident quos fuga, quibusdam corrupti nihil consequatur dignissimos! Cupiditate magni inventore dignissimos earum fugiat aut nesciunt sed nostrum ea deserunt.";
    			add_location(h1, file$2, 5, 20, 144);
    			add_location(p0, file$2, 6, 20, 197);
    			attr_dev(div0, "class", "heade-text");
    			add_location(div0, file$2, 4, 16, 98);
    			attr_dev(div1, "class", "hd");
    			add_location(div1, file$2, 3, 12, 64);
    			add_location(header, file$2, 2, 8, 42);
    			if (img.src !== (img_src_value = "/assets/displayphoto.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "100px");
    			attr_dev(img, "alt", "innocent");
    			attr_dev(img, "class", "svelte-okvz09");
    			add_location(img, file$2, 13, 37, 391);
    			attr_dev(div2, "class", "img svelte-okvz09");
    			add_location(div2, file$2, 13, 20, 374);
    			attr_dev(div3, "class", "image");
    			add_location(div3, file$2, 12, 16, 333);
    			attr_dev(div4, "class", "mn");
    			add_location(div4, file$2, 11, 12, 299);
    			add_location(p1, file$2, 18, 20, 595);
    			attr_dev(div5, "class", "txt");
    			add_location(div5, file$2, 17, 16, 556);
    			attr_dev(div6, "class", "text");
    			add_location(div6, file$2, 16, 12, 520);
    			add_location(main, file$2, 10, 8, 279);
    			attr_dev(div7, "class", "art");
    			add_location(div7, file$2, 1, 4, 15);
    			attr_dev(article, "class", "svelte-okvz09");
    			add_location(article, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div7);
    			append_dev(div7, header);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div7, t3);
    			append_dev(div7, main);
    			append_dev(main, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(main, t4);
    			append_dev(main, div6);
    			append_dev(div6, div5);
    			append_dev(div5, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\routes\index.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\routes\\index.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i].id;
    	child_ctx[3] = list[i].name;
    	child_ctx[4] = list[i].image;
    	child_ctx[1] = list[i].date;
    	child_ctx[5] = list[i].text;
    	return child_ctx;
    }

    // (81:20) {#each data as  {id,name, image, date,text}}
    function create_each_block(ctx) {
    	let a;
    	let div4;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let p0;
    	let t2;
    	let h1;
    	let t3_value = /*name*/ ctx[3] + "";
    	let t3;
    	let t4;
    	let div2;
    	let p1;
    	let t5_value = /*date*/ ctx[1] + "";
    	let t5;
    	let t6;
    	let div3;
    	let p2;
    	let t7_value = /*text*/ ctx[5].substring(0, 80) + "";
    	let t7;
    	let t8;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "_";
    			t2 = space();
    			h1 = element("h1");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			div3 = element("div");
    			p2 = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			if (img.src !== (img_src_value = "/assets/" + /*image*/ ctx[4] + ".jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "artwork");
    			attr_dev(img, "width", "50px");
    			attr_dev(img, "class", "svelte-3g4etp");
    			add_location(img, file$1, 86, 40, 3912);
    			attr_dev(div0, "class", "img");
    			add_location(div0, file$1, 85, 36, 3853);
    			attr_dev(div1, "class", "image");
    			add_location(div1, file$1, 84, 32, 3796);
    			attr_dev(p0, "class", "svelte-3g4etp");
    			add_location(p0, file$1, 92, 32, 4213);
    			attr_dev(h1, "class", "svelte-3g4etp");
    			add_location(h1, file$1, 94, 32, 4257);
    			attr_dev(p1, "class", "svelte-3g4etp");
    			add_location(p1, file$1, 96, 36, 4362);
    			attr_dev(div2, "class", "date svelte-3g4etp");
    			add_location(div2, file$1, 95, 32, 4306);
    			attr_dev(p2, "class", "svelte-3g4etp");
    			add_location(p2, file$1, 101, 36, 4533);
    			attr_dev(div3, "class", "text svelte-3g4etp");
    			add_location(div3, file$1, 99, 32, 4475);
    			attr_dev(div4, "class", "cd svelte-3g4etp");
    			add_location(div4, file$1, 83, 28, 3746);
    			attr_dev(a, "href", /*id*/ ctx[2]);
    			attr_dev(a, "class", "card svelte-3g4etp");
    			add_location(a, file$1, 82, 24, 3688);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div4, t0);
    			append_dev(div4, p0);
    			append_dev(div4, t2);
    			append_dev(div4, h1);
    			append_dev(h1, t3);
    			append_dev(div4, t4);
    			append_dev(div4, div2);
    			append_dev(div2, p1);
    			append_dev(p1, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, p2);
    			append_dev(p2, t7);
    			append_dev(a, t8);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(81:20) {#each data as  {id,name, image, date,text}}",
    		ctx
    	});

    	return block;
    }

    // (75:20) <Carousel                      arrows={false}                      autoplay={true}                      autoplayDuration={4000}                                                                        >
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(75:20) <Carousel                      arrows={false}                      autoplay={true}                      autoplayDuration={4000}                                                                        >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let meta0;
    	let meta1;
    	let meta2;
    	let t0;
    	let article;
    	let header;
    	let div1;
    	let h10;
    	let t1;
    	let span;
    	let t3;
    	let t4;
    	let div0;
    	let p0;
    	let t6;
    	let p1;
    	let t8;
    	let main;
    	let div11;
    	let div7;
    	let div6;
    	let div2;
    	let p2;
    	let t10;
    	let div5;
    	let div3;
    	let h11;
    	let t12;
    	let p3;
    	let t14;
    	let div4;
    	let a0;
    	let p4;
    	let t16;
    	let a1;
    	let p5;
    	let t18;
    	let div10;
    	let div9;
    	let carousel;
    	let t19;
    	let div8;
    	let a2;
    	let t21;
    	let section;
    	let div14;
    	let div13;
    	let div12;
    	let about;
    	let current;

    	carousel = new Carousel({
    			props: {
    				arrows: false,
    				autoplay: true,
    				autoplayDuration: 4000,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			meta2 = element("meta");
    			t0 = space();
    			article = element("article");
    			header = element("header");
    			div1 = element("div");
    			h10 = element("h1");
    			t1 = text("WELCOME TO ");
    			span = element("span");
    			span.textContent = "I SAINT";
    			t3 = text(" POEMS");
    			t4 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "POEMS BY I SAINT THE POET";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "_";
    			t8 = space();
    			main = element("main");
    			div11 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div2 = element("div");
    			p2 = element("p");
    			p2.textContent = `${/*date*/ ctx[1].toLocaleDateString()}`;
    			t10 = space();
    			div5 = element("div");
    			div3 = element("div");
    			h11 = element("h1");
    			h11.textContent = "HOME BODY";
    			t12 = space();
    			p3 = element("p");
    			p3.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaque.";
    			t14 = space();
    			div4 = element("div");
    			a0 = element("a");
    			p4 = element("p");
    			p4.textContent = "you tube";
    			t16 = space();
    			a1 = element("a");
    			p5 = element("p");
    			p5.textContent = "download";
    			t18 = space();
    			div10 = element("div");
    			div9 = element("div");
    			create_component(carousel.$$.fragment);
    			t19 = space();
    			div8 = element("div");
    			a2 = element("a");
    			a2.textContent = "download";
    			t21 = space();
    			section = element("section");
    			div14 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			create_component(about.$$.fragment);
    			attr_dev(meta0, "name", "description");
    			attr_dev(meta0, "content", "luanar bssy timetable");
    			add_location(meta0, file$1, 1, 4, 23);
    			attr_dev(meta1, "name", "author");
    			attr_dev(meta1, "content", "peter butao");
    			add_location(meta1, file$1, 2, 4, 86);
    			attr_dev(meta2, "name", "theme-color");
    			attr_dev(meta2, "content", "#f5f5f5");
    			add_location(meta2, file$1, 3, 4, 134);
    			attr_dev(span, "class", "svelte-3g4etp");
    			add_location(span, file$1, 38, 27, 1973);
    			attr_dev(h10, "class", "svelte-3g4etp");
    			add_location(h10, file$1, 38, 12, 1958);
    			attr_dev(p0, "class", "svelte-3g4etp");
    			add_location(p0, file$1, 40, 16, 2065);
    			attr_dev(div0, "class", "header-subtxt");
    			add_location(div0, file$1, 39, 12, 2020);
    			attr_dev(p1, "class", "line svelte-3g4etp");
    			add_location(p1, file$1, 42, 12, 2131);
    			attr_dev(div1, "class", "header-txt");
    			add_location(div1, file$1, 37, 8, 1920);
    			attr_dev(header, "class", "svelte-3g4etp");
    			add_location(header, file$1, 36, 4, 1902);
    			attr_dev(p2, "class", "svelte-3g4etp");
    			add_location(p2, file$1, 52, 24, 2361);
    			attr_dev(div2, "class", "date svelte-3g4etp");
    			add_location(div2, file$1, 51, 20, 2317);
    			attr_dev(h11, "class", "svelte-3g4etp");
    			add_location(h11, file$1, 56, 28, 2547);
    			attr_dev(p3, "class", "svelte-3g4etp");
    			add_location(p3, file$1, 57, 28, 2595);
    			attr_dev(div3, "class", "hcc-text");
    			add_location(div3, file$1, 55, 24, 2495);
    			attr_dev(p4, "class", "svelte-3g4etp");
    			add_location(p4, file$1, 61, 32, 2955);
    			attr_dev(a0, "class", "youtube svelte-3g4etp");
    			attr_dev(a0, "href", "https://youtube");
    			add_location(a0, file$1, 60, 28, 2879);
    			attr_dev(p5, "class", "svelte-3g4etp");
    			add_location(p5, file$1, 64, 32, 3104);
    			attr_dev(a1, "class", "download svelte-3g4etp");
    			attr_dev(a1, "href", "document");
    			add_location(a1, file$1, 63, 28, 3034);
    			attr_dev(div4, "class", "hcc-button svelte-3g4etp");
    			add_location(div4, file$1, 59, 24, 2825);
    			attr_dev(div5, "class", "hc-content");
    			add_location(div5, file$1, 54, 20, 2445);
    			attr_dev(div6, "class", "hc");
    			add_location(div6, file$1, 50, 16, 2279);
    			attr_dev(div7, "class", "headcard svelte-3g4etp");
    			add_location(div7, file$1, 49, 12, 2239);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "svelte-3g4etp");
    			add_location(a2, file$1, 111, 24, 4858);
    			attr_dev(div8, "class", "download-btn svelte-3g4etp");
    			add_location(div8, file$1, 110, 20, 4806);
    			attr_dev(div9, "href", "/");
    			attr_dev(div9, "class", "cr-cards");
    			add_location(div9, file$1, 73, 16, 3321);
    			attr_dev(div10, "class", "carousel-cards svelte-3g4etp");
    			add_location(div10, file$1, 72, 12, 3275);
    			attr_dev(div11, "class", "mn");
    			add_location(div11, file$1, 47, 8, 2207);
    			attr_dev(main, "class", "svelte-3g4etp");
    			add_location(main, file$1, 46, 4, 2191);
    			attr_dev(div12, "class", "abt-sect");
    			add_location(div12, file$1, 124, 16, 5183);
    			attr_dev(div13, "class", "about-section");
    			add_location(div13, file$1, 123, 12, 5138);
    			attr_dev(div14, "class", "sect");
    			add_location(div14, file$1, 121, 8, 5104);
    			attr_dev(section, "class", "sections");
    			add_location(section, file$1, 120, 4, 5068);
    			attr_dev(article, "class", "svelte-3g4etp");
    			add_location(article, file$1, 35, 0, 1887);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, meta2);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, header);
    			append_dev(header, div1);
    			append_dev(div1, h10);
    			append_dev(h10, t1);
    			append_dev(h10, span);
    			append_dev(h10, t3);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div1, t6);
    			append_dev(div1, p1);
    			append_dev(article, t8);
    			append_dev(article, main);
    			append_dev(main, div11);
    			append_dev(div11, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, p2);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, h11);
    			append_dev(div3, t12);
    			append_dev(div3, p3);
    			append_dev(div5, t14);
    			append_dev(div5, div4);
    			append_dev(div4, a0);
    			append_dev(a0, p4);
    			append_dev(div4, t16);
    			append_dev(div4, a1);
    			append_dev(a1, p5);
    			append_dev(div11, t18);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			mount_component(carousel, div9, null);
    			append_dev(div9, t19);
    			append_dev(div9, div8);
    			append_dev(div8, a2);
    			append_dev(article, t21);
    			append_dev(article, section);
    			append_dev(section, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			mount_component(about, div12, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const carousel_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				carousel_changes.$$scope = { dirty, ctx };
    			}

    			carousel.$set(carousel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(meta2);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(article);
    			destroy_component(carousel);
    			destroy_component(about);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Routes", slots, []);
    	let date = new Date();

    	let data = [
    		{
    			id: 0,
    			image: "img (1)",
    			name: "home body",
    			text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaqueLorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaque",
    			date: `${date.toLocaleDateString()}`
    		},
    		{
    			id: 1,
    			image: "img (2)",
    			name: "lorem ipsum",
    			text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaqueLorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaque",
    			date: `${date.toLocaleDateString()}`
    		},
    		{
    			id: 2,
    			image: "img (3)",
    			name: "sun",
    			text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaqueLorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaque",
    			date: `${date.toLocaleDateString()}`
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Routes> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Carousel, About, date, data });

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) $$invalidate(1, date = $$props.date);
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, date];
    }

    class Routes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Routes",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let router;
    	let t0;
    	let section;
    	let nav;
    	let div6;
    	let div0;
    	let a0;
    	let h1;
    	let t2;
    	let div4;
    	let div1;
    	let t3;
    	let div2;
    	let t4;
    	let div3;
    	let t5;
    	let div5;
    	let ul0;
    	let li0;
    	let a1;
    	let t7;
    	let li1;
    	let a2;
    	let t9;
    	let li2;
    	let a3;
    	let t11;
    	let li3;
    	let a4;
    	let t13;
    	let main;
    	let t14;
    	let footer;
    	let div7;
    	let ul1;
    	let li4;
    	let a5;
    	let svg0;
    	let defs0;
    	let clipPath0;
    	let rect0;
    	let clipPath1;
    	let rect1;
    	let g1;
    	let g0;
    	let rect2;
    	let path0;
    	let t15;
    	let li5;
    	let a6;
    	let svg1;
    	let defs1;
    	let clipPath2;
    	let rect3;
    	let clipPath3;
    	let rect4;
    	let g3;
    	let g2;
    	let rect5;
    	let path1;
    	let t16;
    	let li6;
    	let a7;
    	let svg2;
    	let defs2;
    	let clipPath4;
    	let rect6;
    	let clipPath5;
    	let rect7;
    	let g5;
    	let g4;
    	let rect8;
    	let path2;
    	let t17;
    	let li7;
    	let a8;
    	let t18;
    	let p;
    	let current;
    	let mounted;
    	let dispose;

    	router = new Router({
    			props: { routes: { "/": Routes } },
    			$$inline: true
    		});

    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    			t0 = space();
    			section = element("section");
    			nav = element("nav");
    			div6 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			h1 = element("h1");
    			h1.textContent = "I SAINT";
    			t2 = space();
    			div4 = element("div");
    			div1 = element("div");
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			div5 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "GET INVOLVED";
    			t7 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "DOCS";
    			t9 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "LICENCE";
    			t11 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "CONTACT";
    			t13 = space();
    			main = element("main");
    			if (default_slot) default_slot.c();
    			t14 = space();
    			footer = element("footer");
    			div7 = element("div");
    			ul1 = element("ul");
    			li4 = element("li");
    			a5 = element("a");
    			svg0 = svg_element("svg");
    			defs0 = svg_element("defs");
    			clipPath0 = svg_element("clipPath");
    			rect0 = svg_element("rect");
    			clipPath1 = svg_element("clipPath");
    			rect1 = svg_element("rect");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			rect2 = svg_element("rect");
    			path0 = svg_element("path");
    			t15 = space();
    			li5 = element("li");
    			a6 = element("a");
    			svg1 = svg_element("svg");
    			defs1 = svg_element("defs");
    			clipPath2 = svg_element("clipPath");
    			rect3 = svg_element("rect");
    			clipPath3 = svg_element("clipPath");
    			rect4 = svg_element("rect");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			rect5 = svg_element("rect");
    			path1 = svg_element("path");
    			t16 = space();
    			li6 = element("li");
    			a7 = element("a");
    			svg2 = svg_element("svg");
    			defs2 = svg_element("defs");
    			clipPath4 = svg_element("clipPath");
    			rect6 = svg_element("rect");
    			clipPath5 = svg_element("clipPath");
    			rect7 = svg_element("rect");
    			g5 = svg_element("g");
    			g4 = svg_element("g");
    			rect8 = svg_element("rect");
    			path2 = svg_element("path");
    			t17 = space();
    			li7 = element("li");
    			a8 = element("a");
    			t18 = space();
    			p = element("p");
    			p.textContent = "© BUTAO UX / UI DEV | 2021";
    			attr_dev(h1, "class", "svelte-4eg0wu");
    			add_location(h1, file, 18, 20, 322);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-4eg0wu");
    			add_location(a0, file, 17, 16, 289);
    			attr_dev(div0, "class", "brand svelte-4eg0wu");
    			add_location(div0, file, 16, 12, 253);
    			attr_dev(div1, "class", "line-1 svelte-4eg0wu");
    			add_location(div1, file, 23, 16, 467);
    			attr_dev(div2, "class", "line-2 svelte-4eg0wu");
    			add_location(div2, file, 24, 16, 510);
    			attr_dev(div3, "class", "line-3 svelte-4eg0wu");
    			add_location(div3, file, 25, 16, 553);
    			attr_dev(div4, "class", "menu svelte-4eg0wu");
    			add_location(div4, file, 22, 12, 400);
    			attr_dev(a1, "href", "https://github.com/Peterbutao/luanar-site-svelte.git");
    			attr_dev(a1, "class", "svelte-4eg0wu");
    			add_location(a1, file, 30, 24, 788);
    			attr_dev(li0, "class", "svelte-4eg0wu");
    			add_location(li0, file, 30, 20, 784);
    			attr_dev(a2, "href", "https://github.com/Peterbutao/luanar-site-svelte.git");
    			attr_dev(a2, "class", "svelte-4eg0wu");
    			add_location(a2, file, 31, 24, 897);
    			attr_dev(li1, "class", "svelte-4eg0wu");
    			add_location(li1, file, 31, 20, 893);
    			attr_dev(a3, "href", "https://github.com/Peterbutao/luanar-site-svelte.git/licence");
    			attr_dev(a3, "class", "svelte-4eg0wu");
    			add_location(a3, file, 32, 24, 998);
    			attr_dev(li2, "class", "svelte-4eg0wu");
    			add_location(li2, file, 32, 20, 994);
    			attr_dev(a4, "href", "tel://0880164455");
    			attr_dev(a4, "class", "svelte-4eg0wu");
    			add_location(a4, file, 33, 24, 1110);
    			attr_dev(li3, "class", "svelte-4eg0wu");
    			add_location(li3, file, 33, 20, 1106);
    			attr_dev(ul0, "class", "navlist svelte-4eg0wu");
    			add_location(ul0, file, 29, 16, 712);
    			attr_dev(div5, "class", "nav-bar svelte-4eg0wu");
    			toggle_class(div5, "open", /*open*/ ctx[0]);
    			add_location(div5, file, 28, 12, 624);
    			attr_dev(div6, "class", "nv svelte-4eg0wu");
    			add_location(div6, file, 15, 8, 224);
    			attr_dev(nav, "class", "nav-one svelte-4eg0wu");
    			add_location(nav, file, 14, 4, 194);
    			attr_dev(main, "class", "content svelte-4eg0wu");
    			add_location(main, file, 39, 4, 1238);
    			attr_dev(rect0, "width", "15");
    			attr_dev(rect0, "height", "15");
    			attr_dev(rect0, "transform", "translate(107 766)");
    			attr_dev(rect0, "fill", "#fff");
    			attr_dev(rect0, "stroke", "#707070");
    			attr_dev(rect0, "stroke-width", "1");
    			attr_dev(rect0, "class", "svelte-4eg0wu");
    			add_location(rect0, file, 48, 180, 1589);
    			attr_dev(clipPath0, "id", "a");
    			attr_dev(clipPath0, "class", "svelte-4eg0wu");
    			add_location(clipPath0, file, 48, 163, 1572);
    			attr_dev(rect1, "width", "13.846");
    			attr_dev(rect1, "height", "15");
    			attr_dev(rect1, "fill", "none");
    			attr_dev(rect1, "class", "svelte-4eg0wu");
    			add_location(rect1, file, 48, 315, 1724);
    			attr_dev(clipPath1, "id", "b");
    			attr_dev(clipPath1, "class", "svelte-4eg0wu");
    			add_location(clipPath1, file, 48, 298, 1707);
    			attr_dev(defs0, "class", "svelte-4eg0wu");
    			add_location(defs0, file, 48, 157, 1566);
    			attr_dev(rect2, "width", "13.846");
    			attr_dev(rect2, "height", "15");
    			attr_dev(rect2, "fill", "none");
    			attr_dev(rect2, "class", "svelte-4eg0wu");
    			add_location(rect2, file, 48, 493, 1902);
    			attr_dev(path0, "d", "M12.115,1.833H1.731L6.923,6.417ZM0,1.833A1.789,1.789,0,0,1,1.731,0H12.115a1.789,1.789,0,0,1,1.731,1.833V9.167A1.789,1.789,0,0,1,12.115,11H1.731A1.789,1.789,0,0,1,0,9.167Z");
    			attr_dev(path0, "transform", "translate(0 2)");
    			attr_dev(path0, "fill", "#fff");
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "class", "svelte-4eg0wu");
    			add_location(path0, file, 48, 539, 1948);
    			attr_dev(g0, "transform", "translate(107.577 766)");
    			attr_dev(g0, "clip-path", "url(#b)");
    			attr_dev(g0, "class", "svelte-4eg0wu");
    			add_location(g0, file, 48, 435, 1844);
    			attr_dev(g1, "transform", "translate(-107 -766)");
    			attr_dev(g1, "clip-path", "url(#a)");
    			attr_dev(g1, "class", "svelte-4eg0wu");
    			add_location(g1, file, 48, 379, 1788);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg0, "width", "15");
    			attr_dev(svg0, "height", "15");
    			attr_dev(svg0, "viewBox", "0 0 15 15");
    			attr_dev(svg0, "class", "svelte-4eg0wu");
    			add_location(svg0, file, 48, 31, 1440);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "svelte-4eg0wu");
    			add_location(a5, file, 48, 19, 1428);
    			attr_dev(li4, "class", "svelte-4eg0wu");
    			add_location(li4, file, 48, 15, 1424);
    			attr_dev(rect3, "width", "15");
    			attr_dev(rect3, "height", "15");
    			attr_dev(rect3, "transform", "translate(289 766)");
    			attr_dev(rect3, "fill", "#fff");
    			attr_dev(rect3, "stroke", "#707070");
    			attr_dev(rect3, "stroke-width", "1");
    			attr_dev(rect3, "class", "svelte-4eg0wu");
    			add_location(rect3, file, 49, 180, 2393);
    			attr_dev(clipPath2, "id", "a");
    			attr_dev(clipPath2, "class", "svelte-4eg0wu");
    			add_location(clipPath2, file, 49, 163, 2376);
    			attr_dev(rect4, "width", "13.846");
    			attr_dev(rect4, "height", "15");
    			attr_dev(rect4, "fill", "none");
    			attr_dev(rect4, "class", "svelte-4eg0wu");
    			add_location(rect4, file, 49, 315, 2528);
    			attr_dev(clipPath3, "id", "b");
    			attr_dev(clipPath3, "class", "svelte-4eg0wu");
    			add_location(clipPath3, file, 49, 298, 2511);
    			attr_dev(defs1, "class", "svelte-4eg0wu");
    			add_location(defs1, file, 49, 157, 2370);
    			attr_dev(rect5, "width", "12.923");
    			attr_dev(rect5, "height", "14");
    			attr_dev(rect5, "fill", "none");
    			attr_dev(rect5, "class", "svelte-4eg0wu");
    			add_location(rect5, file, 49, 493, 2706);
    			attr_dev(path1, "d", "M197,15.989V8.7h2.3l.329-2.844H197V4.078c0-.8.246-1.422,1.313-1.422h1.395V.078c-.328,0-1.148-.089-2.051-.089a3.038,3.038,0,0,0-2.476,1.027,3.6,3.6,0,0,0-.888,2.706V5.856H192V8.7h2.3v7.289Z");
    			attr_dev(path1, "transform", "translate(-188.79 0.011)");
    			attr_dev(path1, "fill", "#fff");
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "class", "svelte-4eg0wu");
    			add_location(path1, file, 49, 539, 2752);
    			attr_dev(g2, "transform", "translate(289.577 766)");
    			attr_dev(g2, "clip-path", "url(#b)");
    			attr_dev(g2, "class", "svelte-4eg0wu");
    			add_location(g2, file, 49, 435, 2648);
    			attr_dev(g3, "transform", "translate(-289 -766)");
    			attr_dev(g3, "clip-path", "url(#a)");
    			attr_dev(g3, "class", "svelte-4eg0wu");
    			add_location(g3, file, 49, 379, 2592);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg1, "width", "15");
    			attr_dev(svg1, "height", "15");
    			attr_dev(svg1, "viewBox", "0 0 15 15");
    			attr_dev(svg1, "class", "svelte-4eg0wu");
    			add_location(svg1, file, 49, 31, 2244);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "svelte-4eg0wu");
    			add_location(a6, file, 49, 19, 2232);
    			attr_dev(li5, "class", "svelte-4eg0wu");
    			add_location(li5, file, 49, 15, 2228);
    			attr_dev(rect6, "width", "15");
    			attr_dev(rect6, "height", "15");
    			attr_dev(rect6, "transform", "translate(16 766)");
    			attr_dev(rect6, "fill", "#fff");
    			attr_dev(rect6, "stroke", "#707070");
    			attr_dev(rect6, "stroke-width", "1");
    			attr_dev(rect6, "class", "svelte-4eg0wu");
    			add_location(rect6, file, 50, 180, 3225);
    			attr_dev(clipPath4, "id", "a");
    			attr_dev(clipPath4, "class", "svelte-4eg0wu");
    			add_location(clipPath4, file, 50, 163, 3208);
    			attr_dev(rect7, "width", "13.846");
    			attr_dev(rect7, "height", "15");
    			attr_dev(rect7, "fill", "none");
    			attr_dev(rect7, "class", "svelte-4eg0wu");
    			add_location(rect7, file, 50, 314, 3359);
    			attr_dev(clipPath5, "id", "b");
    			attr_dev(clipPath5, "class", "svelte-4eg0wu");
    			add_location(clipPath5, file, 50, 297, 3342);
    			attr_dev(defs2, "class", "svelte-4eg0wu");
    			add_location(defs2, file, 50, 157, 3202);
    			attr_dev(rect8, "width", "12.923");
    			attr_dev(rect8, "height", "14");
    			attr_dev(rect8, "fill", "none");
    			attr_dev(rect8, "class", "svelte-4eg0wu");
    			add_location(rect8, file, 50, 490, 3535);
    			attr_dev(path2, "d", "M95.225,15.967a7.068,7.068,0,0,0,5.261-2.331,8.313,8.313,0,0,0,2.151-5.7V7.553A6.039,6.039,0,0,0,103.908,6.1a5.52,5.52,0,0,1-1.482.459,2.945,2.945,0,0,0,1.13-1.53,6.188,6.188,0,0,1-1.624.688,2.439,2.439,0,0,0-1.907-.917,2.77,2.77,0,0,0-2.612,2.83,1.608,1.608,0,0,0,.07.612,7.135,7.135,0,0,1-5.366-2.983,3.092,3.092,0,0,0,.777,3.824,2.248,2.248,0,0,1-1.2-.382h0a2.749,2.749,0,0,0,2.118,2.753,2.017,2.017,0,0,1-.706.076,1.115,1.115,0,0,1-.494-.076,2.712,2.712,0,0,0,2.471,1.989,5.077,5.077,0,0,1-3.247,1.224,1.812,1.812,0,0,1-.636-.077,6.319,6.319,0,0,0,4.025,1.377");
    			attr_dev(path2, "transform", "translate(-91.2 -2.8)");
    			attr_dev(path2, "fill", "#fff");
    			attr_dev(path2, "fill-rule", "evenodd");
    			attr_dev(path2, "class", "svelte-4eg0wu");
    			add_location(path2, file, 50, 536, 3581);
    			attr_dev(g4, "transform", "translate(16.577 766)");
    			attr_dev(g4, "clip-path", "url(#b)");
    			attr_dev(g4, "class", "svelte-4eg0wu");
    			add_location(g4, file, 50, 433, 3478);
    			attr_dev(g5, "transform", "translate(-16 -766)");
    			attr_dev(g5, "clip-path", "url(#a)");
    			attr_dev(g5, "class", "svelte-4eg0wu");
    			add_location(g5, file, 50, 378, 3423);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg2, "width", "15");
    			attr_dev(svg2, "height", "15");
    			attr_dev(svg2, "viewBox", "0 0 15 15");
    			attr_dev(svg2, "class", "svelte-4eg0wu");
    			add_location(svg2, file, 50, 31, 3076);
    			attr_dev(a7, "href", "/");
    			attr_dev(a7, "class", "svelte-4eg0wu");
    			add_location(a7, file, 50, 19, 3064);
    			attr_dev(li6, "class", "svelte-4eg0wu");
    			add_location(li6, file, 50, 15, 3060);
    			attr_dev(a8, "href", "/");
    			attr_dev(a8, "class", "svelte-4eg0wu");
    			add_location(a8, file, 51, 19, 4265);
    			attr_dev(li7, "class", "svelte-4eg0wu");
    			add_location(li7, file, 51, 15, 4261);
    			attr_dev(ul1, "class", "navlist svelte-4eg0wu");
    			add_location(ul1, file, 46, 12, 1371);
    			attr_dev(p, "class", "svelte-4eg0wu");
    			add_location(p, file, 55, 12, 4330);
    			attr_dev(div7, "class", "ft svelte-4eg0wu");
    			add_location(div7, file, 43, 8, 1329);
    			attr_dev(footer, "class", "foot svelte-4eg0wu");
    			add_location(footer, file, 42, 4, 1299);
    			attr_dev(section, "id", "layout");
    			attr_dev(section, "class", "svelte-4eg0wu");
    			add_location(section, file, 13, 0, 167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, nav);
    			append_dev(nav, div6);
    			append_dev(div6, div0);
    			append_dev(div0, a0);
    			append_dev(a0, h1);
    			append_dev(div6, t2);
    			append_dev(div6, div4);
    			append_dev(div4, div1);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			append_dev(div5, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a1);
    			append_dev(ul0, t7);
    			append_dev(ul0, li1);
    			append_dev(li1, a2);
    			append_dev(ul0, t9);
    			append_dev(ul0, li2);
    			append_dev(li2, a3);
    			append_dev(ul0, t11);
    			append_dev(ul0, li3);
    			append_dev(li3, a4);
    			append_dev(section, t13);
    			append_dev(section, main);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			append_dev(section, t14);
    			append_dev(section, footer);
    			append_dev(footer, div7);
    			append_dev(div7, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, a5);
    			append_dev(a5, svg0);
    			append_dev(svg0, defs0);
    			append_dev(defs0, clipPath0);
    			append_dev(clipPath0, rect0);
    			append_dev(defs0, clipPath1);
    			append_dev(clipPath1, rect1);
    			append_dev(svg0, g1);
    			append_dev(g1, g0);
    			append_dev(g0, rect2);
    			append_dev(g0, path0);
    			append_dev(ul1, t15);
    			append_dev(ul1, li5);
    			append_dev(li5, a6);
    			append_dev(a6, svg1);
    			append_dev(svg1, defs1);
    			append_dev(defs1, clipPath2);
    			append_dev(clipPath2, rect3);
    			append_dev(defs1, clipPath3);
    			append_dev(clipPath3, rect4);
    			append_dev(svg1, g3);
    			append_dev(g3, g2);
    			append_dev(g2, rect5);
    			append_dev(g2, path1);
    			append_dev(ul1, t16);
    			append_dev(ul1, li6);
    			append_dev(li6, a7);
    			append_dev(a7, svg2);
    			append_dev(svg2, defs2);
    			append_dev(defs2, clipPath4);
    			append_dev(clipPath4, rect6);
    			append_dev(defs2, clipPath5);
    			append_dev(clipPath5, rect7);
    			append_dev(svg2, g5);
    			append_dev(g5, g4);
    			append_dev(g4, rect8);
    			append_dev(g4, path2);
    			append_dev(ul1, t17);
    			append_dev(ul1, li7);
    			append_dev(li7, a8);
    			append_dev(div7, t18);
    			append_dev(div7, p);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div4, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(ul0, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(div5, "click", /*click_handler_2*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*open*/ 1) {
    				toggle_class(div5, "open", /*open*/ ctx[0]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let open;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, open = !open);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, open);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(0, open = !open);
    	};

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Router, link, Home: Routes, open });

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, open = false);
    	return [open, $$scope, slots, click_handler, click_handler_1, click_handler_2];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
