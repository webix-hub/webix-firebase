/*
	Firebase proxy for Webix
	Allows to use firebase urls in all places where normal http urls can be used
*/

webix.proxy.firebase = {
	$proxy:true,
	/*
	some.load("firebase->ref");
	or
	some.load( webix.proxy("firebase", reference) )
	or
	url:"firebase->ref"
	*/
	load:function(view, callback){
		//decode string reference if necessary
		if (typeof this.source == "object")
			this.collection = this.source;
		else
			this.collection = this.collection || webix.firebase.ref(this.source);

		//full data loading - do only once, during first loading
		this.collection.once("value", webix.bind(function(data){
			var source = data.val();
			var result = [];
			for (var key in source){
				var record = source[key];
				record.id = key;
				result.push(record);
			}

			webix.ajax.$callback(view, callback, "", result, -1);
			this._setHandlers(view);

		}, this));
	},
	_setHandlers:function(view){

		//after initial data loading, set listeners for changes
		//data in firebase updated
		this.collection.on("child_changed", function(data){
			//event triggered by data saving in the same component
			if (view.firebase_saving) return;

			var obj = data.val();
			obj.id = data.key;

			//do not trigger data saving events
			webix.dp(view).ignore(function(){
				view.updateItem(obj.id, obj);
			});
		});

		//data in firebase added
		this.collection.on("child_added", function(data){
			//event triggered by data saving in the same component
			if (view.firebase_saving) return;

			//we already have record with such id
			//it seems, this event duplicates info from on:value
			if (view.exists(data.key)) return;

			var obj = data.val();
			obj.id = data.key;

			//do not trigger data saving events
			webix.dp(view).ignore(function(){
				view.add(obj);
			});
		});

		//data in firebase removed
		this.collection.on("child_removed", function(data){
			//event triggered by data saving in the same component
			if (view.firebase_saving) return;

			//do not trigger data saving events
			webix.dp(view).ignore(function(){
				view.remove(data.key);
			});
		});
	},
	/*
	save:"firebase->ref"
	or
	webix.dp(view).define("url", "firebase->ref");
	*/
	save:function(view, obj, dp, callback){
		//decode string reference if necessary
		if (typeof this.source == "object")
			this.collection = this.source;
		else
			this.collection = this.collection || webix.firebase.ref(this.source);

		//flag to prevent triggering of onchange listeners on the same component
		view.firebase_saving = true;

		delete obj.data.id;
		if (obj.operation == "update"){
			//data changed
			this.collection.child(obj.id).update(obj.data, function(error){
				if (error)
					callback.error("", null, error);
				else
					callback.success("", {}, -1);
			});

		} else if (obj.operation == "insert"){
			//data added
			var id = this.collection.push(obj.data, function(error){
				if (error)
					callback.error("", null, error);
				else
					callback.success("", { newid: id }, -1);
			}).key;
			
		} else if (obj.operation == "delete"){
			//data removed
			this.collection.child(obj.id).set(null, function(error){
				if (error)
					callback.error("", null, error);
				else
					callback.success("", {}, -1);
			});
		}

		view.firebase_saving = false;
	}
};



/*
	Helper for component.sync(reference)
*/

webix.attachEvent("onSyncUnknown", function(target, source){
	var fb = window.firebase || webix.firebase;
	if (fb && source instanceof fb.database.Reference){

		var proxy = webix.proxy("firebase", source);

		//due to some limitations in Webix 2.2 we can't use above proxy with DataStore directly
		//so will create intermediate data collection and use syn like
		//firebase -> data collection -> target view
		var data = new webix.DataCollection({
			url:proxy,
			save:proxy
		});

		target.sync(data);
	}
});