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
			addItem(element);
		}
	},
	'click a.delete': function(event, template) {
		removeItem(this._id);
	},
	'click a.strike': function(event, template) {
		strikeItem(this._id);
	},	
	'click .nameContainer': function(event, template){
		//
		//Editing is just drop/readd
		var input = template.find('.thingInput');
		input.value = event.target.textContent;
		removeItem(this._id);
		input.focus();
	}	
};

Template.guide.events = {
	'click input': function(event, template) {
		var element = template.find('.guide');
		element.style.display = 'none';	
		Lists.update(Session.get('list_id'), {$set: {showGuide: false}});
		Session.set('showGuide', false);	
	}, 
	'click a': function(event, template){
		return;
	}
};


Template.thing.helpers({
	nameStyle: function() {
		return this.struck ? 'struck' : '';
	}
});

Template.guide.helpers({
	url: function(){
		return window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;
	},
	//
	//TODO: send actual email instead of using anchor mailto
	emailBody: function(){
		var url = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;
		return '%0AI\'ve%20created%20a%20list%20that%20we%20can%20share.%20%20' + 	
		'We\'ll%20both%20see%20the%20items%20we%20add%2Fremove%20from%20the%20list%20in%20realtime.' + 	
		'%20%20Check%20it%20out%20here%3A%20%20' + url;
	}
});


Template.thing.rendered = function(template){
	var dragOptions = {};
	
	$('.thingContainer').hammer(dragOptions).on("dragleft", function(event) {
		event.gesture.preventDefault();
		event.stopPropagation();		
		if (Things.findOne(event.currentTarget.id)){
			Things.remove(event.currentTarget.id);	
			//
			//Remove hammer event, they linger upon meteor rerender (ghost event!)
			$(event.currentTarget).hammer().off("dragleft");
		}		
	});	

	$('.thingContainer').hammer(dragOptions).on("dragright", function(event) {
		event.gesture.preventDefault();
		event.stopPropagation();
		strikeItem(event.currentTarget.id);
	});
	
}

var addItem = function(element){
	element.blur();	
	var n = element.value;	

	if (!n || n == ''){
		return;
	}
	
	n = n.toLowerCase().substring(0, 125).trim();
	
	var th = Things.findOne({list_id: Session.get('list_id'), name: n});
	if (!th){
		Things.insert({list_id: Session.get('list_id'), name: n, struck: false});
	}			
	element.value = '';
	element.focus();
}

var removeItem = function(id){
	Things.remove(id);
}

var strikeItem = function(id){
	Things.update(id, {$set: {struck: true}});		
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



