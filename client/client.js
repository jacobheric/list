
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
			var element = template.find(".thingInput");
			element.blur();
			//alert(element.value);
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
		Things.remove(this._id);
	},
	'keyup input.name': function(event, template) {
		if (event.keyCode === 13){ 
			var element = template.find(".name");
			element.blur();			
			var n = element.value;
			if (n){
				n = n.toLowerCase();
			}
			
			Things.update(this._id, {
					name: n
				});
		}
	},	
	
};



