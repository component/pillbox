/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , keyname = require('keyname')
  , events = require('events')
  , each = require('each')
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
  this.options = options || {}
  this.input = input;
  this.tags = new Set;
  this.el = document.createElement('div');
  this.el.className = 'pillbox';
  this.el.style = input.style;
  input.parentNode.insertBefore(this.el, input);
  input.parentNode.removeChild(input);
  this.el.appendChild(input);
  this.events = events(this.el, this);
  this.bind();
}

/**
 * Mixin emitter.
 */

Emitter(Pillbox.prototype);

/**
 * Bind internal events.
 *
 * @return {Pillbox}
 * @api public
 */

Pillbox.prototype.bind = function(){
  this.events.bind('click');
  this.events.bind('keydown');
  return this;
};

/**
 * Unbind internal events.
 *
 * @return {Pillbox}
 * @api public
 */

Pillbox.prototype.unbind = function(){
  this.events.unbind();
  return this;
};

/**
 * Handle keyup.
 *
 * @api private
 */

Pillbox.prototype.onkeydown = function(e){
  switch (keyname(e.which)) {
    case 'enter':
      e.preventDefault();
      this.add(e.target.value);
      e.target.value = '';
      break;
    case 'space':
      if (!this.options.space) return;
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
 * Handle click.
 *
 * @api private
 */

Pillbox.prototype.onclick = function(){
  this.input.focus();
};

/**
 * Set / Get all values.
 *
 * @param {Array} vals
 * @return {Array|Pillbox}
 * @api public
 */

Pillbox.prototype.values = function(vals){
  var self = this;

  if (0 == arguments.length) {
    return this.tags.values();
  }

  each(vals, function(value){
    self.add(value);
  });

  return this;
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
  var span = document.createElement('span');
  span.setAttribute('data', tag);
  span.appendChild(document.createTextNode(tag));
  span.onclick = function(e) {
    e.preventDefault();
    self.input.focus();
  };

  // delete link
  var del = document.createElement('a');
  del.appendChild(document.createTextNode('✕'));
  del.href = '#';
  del.onclick = this.remove.bind(this, tag);
  span.appendChild(del);

  this.el.insertBefore(span, this.input);
  this.emit('add', tag, span);

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

  var span;
  for (var i = 0; i < this.el.childNodes.length; ++i) {
    span = this.el.childNodes[i];
    if (tag == span.getAttribute('data')) break;
  }

  this.el.removeChild(span);
  this.emit('remove', tag);

  return this;
}

