import localForage from "localforage";

import type { Options, IndexeddbConfig } from "./type";
import Collection, { CollectionUnit, DocumentID, Document } from "./collection";

export class IDBCollection extends Collection {
	private _config: IndexeddbConfig = {
		name: "dc",
		collectionName: "documents",
	};

	constructor(options: Options) {
		super(options.search);
		Object.assign(this._config, options.config || {});

		try {
			this._collection = localForage.createInstance({
				name: this._config.name,
				storeName: this._config.collectionName,
			});
		} catch (err: any) {
			throw new Error("Unable to create IndexedDB instance.");
		}
	}

	public keys = async (): Promise<Array<DocumentID>> => {
		return new Promise((resolve, reject) => {
			this._collection
				.keys()
				.then((keys: Array<DocumentID>) => {
					resolve(keys);
				})
				.catch((err: any) => {
					resolve([]);
				});
		});
	};

	public get = async (docId: DocumentID): Promise<Document | null> => {
		if (!docId) return Promise.resolve(null);
		return new Promise((resolve, reject) => {
			this._collection
				.getItem(docId)
				.then((doc: Document | null) => {
					resolve(doc);
				})
				.catch((err: any) => {
					resolve(null);
				});
		});
	};

	public set = async (docId: DocumentID, doc: Document | null): Promise<Document | null> => {
		if (!docId || !doc) return Promise.resolve(null);
		return new Promise((resolve, reject) => {
			this._collection
				.setItem(docId, Object.assign(doc, { _id: docId }))
				.then((doc: Document) => {
					this._order.push(docId);
					resolve(doc);
				})
				.catch((err: any) => {
					resolve(null);
				});
		});
	};

	public update = async (docId: DocumentID, doc: Document | null): Promise<Document | null> => {
		if (!docId || !doc) return Promise.resolve(null);
		if (!(docId in this._collection)) return this.set(docId, Object.assign(doc, { _id: docId }));
		return this.set(docId, await this.get(docId).then((result) => Object.assign(result, doc, { _id: docId })));
	};

	public sort = async (): Promise<Array<DocumentID>> => {
		const jsonified = await this.jsonify();
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
					const docA: Document | null = jsonified[a];
					const docB: Document | null = jsonified[b];
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

			const limit: number = this._searchOptions.limit || Number.MAX_VALUE;
			this._collection
				.iterate((doc: Document, docId: string, n: number) => {
					// `n` is one-based number
					let match = this._findMatches(query, docId, doc);
					if (match) {
						matches.push(match);
						if (matches.length >= limit) return;
					}
				})
				.then(() => {
					resolve(matches);
				})
				.catch((err: any) => {
					resolve([]);
				});
		});
	};

	public remove = async (docId: DocumentID): Promise<boolean> => {
		if (!docId) return Promise.resolve(false);
		return new Promise((resolve, reject) => {
			localForage
				.removeItem(docId)
				.then(() => {
					resolve(true);
				})
				.catch((err: any) => {
					resolve(false);
				});
		});
	};

	public clear = async (): Promise<boolean> => {
		return new Promise((resolve, reject) => {
			localForage
				.clear()
				.then(() => {
					resolve(true);
				})
				.catch((err: any) => {
					resolve(false);
				});
		});
	};

	public jsonify = async (): Promise<CollectionUnit> => {
		const units = await Promise.all(
			this._order.map(async (docId: DocumentID): Promise<CollectionUnit> => {
				let unit: CollectionUnit = {};
				const doc: Document | null = await this.get(docId);
				if (doc) unit[docId] = doc;
				return Promise.resolve(unit);
			})
		);
		let jsonified = <CollectionUnit>{};
		units.forEach((unit: CollectionUnit) => {
			Object.assign(jsonified, unit);
		});
		return jsonified;
	};
}
