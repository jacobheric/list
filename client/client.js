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
					
			if (!n || n == ''){
				return;
			}
			
			n = n.toLowerCase().substring(0, 125);			
			
			var th = Things.findOne({list_id: Session.get('list_id'), name: n});			
			if (!th){
				Things.insert({list_id: Session.get('list_id'), name: n});				
				//
				//This is too laggy, revisit security
				//Meteor.call('createListItem', 
				//	{list_id: Session.get('list_id'), name: n}
				//);
			}
			element.value = '';
		}
	},
	'click .delete': function() {
		removeItem(this._id);
	},
	'click .name': function(event, template){
		//
		//Editing is just drop/readd
		var input = template.find('.thingInput');
		input.value = event.target.textContent;
		removeItem(this._id);
		input.focus();
	}	
};

Template.thing.rendered = function(template){
	
	var element = this.find('.thingContainer');
	var id = this.data._id;
	if (element) {
		
		var hammertime = Hammer(element).on("dragleft", function(ev, id) {
			
			var touches = ev.gesture.touches;
			ev.gesture.preventDefault();
			//
			//Hokey: current doc id is bound to dom el id 
			//cause we don't have it in this contex
			var docId = ev.target.id;
		
			for (var t = 0, len = touches.length; t < len; t++) {
				var target = $(touches[t].target);
				
				target.css({
					left: touches[t].pageX - 250
				});
			}
						
			removeItem(docId);
		});
		
	}
}


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



