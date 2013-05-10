// collection contains a list of things
Things = new Meteor.Collection("things");
Lists = new Meteor.Collection("lists");
Undo = new Meteor.Collection("undo");

Things.allow({
	insert: function() {
		return true;
	},
	update: function() {
		return true;
	},
	remove: function() {
		return true;
	}
});

Lists.allow({
	insert: function() {
		return true;
	},
	update: function() {
		return true;
	},
	remove: function() {
		return false;
	}
});

Undo.allow({
	insert: function() {
		return true;
	},
	update: function() {
		return true;
	},
	remove: function() {
		return true;
	}
});

//
// Convenience functions (no 'var' means public)
removeThing = function(id){
	addUndoAction(id, 'insert', Things.findOne(id));	
	Things.remove(id);
}

removeUndo = function(id){
	Undo.remove(id);	
	//
	//Hide remove icon if there are none left
	var u = Undo.find({}).fetch();
	if (!u || u.length == 0){
		Session.set('showUndo', false);
	}
}

strikeThing = function(id, t){
	Things.update(id, {$set: {struck: t}});		
}

insertThing = function(doc){
	doc.name = doc.name.toLowerCase().substring(0, 125).trim();
	//
	//No dups
	var th = Things.findOne({list_id: Session.get('list_id'), name: doc.name});
	
	if (!th){
		Things.insert(doc);
	}	
}

//
//act & val should be the thing to do on undo 
addUndoAction = function(itemId, act, doc){
	Session.set('showUndo', true);		
	
	//
	//Keep undo collection trim, poor man's LIFO
	var u = Undo.find({}).fetch();		

	if (u && u.length > 50){
		//
		//Just remove the first/oldest 
		Undo.remove(Undo.findOne()._id);
	}	
	
	Undo.insert({
		list_id: Session.get("list_id"), 
		item_id: itemId,
		action: act,
		doc: doc 
	});	
}

undoLast = function(){
	var last = Undo.find({}).fetch();	
	//
	//insert and delete from undo history
	if (last && last.length > 0){
		var u = last[last.length - 1];
		insertThing(u.doc)
		removeUndo(u._id);		
	}
}
