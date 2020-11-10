/**
 * A class that accepts a function that is called each time the map is updated,
 * as to make persisting it (ie. in electron-store) a bit easier.
 */
class PersistedMap<K, V> extends Map<K, V> {
    private callback: (map: PersistedMap<K, V>) => void;

    constructor(rows: [K,V][], callback: (map: PersistedMap<K, V>) => void) {
        super(rows);
        
        // Bind the callback to the instance of this class
        this.callback = callback.bind(this);
    }

    set(key: K, value: V): this {
        const ret = super.set(key, value);

        // GUARD: the super call in the in the constructor calls set internally.
        // Since the callback isn't yet set at that point, we disregard any
        // callback calls when this happens.
        if (this.callback) {
            this.callback(this);
        }

        return ret;
    }

    delete(key: K): boolean {
        const ret = super.delete(key);
        this.callback(this);
        return ret;
    }

    clear(): void {
        super.clear();
        this.callback(this);
    }
}

export default PersistedMap;