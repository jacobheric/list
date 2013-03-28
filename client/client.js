//
//Subscriptions/client side collections
Meteor.subscribe("lists");

Template.list.things = function () {
		
  return Things.find(
		{list_id: Session.get('list_id')}, 
		{sort: {name: 1}}	
	);
};

Template.list.events = {
	'keyup input.thingInput': function(event, template) {
		if (event.keyCode === 13){ 
			var element = event.target;
			var n = element.value;			
			if (n){
				n = n.toLowerCase();
			}
			
			var th = Things.findOne({list_id: Session.get('list_id'), name: n});			
			if (!th){
				Meteor.call('createListItem', 
					{list_id: Session.get('list_id'), name: n}
				);
			}
			element.value = '';
		}
	},
	'click div.delete': function() {
		removeItem(this._id);
	},
	'click span.name': function(event, template){
		//
		//Editing is just drop/readd
		var input = template.find('.thingInput');
		input.value = event.target.textContent;
		removeItem(this._id);
		input.focus();
	}	
};

var removeItem = function(id){
	Meteor.call('removeListItem', id);
}

var ListRouter = Backbone.Router.extend({
  routes: {
    ":list_id": "main"
  },
  main: function (list_id) {
    var oldList = Session.get("list_id");
    if (oldList !== list_id) {
      Session.set("list_id", list_id);
    }
  },
  setList: function (list_id) {
    this.navigate(list_id, true);
  }
});

Router = new ListRouter;

Meteor.startup(function () {		

	Backbone.history.start({pushState: true});
		
	Deps.autorun(function() {
		var list_id = Session.get('list_id');	

		if (!Session.get('list_id')){
			console.log('inserting new session');
			Session.set('list_id', Lists.insert({}));			
		}	

		//
		//subscribe to the list collection by list id only
		Router.setList(Session.get('list_id'));    			
		Meteor.subscribe('things', Session.get('list_id'));
	});
	
});



