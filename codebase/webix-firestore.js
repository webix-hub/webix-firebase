/*
	Firebase proxy for Webix
	Allows to use firebase urls in all places where normal http urls can be used
*/

webix.proxy.firestore = {
	$proxy:true,
	/*
	some.load("firebase->ref");
	or
	some.load( webix.proxy("firebase", reference) )
	or
	url:"firebase->ref"
	*/
	load:function(view, callback){
		if (this._unsubscribe){
			this.release();
		}
		var data = webix.promise.defer();

		//decode string reference if necessary
		if (typeof this.source == "object")
			this.collection = this.source;
		else
			this.collection = this.collection || webix.firestore.collection(this.source);

		this._unsubscribe = this.collection.onSnapshot(function(query) {
        	if (query.metadata.hasPendingWrites) return;

			webix.dp(view).ignore(function(){

				var queue = [];
				query.docChanges().forEach(function(change) {
					var data = webix.copy(change.doc.data());
					data.id = change.doc.id;

					switch(change.type){
					  case "added":
					    if (!view.exists(data.id))
					      queue.push(data); //collecting data batch
					    break;
					  case "modified":
					    view.updateItem(data.id, data);
					    break;
						case "removed":
							if (view.exists(data.id))
					    	view.remove(data.id);
					    break;
					}
				});

				//batch adding
				if (queue.length){
					data.resolve(queue);
				}
			});
		});
		
		return data;
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
			this.collection = this.collection || webix.firestore.collection(this.source);

		delete obj.data.id;

		if (obj.operation == "update"){
			//data changed
			return this.collection.doc(obj.id).update(obj.data);

		} else if (obj.operation == "insert"){
			//data added
			return this.collection.add(obj.data);
			
		} else if (obj.operation == "delete"){
			//data removed
			return this.collection.doc(obj.id).delete();
		}
		
		return webix.promise.reject();
	},
	release(){
		if (this._unsubscribe){
			this._unsubscribe();
			this._unsubscribe = null;
		}
	}
};



/*
	Helper for component.sync(reference)
*/

webix.attachEvent("onSyncUnknown", function(target, source){
	var fb = webix.firestore || (window.firebase && window.firebase.firestore);
	if (fb && source instanceof fb.firestore.Collection){

		var proxy = webix.proxy("firestore", source);
		target = webix.$$(target.owner);

		target.clearAll();
		target.load(proxy);
		webix.dp(target).define("url", proxy);
	}
});