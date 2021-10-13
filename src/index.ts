import type { Options } from "./type";

import { DocumentID, Document } from "./collection";
import { JSONCollection } from "./collection-json";
import { IDBCollection } from "./collection-indexeddb";

import ShortUuidV4 from "./short-uuidv4";

export default class DocumentCollection {
	private _collection: JSONCollection | IDBCollection | null = null;
	private _options: Options = {
		type: "indexeddb", // "json" | "indexeddb" | "firestore"
		config: {},
		search: {},
	};

	constructor(options: Options | null) {
		Object.assign(this._options, options);

		const StorageType = this._options.type.toLowerCase();
		if (StorageType === "json") {
			this._collection = new JSONCollection(this._options);
		} else if (StorageType === "indexeddb") {
			this._collection = new IDBCollection(this._options);
		} else {
			throw new Error(`Invalid storage type: ${this._options.type}`);
		}
	}

	public getRandomId = (): DocumentID => {
		return new ShortUuidV4().new();
	};

	public getDocument = async (docId: DocumentID): Promise<Document | null> => {
		if (!this._collection) return null;
		return await this._collection.get(docId);
	};

	public getAllDocuments = async (): Promise<Array<DocumentID> | null> => {
		if (!this._collection) return null;
		return await this._collection.keys();
	};

	public getDocumentsOrder = async (): Promise<Array<DocumentID> | null> => {
		if (!this._collection) return null;
		return await this._collection.order();
	};

	public setDocument = async (docId: DocumentID | null, doc: string | Document | {}): Promise<Document | null> => {
		if (!this._collection) return Promise.resolve(null);

		// Generate new random UUID
		if (!docId) docId = new ShortUuidV4().new();
		try {
			if (typeof doc === "string") return await this._collection.set(docId, JSON.parse(doc as string));
			else if (typeof doc === "object") return await this._collection.set(docId, doc as Document);
		} catch (err) {}
		return Promise.resolve(null);
	};

	public search = async (query: string): Promise<Array<DocumentID>> => {
		const isValidQuery = (query: string) => {
			return query && query.length > 0;
		};
		if (!this._collection) return [];
		if (isValidQuery(query)) {
			return await this._collection.search(query);
		}
		return await this._collection.sort();
	};

	public removeDocument = async (docId: DocumentID): Promise<boolean> => {
		if (!this._collection) return false;
		return await this._collection.remove(docId);
	};

	public clear = async (): Promise<boolean> => {
		// TODO:
		return true;
	};

	private _isJSON = (json: JSON) => {
		try {
			if (json instanceof Object && JSON.parse(JSON.stringify(json))) return true;
		} catch (e) {}
		return false;
	};
}
