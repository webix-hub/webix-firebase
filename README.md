Firebase adapter for Webix UI
=============================

[![npm version](https://badge.fury.io/js/webix-firebase.svg)](https://badge.fury.io/js/webix-firebase)

Library allows using [Webix](http://webix.com) components with [FireBase](https://firebase.google.com/)

Citing the Firebase site:

When data changes, apps built with Firebase update instantly across every device -- web or mobile.

Firebase-powered apps work offline. Data is synchronized instantly when your app regains connectivity.


Firestore
-----------------

Include Webix and Firebase files on the page

```html
<!-- Webix -->
<script type="text/javascript" src="http://cdn.webix.com/edge/webix.js"></script>
<link rel="stylesheet" type="text/css" href="http://cdn.webix.com/edge/webix.css">
<!-- Webix-Firebase adapter -->
<script type="text/javascript" src="../codebase/webix-firestore.js"></script>
<!-- FireBase -->
<script src="https://www.gstatic.com/firebasejs/5.0.4/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/5.0.4/firebase-firestore.js"></script>
```

Create main firebase connection

```js
firebase.initializeApp({
	apiKey: "YOU API KEY HERE",
	projectId: "webix-demo"
});

// create firebase connection, and assign it to webix
var db = firebase.firestore();
db.settings({ timestampsInSnapshots:true });

webix.firestore = db;
```

Init webix component, using "firebase->{reference}" as data url

```js
webix.ui({
	id:"dtable",
	view:"datatable",
	autoConfig:true,

	// load data from "books" collection
	url: "firestore->books",
	// save data to "books" collection
	save:"firestore->books"
}
```	

That is it.

Adding "url" property will enable data loading and automatic updates of component when data changed in the firebase. 

Adding "save" property ensures that all changes in the datatable will be saved to the Firebase

### Using FireBase references

Instead of using text url you can use firestore collections directly 

```js
firebase.initializeApp({
	apiKey: "YOU API KEY HERE",
	projectId: "webix-demo"
});

// create firebase connection, and assign it to webix
var db = firebase.firestore();
db.settings({ timestampsInSnapshots:true });

var proxy = webix.proxy("firestore", db.collection("books"));

webix.ui({
	view:"list",
	url: proxy,
	save: proxy
}););
```


### Dynamic data loading

You can use "load" command to (re)load data in the component. 

```js
$$("dtable").clearAll();
$$("dtable").load("firestore->books");
```

or

```js
$$("dtable").clearAll();
$$("dtable").load( webix.proxy("firestore", collection) );
```


Realtime Database
------------------

Include Webix and Firebase files on the page

```html
<!-- Webix -->
<script type="text/javascript" src="http://cdn.webix.com/edge/webix.js"></script>
<link rel="stylesheet" type="text/css" href="http://cdn.webix.com/edge/webix.css">
<!-- Webix-Firebase adapter -->
<script type="text/javascript" src="../codebase/webix-firebase.js"></script>
<!-- FireBase -->
<script src="https://www.gstatic.com/firebasejs/5.0.4/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/5.0.4/firebase-database.js"></script>
```

Create main firebase connection

```js
firebase.initializeApp({
  databaseURL: "https://webix-demo.firebaseio.com/"
});

// create firebase connection, and assign it to webix
webix.firebase = firebase.database();
```

Init webix component, using "firebase->{reference}" as data url

```js
webix.ui({
	id:"dtable",
	view:"datatable",
	editable:true, editaction:"dblclick",
	columns:[{
		id:"name", editor:"text", fillspace:1
	},{
		id:"author", editor:"text", fillspace:1
	}],

	// load data from /books
	url: "firebase->books",
	// save data to /books
	save:"firebase->books"
}
```	

That is it.

Adding "url" property will enable data loading and automatic updates of component when data changed in the firebase. 

Adding "save" property ensures that all changes in the datatable will be saved to the Firebase



### Using FireBase references

Instead of using text url you can use firebase references directly 

```js
firebase.initializeApp({
	databaseURL: "https://webix-demo.firebaseio.com/"
});
var db = firebase.database();
var proxy = webix.proxy("firebase", db.ref("books"));

webix.ui({
	view:"list",
	url: proxy,
	save: proxy
});
```


### Dynamic data loading

You can use "load" command to (re)load data in the component. 

```js
$$("dtable").clearAll();
$$("dtable").load("firebase->books");
```

or

```js
$$("dtable").clearAll();
$$("dtable").load( webix.proxy("firebase", ref) );
```




### Sync api

Webix components have native [sync](http://docs.webix.com/api__link__ui.proto_sync.html) api to [sync data between components](http://docs.webix.com/desktop__data_binding.html). The same api can be used with firebase

```js
firebase.initializeApp({
	databaseURL: "https://webix-demo.firebaseio.com/"
});
webix.firebase = firebase.database();
var ref = webix.firebase.ref("books");

$$("dtable").sync(ref);
```

### Working with Forms and Templates


Similar to data views, you can use "load" and "save" API while working with Forms

```js
//form
$$("form").load("books/4");
...
$$("form").save();

//template
$$("template").load("books/4")
```

In some cases, it has sense to not load data correctly but bind form ( template ) to some other view or data collection

```js
var data = new webix.DataCollection({
	url:"firebase->books",
	save:"firebase->books"
})
form.bind(data);
data.waitData.then(function(){
	//you need to use setCursor API to load some record from collection into a form
	data.setCursor("4");
})
```

or, the same for the datatable

```js
webix.ui({
	view:"datatable", autoConfig:true, id:"d1", select:true,
	url:"firebase->books",
	save:"firebase->books"
});
form.bind("d1"); //selected row will be shown in a form
```

Samples
-----------

- [Grid, data loading and saving by url](http://webix-hub.github.io/webix-firebase/samples/01_datatable_url.html)
- [Grid, data loading and saving by reference](http://webix-hub.github.io/webix-firebase/samples/02_datatable_ref.html)
- [Grid, syncing with reference](http://webix-hub.github.io/webix-firebase/samples/03_datatable_sync.html)
- [Different components, data syncing](http://webix-hub.github.io/webix-firebase/samples/04_other_components.html)
- [Webix Kanban with FireBase backend](http://webix-hub.github.io/webix-firebase/samples/05_kanban.html)


License
----------

The MIT License

Copyright (c) 2015 Maksim Kozhukh 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
