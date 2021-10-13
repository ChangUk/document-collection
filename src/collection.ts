import type { SearchOptions } from "./type";
import SearchStrategy from "./search-strategies";

export type CollectionUnit = {
	[id: DocumentID]: Document;
};
export type DocumentID = string;
export type Document = {
	[field: string]: string;
	_id: DocumentID;
};

export default abstract class Collection {
	protected _collection: any = {};
	protected _order: Array<DocumentID> = [];
	protected _searchStrategy: (query: string, subject: string) => boolean;
	protected _searchOptions: SearchOptions = {
		orderBy: [],
		fuzzy: false,
		limit: Number.MAX_SAFE_INTEGER,
		exclude: [],
	};

	constructor(searchOptions: SearchOptions | undefined) {
		Object.assign(this._searchOptions, searchOptions);
		this._searchStrategy = this._searchOptions.fuzzy ? SearchStrategy.Fuzzy : SearchStrategy.Literal;
	}

	public order = async (): Promise<Array<DocumentID>> => {
		return new Promise((resolve, reject) => {
			resolve(this._order);
		});
	};

	abstract keys(): Promise<Array<DocumentID>>;

	abstract get(docId: DocumentID): Promise<Document | null>;

	abstract set(docId: DocumentID, doc: Document | null): Promise<Document | null>;

	abstract update(docId: DocumentID, doc: Document | null): Promise<Document | null>;

	abstract remove(docId: DocumentID): Promise<boolean>;

	abstract clear(): Promise<boolean>;

	abstract sort(): Promise<Array<DocumentID>>;

	abstract search(query: string): Promise<Array<DocumentID>>;

	protected _findMatches = (query: string, docId: DocumentID, doc: Document): DocumentID | null => {
		for (const field in doc) {
			if (field[0] === "_") continue;
			if (!this._isExcluded(doc[field]) && this._searchStrategy(query, doc[field])) return docId;
		}
		return null;
	};

	protected _isExcluded = (str: string): boolean => {
		if (!this._searchOptions || !this._searchOptions.exclude) return false;
		for (let i = 0, len = this._searchOptions.exclude.length; i < len; i++) {
			const Excluded = this._searchOptions.exclude[i];
			if (new RegExp(Excluded).test(str)) return true;
		}
		return false;
	};
}
