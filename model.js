// collection contains a list of things
Things = new Meteor.Collection("things");
Lists = new Meteor.Collection("lists");

Things.allow({
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
