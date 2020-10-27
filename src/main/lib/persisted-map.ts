class PersistedMap<K, V> extends Map<K, V> {
    private isInitialised = false;
    private callback: (map: PersistedMap<K, V>) => void;

    constructor(rows: [K,V][], callback: (map: PersistedMap<K, V>) => void) {
        super(rows);

        this.callback = callback.bind(this);
        this.isInitialised = true;
    }

    set(key: K, value: V): this {
        const ret = super.set(key, value);

        if (this.isInitialised) {
            this.callback(this);
        }

        return ret;
    }
}

export default PersistedMap;