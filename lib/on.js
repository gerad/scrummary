module.exports = On;

function On() {
  if (!(this instanceof On)) { var o = Object.create(On.prototype); On.apply(o, arguments); return o; }

  var callbacks = {};

  for (var i = 0, l = arguments.length; i < l; i++) {
    var name = arguments[i];
    
    callbacks[name] = [];
    this[name] = add(callbacks[name]);
    this[name].fire = fire(callbacks[name]);
  }
}

function add(callbacks) {
  return function add(callback) {
    callbacks.push(callback);
  };
}

function fire(callbacks) {
  return function fire() {
    for (var i = 0, l = callbacks.length; i < l; i++) {
      callbacks[i].apply(null, arguments);
    }
  }  
}
