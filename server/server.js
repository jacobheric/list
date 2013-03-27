Meteor.startup(function() {
	
});


Meteor.publish("things", function () {
	
	return Things.find({},{
		sort: {
			name: 1
		}
	});
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
	}
});