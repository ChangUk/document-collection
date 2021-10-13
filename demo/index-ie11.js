var DATAPATH = "C:\\Users\\uklet\\Documents\\GitHub\\document-collection\\demo\\sample-data.json";

var FileManager = (function () {
	return {
		readText: function (path) {
			var astream = new ActiveXObject("ADODB.Stream");
			astream.Open();
			astream.Charset = "UTF-8";
			astream.LoadFromFile(path);
			var content = astream.ReadText();
			astream.Close();
			return content;
		}
	}
})();

var debounce = function (callback, wait, immediate) {
	immediate = immediate || false;
	var _;
	var timeout;
	return function () {
		_ = document.activeElement;
		var context = this, args = arguments;
		var later = function () {
			_.focus();
			timeout = null;
			if (!immediate) callback.apply(context, args);
		}
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) callback.apply(context, args);
	};
};

var json = JSON.parse(FileManager.readText(DATAPATH));
var collection = json["documents"];
var dc = new DocumentCollection({
	type: "json",
	search: {
		orderby: ["-date", "title"],
		fuzzy: false,
		limit: 10,
		exclude: []
	}
});

// Load data
for (var id in collection) {
	dc.setDocument(id, collection[id]);
}

var searchInput = document.querySelector("#search-input");
var searchResult = document.querySelector("#search-result");
var viewer = document.querySelector("#viewer");

searchInput.oninput = debounce(function (e) {
	if (!dc) return;
	dc.search(e.target.value).then(function (results) {
		showSearchResults(results);
	});
}, 300);

var btnNewId = document.querySelector("#btn-newid");
var btnTemplate = document.querySelector("#btn-template");
var btnCreate = document.querySelector("#btn-create");

btnNewId.addEventListener("click", function (e) {
	document.querySelector("#document-id").value = dc.getRandomId();
});
var template = "{\n    \"category\": \"[]\",\n    \"content\": \"\",\n    \"date\": \"\",\n    \"tags\": \"[]\",\n    \"title\": \"\"\n}"
btnTemplate.addEventListener("click", function (e) {
	document.querySelector("#editor").value = template;
});
btnCreate.addEventListener("click", function (e) {
	var docId = document.querySelector("#document-id").value;
	var content = document.querySelector("#editor").value;
	if (!content) {
		alert("Content is empty!");
		return;
	}
	dc.setDocument(docId, content);
	dc.search().then(function (results) {
		showSearchResults(results);
	})
});

var showSearchResults = function (results) {
	searchResult.innerHTML = "";
	for (var i = 0; i < results.length; i++) {
		dc.getDocument(results[i]).then(function (doc) {
			var div = document.createElement("div");
			div.classList.add("result-item");
			div.innerHTML = doc.title;
			div.setAttribute("id", doc._id);
			div.onclick = function (e) {
				dc.getDocument(e.target.getAttribute("id")).then(function (doc) {
					viewer.value = JSON.stringify(doc, " ", 4);
				});
			};
			searchResult.appendChild(div);
		});
	}
}
dc.search().then(function (results) {
	showSearchResults(results);
});
searchInput.focus();
