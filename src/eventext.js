// Extend Element with observe and stopObserving.
if (typeof Element.Methods.observe == 'undefined') Element.addMethods({
  observe : function(el, event, callback) {
    Event.observe(el, event, callback);
  },
  stopObserving : function(el, event, callback) {
    Event.stopObserving(el, event, callback);
  }
});

// Replace out existing event observe code with Dean Edwards' addEvent
// http://dean.edwards.name/weblog/2005/10/add-event/
Object.extend(Event, {
  _observeAndCache : function(el, type, func) {
    if (!func.$$guid) func.$$guid = Event._guid++;
  	if (!el.events) el.events = {};
  	var handlers = el.events[type];
  	if (!handlers) {
  		handlers = el.events[type] = {};
  		if (el["on" + type]) {
  			handlers[0] = el["on" + type];
  		}
  	}
  	handlers[func.$$guid] = func;
  	el["on" + type] = Event._handleEvent;
  	
  	if (!Event.observers) Event.observers = [];
  	Event.observers.push([el, type, func, false]);
	},
	stopObserving : function(el, type, func) {
	  el = $(el);
    if (el.events && el.events[type]) delete el.events[type][func.$$guid];
    
    for (var i = 0; i < Event.observers.length; i++) {
      if (Event.observers[i] &&
          Event.observers[i][0] == el && 
          Event.observers[i][1] == type && 
          Event.observers[i][2] == func) delete Event.observers[i];
    }
  },
  _handleEvent : function(e) {
    var returnValue = true;
    e = e || Event._fixEvent(window.event);
    var handlers = this.events[e.type], el = $(this);
    for (var i in handlers) {
    	el.$$handleEvent = handlers[i];
    	if (el.$$handleEvent(e) === false) returnValue = false;
    }
  	return returnValue;
  },
  _fixEvent : function(e) {
    e.preventDefault = Event._preventDefault;
    e.stopPropagation = Event._stopPropagation;
    return e;
  },
  _preventDefault : function() { this.returnValue = false },
  _stopPropagation : function() { this.cancelBubble = true },
  _guid : 1
});

// Allows you to trigger an event element.  
Object.extend(Event, {
  trigger : function(element, event, fakeEvent) {
    element = $(element);
    fakeEvent = fakeEvent || { type :  event };
    if(element.events && element.events[event]) { 	
      $H(element.events[event]).each(function(cache) {
        cache[1].call(element, fakeEvent);
    	});
    }
  }
});