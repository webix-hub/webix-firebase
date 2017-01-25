Firebase adapter for Webix UI
=============================

Library allows using [Webix](http://webix.com) components with [FireBase](https://firebase.com/)

Citing the Firebase site:

When data changes, apps built with Firebase update instantly across every device -- web or mobile.

Firebase-powered apps work offline. Data is synchronized instantly when your app regains connectivity.


How to use
-----------

Include Webix and Firebase files on the page

```html
<!-- Webix -->
<script type="text/javascript" src="http://cdn.webix.io/2.2/webix.js"></script>
<link rel="stylesheet" type="text/css" href="http://cdn.webix.io/2.2/webix.css">
<!-- Webix-Firebase adapter -->
<script type="text/javascript" src="../codebase/webix-firebase.js"></script>
<!-- FireBase -->
<script src="https://cdn.firebase.com/js/client/2.1.1/firebase.js"></script>
```

Create main firebase connection

```js
webix.firebase = new Firebase("https://webix-demo.firebaseio.com/");
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

	//load data from /books
	url: "firebase->books",
	//save data to /books
	save:"firebase->books"
}
```	

That is it.

Adding "url" property will enable data loading and automatic updates of component when data changed in the firebase. 

Adding "save" property ensures that all changes in the datatable will be saved to the Firebase



### Using FireBase references

Instead of using text url you can use firebase references directly 

```js
var fb = new Firebase("https://webix-demo.firebaseio.com/");
var ref = fb.child("books");

webix.ui({
	view:"list",
	url: webix.proxy("firebase", ref),
	save: webix.proxy("firebase", ref)
}
```	




### Dynamic data loading

You can use "load" command to (re)load data in the component. 

```js
$$("dtable").load("firebase->books");
```

or

```js
$$("dtable").load( webix.proxy("firebase", ref);
```




### Sync api

Webix components have native [sync](http://docs.webix.com/api__link__ui.proto_sync.html) api to [sync data between components](http://docs.webix.com/desktop__data_binding.html). The same api can be used with firebase

```js
var fb = new Firebase("https://webix-demo.firebaseio.com/");
var ref = fb.child("books");

$$("dtable").sync(ref);
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
