Meteor.subscribe("lists");	
// show guide is false by default
Session.setDefault('showGuide', false);

// Subscribe to 'lists' collection on startup.
// Select a list once data has arrived.
var listsHandle = Meteor.subscribe('lists', function () {
	//
	//Check for our show guide token
	if (Session.get('list_id')){
		var l = Lists.findOne(Session.get('list_id'));
		
		if (l && l.showGuide && l.showGuide == true){
			Session.set('showGuide', true);
		}
	}
	else {
		var id = Lists.insert({showGuide: true});
		Session.set('list_id', id);
		Session.set('showGuide', true);
		Router.setList(id);
	}
});

Deps.autorun(function () {
	var list_id = Session.get('list_id');
	var	thingsHandle = null;
	
	if (list_id) {
		thingsHandle = Meteor.subscribe('things', list_id);
	}
});

Template.list.loading = function () {
	return !listsHandle.ready();
};


Template.list.things = function () {	
	return Things.find(
		{list_id: Session.get('list_id')}, 
		{sort: {name: 1}}	
	);
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
			
			n = n.toLowerCase().substring(0, 125).trim();			
			
			var th = Things.findOne({list_id: Session.get('list_id'), name: n});			
			if (!th){
				Things.insert({list_id: Session.get('list_id'), name: n, struck: false});				
				//
				//This is too laggy, revisit security
				//Meteor.call('createListItem', 
				//	{list_id: Session.get('list_id'), name: n}
				//);
			}			
			element.value = '';
		}
	},
	'click div.delete': function(event, template) {
		removeItem(this._id);
	},
	'click div.strike': function(event, template) {
		strikeItem(this._id);
	},	
	'click div.nameContainer': function(event, template){
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
	
	var element = this.find('.nameContainer');
	var id = this.data._id;
	if (element) {
		Hammer(element).on("dragleft", dragLeft);
		Hammer(element).on("dragright", dragRight);
	}
}

var removeItem = function(id){
	Meteor.call('removeListItem', id);
}

var strikeItem = function(id){
	Things.update(id, {$set: {struck: true}});		
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

var dragRight = function(ev, id){
	var touches = ev.gesture.touches;
	ev.gesture.preventDefault();
	//
	//Hokey: current doc id is bound to dom el id 
	//cause we don't have it in this contex
	var docId = ev.target.id;
	
	//
	//TODO: Needs work
	// var target;
	// 
	// for (var t = 0, len = touches.length; t < len; t++) {
	// 	target = $(touches[t].target);
	// 	target.css({
	// 		left: touches[t].pageX+5
	// 	});		
	// 	
	// }
	// //Maybe an animation would be better
	// setTimeout( function(){
	// 	target.css({
	// 		left: ''
	// 	});		
	// 	return;
	// }, 100);
		
	strikeItem(docId);	
}

var resetLeft = function(target){
	target.css({
		left: ''
	});		
	return;
}

var ListRouter = Backbone.Router.extend({
	routes: {
		":list_id": "main"
	},
	main: function(list_id) {
		var oldList = Session.get("list_id");
		if (oldList !== list_id) {
			Session.set("list_id", list_id);
		}
	},
	setList: function(list_id) {
		this.navigate(list_id, true);
	}
});


Router = new ListRouter;

Meteor.startup(function () {		
	Backbone.history.start({pushState: true});		
});



