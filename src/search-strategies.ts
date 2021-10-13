export default class SearchStrategy {
	public static Literal(query: string, subject: string): boolean {
		if (!subject) return false;
		query = query.toLowerCase();
		subject = subject.trim().toLowerCase();
		let tokens: Array<string> = new RegExp("\\s+$").test(query) ? [query] : query.trim().split(" ");
		return tokens.filter((token) => subject.indexOf(token) >= 0).length === tokens.length;
	}

	public static Fuzzy(query: string, subject: string): boolean {
		if (!subject) return false;
		if (query.length > subject.length) return false;
		query = query.toLowerCase();
		subject = subject.toLowerCase();
		if (query.length === subject.length) return query === subject;
		outer: for (let i = 0, j = 0; i < query.length; i++) {
			let ch = query.charCodeAt(i);
			while (j < subject.length) if (subject.charCodeAt(j++) === ch) continue outer;
			return false;
		}
		return true;
	}
}
