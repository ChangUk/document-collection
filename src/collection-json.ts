import type { JsonConfig, Options } from "./type";
import Collection, { DocumentID, Document } from "./collection";

export class JSONCollection extends Collection {
	private _config: JsonConfig = {};

	constructor(options: Options) {
		super(options.search);
		Object.assign(this._config, options.config || {});
	}

	public keys = async (): Promise<Array<DocumentID>> => {
		return new Promise((resolve, reject) => {
			resolve(Object.keys(this._collection));
		});
	};

	public get = async (docId: DocumentID): Promise<Document | null> => {
		if (!docId || !(docId in this._collection)) return Promise.resolve(null);
		return new Promise((resolve, reject) => {
			resolve(this._collection[docId]);
		});
	};

	public set = async (docId: DocumentID, doc: Document | null): Promise<Document | null> => {
		if (!docId || !doc) return Promise.resolve(null);
		return new Promise((resolve, reject) => {
			this._collection[docId] = Object.assign(doc, { _id: docId });
			this._order.push(docId);
			resolve(this._collection[docId]);
		});
	};

	public update = async (docId: DocumentID, doc: Document | null): Promise<Document | null> => {
		if (!docId || !doc) return Promise.resolve(null);
		if (!(docId in this._collection)) return this.set(docId, Object.assign(doc, { _id: docId }));
		return this.set(
			docId,
			await this.get(docId).then((result) => {
				if (!result) return null;
				return Object.assign(result, doc, { _id: docId });
			})
		);
	};

	public sort = async (): Promise<Array<DocumentID>> => {
		const sorter = (): ((a: DocumentID, b: DocumentID) => number) => {
			if (!this._searchOptions) {
				return (a: DocumentID, b: DocumentID) => {
					return 0;
				};
			}
			let directions: Array<number> = [];
			let fields = this._searchOptions?.orderBy?.map((field: string, i: number) => {
				if (field[0] === "-") {
					directions[i] = -1;
					field = field.substring(1);
				} else directions[i] = 1;
				return field;
			});
			return (a: DocumentID, b: DocumentID) => {
				if (fields) {
					const docA: Document | null = this._collection[a];
					const docB: Document | null = this._collection[b];
					if (docA && docB) {
						for (let f = 0; f < fields.length; f++) {
							const field = fields[f];
							if (docA[field] > docB[field]) return directions[f];
							if (docA[field] < docB[field]) return -directions[f];
						}
					}
				}
				return 0;
			};
		};
		return new Promise((resolve, reject) => {
			let results: Array<DocumentID> = this._order.sort(sorter());
			resolve(results.slice(0, this._searchOptions.limit || Number.MAX_SAFE_INTEGER - 1));
		});
	};

	public search = async (query: string): Promise<Array<DocumentID>> => {
		if (!query) return Promise.resolve([]);
		return new Promise((resolve, reject) => {
			let matches = <Array<DocumentID>>[];
			if (!this._searchOptions) return resolve(matches);

			const total: number = Object.keys(this._collection).length;
			const limit: number = this._searchOptions.limit || Number.MAX_SAFE_INTEGER;
			for (let i = 0; i < total; i++) {
				const docId = this._order[i];
				let match = this._findMatches(query, docId, this._collection[docId]);
				if (match) {
					matches.push(match);
					if (matches.length >= limit) break;
				}
			}
			resolve(matches);
		});
	};

	public remove = async (docId: DocumentID): Promise<boolean> => {
		if (!docId || !(docId in this._collection)) return Promise.resolve(false);
		return new Promise((resolve, reject) => {
			try {
				delete this._collection[docId];
				resolve(true);
			} catch (err: any) {
				resolve(false);
			}
		});
	};

	public clear = async (): Promise<boolean> => {
		return new Promise((resolve, reject) => {
			try {
				for (const docId in this._collection) {
					delete this._collection[docId];
				}
				resolve(true);
			} catch (err: any) {
				resolve(false);
			}
		});
	};
}
