export class RandomGen {
    public random(options?: any) {
        if (window.crypto && window.crypto.getRandomValues) {
            let opts = { ...options }
            let d = new Uint8Array(16);
            window.crypto.getRandomValues(d);
            let s = String.fromCharCode.apply(null, d);
            if (opts.hex) {
                return this.binStringToHex(s);
            } else {
                return s;
            }
        } else {
            return this.makeRandomId();
        }
    }

    private makeRandomId() {
        return (Math.random() + 1).toString(36).substr(2, 7);
    }

    private binStringToHex(binString: string) {
        let hex = '';
        let char;
        for (var i = 0; i < binString.length; ++i) {
            char = binString.charCodeAt(i);
            hex += (char >> 4).toString(16);
            hex += (char & 0xF).toString(16);
        }
        return hex;
    }
}

export const randomGen = new RandomGen();
