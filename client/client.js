
Template.list.things = function () {
  return Things.find({}, 
	{
		sort: {
			name: 1
		}
	}	
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
			var th = Things.findOne({name: n});
			if (!th){
				Things.insert({
						name: n
					});
			}
			element.value = '';
		}
	},
	'click div.delete': function() {
		deleteThing(this._id);
	},
	'click span.name': function(event, template){
		//
		//Editing is accomplished by removing the current 
		//item from the list & putting it back in the edit field
		var input = template.find('.thingInput');
		input.value = event.target.textContent;
		deleteThing(this._id);
		input.focus();
		
	}	
};

var deleteThing = function(id){
	Things.remove(id);	
}



