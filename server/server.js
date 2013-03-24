Meteor.startup(function() {
	
	if (Things.find().count() > 0) {
		return;
	}
	
    var names = ["Milk",
                 "Trash Bags",
                 "Wine",
                 "Beer",
                 "Depends"];

    for (var i = 0; i < names.length; i++){
      Things.insert({name: names[i].toLowerCase()});
	}	
});