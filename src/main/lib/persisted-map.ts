class PersistedMap<K, V> extends Map<K, V> {
    private isInitialised = false;
    private callback: (map: PersistedMap<K, V>) => void;

    constructor(obj: { key: K, value: V }[], callback: (map: PersistedMap<K, V>) => void) {
        super();
        
        obj.forEach(({ key, value }) => {
            this.set(key, value);
        });

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

    toString(): string {
        const obj = Array.from(this.keys()).map((key) => {
            return { key, value: this.get(key) };
        });
        return JSON.stringify(obj);
    }
}

export default PersistedMap;