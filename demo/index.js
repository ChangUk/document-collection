import DocumentCollection from "../dist/document-collection.esm.js";

let dc = null;

const searchInput = document.querySelector("#search-input");
const searchResult = document.querySelector("#search-result");
const viewer = document.querySelector("#viewer");

const debounce = function (callback, wait, immediate) {
	immediate = immediate || false;
	let _;
	let timeout;
	return function () {
		_ = document.activeElement;
		const context = this, args = arguments;
		const later = function () {
			_.focus();
			timeout = null;
			if (!immediate) callback.apply(context, args);
		}
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) callback.apply(context, args);
	};
};

searchInput.oninput = debounce((e) => {
	if (!dc) return;
	dc.search(e.target.value).then(results => {
		showSearchResults(results);
	});
}, 300);

const btnNewId = document.querySelector("#btn-newid");
const btnTemplate = document.querySelector("#btn-template");
const btnCreate = document.querySelector("#btn-create");

btnNewId.addEventListener("click", (e) => {
	document.querySelector("#document-id").value = dc.getRandomId();
});
const template = "{\n    \"category\": \"[]\",\n    \"content\": \"\",\n    \"date\": \"\",\n    \"tags\": \"[]\",\n    \"title\": \"\"\n}"
btnTemplate.addEventListener("click", (e) => {
	document.querySelector("#editor").value = template;
});
btnCreate.addEventListener("click", async (e) => {
	let docId = document.querySelector("#document-id").value;
	let content = document.querySelector("#editor").value;
	if (!content) {
		alert("Content is empty!");
		return;
	}
	dc.setDocument(docId, content).then(dc.search).then((results) => {
		showSearchResults(results);
	});
});

const showSearchResults = async (results) => {
	searchResult.innerHTML = "";
	for (let i = 0; i < results.length; i++) {
		dc.getDocument(results[i]).then((doc) => {
			let div = document.createElement("div");
			div.classList.add("result-item");
			div.innerHTML = doc.title;
			div.setAttribute("id", doc._id);
			div.onclick = async (e) => {
				viewer.value = JSON.stringify(await dc.getDocument(e.target.getAttribute("id")), " ", 4);
			};
			searchResult.appendChild(div);
		});
	}
}

const DATALOADTYPE = "INDEXEDDB";

fetch("sample-data.json").then(res => res.json())
	.then(async (json) => {
		const collection = json["documents"];
		if (DATALOADTYPE === "JSON") {
			dc = new DocumentCollection({
				type: "json",
				search: {
					orderby: ["-date", "title"],
					fuzzy: false,
					limit: 10,
					exclude: []
				}
			});
			for (let id in collection) {
				await dc.setDocument(id, collection[id]);
			}
		} else if (DATALOADTYPE === "INDEXEDDB") {
			dc = new DocumentCollection({
				type: "indexeddb",
				config: {
					name: "dc",
					collection: "documents",
				},
				search: {
					orderby: ["-date", "title"],
				}
			});
			for (let id in collection) {
				await dc.setDocument(id, collection[id]);
			}
		}
		dc.search().then((results) => {
			showSearchResults(results);
		});
		searchInput.focus();
	});
