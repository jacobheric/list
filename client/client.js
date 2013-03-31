Meteor.subscribe("lists");	
// show guide is false by default
Session.setDefault('showGuide', false);

Template.list.things = function () {	
	return Things.find(
		{list_id: Session.get('list_id')}, 
		{sort: {name: 1}}	
	);
	
 x;
};

Template.list.showGuide = function () {
	return Session.get('showGuide');
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

Template.guide.events = {
	'click': function(event, template) {
		var element = template.find('.guide');		
		element.style.display = 'none';	
		Lists.update(Session.get('list_id'), {$set: {showGuide: false}});
		Session.set('showGuide', false);	
	}
};

Template.thing.rendered = function(template){
	
	var element = this.find('.thingContainer');
	var id = this.data._id;
	if (element) {
		Hammer(element).on("dragleft", dragLeft);
	}
}

var removeItem = function(id){
	Meteor.call('removeListItem', id);
}

var dragLeft = function(ev, id){
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
			
	if (!Session.get('list_id')){
		var id = Lists.insert({showGuide: true});
		Session.set('list_id', id);
		Session.set('showGuide', true);		
	}	
	//TODO:  this doesn't work; conflict w/ backbone
	// else{
	// 	var l = Lists.findOne(Session.get('list_id'));
	// 	if (l && l.showGuide == true){
	// 		Session.set('showGuide', true);		
	// 	}
	// 	else{
	// 		Session.set('showGuide', false);
	// 	}		
	// }
	
	//
	//subscribe to the list collection by list id only
	Router.setList(Session.get('list_id'));	

	Deps.autorun(function () {
		Meteor.subscribe('things', Session.get('list_id'));	
	});			
});



