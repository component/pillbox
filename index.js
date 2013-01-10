
/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , keyname = require('keyname')
  , event = require('event')
  , Set = require('set');

/**
 * Expose `Pillbox`.
 */

module.exports = Pillbox

/**
 * Initialize a `Pillbox` with the given
 * `input` element and `options`.
 *
 * @param {Element} input
 * @param {Object} options
 * @api public
 */

function Pillbox(input, options) {
  if (!(this instanceof Pillbox)) return new Pillbox(input, options);
  var self = this
  this.options = options || {}
  this.input = input;
  this.tags = new Set;
  this.el = document.createElement('div');
  this.el.className = 'pillbox';
  this.el.style = input.style;
  this.ul = document.createElement('ul');
  this.el.appendChild(this.ul);
  input.parentNode.insertBefore(this.el, input);
  input.parentNode.removeChild(input);
  this.el.appendChild(input);
  event.bind(this.el, 'click', input.focus.bind(input));
  event.bind(this.el, 'keydown', this.onkeyup.bind(this));
}

/**
 * Mixin emitter.
 */

Emitter(Pillbox.prototype);

/**
 * Handle keyup.
 *
 * @api private
 */

Pillbox.prototype.onkeyup = function(e){
  switch (keyname(e.which)) {
    case 'enter':
      e.preventDefault();
      this.add(e.target.value);
      e.target.value = '';
      break;
    case 'backspace':
      if ('' == e.target.value) {
        this.remove(this.last());
      }
      break;
  }
};

/**
 * Return an array of the tag strings.
 *
 * @return {Array}
 * @api public
 */

Pillbox.prototype.values = function(){
  return this.tags.values();
};

/**
 * Return the last member of the set.
 *
 * @return {String}
 * @api private
 */

Pillbox.prototype.last = function(){
  return this.tags.vals[this.tags.vals.length - 1];
};

/**
 * Add `tag`.
 *
 * @param {String} tag
 * @return {Pillbox} self
 * @api public
 */

Pillbox.prototype.add = function(tag) {
  var self = this
  tag = tag.trim();

  // blank
  if ('' == tag) return;

  // exists
  if (this.tags.has(tag)) return;

  // lowercase
  if (this.options.lowercase) tag = tag.toLowerCase();

  // add it
  this.tags.add(tag);

  // list item
  var li = document.createElement('li');
  li.setAttribute('data', tag);
  li.appendChild(document.createTextNode(tag));
  li.onclick = function(e) {
    e.preventDefault();
    self.input.focus();
  };

  // delete link
  var del = document.createElement('a');
  del.appendChild(document.createTextNode('✕'));
  del.href = '#';
  del.onclick = this.remove.bind(this, tag);
  li.appendChild(del);

  this.ul.appendChild(li);
  this.emit('add', tag);

  return this;
}

/**
 * Remove `tag`.
 *
 * @param {String} tag
 * @return {Pillbox} self
 * @api public
 */

Pillbox.prototype.remove = function(tag) {
  if (!this.tags.has(tag)) return this;
  this.tags.remove(tag);

  var li;
  for (var i = 0; i < this.ul.childNodes.length; ++i) {
    li = this.ul.childNodes[i];
    if (tag == li.getAttribute('data')) break;
  }

  this.ul.removeChild(li);
  this.emit('remove', tag);

  return this;
}

