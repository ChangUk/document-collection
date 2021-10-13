// TODO: import firestore module

import type { FirestoreConfig, Options } from "./type";
import Collection, { DocumentID, Document } from "./collection";

export class FirestoreCollection extends Collection {
	private _config: FirestoreConfig = {
		apiKey: "### FIREBASE API KEY ###",
		authDomain: "### FIREBASE AUTH DOMAIN ###",
		projectId: "### CLOUD FIRESTORE PROJECT ID ###",
		collectionName: "documents",
	};

	constructor(options: Options) {
		super(options.search);
		Object.assign(this._config, options.config || {});

		// Configuration test
		let result: boolean = true;
		if (options.config) {
			for (const key in this._config) {
				if (!(key in options.config)) {
					result = false;
					break;
				}
			}
		}
		if (!result) throw new Error(`Invalid options: ${options}`);
	}

	public keys = async (): Promise<Array<DocumentID>> => {
		return Promise.resolve([]);
	};

	public get = async (docId: DocumentID): Promise<Document | null> => {
		return Promise.resolve(null);
	};

	public set = async (docId: DocumentID, doc: Document | null): Promise<Document | null> => {
		if (!docId || !doc) return Promise.resolve(null);
		return Promise.resolve(null);
	};

	public update = async (docId: DocumentID, doc: Document | null): Promise<Document | null> => {
		if (!docId || !doc) return Promise.resolve(null);
		return Promise.resolve(null);
	};

	public sort = async (): Promise<Array<DocumentID>> => {
		return Promise.resolve([]);
	};

	public search = async (query: string): Promise<Array<DocumentID>> => {
		return Promise.resolve([]);
	};

	public remove = async (docId: DocumentID): Promise<boolean> => {
		return Promise.resolve(false);
	};

	public clear = async (): Promise<boolean> => {
		return Promise.resolve(false);
	};
}
