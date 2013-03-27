// collection contains a list of things
Things = new Meteor.Collection("things");


Things.allow({
  insert: function () {
    return false; // use createVenue function only
  },
  update: function () {
    return false;
  },
  remove: function () {
	return false;
  }
});
