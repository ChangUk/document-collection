export type JsonConfig = {
	name?: string;
	collectionName?: string;
};
export type IndexeddbConfig = {
	name?: string;
	collectionName?: string;
};
export type FirestoreConfig = {
	apiKey: string;
	authDomain: string;
	projectId: string;
	collectionName?: string;
};

export type Options = {
	type: string;
	config?: JsonConfig | IndexeddbConfig | FirestoreConfig | {};
	search?: SearchOptions | {};
};
export type SearchOptions = {
	orderBy?: Array<string>;
	fuzzy?: boolean;
	limit?: number;
	exclude?: Array<string>;
};

export type SearchQuery = string | Record<string, any>;
