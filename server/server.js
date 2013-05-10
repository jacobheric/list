// Publish complete set of lists to all clients.
Meteor.publish('lists', function () {
  return Lists.find();
});

// Publish all items for requested list_id.
Meteor.publish('things', function (id) {
  return Things.find({list_id: id});
});

// Publish all undo items for requested list_id.
Meteor.publish('undo', function (id) {
  return Undo.find({list_id: id});
});


Meteor.methods({
	
	//
	//Thin abstraction at this point so client code is loosely coupled from server side collection
	createListItem: function (item) {
		item.name = item.name.substring(0, 125);
		Things.insert(item);
	},
	removeListItem: function (id) {
		Things.remove(id);
	},
	createNewList: function(){
		return createList();
	},
	getList: function(id){
		return Lists.findOne(id);
	}, 
	//
	//Grab existing or create
	// initList: function(id){		
	// 	var list = Lists.findOne(id);
	// 	if (list){
	// 		console.log('found list');			
	// 		return list;
	// 	} 
	// 	else {
	// 		console.log('inserting list');
	// 		return createList();
	// 	}		
	// }
	
});

var createList = function createList(){
	return Lists.insert({});
}