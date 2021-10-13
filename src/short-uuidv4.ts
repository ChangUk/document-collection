declare global {
	interface String {
		padStart(length: number, padString: string): string;
	}
	interface Window {
		msCrypto: any;
	}
}

interface IDictionary<T> {
	[key: string]: T;
}

String.prototype.padStart = function (length: number, padString: string): string {
	length = length >> 0; // Truncate if number or convert non-number to 0;
	padString = String(typeof padString !== "undefined" ? padString : " ");
	if (this.length > length) {
		return String(this);
	} else {
		length -= this.length;
		if (length > padString.length) {
			// Append to original to ensure we are longer than needed
			padString += padString.repeat(length / padString.length);
		}
		return padString.slice(0, length) + String(this);
	}
};

class Converter {
	srcBase: string;
	dstBase: string;
	constructor(srcBase: string, dstBase: string) {
		if (!srcBase || !dstBase || !srcBase.length || !dstBase.length) {
			throw new Error("Invalid base string!");
		}
		this.srcBase = srcBase;
		this.dstBase = dstBase;
	}

	public run(uuid: string): string {
		if (this.srcBase === this.dstBase) return uuid;

		let inputLength: number = uuid.length;
		let newLength: number = 0,
			div: number = 0;
		let srcLength: number = this.srcBase.length;
		let dstLength: number = this.dstBase.length;
		let converted: string = "";
		let map: IDictionary<number> = {};

		for (let i: number = 0; i < inputLength; i++) map[i] = this.srcBase.indexOf(uuid[i]);

		do {
			div = 0;
			newLength = 0;
			for (let i: number = 0; i < inputLength; i++) {
				div = div * srcLength + map[i];
				if (div >= dstLength) {
					map[newLength++] = parseInt((div / dstLength).toString(), 10);
					div = div % dstLength;
				} else {
					if (newLength > 0) map[newLength++] = 0;
				}
			}
			inputLength = newLength;
			converted = this.dstBase[div] + converted;
		} while (newLength != 0);
		return converted;
	}
}

export default class ShortUuidV4 {
	constructor() {}

	public static get BASE_DEF(): string {
		return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	}
	public static get BASE_BIN(): string {
		return "01";
	}
	public static get BASE_OCT(): string {
		return "01234567";
	}
	public static get BASE_DEC(): string {
		return "0123456789";
	}
	public static get BASE_HEX(): string {
		return "0123456789abcdef";
	}

	private checkBase(base: string) {
		if ([...new Set(Array.from(base))].length !== base.length) {
			throw new Error("The given base string has duplicate characters resulting in unreliable results.");
		}
	}

	private uuidv4(): string {
		let crypto: Crypto = window.crypto || window.msCrypto;
		if (!crypto) return "";
		return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any) =>
			(c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
		);
	}

	public new(): string {
		return this.generate(ShortUuidV4.BASE_DEF);
	}

	public generate(base: string = ShortUuidV4.BASE_DEF): string {
		// this.checkBase(base);
		return this.translate(this.uuidv4(), ShortUuidV4.BASE_HEX, base);
	}

	public translate(uuid: string, from: string = ShortUuidV4.BASE_DEF, to: string = ShortUuidV4.BASE_HEX): string {
		// this.checkBase(from);
		// this.checkBase(to);
		uuid = uuid.replace(/-/g, "");
		let length: number = Math.ceil(Math.log(2 ** 128) / Math.log(to.length));
		return this.formatUuidV4(new Converter(from, to).run(uuid).padStart(length, to[0]));
	}

	public formatUuidV4(uuid: string) {
		const m: RegExpMatchArray | null = uuid.match(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/);
		return m ? [m[1], m[2], m[3], m[4], m[5]].join("-") : uuid;
	}
}
