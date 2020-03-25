interface Map<K, V> {
    map(callback: (key: K, value: V, index: number) => any): any
}

Map.prototype.map = function(callback) {
    // Retrieve all keys from the Map
    const keys = Array.from(this.entries());

    // Then map over the keys, while continusouly retrieving the value
    return keys.map((key: any, index: number) => {
        // Then call the callback for each item
        return callback(this.get(key), key, index);
    });
}