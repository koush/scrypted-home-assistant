export function bitmaskToInterfaces(mask: number, keys: Map<number, string>, interfaces: any) {
    const ret = [];
    var test = 1;
    while (mask !== 0) {
        if (mask % 2 === 1) {
            const feature = keys.get(test);
            if (feature) {
                ret.push(feature);
            }
        }

        test <<= 1;
        mask >>= 1;
    }
    return ret
    .map(feature => interfaces[feature])
    .filter(iface => iface);
}

// reverse the dict.
export function makeKeys(keys: any): Map<number, string> {
    var ret: Map<number, string> = new Map();
    for (var key of Object.keys(keys)) {
        ret.set(keys[key], key);
    }
    return ret;
}