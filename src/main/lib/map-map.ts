interface Map<K, V> {
    // eslint-disable-next-line
    map(callback: (value: V, key: K, index: number) => any): any
}

Map.prototype.map = function(callback) {
    // Retrieve all keys from the Map
    const entries = Array.from(this.entries());

    // Then map over the keys, while continusouly retrieving the value
    return entries.map(([key, value], index) => {
        // Then call the callback for each item
        return callback(value, key, index);
    });
}