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

		var data = webix.promise.defer();

		//full data loading - do only once, during first loading
		this.collection.once("value", webix.bind(function(pack){
			var isCollection = !!view.exists;

			if (isCollection){
				var result = [];
				//preserve data order
				pack.forEach(function(child){
					var record = child.val();

					//convert simple string types to data objects
					if (typeof record !== "object")
						record = { value : record };

					record.id = child.key;
					result.push(record);
				});
			} else {
				var result = pack.val();
			}

			data.resolve(result);
			this._setHandlers(view);

			if (isCollection)
				this._setAddRemove(view);
			else
				this._addSaveMethod(view);

		}, this));

		return data;
	},
	_addSaveMethod:function(view){
		var proxy = this;
		view.save = function(){
			var values = this.getDirtyValues();
			this.setDirty(false);
			proxy.collection.update(values);
		};
	},
	_setHandlers:function(view){
		//after initial data loading, set listeners for changes
		//data in firebase updated
		this.collection.on("child_changed", function(data){
			//event triggered by data saving in the same component
			if (view.firebase_saving) return;
			var isCollection = !!view.exists;

			if (isCollection){
				var obj = data.val();
				obj.id = data.key;

				//do not trigger data saving events
				webix.dp(view).ignore(function(){
					view.updateItem(obj.id, obj);
				});
			} else {
				if (view.setValues){
					var update = {}
					update[data.key] = data.val();
					return view.setValues(update, true);
				}
			}
		});
	},

	_setAddRemove:function(view){
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
		var result = webix.promise.defer();

		delete obj.data.id;
		if (obj.operation == "update"){
			//data changed
			this.collection.child(obj.id).update(obj.data, function(error){
				if (error)
					result.reject(error);
				else
					result.resolve({});
			});

		} else if (obj.operation == "insert"){
			//data added
			var id = this.collection.push(obj.data, function(error){
				if (error)
					result.reject(error);
				else
					result.resolve({ newid: id });
			}).key;
			
		} else if (obj.operation == "delete"){
			//data removed
			this.collection.child(obj.id).set(null, function(error){
				if (error)
					result.reject(error);
				else
					result.resolve({}, -1);
			});
		}

		view.firebase_saving = false;
		return result;
	}
};



/*
	Helper for component.sync(reference)
*/

webix.attachEvent("onSyncUnknown", function(target, source){
	var fb = window.firebase || webix.firebase;
	if (fb && source instanceof fb.database.Reference){

		var proxy = webix.proxy("firebase", source);
		target = webix.$$(target.owner);

		target.clearAll();
		target.load(proxy);
		webix.dp(target).define("url", proxy);
	}
});