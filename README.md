# DocumentCollection.js

**DocumentCollection** is a javascript library to manage document collection.

## Features

- Store documents on the local system
    - Currently being developed to support Firebase...
- Full-text search
    - Support compound query
- Data encryption (Not support yet)
- Compatible with Internet Explorer 11

## Data model

In general, the unit of collection is `Document` and it consists of <`DocumentID`-`Document`> pairs:

```
// Collection
{
    [DOCUMENT_ID: DocumentID]: Document
}
```

The `Document` can have multiple fields:

```
// Document
{
    [FIELD_NAME: string]: any,
    _id: DOCUMENT_ID
}
```

The `DocumentID` is string identifier to distinguish a document from another. Once a document is stored via **DocumentCollection** API, the private field `_id` is assigned to the data automatically.

## Storage support

1. [JSON Object](https://en.wikipedia.org/wiki/JSON) of clientside
1. [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) in web browser
1. [Cloud Firestore](https://firebase.google.com/products/firestore) powered by [Google](https://google.com/) (Not support yet)

## Usage

Most of APIs are **asynchronous**.

### Create an instance (ESM)

```js
import DocumentCollection from "document-collection.esm.js";

const dc = new DocumentCollection({
    store: "indexeddb",
    config: {
        name: "dc",
        collectionName: "documents"
    },
    search: {
        orderBy: ["-date", "title"],
        limit: 30
    }
});
```

#### Options

```js
// Options
{
    store: "json" | "indexeddb" | "firestore";
    config: JsonConfig | IndexeddbConfig | FirestoreConfig | {};
    search: SearchOptions;
}
```

#### Configurations

The configuration format varies depending on `Options.type`:

```js
// JsonConfig (optional)
{
    name?: string;
    collectionName?: string;
}
```
- `name`(optional)
    - Default: `"dc"`
    - Used when JSON object is exported to local system.
- `collectionName`(optional)
    - Default: `"documents"`
    - Used when JSON object is exported to local system.

```js
// IndexeddbConfig (optional)
{
    name?: string;
    collectionName?: string;
}
```
- `name`(optional)
    - Default: `"dc"`
    - Database name of IndexedDB
- `collectionName`(optional)
    - Default: `"documents"`
    - Store name of IndexedDB database

```js
// FirestoreConfig (mandatory if Options.type is "firestore")
{
    apiKey: string;
    authDomain: string;
    projectId: string;
    collectionName?: string;
}
```
- `apiKey`(mandatory)
    - Default: `""`
    - Firebase API key
- `authDomain`(mandatory)
    - Default: `""`
    - Firebase auth domain
- `projectId`(mandatory)
    - Default: `""`
    - Cloud Firestore project ID
- `collectionName`(optional)
    - Default: `"documents"`
    - Specify collection of Firestore

#### Search options

```js
// SearchOptions
{
    orderBy?: Array<string>;
    fuzzy?: boolean;
    limit?: number;
    exclude?: Array<string>;
}
```
- `orderBy`(optional)
    - Default: `[]`
    - Specify field names to sort search results. Using prefix `-` in front of field name makes the resulting order descending. For example, if you are going to sort the search result by the field `"title"` in ascending order and `"date"` in descending order, set this option as follows: `"orderBy": ["title", "-date"]`.
- `fuzzy`(optional)
    - Default: `false`
    - Fuzzy search enables to find documents whose words are similar to the given string query.
- `limit`(optional)
    - Default: `Number.MAX_SAFE_INTEGER`
    - Specify the maximum number of search results
- `exclude`(optional)
    - Default: `[]`
    - If a document contains words which is in exclude list, the document is not selected for the search result.

### Add document data

```js
dc.setDocument(null, {
    title: "Sample Document",
    date: 1633958686179,
    content: "...",
    category: ["test"],
}).then((added) => {
    console.log(`Successfully added: "${added._id}"`);
});
```
```
// Output
Successfully added: "C1b6iSaUYH64vkJHshAORT"
```

Unless the document ID is given, **DocumentCollection** generate a random UUID(length-22) as a key.

### Get document data

```js
dc.getDocument("C1b6iSaUYH64vkJHshAORT").then((doc) => {
    console.log(doc);
});
```
```
// Output
{
    title: "Sample Document",
    date: 1633958686179,
    content: "...",
    category: ["test"],
}
```

### Search documents with a query

#### For string query

```js
dc.search("sample query").then((results) => {
    // Array of `DocumentID`
    console.log(results);
});
```
```
// Output
["C1b6iSaUYH64vkJHshAORT"]
```

#### For compound query

Being developed...

### Remove document data

```js
dc.removeDocument("C1b6iSaUYH64vkJHshAORT").then((result) => {
    console.log(result);
});
```
```
// Output
true
```

## Dependents

- [localForage](https://localforage.github.io/localForage)
- [short-uuidv4](https://github.com/ChangUk/short-uuidv4)

## MIT License

Copyright (c) 2021 Park ChangUk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
