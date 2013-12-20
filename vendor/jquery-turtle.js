(function($) {
/*

jQuery-turtle
=============

version 2.0.7

jQuery-turtle is a jQuery plugin for turtle graphics.

With jQuery-turtle, every DOM element is a turtle that can be
moved using turtle graphics methods like fd (forward), bk (back),
rt (right turn), and lt (left turn).  The pen function allows
a turtle to draw on a full-document canvas as it moves.

<pre>
$('#turtle').pen('red').rt(90).fd(100).lt(90).bk(50).fadeOut();
</pre>

jQuery-turtle provides:
  * Relative and absolute motion and drawing.
  * Functions to ease basic input, output, and game-making for beginners.
  * Operations on sets of turtles, and turtle motion of arbitrary elements.
  * Accurate collision-testing of turtles with arbitrary convex hulls.
  * Simplified access to CSS3 transforms, jQuery animations, Canvas, and Web Audio.
  * An interactive turtle console in either Javascript or CoffeeScript.

The plugin can also create a learning environment with a default
turtle that is friendly for beginners.  The following is a complete
CoffeeScript program that uses the default turtle to draw a grid of
sixteen colored polygons.

<pre>
eval $.turtle()  # Create the default turtle.

speed 100
for color in [red, gold, green, blue]
  for sides in [3..6]
    pen color
    for x in [1..sides]
      fd 100 / sides
      lt 360 / sides
    pen null
    fd 40
  slide 40, -160
</pre>

[Try an interactive demo (CoffeeScript syntax) here.](
http://davidbau.github.io/jquery-turtle/demo.html)


JQuery Methods for Turtle Movement
----------------------------------

The turtle API is briefly summarized below.  All the following
turtle-oriented methods operate on any jQuery object (including
the default turtle, if used):

<pre>
$(q).fd(100)      // Forward relative motion in local coordinates.
$(q).bk(50)       // Back.
$(q).rt(90)       // Right turn.  Optional turning radius second arg.
$(q).lt(45)       // Left turn.  Optional turning radius second arg.
$(q).slide(x, y)  // Slide right by x while sliding forward by y.
$(q).moveto({pageX:x,pageY:y} | [x,y])  // Absolute motion on page.
$(q).jumpto({pageX:x,pageY:y} | [x,y])  // Like moveto, without drawing.
$(q).turnto(bearing || position)        // Absolute direction adjustment.
$(q).play("ccgg") // Plays notes using ABC notation and waits until done.

// Methods below happen in an instant, but line up in the animation queue.
$(q).home()       // Jumps to the center of the document, with bearing 0.
$(q).pen('red')   // Sets a pen style, or 'none' for no drawing.
$(q).pu()         // Pen up - temporarily disables the pen (also pen(false)).
$(q).pd()         // Pen down - starts a new pen path.
$(q).pe()         // Uses the pen 'erase' style.
$(q).fill('gold') // Fills a shape previously outlined using pen('path').
$(q).dot(12)      // Draws a circular dot of diameter 12.  Color second arg.
$(q).label('A')   // Prints an HTML label at the turtle location.
$(q).speed(10)    // Sets turtle animation speed to 10 moves per sec.
$(q).ht()         // Hides the turtle.
$(q).st()         // Shows the turtle.
$(q).wear('blue') // Switches to a blue shell.  Use any image or color.
$(q).scale(1.5)   // Scales turtle size and motion by 150%.
$(q).twist(180)   // Changes which direction is considered "forward".
$(q).mirror(true) // Flips the turtle across its main axis.
$(q).reload()     // Reloads the turtle's image (restarting animated gifs)
$(q).direct(fn)   // Like each, but this is set to $(elt) instead of elt,
                  // and the callback fn can insert into the animation queue.

// Methods below this line do not queue for animation.
$(q).getxy()      // Local (center-y-up [x, y]) coordinates of the turtle.
$(q).pagexy()     // Page (topleft-y-down {pageX:x, pageY:y}) coordinates.
$(q).bearing([p]) // The turtles absolute direction (or direction towards p).
$(q).distance(p)  // Distance to p in page coordinates.
$(q).shown()      // Shorthand for is(":visible")
$(q).hidden()     // Shorthand for !is(":visible")
$(q).touches(y)   // Collision tests elements (uses turtleHull if present).
$(q).enclosedby(y)// Containment collision test.
$(q).within(d, t) // Filters to items with centers within d of t.pagexy().
$(q).notwithin()  // The negation of within.
$(q).cell(y, x)   // Selects the yth row and xth column cell in a table.
$(q).hatch([n,] [img]) // Creates and returns n turtles with the given img.
</pre>


Speed and Turtle Animation
--------------------------

When the speed of a turtle is nonzero, the first eight movement
functions animate at that speed (in moves per second), and the
remaining mutators also participate in the animation queue.  The
default turtle speed is a leisurely one move per second (as
appropriate for the creature), but you may soon discover the
desire to set speed higher.

Setting the turtle speed to Infinity will make its movement synchronous,
which makes the synchronous distance, direction, and hit-testing useful
for realtime game-making.

Pen and Fill Styles
-------------------

The turtle pen respects canvas styling: any valid strokeStyle is
accepted; and also using a space-separated syntax, lineWidth, lineCap,
lineJoin, miterLimit, and fillStyle can be specified, e.g.,
pen('red lineWidth 5 lineCap square').  The same syntax applies for
styling dot and fill (except that the default interpretation for the
first value is fillStyle instead of strokeStyle).

The fill method is used by tracing an invisible path using the
pen('path') style, and then calling the fill method.  Disconnected
paths can be created using pu() and pd().

Conventions for Musical Notes
-----------------------------

The play method plays a sequence of notes specified using a subset of
standard ABC notation.  Capital C denotes middle C, and lowercase c is
an octave higher.  Pitches and durations can be altered with commas,
apostrophes, carets, underscores, digits, and slashes as in the
standard.  Enclosing letters in square brackets represents a chord,
and z represents a rest.  The default tempo is 120, but can be changed
by passing a options object as the first parameter setting tempo, e.g.,
{ tempo: 200 }.  Other options include volume: 0.5, type: 'sine' or
'square' or 'sawtooth' or 'triangle', and envelope: which defines
an ADSR envelope e.g., { a: 0.01, d: 0.2, s: 0.1, r: 0.1 }.

The turtle's motion will pause while it is playing notes.  To play
notes without stalling turtle movement, use the global function sound()
instead of the turtle method play().

Directing Logic in the Animation Queue
--------------------------------------

The direct method can be used to queue logic (including synchronous
tests or actions) by running a function in the animation queue.  Unlike
jquery queue(), direct arranges things so that if further animations
are queued by the callback function, they are inserted (in natural
recursive functional execution order) instead of being appended.

Turnto and Absolute Bearings
----------------------------

The turnto method can turn to an absolute bearing (if called with a
single numeric argument) or towards an absolute position on the
screen.  The methods moveto and turnto accept either page or
graphing coordinates.

Moveto and Two Flavors of Cartesian Coordinates
-----------------------------------------------

Graphing coordinates are measured upwards and rightwards from the
center of the page, and they are specified as bare numeric x, y
arguments or [x, y] pairs as returned from getxy().

Page coordinates are specified by an object with pageX and pageY
properties, or with a pagexy() method that will return such an object.
That includes, usefullly, mouse events and turtle objects.  Page
coordinates are measured downward from the top-left corner of the
page to the center (or transform-origin) of the given object.

Hit Testing
-----------

The hit-testing functions touches() and enclosedby() will test for
collisions using the convex hulls of the objects in question.
The hull of an element defaults to the bounding box of the element
(as transformed) but can be overridden by the turtleHull CSS property,
if present.  The default turtle is given a turtle-shaped hull.

Turtle Teaching Environment
---------------------------

A default turtle together with an interactive console are created by
calling eval($.turtle()).  That call exposes all the turtle methods
such as (fd, rt, getxy, etc) as global functions operating on the default
turtle.  It will also set up a number of other global symbols to provide
beginners with a simplified programming environment.

In detail, after eval($.turtle()):
  * An &lt;img id="turtle"&gt; is created if #turtle doesn't already exist.
  * An eval debugging panel (see.js) is shown at the bottom of the screen.
  * Turtle methods on the default turtle are packaged as globals, e.g., fd(10).
  * Every #id element is turned into a global variable: window.id = $('#id').
  * Default turtle animation is set to 1 move per sec so steps can be seen.
  * Global event listeners are created to update global event variables.
  * Methods of $.turtle.* (enumerated below) are exposed as global functions.
  * String constants are defined for the 140 named CSS colors.

Beyond the functions to control the default turtle, the globals added by
$.turtle() are as follows:

<pre>
lastclick             // Event object of the last click event in the doc.
lastmousemove         // The last mousemove event.
lastmouseup           // The last mouseup event.
lastmousedown         // The last mousedown event.
keydown               // The last keydown event.
keyup                 // The last keyup event.
keypress              // The last keypress event.
hatch([n,] [img])     // Creates and returns n turtles with the given img.
cs()                  // Clears the screen, both the canvas and the body text.
cg()                  // Clears the graphics canvas without clearing the text.
ct()                  // Clears the text without clearing the canvas.
defaultspeed(mps)     // Sets $.fx.speeds.turtle to 1000 / mps.
tick([perSec,] fn)    // Sets fn as the tick callback (null to clear).
random(n)             // Returns a random number [0..n-1].
random(list)          // Returns a random element of the list.
random('normal')      // Returns a gaussian random (mean 0 stdev 1).
random('uniform')     // Returns a uniform random [0...1).
random('position')    // Returns a random {pageX:x, pageY:y} coordinate.
random('color')       // Returns a random hsl(*, 100%, 50%) color.
random('gray')        // Returns a random hsl(0, 0, *) gray.
remove()              // Removes default turtle and its globals (fd, etc).
see(a, b, c...)       // Logs tree-expandable data into debugging panel.
write(html)           // Appends html into the document body.
read([label,] fn)     // Makes a one-time input field, calls fn after entry.
readnum([label,] fn)  // Like read, but restricted to numeric input.
readstr([label,] fn)  // Like read, but never converts input to a number.
button([label,] fn)   // Makes a clickable button, calls fn when clicked.
table(m, n)           // Outputs a table with m rows and n columns.
sound('[DFG][EGc]')   // Plays musical notes now, without queueing.
</pre>

Here is another CoffeeScript example that demonstrates some of
the functions:

<pre>
eval $.turtle()  # Create the default turtle and global functions.

defaultspeed Infinity
write "Catch blue before red gets you."
bk 100
r = hatch red
b = hatch blue
tick 10, ->
  turnto lastmousemove
  fd 6
  r.turnto turtle
  r.fd 4
  b.turnto bearing b
  b.fd 3
  if b.touches(turtle)
    write "You win!"
    tick off
  else if r.touches(turtle)
    write "Red got you!"
    tick off
  else if not b.enclosedby(document)
    write "Blue got away!"
    tick off
</pre>

The turtle teaching environment is designed to work well with either
Javascript or CoffeeScript.

JQuery CSS Hooks for Turtle Geometry
------------------------------------

Underlying turtle motion are turtle-oriented 2d transform jQuery cssHooks,
with animation support on all motion:

<pre>
$(q).css('turtleSpeed', '10');         // default speed in moves per second.
$(q).css('turtlePosition', '30 40');   // position in local coordinates.
$(q).css('turtlePositionX', '30px');   // x component.
$(q).css('turtlePositionY', '40px');   // y component.
$(q).css('turtleRotation', '90deg');   // rotation in degrees.
$(q).css('turtleScale', '2');          // double the size of any element.
$(q).css('turtleScaleX', '2');         // x stretch after twist.
$(q).css('turtleScaleY', '2');         // y stretch after twist.
$(q).css('turtleTwist', '45deg');      // turn before stretching.
$(q).css('turtleForward', '50px');     // position in direction of rotation.
$(q).css('turtleTurningRadius, '50px');// arc turning radius for rotation.
$(q).css('turtlePenStyle', 'red');     // or 'red lineWidth 2px' etc.
$(q).css('turtlePenDown', 'up');       // default 'down' to draw with pen.
$(q).css('turtleHull', '5 0 0 5 0 -5');// fine-tune shape for collisions.
</pre>

Arbitrary 2d transforms are supported, including transforms of elements
nested within other elements that have css transforms. For example, arc
paths of a turtle within a skewed div will transform to the proper elliptical
arc.  Note that while turtle motion is transformed, lines and dots are not:
for example, dots are always circular.  To get transformed circles, trace
out an arc.

Transforms on the turtle itself are used to infer the turtle position,
direction, and rendering of the sprite.  ScaleY stretches the turtle
sprite in the direction of movement also stretches distances for
motion in all directions.  ScaleX stretches the turtle sprite perpendicular
to the direction of motion and also stretches line and dot widths for
drawing.

A canvas is supported for drawing, but only created when the pen is
used; pen styles include canvas style properties such as lineWidth
and lineCap.

A convex hull polygon can be set to be used by the collision detection
and hit-testing functions (enclosedby, touches).  The turtleHull is a list
of (unrotated) x-y coordinates relative to the object's transformOrigin.
If set to 'auto' (the default) the hull is just the bounding box for the
element.

License (MIT)
-------------

Copyright (c) 2013 David Bau

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

//////////////////////////////////////////////////////////////////////////
// PREREQUISTIES
// Establish support for transforms in this browser.
//////////////////////////////////////////////////////////////////////////

var undefined = {}.undefined;

if (!$.cssHooks) {
  throw("jQuery 1.4.3+ is needed for jQuery-turtle to work");
}

// Determine the name of the 'transform' css property.
function styleSupport(prop) {
  var vendorProp, supportedProp,
      capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
      prefixes = [ "Moz", "Webkit", "O", "ms" ],
      div = document.createElement("div");
  if (prop in div.style) {
    supportedProp = prop;
  } else {
    for (var i = 0; i < prefixes.length; i++) {
      vendorProp = prefixes[i] + capProp;
      if (vendorProp in div.style) {
        supportedProp = vendorProp;
        break;
      }
    }
  }
  div = null;
  $.support[prop] = supportedProp;
  return supportedProp;
}
function hasGetBoundingClientRect() {
  var div = document.createElement("div"),
      result = ('getBoundingClientRect' in div);
  div = null;
  return result;
}
var transform = styleSupport("transform"),
    transformOrigin = styleSupport("transformOrigin");

if (!transform || !hasGetBoundingClientRect()) {
  // Need transforms and boundingClientRects to support turtle methods.
  return;
}

//////////////////////////////////////////////////////////////////////////
// MATH
// 2d matrix support functions.
//////////////////////////////////////////////////////////////////////////

function identity(x) { return x; }

// Handles both 2x2 and 2x3 matrices.
function matrixVectorProduct(a, v) {
  var r = [a[0] * v[0] + a[2] * v[1], a[1] * v[0] + a[3] * v[1]];
  if (a.length == 6) {
    r[0] += a[4];
    r[1] += a[5];
  }
  return r;
}

// Multiplies 2x2 or 2x3 matrices.
function matrixProduct(a, b) {
  var r = [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3]
  ];
  var along = (a.length == 6);
  if (b.length == 6) {
    r.push(a[0] * b[4] + a[2] * b[5] + (along ? a[4] : 0));
    r.push(a[1] * b[4] + a[3] * b[5] + (along ? a[5] : 0));
  } else if (along) {
    r.push(a[4]);
    r.push(a[5]);
  }
  return r;
}

function nonzero(e) {
  // Consider zero any deviations less than one in a trillion.
  return Math.abs(e) > 1e-12;
}

function isone2x2(a) {
  return !nonzero(a[1]) && !nonzero(a[2]) &&
      !nonzero(1 - a[0]) && !nonzero(1 - a[3]);
}

function inverse2x2(a) {
  if (isone2x2(a)) { return [1, 0, 0, 1]; }
  var d = decomposeSVD(a);
  // Degenerate matrices have no inverse.
  if (!nonzero(d[2])) return null;
  return matrixProduct(
      rotation(-(d[3])), matrixProduct(
      scale(1/d[1], 1/d[2]),
      rotation(-(d[0]))));
}

function rotation(theta) {
  var c = Math.cos(theta),
      s = Math.sin(theta);
  return [c, s, -s, c];
}

function scale(sx, sy) {
  if (arguments.length == 1) { sx = sy; }
  return [sx, 0, 0, sy];
}

function addVector(v, a) {
  return [v[0] + a[0], v[1] + a[1]];
}

function subtractVector(v, s) {
  return [v[0] - s[0], v[1] - s[1]];
}

function scaleVector(v, s) {
  return [v[0] * s, v[1] * s];
}

function translatedMVP(m, v, origin) {
  return addVector(matrixVectorProduct(m, subtractVector(v, origin)), origin);
}

// decomposeSVD:
//
// Decomposes an arbitrary 2d matrix into a rotation, an X-Y scaling,
// and a prescaling rotation (which we call a "twist").  The prescaling
// rotation is only nonzero when there is some skew (i.e, a stretch that
// does not preserve rectilinear angles in the source).
//
// This decomposition is stable, which means that the product of
// the three components is always within near machine precision
// (about ~1e-15) of the original matrix.
//
// Input:  [m11, m21, m12, m22] in column-first order.
// Output: [rotation, scalex, scaley, twist] with rotations in radians.
//
// The decomposition is the unique 2d SVD permuted to fit the contraints:
//  * twist is between +- pi/4
//  * rotation is between +- pi/2
//  * scalex + scaley >= 0.
function decomposeSVD(m) {
  var // Compute M*M
      mtm0 = m[0] * m[0] + m[1] * m[1],
      mtm12 = m[0] * m[2] + m[1] * m[3],
      mtm3 = m[2] * m[2] + m[3] * m[3],
      // Compute right-side rotation.
      phi = -0.5 * Math.atan2(mtm12 * 2, mtm0 - mtm3),
      v0 = Math.cos(phi),
      v1 = Math.sin(phi),  // [v0 v1 -v1 v0]
      // Compute left-side rotation.
      mvt0 = (m[0] * v0 - m[2] * v1),
      mvt1 = (m[1] * v0 - m[3] * v1),
      theta = Math.atan2(mvt1, mvt0),
      u0 = Math.cos(theta),
      u1 = Math.sin(theta),  // [u0 u1 -u1 u0]
      // Compute the singular values.  Notice by computing in this way,
      // the sign is pushed into the smaller singular value.
      sv2c = (m[1] * v1 + m[3] * v0) * u0 - (m[0] * v1 + m[2] * v0) * u1,
      sv1c = (m[0] * v0 - m[2] * v1) * u0 + (m[1] * v0 - m[3] * v1) * u1,
      sv1, sv2;
  // Put phi between -pi/4 and pi/4.
  if (phi < -Math.PI / 4) {
    phi += Math.PI / 2;
    sv2 = sv1c;
    sv1 = sv2c;
    theta -= Math.PI / 2;
  } else {
    sv1 = sv1c;
    sv2 = sv2c;
  }
  // Put theta between -pi and pi.
  if (theta > Math.PI) { theta -= 2 * Math.PI; }
  return [theta, sv1, sv2, phi];
}

// approxBezierUnitArc:
// Returns three bezier curve control points that approximate
// a a unit circle arc from angle a1 to a2 (not including the
// beginning point, which would just be at cos(a1), sin(a1)).
// For a discussion and derivation of this formula,
// google [riskus approximating circular arcs]
function approxBezierUnitArc(a1, a2) {
  var a = (a2 - a1) / 2,
      x4 = Math.cos(a),
      y4 = Math.sin(a),
      x1 = x4,
      y1 = -y4,
      q2 = 1 + x1 * x4 + y1 * y4,
      d = (x1 * y4 - y1 * x4),
      k2 = d && (4/3 * (Math.sqrt(2 * q2) - q2) / d),
      x2 = x1 - k2 * y1,
      y2 = y1 + k2 * x1,
      x3 = x2,
      y3 = -y2,
      ar = a + a1,
      car = Math.cos(ar),
      sar = Math.sin(ar);
  return [
     [x2 * car - y2 * sar, x2 * sar + y2 * car],
     [x3 * car - y3 * sar, x3 * sar + y3 * car],
     [Math.cos(a2), Math.sin(a2)]
  ];
}

//////////////////////////////////////////////////////////////////////////
// CSS TRANSFORMS
// Basic manipulation of 2d CSS transforms.
//////////////////////////////////////////////////////////////////////////

function getElementTranslation(elem) {
  var ts = readTurtleTransform(elem, false);
  if (ts) { return [ts.tx, ts.ty]; }
  var m = readTransformMatrix(elem);
  if (m) { return [m[4], m[5]]; }
  return [0, 0];
}

// Reads out the 2x3 transform matrix of the given element.
function readTransformMatrix(elem) {
  var ts = (window.getComputedStyle ?
      window.getComputedStyle(elem)[transform] :
      $.css(elem, 'transform'));
  if (!ts || ts === 'none') {
    return null;
  }
  // Quick exit on the explicit matrix() case:
  var e =/^matrix\(([\-+.\de]+),\s*([\-+.\de]+),\s*([\-+.\de]+),\s*([\-+.\de]+),\s*([\-+.\de]+)(?:px)?,\s*([\-+.\de]+)(?:px)?\)$/.exec(ts);
  if (e) {
    return [parseFloat(e[1]), parseFloat(e[2]), parseFloat(e[3]),
            parseFloat(e[4]), parseFloat(e[5]), parseFloat(e[6])];
  }
  // Interpret the transform string.
  return transformStyleAsMatrix(ts);
}

// Reads out the css transformOrigin property, if present.
function readTransformOrigin(elem, wh) {
  var gcs = (window.getComputedStyle ?  window.getComputedStyle(elem) : null),
      origin = (gcs && gcs[transformOrigin] || $.css(elem, 'transformOrigin'));
  if (origin && origin.indexOf('%') < 0) {
    return $.map(origin.split(' '), parseFloat);
  }
  if (wh) {
    return [wh[0] / 2, wh[1] / 2];
  }
  var sel = $(elem);
  return [sel.width() / 2, sel.height() / 2];
}

// Composes all the 2x2 transforms up to the top.
function totalTransform2x2(elem) {
  var result = [1, 0, 0, 1], t;
  while (elem !== null) {
    t = readTransformMatrix(elem);
    if (t && !isone2x2(t)) {
      result = matrixProduct(t, result);
    }
    elem = elem.parentElement;
  }
  return result.slice(0, 4);
}

// Applies the css 2d transforms specification.
function transformStyleAsMatrix(transformStyle) {
  // Deal with arbitrary transforms:
  var result = [1, 0, 0, 1], ops = [], args = [],
      pat = /(?:^\s*|)(\w*)\s*\(([^)]*)\)\s*/g,
      unknown = transformStyle.replace(pat, function(m) {
        ops.push(m[1].toLowerCase());
        args.push($.map(m[2].split(','), function(s) {
          var v = s.trim().toLowerCase();
          return {
            num: parseFloat(v),
            unit: v.replace(/^[+-.\de]*/, '')
          };
        }));
        return '';
      });
  if (unknown) { return null; }
  for (var index = ops.length - 1; index >= 0; --index) {
    var m = null, a, c, s, t;
    var op = ops[index];
    var arg = args[index];
    if (op == 'matrix') {
      if (arg.length >= 6) {
        m = [arg[0].num, arg[1].num, arg[2].num, arg[3].num,
             arg[4].num, arg[5].num];
      }
    } else if (op == 'rotate') {
      if (arg.length == 1) {
        a = convertToRadians(arg[0]);
        c = Math.cos(a);
        s = Math.sin(a);
        m = [c, -s, c, s];
      }
    } else if (op == 'translate' || op == 'translatex' || op == 'translatey') {
      var tx = 0, ty = 0;
      if (arg.length >= 1) {
        if (arg[0].unit && arg[0].unit != 'px') { return null; } // non-pixels
        if (op == 'translate' || op == 'translatex') { tx = arg[0].num; }
        else if (op == 'translatey') { ty = arg[0].num; }
        if (op == 'translate' && arg.length >= 2) {
          if (arg[1].unit && arg[1].unit != 'px') { return null; }
          ty = arg[1].num;
        }
        m = [0, 0, 0, 0, tx, ty];
      }
    } else if (op == 'scale' || op == 'scalex' || op == 'scaley') {
      var sx = 1, sy = 1;
      if (arg.length >= 1) {
        if (op == 'scale' || op == 'scalex') { sx = arg[0].num; }
        else if (op == 'scaley') { sy = arg[0].num; }
        if (op == 'scale' && arg.length >= 2) { sy = arg[1].num; }
        m = [sx, 0, 0, sy, 0, 0];
      }
    } else if (op == 'skew' || op == 'skewx' || op == 'skewy') {
      var kx = 0, ky = 0;
      if (arg.length >= 1) {
        if (op == 'skew' || op == 'skewx') {
          kx = Math.tan(convertToRadians(arg[0]));
        } else if (op == 'skewy') {
          ky = Math.tan(convertToRadians(arg[0]));
        }
        if (op == 'skew' && arg.length >= 2) {
          ky = Math.tan(convertToRadians(arg[0]));
        }
        m = [1, ky, kx, 1, 0, 0];
      }
    } else {
      // Unrecgonized transformation.
      return null;
    }
    result = matrixProduct(result, m);
  }
  return result;
}

//////////////////////////////////////////////////////////////////////////
// ABSOLUTE PAGE POSITIONING
// Dealing with the element origin, rectangle, and direction on the page,
// taking into account nested parent transforms.
//////////////////////////////////////////////////////////////////////////

function limitMovement(start, target, limit) {
  if (limit <= 0) return start;
  var distx = target.pageX - start.pageX,
      disty = target.pageY - start.pageY,
      dist2 = distx * distx + disty * disty;
  if (limit * limit >= dist2) {
    return target;
  }
  var frac = limit / Math.sqrt(dist2);
  return {
    pageX: start.pageX + frac * distx,
    pageY: start.pageY + frac * disty
  };
}

function limitRotation(start, target, limit) {
  if (limit <= 0) { target = start; }
  else if (limit < 180) {
    var delta = normalizeRotation(target - start);
    if (delta > limit) { target = start + limit; }
    else if (delta < -limit) { target = start - limit; }
  }
  return normalizeRotation(target);
}

function getRoundedCenterLTWH(x0, y0, w, h) {
  return { pageX: Math.floor(x0 + w / 2), pageY: Math.floor(y0 + h / 2) };
}

function getStraightRectLTWH(x0, y0, w, h) {
  var x1 = x0 + w, y1 = y0 + h;
  return [
    { pageX: x0, pageY: y0 },
    { pageX: x0, pageY: y1 },
    { pageX: x1, pageY: y1 },
    { pageX: x1, pageY: y0 }
  ];
}

function cleanedStyle(trans) {
  // Work around FF bug: the browser generates CSS transforms with nums
  // with exponents like 1e-6px that are not allowed by the CSS spec.
  // And yet it doesn't accept them when set back into the style object.
  // So $.swap doesn't work in these cases.  Therefore, we have a cleanedSwap
  // that cleans these numbers before setting them back.
  if (!/e[\-+]/.exec(trans)) {
    return trans;
  }
  var result = trans.replace(/(?:\d+(?:\.\d*)?|\.\d+)e[\-+]\d+/g, function(e) {
    return cssNum(parseFloat(e)); });
  return result;
}

function cleanSwap(elem, options, callback) {
  var ret, name, old = {};
  // Remember the old values, and insert the new ones
  for (name in options) {
    old[name] = elem.style[name];
    elem.style[name] = options[name];
  }
  ret = callback.apply(elem);
  // Revert the old values
  for (name in options) {
    elem.style[name] = cleanedStyle(old[name]);
  }
  return ret;
}

function unattached(elt) {
  // Unattached if not part of a document.
  while (elt) {
    if (elt.nodeType === 9) return false;
    elt = elt.parentNode;
  }
  return true;
}

function wh() {
  // Quirks-mode compatible window height.
  return window.innerHeight || $(window).height();
}

function ww() {
  // Quirks-mode compatible window width.
  return window.innerWidth || $(window).width();
}

function dh() {
  return document.body ? $(document).height() : document.height;
}

function dw() {
  return document.body ? $(document).width() : document.width;
}

function makeGbcrLTWH(left, top, width, height) {
  return {
    left: left, top: top, right: left + width, bottom: top + height,
    width: width, height: height
  };
}

function getPageGbcr(elem) {
  if (isPageCoordinate(elem)) {
    return makeGbcrLTWH(elem.pageX, elem.pageY, 0, 0);
  } else if ($.isWindow(elem)) {
    return makeGbcrLTWH(
        $(window).scrollLeft(), $(window).scrollTop(), ww(), wh());
  } else if (elem.nodeType === 9) {
    return makeGbcrLTWH(0, 0, dw(), dh());
  }
  return readPageGbcr.apply(elem);
}

function isGbcrOutside(center, distance, d2, gbcr) {
  var dy = Math.max(0,
           Math.max(gbcr.top - center.pageY, center.pageY - gbcr.bottom)),
      dx = Math.max(0,
           Math.max(gbcr.left - center.pageX, center.pageX - gbcr.right));
  return dx * dx + dy * dy > d2;
}

function isGbcrInside(center, d2, gbcr) {
  var dy = Math.max(gbcr.bottom - center.pageY, center.pageY - gbcr.top),
      dx = Math.max(gbcr.right - center.pageX, center.pageX - gbcr.left);
  return dx * dx + dy * dy < d2;
}

function isDisjointGbcr(gbcr0, gbcr1) {
  return (gbcr1.right < gbcr0.left || gbcr0.right < gbcr1.left ||
          gbcr1.bottom < gbcr0.top || gbcr0.bottom < gbcr1.top);
}

function gbcrEncloses(gbcr0, gbcr1) {
  return (gbcr1.top >= gbcr0.top && gbcr1.bottom <= gbcr0.bottom &&
          gbcr1.left >= gbcr0.left && gbcr1.right <= gbcr0.right);
}

function polyMatchesGbcr(poly, gbcr) {
  return (poly.length === 4 &&
      poly[0].pageX === gbcr.left && poly[0].pageY === gbcr.top &&
      poly[1].pageX === gbcr.left && poly[1].pageY === gbcr.bottom &&
      poly[2].pageX === gbcr.right && poly[2].pageY === gbcr.bottom &&
      poly[3].pageX === gbcr.right && poly[3].pageY === gbcr.top);
}

function readPageGbcr() {
  var raw = this.getBoundingClientRect();
  if (raw.width === 0 && raw.height === 0 &&
     raw.top === 0 && raw.left === 0 && unattached(this)) {
    // Prentend unattached images have a size.
    return {
      top: 0,
      bottom: this.height || 0,
      left: 0,
      right: this.width || 0,
      width: this.width || 0,
      height: this.height || 0
    }
  }
  return {
    top: raw.top + window.pageYOffset,
    bottom: raw.bottom + window.pageYOffset,
    left: raw.left + window.pageXOffset,
    right: raw.right + window.pageXOffset,
    width: raw.width,
    height: raw.height
  };
}

// Temporarily eliminate transform (but reverse parent distortions)
// to get origin position; then calculate displacement needed to move
// turtle to target coordinates (again reversing parent distortions
// if possible).
function computeTargetAsTurtlePosition(elem, target, limit, localx, localy) {
  var totalParentTransform = totalTransform2x2(elem.parentElement),
      inverseParent = inverse2x2(totalParentTransform),
      hidden = ($.css(elem, 'display') === 'none'),
      swapout = hidden ?
        { position: "absolute", visibility: "hidden", display: "block" } : {},
      substTransform = swapout[transform] = (inverseParent ? 'matrix(' +
          $.map(inverseParent, cssNum).join(', ') + ', 0, 0)' : 'none'),
      gbcr = cleanSwap(elem, swapout, readPageGbcr),
      middle = readTransformOrigin(elem, [gbcr.width, gbcr.height]),
      origin = addVector([gbcr.left, gbcr.top], middle),
      pos, current, tr, localTarget;
  if (!inverseParent) { return; }
  if ($.isNumeric(limit)) {
    tr = getElementTranslation(elem);
    pos = addVector(matrixVectorProduct(totalParentTransform, tr), origin);
    current = {
      pageX: pos[0],
      pageY: pos[1]
    };
    target = limitMovement(current, target, limit);
  }
  localTarget = matrixVectorProduct(inverseParent,
      subtractVector([target.pageX, target.pageY], origin));
  if (localx || localy) {
    var ts = readTurtleTransform(elem, true),
        sy = ts ? ts.sy : 1;
    localTarget[0] += localx * sy;
    localTarget[1] -= localy * sy;
  }
  return cssNum(localTarget[0]) + ' ' + cssNum(localTarget[1]);
}

function homeContainer(elem) {
  var container = elem.offsetParent;
  if (!container) {
    return document;
  }
  return container;
}

// Compute the home position and the turtle location in local turtle
// coordinates; return the local offset from the home position as
// an array of len 2.
function computePositionAsLocalOffset(elem, home) {
  if (!home) {
    home = $(homeContainer(elem)).pagexy();
  }
  var totalParentTransform = totalTransform2x2(elem.parentElement),
      inverseParent = inverse2x2(totalParentTransform),
      hidden = ($.css(elem, 'display') === 'none'),
      swapout = hidden ?
        { position: "absolute", visibility: "hidden", display: "block" } : {},
      substTransform = swapout[transform] = (inverseParent ? 'matrix(' +
          $.map(inverseParent, cssNum).join(', ') + ', 0, 0)' : 'none'),
      gbcr = cleanSwap(elem, swapout, readPageGbcr),
      middle = readTransformOrigin(elem, [gbcr.width, gbcr.height]),
      origin = addVector([gbcr.left, gbcr.top], middle),
      ts = readTurtleTransform(elem, true),
      localHome = inverseParent && matrixVectorProduct(inverseParent,
          subtractVector([home.pageX, home.pageY], origin)),
      isy = ts && 1 / ts.sy;
  if (!inverseParent) { return; }
  return [(ts.tx - localHome[0]) * isy, (localHome[1] - ts.ty) * isy];
}

function convertLocalXyToPageCoordinates(elem, localxy) {
  var totalParentTransform = totalTransform2x2(elem.parentElement),
      ts = readTurtleTransform(elem, true),
      center = $(homeContainer(elem)).pagexy(),
      result = [],
      pageOffset, j;
  for (j = 0; j < localxy.length; j++) {
    pageOffset = matrixVectorProduct(
        totalParentTransform, [localxy[j][0] * ts.sy, -localxy[j][1] * ts.sy]);
    result.push({ pageX: center.pageX + pageOffset[0],
                  pageY: center.pageY + pageOffset[1] });
  }
  return result;
}

// Uses getBoundingClientRect to figure out current position in page
// coordinates.  Works by backing out local transformation (and inverting
// any parent rotations and distortions) so that the bounding rect is
// rectilinear; then reapplies translation (under any parent distortion)
// to get the final x and y, returned as {pageX:, pagey:}.
function getCenterInPageCoordinates(elem) {
  if ($.isWindow(elem)) {
    return getRoundedCenterLTWH(
        $(window).scrollLeft(), $(window).scrollTop(), ww(), wh());
  } else if (elem.nodeType === 9 || elem == document.body) {
    return getRoundedCenterLTWH(0, 0, dw(), dh());
  }
  var tr = getElementTranslation(elem),
      totalParentTransform = totalTransform2x2(elem.parentElement),
      inverseParent = inverse2x2(totalParentTransform),
      hidden = ($.css(elem, 'display') === 'none'),
      swapout = hidden ?
        { position: "absolute", visibility: "hidden", display: "block" } : {},
      st = swapout[transform] = (inverseParent ?
          'matrix(' + $.map(inverseParent, cssNum).join(', ') + ', 0, 0)' : 'none'),
      saved = elem.style[transform],
      gbcr = cleanSwap(elem, swapout, readPageGbcr),
      middle = readTransformOrigin(elem, [gbcr.width, gbcr.height]),
      origin = addVector([gbcr.left, gbcr.top], middle),
      pos = addVector(matrixVectorProduct(totalParentTransform, tr), origin);
  return {
    pageX: pos[0],
    pageY: pos[1]
  };
}

function polyToVectorsOffset(poly, offset) {
  if (!poly) { return null; }
  var result = [], j = 0;
  for (; j < poly.length; ++j) {
    result.push([poly[j].pageX + offset[0], poly[j].pageY + offset[1]]);
  }
  return result;
}

// Uses getBoundingClientRect to figure out the corners of the
// transformed parallelogram in page coordinates.
function getCornersInPageCoordinates(elem, untransformed) {
  if ($.isWindow(elem)) {
    return getStraightRectLTWH(
        $(window).scrollLeft(), $(window).scrollTop(), ww(), wh());
  } else if (elem.nodeType === 9) {
    return getStraightRectLTWH(0, 0, dw(), dh());
  }
  var currentTransform = readTransformMatrix(elem) || [1, 0, 0, 1],
      totalParentTransform = totalTransform2x2(elem.parentElement),
      totalTransform = matrixProduct(totalParentTransform, currentTransform),
      inverseParent = inverse2x2(totalParentTransform),
      hidden = ($.css(elem, 'display') === 'none'),
      swapout = hidden ?
        { position: "absolute", visibility: "hidden", display: "block" } : {},
      substTransform = swapout[transform] = (inverseParent ? 'matrix(' +
          $.map(inverseParent, cssNum).join(', ') + ', 0, 0)' : 'none'),
      gbcr = cleanSwap(elem, swapout, readPageGbcr),
      middle = readTransformOrigin(elem, [gbcr.width, gbcr.height]),
      origin = addVector([gbcr.left, gbcr.top], middle),
      hull = polyToVectorsOffset(getTurtleData(elem).hull, origin) || [
        [gbcr.left, gbcr.top],
        [gbcr.left, gbcr.bottom],
        [gbcr.right, gbcr.bottom],
        [gbcr.right, gbcr.top]
      ];
  if (untransformed) {
    // Used by the turtleHull css getter hook.
    return $.map(hull, function(pt) {
      return { pageX: pt[0] - origin[0], pageY: pt[1] - origin[1] };
    });
  }
  return $.map(hull, function(pt) {
    var tpt = translatedMVP(totalTransform, pt, origin);
    return { pageX: tpt[0], pageY: tpt[1] };
  });
}

function getDirectionOnPage(elem) {
  var ts = readTurtleTransform(elem, true),
      r = convertToRadians(normalizeRotation(ts.rot)),
      ux = Math.sin(r), uy = Math.cos(r),
      totalParentTransform = totalTransform2x2(elem.parentElement),
      up = matrixVectorProduct(totalParentTransform, [ux, uy]);
      dp = Math.atan2(up[0], up[1]);
  return radiansToDegrees(dp);
}

function scrollWindowToDocumentPosition(pos, limit) {
  var tx = pos.pageX,
      ty = pos.pageY,
      ww2 = ww() / 2,
      wh2 = wh() / 2,
      b = $('body'),
      dw = b.width(),
      dh = b.height(),
      w = $(window);
  if (tx > dw - ww2) { tx = dw - ww2; }
  if (tx < ww2) { tx = ww2; }
  if (ty > dh - wh2) { ty = dh - wh2; }
  if (ty < wh2) { ty = wh2; }
  targ = { pageX: tx, pageY: ty };
  if ($.isNumeric(limit)) {
    targ = limitMovement(w.origin(), targ, limit);
  }
  w.scrollLeft(targ.pageX - ww2);
  w.scrollTop(targ.pageY - wh2);
}

//////////////////////////////////////////////////////////////////////////
// HIT DETECTION AND COLLISIONS
// Deal with touching and enclosing element rectangles taking
// into account distortions from transforms.
//////////////////////////////////////////////////////////////////////////

function signedTriangleArea(pt0, pt1, pt2) {
  var x1 = pt1.pageX - pt0.pageX,
      y1 = pt1.pageY - pt0.pageY,
      x2 = pt2.pageX - pt0.pageX,
      y2 = pt2.pageY - pt0.pageY;
  return x2 * y1 - x1 * y2;
}

function signedDeltaTriangleArea(pt0, diff1, pt2) {
  var x2 = pt2.pageX - pt0.pageX,
      y2 = pt2.pageY - pt0.pageY;
  return x2 * diff1.pageY - diff1.pageX * y2;
}

function pointInConvexPolygon(pt, poly) {
  // Implements top google hit algorithm for
  // ["An efficient test for a point to be in a convex polygon"]
  if (poly.length <= 0) { return false; }
  if (poly.length == 1) {
    return poly[0].pageX == pt.pageX && poly[0].pageY == pt.pageY;
  }
  var a0 = signedTriangleArea(pt, poly[poly.length - 1], poly[0]);
  if (a0 === 0) { return true; }
  var positive = (a0 > 0);
  if (poly.length == 2) { return false; }
  for (var j = 1; j < poly.length; ++j) {
    var aj = signedTriangleArea(pt, poly[j - 1], poly[j]);
    if (aj === 0) { return true; }
    if ((aj > 0) != positive) { return false; }
  }
  return true;
}

function diff(v1, v0) {
  return { pageX: v1.pageX - v0.pageX, pageY: v1.pageY - v0.pageY };
}

// Given an edge [p0, p1] of polygon P, and the expected sign of [p0, p1, p]
// for p inside P, then determine if all points in the other poly have the
// opposite sign.
function edgeSeparatesPointAndPoly(inside, p0, p1, poly) {
  var d1 = diff(p1, p0), j, s;
  for (j = 0; j < poly.length; ++j) {
    s = sign(signedDeltaTriangleArea(p0, d1, poly[j]));
    if (!s || s === inside) { return false; }
  }
  return true;
}

function sign(n) {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}

function convexPolygonSign(poly) {
  if (poly.length <= 2) { return 0; }
  var a = signedTriangleArea(poly[poly.length - 1], poly[0], poly[1]);
  if (a !== 0) { return sign(a); }
  for (var j = 1; j < poly.length; ++j) {
    a = signedTriangleArea(poly[j - 1], poly[j], poly[(j + 1) % poly.length]);
    if (a !== 0) { return sign(a); }
  }
  return 0;
}

function doConvexPolygonsOverlap(poly1, poly2) {
  // Implements top google hit for
  // ["polygon collision" gpwiki]
  var sign = convexPolygonSign(poly1), j;
  for (j = 0; j < poly1.length; ++j) {
    if (edgeSeparatesPointAndPoly(
        sign, poly1[j], poly1[(j + 1) % poly1.length], poly2)) {
      return false;
    }
  }
  sign = convexPolygonSign(poly2);
  for (j = 0; j < poly2.length; ++j) {
    if (edgeSeparatesPointAndPoly(
        sign, poly2[j], poly2[(j + 1) % poly2.length], poly1)) {
      return false;
    }
  }
  return true;
}

function doesConvexPolygonContain(polyOuter, polyInner) {
  // Just verify all vertices of polyInner are inside.
  for (var j = 0; j < polyInner.length; ++j) {
    if (!pointInConvexPolygon(polyInner[j], polyOuter)) {
      return false;
    }
  }
  return true;
}

// Google search for [Graham Scan Tom Switzer].
function convexHull(points) {
  function keepLeft(hull, r) {
    if (!r || !isPageCoordinate(r)) { return hull; }
    while (hull.length > 1 && sign(signedTriangleArea(hull[hull.length - 2],
        hull[hull.length - 1], r)) != 1) { hull.pop(); }
    if (!hull.length || !equalPoint(hull[hull.length - 1], r)) { hull.push(r); }
    return hull;
  }
  function reduce(arr, valueInitial, fnReduce) {
    for (var j = 0; j < arr.length; ++j) {
      valueInitial = fnReduce(valueInitial, arr[j]);
    }
    return valueInitial;
  }
  function equalPoint(p, q) {
    return p.pageX === q.pageX && p.pageY === q.pageY;
  }
  function lexicalPointOrder(p, q) {
    return p.pageX < q.pageX ? -1 : p.pageX > q.pageX ? 1 :
           p.pageY < q.pageY ? -1 : p.pageY > q.pageY ? 1 : 0;
  }
  points.sort(lexicalPointOrder);
  var leftdown = reduce(points, [], keepLeft),
      rightup = reduce(points.reverse(), [], keepLeft);
  return leftdown.concat(rightup.slice(1, -1));
}

function parseTurtleHull(text) {
  if (!text) return null;
  var nums = $.map(text.trim().split(/\s+/), parseFloat), points = [], j = 0;
  while (j + 1 < nums.length) {
    points.push({ pageX: nums[j], pageY: nums[j + 1] });
    j += 2;
  }
  return points;
}

function readTurtleHull(elem) {
  return getTurtleData(elem).hull;
}

function writeTurtleHull(hull) {
  for (var j = 0, result = []; j < hull.length; ++j) {
    result.push(hull[j].pageX, hull[j].pageY);
  }
  return result.length ? $.map(result, cssNum).join(' ') : 'none';
}

function makeHullHook() {
  return {
    get: function(elem, computed, extra) {
      var hull = getTurtleData(elem).hull;
      return writeTurtleHull(hull ||
          getCornersInPageCoordinates(elem, true));
    },
    set: function(elem, value) {
      var hull =
        !value || value == 'auto' ? null :
        value == 'none' ? [] :
        convexHull(parseTurtleHull(value));
      getTurtleData(elem).hull = hull;
    }
  };
}

//////////////////////////////////////////////////////////////////////////
// TURTLE CSS CONVENTIONS
// For better performance, the turtle library always writes transform
// CSS in a canonical form; and it reads this form faster than generic
// matrices.
//////////////////////////////////////////////////////////////////////////

// The canonical 2D transforms written by this plugin have the form:
// translate(tx, ty) rotate(rot) scale(sx, sy) rotate(twi)
// (with each component optional).
// This function quickly parses this form into a canonicalized object.
function parseTurtleTransform(transform) {
  if (transform === 'none') {
    return {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, twi: 0};
  }
  // Note that although the CSS spec doesn't allow 'e' in numbers, IE10
  // and FF put them in there; so allow them.
  var e = /^(?:translate\(([\-+.\de]+)(?:px)?,\s*([\-+.\de]+)(?:px)?\)\s*)?(?:rotate\(([\-+.\de]+)(?:deg)?\)\s*)?(?:scale\(([\-+.\de]+)(?:,\s*([\-+.\de]+))?\)\s*)?(?:rotate\(([\-+.\de]+)(?:deg)?\)\s*)?$/.exec(transform);
  if (!e) { return null; }
  var tx = e[1] ? parseFloat(e[1]) : 0,
      ty = e[2] ? parseFloat(e[2]) : 0,
      rot = e[3] ? parseFloat(e[3]) : 0,
      sx = e[4] ? parseFloat(e[4]) : 1,
      sy = e[5] ? parseFloat(e[5]) : sx,
      twi = e[6] ? parseFloat(e[6]) : 0;
  return {tx:tx, ty:ty, rot:rot, sx:sx, sy:sy, twi:twi};
}

function computeTurtleTransform(elem) {
  var m = readTransformMatrix(elem), d;
  if (!m) {
    return {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, twi: 0};
  }
  d = decomposeSVD(m);
  return {
    tx: m[4], ty: m[5], rot: radiansToDegrees(d[0]),
    sx: d[1], sy: d[2], twi: radiansToDegrees(d[3])
  };
}

function readTurtleTransform(elem, computed) {
  return parseTurtleTransform(elem.style[transform]) ||
      (computed && computeTurtleTransform(elem));
}

function cssNum(n) {
  var r = n.toString();
  if (r.indexOf('e') >= 0) {
    r = Number(n).toFixed(17);
  }
  return r;
}

function writeTurtleTransform(ts) {
  var result = [];
  if (nonzero(ts.tx) || nonzero(ts.ty)) {
    result.push(
      'translate(' + cssNum(ts.tx) + 'px, ' + cssNum(ts.ty) + 'px)');
  }
  if (nonzero(ts.rot) || nonzero(ts.twi)) {
    result.push('rotate(' + cssNum(ts.rot) + 'deg)');
  }
  if (nonzero(1 - ts.sx) || nonzero(1 - ts.sy)) {
    if (nonzero(ts.sx - ts.sy)) {
      result.push('scale(' + cssNum(ts.sx) + ', ' + cssNum(ts.sy) + ')');
    } else {
      result.push('scale(' + cssNum(ts.sx) + ')');
    }
  }
  if (nonzero(ts.twi)) {
    result.push('rotate(' + cssNum(ts.twi) + 'deg)');
  }
  if (!result.length) {
    return 'none';
  }
  return result.join(' ');
}

function radiansToDegrees(r) {
  d = r * 180 / Math.PI;
  if (d > 180) { d -= 360; }
  return d;
}

function convertToRadians(d) {
  return d * Math.PI / 180;
}

function normalizeRotation(x) {
  if (Math.abs(x) > 180) {
    x = x % 360;
    if (x > 180) { x -= 360; }
    else if (x <= -180) { x += 360; }
  }
  return x;
}

function normalizeRotationDelta(x) {
  if (Math.abs(x) >= 720) {
    x = x % 360 + (x > 0 ? 360 : -360);
  }
  return x;
}

//////////////////////////////////////////////////////////////////////////
// TURTLE DRAWING SUPPORT
// If pen, fill, or dot are used, then a full-page canvas is created
// and used for drawing.
//////////////////////////////////////////////////////////////////////////

// drawing state.
var drawing = {
  attached: false,
  surface: null,
  ctx: null,
  canvas: null,
  timer: null,
  subpixel: 1
};

function getTurtleClipSurface() {
  if (drawing.surface) {
    return drawing.surface;
  }
  var surface = document.createElement('samp');
  $(surface)
    .attr('id', '_turtlefield')
    .css({
      position: 'absolute',
      display: 'inline-block',
      top: 0, left: 0, width: '100%', height: '100%',
      zIndex: -1,
      font: 'inherit',
      // Setting transform origin for the turtle field
      // fixes a "center" point in page coordinates that
      // will not change even if the document resizes.
      transformOrigin: Math.floor(ww() / 2) + "px " +
                       Math.floor(wh() / 2) + "px",
      overflow: 'hidden'
    });
  drawing.surface = surface;
  attachClipSurface();
  return surface;
}

function attachClipSurface() {
  if (document.body) {
    $(drawing.surface).prependTo('body');
    // Attach an event handler to forward mouse events from the body
    // to turtles in the turtle field layer.
    $('body').on('click.turtle ' +
      'mouseup.turtle mousedown.turtle mousemove.turtle', function(e) {
      if (e.target === this && !e.isTrigger) {
        // Only forward events directly on the body that (geometrically)
        // touch a turtle directly within the turtlefield.
        var warn = $.turtle.nowarn;
        $.turtle.nowarn = true;
        var sel = $('#_turtlefield > .turtle').within('touch', e).eq(0);
        $.turtle.nowarn = warn;
        if (sel.length === 1) {
          // Erase portions of the event that are wrong for the turtle.
          e.target = null;
          e.relatedTarget = null;
          e.fromElement = null;
          e.toElement = null;
          sel.trigger(e);
          return false;
        }
      }
    });
  } else {
    $(document).ready(attachClipSurface);
  }
}

function getTurtleDrawingCtx() {
  if (drawing.ctx) {
    return drawing.ctx;
  }
  var surface = getTurtleClipSurface();
  drawing.canvas = document.createElement('canvas');
  $(drawing.canvas).css({'z-index': -1});
  surface.insertBefore(drawing.canvas, surface.firstChild);
  drawing.ctx = drawing.canvas.getContext('2d');
  resizecanvas();
  pollbodysize(resizecanvas);
  $(window).resize(resizecanvas);
  drawing.ctx.scale(drawing.subpixel, drawing.subpixel);
  return drawing.ctx;
}

function getOffscreenCanvas(width, height) {
  if (drawing.offscreen &&
      drawing.offscreen.width === width &&
      drawing.offscreen.height === height) {
    return drawing.offscreen;
  }
  if (!drawing.offscreen) {
    drawing.offscreen = document.createElement('canvas');
  }
  drawing.offscreen.width = width;
  drawing.offscreen.height = height;
  return drawing.offscreen;
}

function pollbodysize(callback) {
  var b = $('body');
  var lastwidth = b.width();
  var lastheight = b.height();
  var poller = (function() {
    if (b.width() != lastwidth || b.height() != lastheight) {
      callback();
      lastwidth = b.width();
      lastheight = b.height();
    }
  });
  if (drawing.timer) {
    clearInterval(drawing.timer);
  }
  drawing.timer = setInterval(poller, 250);
}

function resizecanvas() {
  if (!drawing.canvas) return;
  var b = $('body'),
      wh = Math.max(b.outerHeight(true),
          window.innerHeight || $(window).height()),
      bw = Math.max(200, Math.ceil(b.outerWidth(true) / 100) * 100),
      bh = Math.max(200, Math.ceil(wh / 100) * 100),
      cw = drawing.canvas.width,
      ch = drawing.canvas.height,
      tc;
  $(drawing.surface).css({ width: b.outerWidth(true) + 'px',
      height: wh + 'px'});
  if (cw != bw * drawing.subpixel || ch != bh * drawing.subpixel) {
    // Transfer canvas out to tc and back again after resize.
    tc = document.createElement('canvas');
    tc.width = Math.min(cw, bw * drawing.subpixel);
    tc.height = Math.min(ch, bh * drawing.subpixel);
    tc.getContext('2d').drawImage(drawing.canvas, 0, 0);
    drawing.canvas.width = bw * drawing.subpixel;
    drawing.canvas.height = bh * drawing.subpixel;
    drawing.canvas.getContext('2d').drawImage(tc, 0, 0);
    $(drawing.canvas).css({ width: bw, height: bh });
  }
}

// turtlePenStyle style syntax
function parsePenStyle(text, defaultProp) {
  if (!text) { return null; }
  if (text.trim) { text = text.trim(); }
  if (!text || text === 'none') { return null; }
  if (text === 'path' || text === 'fill') {
    return { savePath: true };
  }
  var eraseMode = false;
  if (/^erase\b/.test(text)) {
    text = text.replace(
        /^erase\b/, 'white globalCompositeOperation destination-out');
    eraseMode = true;
  }
  var words = text.split(/\s+/),
      mapping = {
        strokeStyle: identity,
        lineWidth: parseFloat,
        lineCap: identity,
        lineJoin: identity,
        miterLimit: parseFloat,
        fillStyle: identity,
        globalCompositeOperation: identity
      },
      result = {}, j, end = words.length;
  if (eraseMode) { result.eraseMode = true; }
  for (j = words.length - 1; j >= 0; --j) {
    if (mapping.hasOwnProperty(words[j])) {
      var key = words[j],
          param = words.slice(j + 1, end).join(' ');
      result[key] = mapping[key](param);
      end = j;
    }
  }
  if (end > 0 && !result[defaultProp]) {
    result[defaultProp] = words.slice(0, end).join(' ');
  }
  return result;
}

function writePenStyle(style) {
  if (!style) { return 'none'; }
  var result = [];
  $.each(style, function(k, v) {
    result.push(k);
    result.push(v);
  });
  return result.join(' ');
}

function parsePenDown(style) {
  if (style == 'down' || style === true) return true;
  if (style == 'up' || style === false) return false;
  return undefined;
}

function writePenDown(bool) {
  return bool ? 'down' : 'up';
}

function getTurtleData(elem) {
  var state = $.data(elem, 'turtleData');
  if (!state) {
    state = $.data(elem, 'turtleData', {
      style: null,
      path: [[]],
      down: true,
      speed: 'turtle',
      turningRadius: 0,
      // Below: support for image loading without messing up origin.
      lastSeenOrigin: null,
      lastSeenOriginTime: null,
      lastSeenOriginTimer: null,
      lastSeenOriginEvent: null
    });
  }
  return state;
}

function getTurningRadius(elem) {
  var state = $.data(elem, 'turtleData');
  if (!state) { return 0; }
  return state.turningRadius;
}

function makeTurningRadiusHook() {
  return {
    get: function(elem, computed, extra) {
      return cssNum(getTurningRadius(elem)) + 'px';
    },
    set: function(elem, value) {
      var radius = parseFloat(value);
      if (isNaN(radius)) return;
      getTurtleData(elem).turningRadius = radius;
      elem.style.turtleTurningRadius = '' + cssNum(radius) + 'px';
      if (radius === 0) {
        // When radius goes to zero, renormalize rotation to
        // between 180 and -180.  (We avoid normalizing rotation
        // when there is a visible turning radius so we can tell
        // the difference between +361 and +1 and -359 arcs,
        // which are all different.)
        var ts = readTurtleTransform(elem, false);
        if (ts && (ts.rot > 180 || ts.rot <= -180)) {
          ts.rot = normalizeRotation(ts.rot);
          elem.style[transform] = writeTurtleTransform(ts);
        }
      }
    }
  };
}

function makePenStyleHook() {
  return {
    get: function(elem, computed, extra) {
      return writePenStyle(getTurtleData(elem).style);
    },
    set: function(elem, value) {
      var style = parsePenStyle(value, 'strokeStyle');
      getTurtleData(elem).style = style;
      elem.style.turtlePenStyle = writePenStyle(style);
      flushPenState(elem);
    }
  };
}

function makePenDownHook() {
  return {
    get: function(elem, computed, extra) {
      return writePenDown(getTurtleData(elem).down);
    },
    set: function(elem, value) {
      var style = parsePenDown(value);
      if (style === undefined) return;
      getTurtleData(elem).down = style;
      elem.style.turtlePenDown = writePenDown(style);
      flushPenState(elem);
    }
  };
}

function isPointNearby(a, b) {
  return Math.round(a.pageX - b.pageX) === 0 &&
         Math.round(a.pageY - b.pageY) === 0;
}

function isBezierTiny(a, b) {
  return isPointNearby(a, b) &&
         Math.round(a.pageX - b.pageX1) === 0 &&
         Math.round(a.pageY - b.pageY1) === 0 &&
         Math.round(b.pageX2 - b.pageX) === 0 &&
         Math.round(b.pageY2 - b.pageY) === 0;
}

function applyPenStyle(ctx, ps, scale) {
  scale = scale || 1;
  var extraWidth = ps.eraseMode ? 1 : 0;
  if (!ps || !('strokeStyle' in ps)) { ctx.strokeStyle = 'black'; }
  if (!ps || !('lineWidth' in ps)) { ctx.lineWidth = 1.62 * scale + extraWidth; }
  if (!ps || !('lineCap' in ps)) { ctx.lineCap = 'round'; }
  if (ps) {
    for (var a in ps) {
      if (a === 'savePath' || a === 'eraseMode') { continue; }
      if (scale && a === 'lineWidth') {
        ctx[a] = scale * ps[a] + extraWidth;
      } else {
        ctx[a] = ps[a];
      }
    }
  }
}

function drawAndClearPath(path, style, scale) {
  var ctx = getTurtleDrawingCtx(),
      isClosed, skipLast,
      j = path.length,
      segment;
  ctx.save();
  ctx.beginPath();
  // Scale up lineWidth by sx.  (TODO: consider parent transforms.)
  applyPenStyle(ctx, style, scale);
  while (j--) {
    if (path[j].length) {
      segment = path[j];
      isClosed = segment.length > 2 && isPointNearby(
          segment[0], segment[segment.length - 1]);
      skipLast = isClosed && (!('pageX2' in segment[segment.length - 1]));
      ctx.moveTo(segment[0].pageX, segment[0].pageY);
      for (var k = 1; k < segment.length - (skipLast ? 1 : 0); ++k) {
        if ('pageX2' in segment[k] &&
            !isBezierTiny(segment[k - 1], segment[k])) {
          ctx.bezierCurveTo(
             segment[k].pageX1, segment[k].pageY1,
             segment[k].pageX2, segment[k].pageY2,
             segment[k].pageX, segment[k].pageY);
        } else {
          ctx.lineTo(segment[k].pageX, segment[k].pageY);
        }
      }
      if (isClosed) { ctx.closePath(); }
    }
  }
  if ('fillStyle' in style) { ctx.fill(); }
  if ('strokeStyle' in style) { ctx.stroke(); }
  ctx.restore();
  path.length = 1;
  path[0].splice(0, path[0].length - 1);
}

function addBezierToPath(path, start, triples) {
  if (!path.length || !isPointNearby(start, path[path.length - 1])) {
    path.push(start);
  }
  for (var j = 0; j < triples.length; ++j) {
    path.push({
        pageX1: triples[j][0].pageX, pageY1: triples[j][0].pageY,
        pageX2: triples[j][1].pageX, pageY2: triples[j][1].pageY,
        pageX: triples[j][2].pageX, pageY: triples[j][2].pageY });
  }
}

function flushPenState(elem) {
  var state = getTurtleData(elem);
  if (!state.style || (!state.down && !state.style.savePath)) {
    if (state.path.length > 1) { state.path.length = 1; }
    if (state.path[0].length) { state.path[0].length = 0; }
    return;
  }
  if (!state.down) {
    // Penup when saving path will start a new segment if one isn't started.
    if (state.path.length && state.path[0].length) {
      state.path.shift([]);
    }
    return;
  }
  if (state.lastSeenOrigin) { fixOriginIfWatching(elem); }
  var center = getCenterInPageCoordinates(elem);
  // Once the pen is down, the origin needs to be stable when the image
  // loads.
  watchImageToFixOriginOnLoad(elem);
  if (!state.path[0].length ||
      !isPointNearby(center, state.path[0][state.path[0].length - 1])) {
    state.path[0].push(center);
  }
  if (!state.style.savePath) {
    var ts = readTurtleTransform(elem, true);
    drawAndClearPath(state.path, state.style, ts.sx);
  }
}

function endAndFillPenPath(elem, style) {
  var ts = readTurtleTransform(elem, true),
      state = getTurtleData(elem);
  drawAndClearPath(state.path, style);
  if (state.style && state.style.savePath) {
    $.style(elem, 'turtlePenStyle', 'none');
  }
}

function fillDot(position, diameter, style) {
  var ctx = getTurtleDrawingCtx();
  ctx.save();
  applyPenStyle(ctx, style);
  ctx.beginPath();
  ctx.arc(position.pageX, position.pageY, diameter / 2, 0, 2*Math.PI, false);
  ctx.closePath();
  ctx.fill();
  if (style.strokeStyle) {
    ctx.stroke();
  }
  ctx.restore();
}

function clearField(arg) {
  if (!arg || /\bcanvas\b/.test(arg)) {
    eraseBox(document, {fillStyle: 'transparent'});
  }
  if (!arg || /\bturtles\b/.test(arg)) {
    var sel = $('#_turtlefield .turtle');
    if (global_turtle) {
      sel = sel.not(global_turtle);
    }
    sel.remove();
  }
  if (!arg || /\btext\b/.test(arg)) {
    $('body').contents().not('samp#_testpanel,samp#_turtlefield').remove();
  }
}

function eraseBox(elem, style) {
  var c = getCornersInPageCoordinates(elem),
      ctx = getTurtleDrawingCtx(),
      j = 1;
  if (!c || c.length < 3) { return; }
  ctx.save();
  // Clip to box and use 'copy' mode so that 'transparent' can be
  // written into the canvas - that's better erasing than 'white'.
  ctx.globalCompositeOperation = 'copy';
  applyPenStyle(ctx, style);
  ctx.beginPath();
  ctx.moveTo(c[0].pageX, c[0].pageY);
  for (; j < c.length; j += 1) {
    ctx.lineTo(c[j].pageX, c[j].pageY);
  }
  ctx.closePath();
  ctx.clip();
  ctx.fill();
  ctx.restore();
}

function getBoundingBoxOfCorners(c, clipToDoc) {
  if (!c || c.length < 1) return null;
  var j = 1, result = {
    left: Math.floor(c[0].pageX),
    top: Math.floor(c[0].pageY),
    right: Math.ceil(c[0].pageX),
    bottom: Math.ceil(c[0].pageY)
  };
  for (; j < c.length; ++j) {
    result.left = Math.min(result.left, Math.floor(c[j].pageX));
    result.top = Math.min(result.top, Math.floor(c[j].pageY));
    result.right = Math.max(result.right, Math.ceil(c[j].pageX));
    result.bottom = Math.max(result.bottom, Math.ceil(c[j].pageY));
  }
  if (clipToDoc) {
    result.left = Math.max(0, result.left);
    result.top = Math.max(0, result.top);
    result.right = Math.min(dw(), result.right);
    result.bottom = Math.min(dh(), result.bottom);
  }
  return result;
}

function touchesPixel(elem, color) {
  if (!elem || !drawing.canvas) { return false; }
  var c = getCornersInPageCoordinates(elem),
      canvas = drawing.canvas,
      bb = getBoundingBoxOfCorners(c, true),
      w = bb.right - bb.left,
      h = bb.bottom - bb.top,
      osc = getOffscreenCanvas(w, h),
      octx = osc.getContext('2d'),
      rgba = rgbaForColor(color),
      j = 1, k, data;
  if (!c || c.length < 3 || !w || !h) { return false; }
  octx.clearRect(0, 0, w, h);
  octx.drawImage(canvas, bb.left, bb.top, w, h, 0, 0, w, h);
  octx.save();
  // Erase everything outside clipping region.
  octx.beginPath();
  octx.moveTo(0, 0);
  octx.lineTo(w, 0);
  octx.lineTo(w, h);
  octx.lineTo(0, h);
  octx.closePath();
  octx.moveTo(c[0].pageX - bb.left, c[0].pageY - bb.top);
  for (; j < c.length; j += 1) {
    octx.lineTo(c[j].pageX - bb.left, c[j].pageY - bb.top);
  }
  octx.closePath();
  octx.clip();
  octx.clearRect(0, 0, w, h);
  octx.restore();
  // Now examine the results and look for alpha > 0%.
  data = octx.getImageData(0, 0, w, h).data;
  if (!rgba) {
    for (j = 0; j < data.length; j += 4) {
      if (data[j + 3] > 0) return true;
    }
  } else {
    for (j = 0; j < data.length; j += 4) {
      // Look for a near-match in color: within a 7x7x7 cube in rgb space,
      // and at least 50% of the target alpha value.
      if (Math.abs(data[j + 0] - rgba[0]) <= 3 &&
          Math.abs(data[j + 1] - rgba[1]) <= 3 &&
          Math.abs(data[j + 2] - rgba[2]) <= 3 &&
          data[j + 3] <= rgba[3] * 2 && data[j + 3] >= rgba[3] / 2) {
        return true;
      }
    }
  }
  return false;
}

//////////////////////////////////////////////////////////////////////////
// JQUERY METHOD SUPPORT
// Functions in direct support of exported methods.
//////////////////////////////////////////////////////////////////////////

function applyImg(sel, img) {
  if (sel[0].tagName == 'IMG') {
    // Set the image to a 1x1 transparent GIF before next switching it
    // to the image of interest.
    sel[0].src = 'data:image/gif;base64,R0lGODlhAQABAIAAA' +
                 'AAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    sel.css({
      backgroundImage: 'none',
      height: 'auto',
      width: 'auto'
    });
    sel[0].src = img.url;
    sel.css(img.css);
  } else {
    var props = {
      backgroundImage: 'url(' + img.url + ')',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    };
    if (img.css.width && img.css.height) {
      props.backgroundSize = img.css.width + 'px ' + img.css.height + 'px';
    }
    sel.css(props);
  }
}

function doQuickMove(elem, distance, sideways) {
  var ts = readTurtleTransform(elem, true),
      r = ts && convertToRadians(ts.rot),
      scaledDistance = ts && (distance * ts.sy),
      scaledSideways = ts && ((sideways || 0) * ts.sy),
      dy = -Math.cos(r) * scaledDistance,
      dx = Math.sin(r) * scaledDistance;
  if (!ts) { return; }
  if (sideways) {
    dy += Math.sin(r) * scaledSideways;
    dx += Math.cos(r) * scaledSideways;
  }
  ts.tx += dx;
  ts.ty += dy;
  elem.style[transform] = writeTurtleTransform(ts);
  flushPenState(elem);
}

function displacedPosition(elem, distance, sideways) {
  var ts = readTurtleTransform(elem, true),
      r = ts && convertToRadians(ts.rot),
      scaledDistance = ts && (distance * ts.sy),
      scaledSideways = ts && ((sideways || 0) * ts.sy),
      dy = -Math.cos(r) * scaledDistance,
      dx = Math.sin(r) * scaledDistance;
  if (!ts) { return; }
  if (scaledSideways) {
    dy += Math.sin(r) * scaledSideways;
    dx += Math.cos(r) * scaledSideways;
  }
  return cssNum(ts.tx + dx) + ' ' + cssNum(ts.ty + dy);
}

function isPageCoordinate(obj) {
  return obj && $.isNumeric(obj.pageX) && $.isNumeric(obj.pageY);
}

function makeTurtleSpeedHook() {
  return {
    get: function(elem, computed, extra) {
      return getTurtleData(elem).speed;
    },
    set: function(elem, value) {
      if ((!$.isNumeric(value) || value <= 0) &&
          !(value in $.fx.speeds) && ('' + value != 'Infinity')) {
        return;
      }
      getTurtleData(elem).speed = '' + value;
    }
  }
}

function animTime(elem) {
  var state = $.data(elem, 'turtleData');
  if (!state) return 'turtle';
  if ($.isNumeric(state.speed) || state.speed == 'Infinity') {
    return 1000 / state.speed;
  }
  return state.speed;
}

function makeTurtleForwardHook() {
  return {
    get: function(elem, computed, extra) {
      // TODO: after reading turtleForward, we need to also
      // adjust it if ts.tx/ty change due to an origin change,
      // so that images don't stutter if they resize during an fd.
      // OR - offset by origin, so that changes in its value are
      // not a factor.
      var ts = readTurtleTransform(elem, computed),
          middle = readTransformOrigin(elem);
      if (ts) {
        var r = convertToRadians(ts.rot),
            c = Math.cos(r),
            s = Math.sin(r);
        return cssNum(((ts.tx + middle[0]) * s - (ts.ty + middle[1]) * c)
            / ts.sy) + 'px';
      }
    },
    set: function(elem, value) {
      var ts = readTurtleTransform(elem, true) ||
              {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, twi: 0},
          middle = readTransformOrigin(elem),
          v = parseFloat(value) * ts.sy,
          r = convertToRadians(ts.rot),
          c = Math.cos(r),
          s = Math.sin(r),
          p = (ts.tx + middle[0]) * c + (ts.ty + middle[1]) * s;
      ts.tx = p * c + v * s - middle[0];
      ts.ty = p * s - v * c - middle[1];
      elem.style[transform] = writeTurtleTransform(ts);
      flushPenState(elem);
    }
  };
}

// Finally, add turtle support.
function makeTurtleHook(prop, normalize, unit, displace) {
  return {
    get: function(elem, computed, extra) {
      if (displace) fixOriginIfWatching(elem);
      var ts = readTurtleTransform(elem, computed);
      if (ts) { return ts[prop] + unit; }
    },
    set: function(elem, value) {
      if (displace) fixOriginIfWatching(elem);
      var ts = readTurtleTransform(elem, true) ||
          {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, twi: 0},
          opt = { displace: displace };
      ts[prop] = normalize(value, elem, ts, opt);
      elem.style[transform] = writeTurtleTransform(ts);
      if (opt.displace) {
        flushPenState(elem);
      }
    }
  };
}

function maybeArcRotation(end, elem, ts, opt) {
  end = parseFloat(end);
  var state = $.data(elem, 'turtleData'),
      tradius = state ? state.turningRadius : 0;
  if (tradius === 0) {
    // Avoid drawing a line if zero turning radius.
    opt.displace = false;
    return normalizeRotation(end);
  }
  var tracing = (state && state.style && state.down),
      r0 = ts.rot, r1, r1r, a1r, a2r, j, r, pts, triples,
      r0r = convertToRadians(ts.rot),
      delta = normalizeRotationDelta(end - r0),
      radius = (delta > 0 ? tradius : -tradius) * ts.sy,
      dc = [Math.cos(r0r) * radius, Math.sin(r0r) * radius],
      splits, splita, absang,
      path, totalParentTransform, start, relative, points;
  if (tracing) {
    // Decompose an arc into equal arcs, all 45 degrees or less.
    splits = 1;
    splita = delta;
    absang = Math.abs(delta);
    if (absang > 45) {
      splits = Math.ceil(absang / 45);
      splita = delta / splits;
    }
    path = state.path[0];
    totalParentTransform = totalTransform2x2(elem.parentElement);
    // Relative traces out the unit-radius arc centered at the origin.
    relative = [];
    while (--splits >= 0) {
      r1 = splits === 0 ? end : r0 + splita;
      a1r = convertToRadians(r0 + 180);
      a2r = convertToRadians(r1 + 180);
      relative.push.apply(relative, approxBezierUnitArc(a1r, a2r));
      r0 = r1;
    }
    points = [];
    // start is the starting position in absolute coordinates,
    // and dc is the local coordinate offset from the starting
    // position to the center of the turning radius.
    start = getCenterInPageCoordinates(elem);
    for (j = 0; j < relative.length; j++) {
      // Multiply each coordinate by radius scale up to the right
      // turning radius and add to dc to center the turning radius
      // at the right local coordinate position; then apply parent
      // distortions to get page-coordinate relative offsets to the
      // turtle's original position.
      r = matrixVectorProduct(totalParentTransform,
          addVector(scaleVector(relative[j], radius), dc));
      // Finally add these to the turtle's actual original position
      // to get page-coordinate control points for the bezier curves.
      points.push({
        pageX: r[0] + start.pageX,
        pageY: r[1] + start.pageY});
    }
    // Divide control points into triples again to form bezier curves.
    triples = [];
    for (j = 0; j < points.length; j += 3) {
      triples.push(points.slice(j, j + 3));
    }
    addBezierToPath(path, start, triples);
  }
  // Now move turtle to its final position: in local coordinates,
  // translate to the turning center plus the vector to the arc end.
  r1r = convertToRadians(end);
  ts.tx += dc[0] - Math.cos(r1r) * radius;
  ts.ty += dc[1] - Math.sin(r1r) * radius;
  opt.displace = true;
  return end;
}

function makeRotationStep(prop) {
  return function(fx) {
    if (!fx.delta) {
      fx.delta = normalizeRotationDelta(fx.end - fx.start);
      fx.start = fx.end - fx.delta;
    }
    $.cssHooks[prop].set(fx.elem, fx.start + fx.delta * fx.pos);
  };
}

function splitPair(text, duplicate) {
  if (text.length && text[0] === '_') {
    // Hack: remove forced number non-conversion.
    text = text.substring(1);
  }
  var result = $.map(('' + text).split(/\s+/), parseFloat);
  while (result.length < 2) {
    result.push(duplicate ?
        (!result.length ? 1 : result[result.length - 1]) : 0);
  }
  return result;
}

function makePairStep(prop, displace) {
  return function(fx) {
    if (!fx.delta) {
      var end = splitPair(fx.end, !displace);
      fx.start = splitPair(fx.start, !displace);
      fx.delta = [end[0] - fx.start[0], end[1] - fx.start[1]];
    }
    $.cssHooks[prop].set(fx.elem, [fx.start[0] + fx.delta[0] * fx.pos,
        fx.start[1] + fx.delta[1] * fx.pos].join(' '));
  };
}

var XY = ['X', 'Y'];
function makeTurtleXYHook(publicname, propx, propy, displace) {
  return {
    get: function(elem, computed, extra) {
      fixOriginIfWatching(elem);
      var ts = readTurtleTransform(elem, computed);
      if (ts) {
        if (displace || ts[propx] != ts[propy]) {
          // Hack: if asked to convert a pair to a number by fx, then refuse.
          return (extra === '' ? '_' : '') + ts[propx] + ' ' + ts[propy];
        } else {
          return '' + ts[propx];
        }
      }
    },
    set: function(elem, value, extra) {
      fixOriginIfWatching(elem);
      var ts = readTurtleTransform(elem, true) ||
              {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, twi: 0};
      var parts = (typeof(value) == 'string' ? value.split(/\s+/) : [value]);
      if (parts.length < 1 || parts.length > 2) { return; }
      if (parts.length >= 1) { ts[propx] = parts[0]; }
      if (parts.length >= 2) { ts[propy] = parts[1]; }
      else if (!displace) { ts[propy] = ts[propx]; }
      else { ts[propy] = 0; }
      elem.style[transform] = writeTurtleTransform(ts);
      if (displace) {
        flushPenState(elem);
      }
    }
  };
}

function fixOriginIfWatching(elem) {
  // A function to reposition an image turtle each time its origin
  // changes from the last seen origin, to keep the origin in the
  // same location on the page.
  var state = $.data(elem, 'turtleData');
  if (state && state.lastSeenOrigin) {
    var oldOrigin = state.lastSeenOrigin,
        newOrigin = readTransformOrigin(elem),
        now = $.now();
    if (state.lastSeenOriginEvent && elem.complete) {
      $.event.remove(elem, 'load.turtle', state.lastSeenOriginEvent);
      state.lastSeenOriginEvent = null;
      state.lastSeenOriginTime = now;
    }
    if (newOrigin[0] != oldOrigin[0] || newOrigin[1] != oldOrigin[1]) {
      var ts = readTurtleTransform(elem, true);
      ts.tx += oldOrigin[0] - newOrigin[0];
      ts.ty += oldOrigin[1] - newOrigin[1];
      state.lastSeenOrigin = newOrigin;
      state.lastSeenOriginTime = now;
      elem.style[transform] = writeTurtleTransform(ts);
    } else if (elem.tagName == 'IMG' && !elem.complete) {
      state.lastSeenOriginTime = now;
      if (!state.lastSeenOriginEvent) {
        state.lastSeenOriginEvent = (function() { fixOriginIfWatching(elem); });
        $.event.add(elem, 'load.turtle', state.lastSeenOriginEvent);
      }
    } else if (!state.lastSeenOriginEvent &&
        now - state.lastSeenOriginTime > 1000) {
      // Watch for an additional second after anything interesting;
      // then clear the watcher.
      clearInterval(state.lastSeenOriginTimer);
      state.lastSeenOriginTimer = null;
      state.lastSeenOriginTime = null;
      state.lastSeenOrigin = null;
    }
  }
}

function queueWaitForImageLoad(sel) {
  if (sel[0] && sel[0].tagName == 'IMG' && !sel[0].complete &&
      ((!sel[0].style.width && !sel[0].getAttribute('width'))
       || (!sel[0].style.height && !sel[0].getAttribute('height')))) {
    sel.queue(function() {
      var interval = null;
      function checkIfLoaded() {
        if (sel[0].complete) {
          clearInterval(interval);
          // fixOriginIfWatching(sel[0]);
          sel.dequeue();
        }
      }
      interval = setInterval(checkIfLoaded, 100);
    });
  }
}

function watchImageToFixOriginOnLoad(elem, force) {
  if (!elem || elem.tagName !== 'IMG' ||
      (!force && elem.complete) ||
      $(elem).css('position') != 'absolute') {
    return;
  }
  var state = getTurtleData(elem),
      now = $.now();
  if (state.lastSeenOrigin) {
    // Already tracking: let it continue.
    fixOriginIfWatching(elem);
    return;
  }
  state.lastSeenOrigin = readTransformOrigin(elem);
  state.lastSeenOriginTimer = setInterval(function() {
    fixOriginIfWatching(elem);
  }, 200);
  state.lastSeenOriginTime = $.now();
  fixOriginIfWatching(elem);
}


function withinOrNot(obj, within, distance, x, y) {
  var sel, elem, gbcr, pos, d2;
  if (x === undefined && y === undefined) {
    sel = $(distance);
    if (!sel.length) { return []; }
    elem = sel[0];
    gbcr = getPageGbcr(elem);
    if (polyMatchesGbcr(getCornersInPageCoordinates(elem), gbcr)) {
      return obj.filter(function() {
        var thisgbcr = getPageGbcr(this);
        return within === (gbcrEncloses(gbcr, thisgbcr) ||
            (!isDisjointGbcr(gbcr, thisgbcr) && $(this).enclosedby(elem)));
      });
    } else {
      return obj.filter(function() {
        return within === $(this).enclosedby(elem);
      });
    }
  }
  if ($.isNumeric(x) && $.isNumeric(y)) {
    pos = [x, y];
  } else {
    pos = x;
  }
  if ($.isArray(pos)) {
    // [x, y]: local coordinates.
    pos = convertLocalXyToPageCoordinates(obj[0] || document.body, [pos])[0];
  }
  if (distance === 'touch') {
    if (isPageCoordinate(pos)) {
      return obj.filter(function() {
        return within === $(this).touches(pos);
      });
    } else {
      sel = $(pos);
      gbcr = getPageGbcr(sel[0]);
      if (polyMatchesGbcr(getCornersInPageCoordinates(sel[0]), gbcr)) {
        return obj.filter(function() {
          var thisgbcr = getPageGbcr(this);
          // !isDisjoint test assumes gbcr is tight.
          return within === (!isDisjointGbcr(gbcr, thisgbcr) &&
            (gbcrEncloses(gbcr, thisgbcr) || sel.touches(this)));
        });
      } else {
        return obj.filter(function() {
          return within === sel.touches(this);
        });
      }
    }
  }
  d2 = distance * distance;
  return obj.filter(function() {
    var gbcr = getPageGbcr(this);
    if (isGbcrOutside(pos, distance, d2, gbcr)) { return !within; }
    if (isGbcrInside(pos, d2, gbcr)) { return within; }
    fixOriginIfWatching(this);
    var thispos = getCenterInPageCoordinates(this),
        dx = pos.pageX - thispos.pageX,
        dy = pos.pageY - thispos.pageY;
    return within === (dx * dx + dy * dy <= d2);
  });
}

//////////////////////////////////////////////////////////////////////////
// JQUERY REGISTRATION
// Register all our hooks.
//////////////////////////////////////////////////////////////////////////

$.extend(true, $, {
  cssHooks: {
    turtlePenStyle: makePenStyleHook(),
    turtlePenDown: makePenDownHook(),
    turtleSpeed: makeTurtleSpeedHook(),
    turtleForward: makeTurtleForwardHook(),
    turtleTurningRadius: makeTurningRadiusHook(),
    turtlePosition: makeTurtleXYHook('turtlePosition', 'tx', 'ty', true),
    turtlePositionX: makeTurtleHook('tx', identity, 'px', true),
    turtlePositionY: makeTurtleHook('ty', identity, 'px', true),
    turtleRotation: makeTurtleHook('rot', maybeArcRotation, 'deg', true),
    turtleScale: makeTurtleXYHook('turtleScale', 'sx', 'sy', false),
    turtleScaleX: makeTurtleHook('sx', identity, '', false),
    turtleScaleY: makeTurtleHook('sy', identity, '', false),
    turtleTwist: makeTurtleHook('twi', normalizeRotation, 'deg', false),
    turtleHull: makeHullHook()
  },
  cssNumber: {
    turtleRotation: true,
    turtleSpeed: true,
    turtleScale: true,
    turtleScaleX: true,
    turtleScaleY: true,
    turtleTwist: true
  },
  support: {
    turtle: true
  }
});
$.extend(true, $.fx, {
  step: {
    turtlePosition: makePairStep('turtlePosition', true),
    turtleRotation: makeRotationStep('turtleRotation'),
    turtleScale: makePairStep('turtlePosition', false),
    turtleTwist: makeRotationStep('turtleTwist')
  },
  speeds: {
    turtle: 0
  }
});

function wraphelp(text, fn) {
  fn.helptext = text;
  return fn;
}

function helpwrite(text) {
  see.html('<aside style="line-height:133%;word-break:normal;' +
           'white-space:normal">' + text + '</aside>');
}
function globalhelp(obj) {
  var helptable = $.extend({}, dollar_turtle_methods, turtlefn, extrahelp),
      helplist, j;
  if (obj && (!$.isArray(obj.helptext))) {
    if (obj in helptable) {
      obj = helptable[obj];
    }
  }
  if (obj && $.isArray(obj.helptext) && obj.helptext.length) {
    for (j = 0; j < obj.helptext.length; ++j) {
      var text = obj.helptext[j];
      helpwrite(text.replace(/<(u)>/g,
          '<$1 style="border:1px solid black;text-decoration:none;' +
          'word-break:keep-all;white-space:nowrap">').replace(/<(mark)>/g,
          '<$1 style="border:1px solid blue;color:blue;text-decoration:none;' +
          'word-break:keep-all;white-space:nowrap;cursor:pointer;" ' +
          'onclick="see.enter($(this).text())">'));
    }
    return helpok;
  }
  helplist = [];
  for (var name in helptable) {
    if (helptable[name].helptext && helptable[name].helptext.length &&
        (!(name in window) || typeof(window[name]) == 'function')) {
      helplist.push(name);
    }
  }
  helplist.sort();
  helpwrite("help available for: " + helplist.map(function(x) {
     return '<mark style="border:1px solid blue;color:blue;text-decoration:none;' +
       'word-break:keep-all;white-space:nowrap;cursor:pointer;" ' +
       'onclick="see.enter($(this).text())">' + x + '</mark>';
  }).join(" "));
  return helpok;
}
globalhelp.helptext = [];

var turtlefn = {
  rt: wraphelp(
  ["<u>rt(degrees)</u> Right turn. Pivots clockwise by some degrees: " +
      "<mark>rt 90</mark>",
   "<u>rt(degrees, radius)</u> Right arc. Pivots with a turning radius: " +
      "<mark>rt 90, 50</mark>"],
  function rt(degrees, radius) {
    if (!radius) {
      return this.direct(function(j, elem) {
        this.animate({turtleRotation: '+=' + cssNum(degrees || 0) + 'deg'},
            animTime(elem));
      });
    } else {
      return this.direct(function(j, elem) {
        var oldRadius = this.css('turtleTurningRadius');
        this.css({turtleTurningRadius: (degrees < 0) ? -radius : radius});
        this.animate({turtleRotation: '+=' + cssNum(degrees) + 'deg'},
            animTime(elem));
        this.direct(function() {
          this.css({turtleTurningRadius: oldRadius});
        });
      });
    }
  }),
  lt: wraphelp(
  ["<u>lt(degrees)</u> Left turn. Pivots counterclockwise by some degrees: " +
      "<mark>lt 90</mark>",
   "<u>lt(degrees, radius)</u> Left arc. Pivots with a turning radius: " +
      "<mark>lt 90, 50</mark>"],
  function lt(degrees, radius) {
    if (!radius) {
      return this.direct(function(j, elem) {
        this.animate({turtleRotation: '-=' + cssNum(degrees || 0) + 'deg'},
            animTime(elem));
      });
    } else {
      return this.direct(function(j, elem) {
        var oldRadius = this.css('turtleTurningRadius');
        this.css({turtleTurningRadius: (degrees < 0) ? -radius : radius});
        this.animate({turtleRotation: '-=' + cssNum(degrees) + 'deg'},
            animTime(elem));
        this.direct(function() {
          this.css({turtleTurningRadius: oldRadius});
        });
      });
    }
  }),
  fd: wraphelp(
  ["<u>fd(pixels)</u> Forward. Moves ahead by some pixels: " +
      "<mark>fd 100</mark>"],
  function fd(amount) {
    var elem, q, doqueue, atime;
    if (this.length == 1 &&
        ((atime = animTime(elem = this[0])) === 0 ||
          $.fx.speeds[atime] === 0)) {
      q = $.queue(elem);
      doqueue = (q.length > 0);
      function domove() {
        fixOriginIfWatching(elem);
        doQuickMove(elem, amount, 0);
        if (doqueue) { $.dequeue(elem); }
      }
      if (doqueue) {
        domove.finish = domove;
        q.push(domove);
      } else {
        domove();
      }
      return this;
    }
    return this.direct(function(j, elem) {
      fixOriginIfWatching(elem);
      this.animate({turtleForward: '+=' + cssNum(amount || 0) + 'px'},
          animTime(elem));
    });
  }),
  bk: wraphelp(
  ["<u>bk(pixels)</u> Back. Moves in reverse by some pixels: " +
      "<mark>bk 100</mark>"],
  function bk(amount) {
    return this.fd(-amount);
  }),
  slide: wraphelp(
  ["<u>slide(x, y)</u> Slides right x and forward y pixels without turning: " +
      "<mark>slide 50, 100</mark>"],
  function slide(x, y) {
    if (!y) { y = 0; }
    if (!x) { x = 0; }
    return this.direct(function(j, elem) {
      this.animate({turtlePosition:
          displacedPosition(elem, y, x)}, animTime(elem));
    });
  }),
  moveto: wraphelp(
  ["<u>moveto(x, y)</u> Move to graphing coordinates (see <u>getxy</u>): " +
      "<mark>moveto 50, 100</mark>",
   "<u>moveto(obj)</u> Move to page coordinates " +
      "or an object on the page (see <u>pagexy</u>): " +
      "<mark>moveto lastmousemove</mark>"],
  function moveto(x, y) {
    var position = x, localx = 0, localy = 0, limit = null;
    if ($.isNumeric(position) && $.isNumeric(y)) {
      // moveto x, y: use local coordinates.
      localx = parseFloat(position);
      localy = parseFloat(y);
      position = null;
      limit = null;
    } else if ($.isArray(position)) {
      // moveto [x, y], limit: use local coordinates (limit optional).
      localx = position[0];
      localy = position[1];
      position = null;
      limit = y;
    } else if ($.isNumeric(y)) {
      // moveto obj, limit: limited motion in the direction of obj.
      limit = y;
    }
    // Otherwise moveto {pos}, limit: absolute motion with optional limit.
    return this.direct(function(j, elem) {
      var pos = position;
      if (pos === null) {
        pos = $(homeContainer(elem)).pagexy();
      }
      if (pos && !isPageCoordinate(pos)) {
        try {
          pos = $(pos).pagexy();
        } catch (e) {
          return;
        }
      }
      if (!pos || !isPageCoordinate(pos)) return;
      if ($.isWindow(elem)) {
        scrollWindowToDocumentPosition(pos, limit);
        return;
      } else if (elem.nodeType === 9) {
        return;
      }
      this.animate({turtlePosition:
          computeTargetAsTurtlePosition(elem, pos, limit, localx, localy)},
          animTime(elem));
    });
  }),
  jumpto: wraphelp(
  ["<u>jumpto(x, y)</u> Move without drawing (compare to <u>moveto</u>): " +
      "<mark>jumpto 50, 100</mark>"],
  function jumpto(x, y) {
    var args = arguments;
    return this.direct(function(j, elem) {
      var down = this.css('turtlePenDown');
      this.css({turtlePenDown: 'up'});
      this.moveto.apply(this, args);
      this.direct(function() {
        this.css({turtlePenDown: down});
      });
    });
  }),
  turnto: wraphelp(
  ["<u>turnto(degrees)</u> Turn to a bearing. " +
      "North is 0, East is 90: <mark>turnto 270</turnto>",
   "<u>turnto(x, y)</u> Turn to graphing coordinates: " +
      "<mark>turnto 50, 100</mark>",
   "<u>turnto(obj)</u> Turn to page coordinates or an object on the page: " +
      "<mark>turnto lastmousemove</mark>"],
  function turnto(bearing, y) {
    if ($.isNumeric(y) && $.isNumeric(bearing)) {
      // turnto x, y: convert to turnto [x, y].
      bearing = [bearing, y];
      y = null;
    }
    return this.direct(function(j, elem) {
      if ($.isWindow(elem) || elem.nodeType === 9) return;
      // turnto bearing: just use the given absolute.
      var limit = null, ts, r,
          targetpos = null, nlocalxy = null;
      if ($.isNumeric(bearing)) {
        r = convertToRadians(bearing);
        fixOriginIfWatching(elem);
        targetpos = getCenterInPageCoordinates(elem);
        targetpos.pageX += Math.sin(r) * 1024;
        targetpos.pageY -= Math.cos(r) * 1024;
        limit = y;
      } else if ($.isArray(bearing)) {
        nlocalxy = computePositionAsLocalOffset(elem);
        nlocalxy[0] -= bearing[0];
        nlocalxy[1] -= bearing[1];
      } else if (isPageCoordinate(bearing)) {
        targetpos = bearing;
      } else {
        try {
          targetpos = $(bearing).pagexy();
        } catch(e) {
          return;
        }
      }
      if (!nlocalxy) {
        nlocalxy = computePositionAsLocalOffset(elem, targetpos);
      }
      dir = radiansToDegrees(Math.atan2(-nlocalxy[0], -nlocalxy[1]));
      if (!(limit === null)) {
        ts = readTurtleTransform(elem, true);
        r = convertToRadians(ts.rot);
        dir = limitRotation(ts.rot, dir, limit);
      }
      this.animate({turtleRotation: dir}, animTime(elem));
    });
  }),
  home: wraphelp(
  ["<u>home()</u> Goes home. " +
      "Jumps to the center without drawing: <mark>do home</mark>"],
  function home(container) {
    return this.direct(function(j, elem) {
      var down = this.css('turtlePenDown'),
          radius = this.css('turtleTurningRadius'),
          hc = container || homeContainer(elem);
      this.css({turtlePenDown: 'up', turtleTurningRadius: 0 });
      this.css({
        turtlePosition:
          computeTargetAsTurtlePosition(
              elem, $(hc).pagexy(), null, 0, 0),
        turtleRotation: 0});
      this.css({turtlePenDown: down, turtleTurningRadius: radius });
    });
  }),
  pen: wraphelp(
  ["<u>pen(color)</u> Selects a pen. " +
      "Chooses a color and style for the pen: <mark>pen red</mark>."],
  function pen(penstyle, lineWidth) {
    if (penstyle && ((penstyle.method || penstyle) === turtlefn.fill)) {
      penstyle = 'fill';
    }
    return this.direct(function(j, elem) {
      if (penstyle === undefined) {
        penstyle = 'black';
      } else if (penstyle === null) {
        penstyle = 'none';
      }
      if (penstyle === false || penstyle === true ||
          penstyle == 'down' || penstyle == 'up') {
        this.css('turtlePenDown', penstyle);
      } else {
        if (lineWidth !== undefined) {
          penstyle += " lineWidth " + lineWidth;
        }
        this.css('turtlePenStyle', penstyle);
      }
    });
  }),
  fill: wraphelp(
  ["<u>fill(color)</u> Fills a path traced using " +
      "<u>pf()</u>: " +
      "<mark>do pf; rt 100, 90; fill blue</mark>"],
  function fill(style) {
    if (!style) { style = 'black'; }
    var ps = parsePenStyle(style, 'fillStyle');
    return this.direct(function(j, elem) {
      endAndFillPenPath(elem, ps);
    });
  }),
  dot: wraphelp(
  ["<u>dot(color, diameter)</u> Draws a dot. " +
      "Color and diameter are optional: " +
      "<mark>dot blue</mark>"],
  function dot(style, diameter) {
    if ($.isNumeric(style)) {
      // Allow for parameters in either order.
      var t = style;
      style = diameter;
      diameter = t;
    }
    if (diameter === undefined) { diameter = 8.8; }
    if (!style) { style = 'black'; }
    var ps = parsePenStyle(style, 'fillStyle');
    return this.direct(function(j, elem) {
      var c = this.pagexy(),
          ts = readTurtleTransform(elem, true),
          extraDiam = (ps.eraseMode ? 2 : 0);
      // Scale by sx.  (TODO: consider parent transforms.)
      fillDot(c, diameter * ts.sx + extraDiam, ps);
      // Once drawing begins, origin must be stable.
      watchImageToFixOriginOnLoad(elem);
    });
  }),
  wait: wraphelp(
  ["<u>wait(seconds)</u> Waits some seconds before proceeding. " +
      "<mark>fd 100; wait 2.5; bk 100</mark>"],
  function wait(seconds) {
    return this.delay(seconds * 1000);
  }),
  st: wraphelp(
  ["<u>st()</u> Show turtle. The reverse of " +
      "<u>ht()</u>. <mark>do st</mark>"],
  function st() {
    return this.direct(function() { this.show(); });
  }),
  ht: wraphelp(
  ["<u>ht()</u> Hide turtle. The turtle can be shown again with " +
      "<u>st()</u>. <mark>do ht</mark>"],
  function ht() {
    return this.direct(function() { this.hide(); });
  }),
  pu: wraphelp(
  ["<u>pu()</u> Pen up. Tracing can be resumed with " +
      "<u>pd()</u>. <mark>do pu</mark>"],
  function pu() {
    return this.pen(false);
  }),
  pd: wraphelp(
  ["<u>pd()</u> Pen down. Resumes tracing a path that was paused with " +
      "<u>pu()</u>. <mark>do pd</mark>"],
  function pd() {
    return this.pen(true);
  }),
  pe: wraphelp(
  ["<u>pe()</u> Pen erase. Can overtrace old " +
      "lines to erase them.  <mark>pen red; fd 100; do pe; bk 100</mark>"],
  function pe() {
    return this.pen('erase');
  }),
  pf: wraphelp(
  ["<u>pf()</u> Pen fill. Traces an invisible path to fill. " +
      "<mark>do pf; rt 100, 90; fill blue</mark>"],
  function pf() {
    return this.pen('path');
  }),
  play: wraphelp(
  ["<u>play(notes)</u> Play notes. Notes are specified in " +
      "<a href=\"http://abcnotation.com/\" target=\"_blank\">" +
      "ABC notation</a>. " +
      "<mark>play \"de[dBFA]2[cGEC]4\"</mark>"],
  function play(notes) {
    var args = arguments;
    return this.queue(function() {
      // playABC will call $(this).dequeue() when song is done.
      playABC(this, args);
    });
  }),
  speed: wraphelp(
  ["<u>speed(persec)</u> Set turtle speed in moves per second: " +
      "<mark>speed Infinity</mark>"],
  function speed(mps) {
    return this.direct(function(j, elem) {
      this.css('turtleSpeed', mps);
    });
  }),
  wear: wraphelp(
  ["<u>wear(color)</u> Sets the turtle shell color: " +
      "<mark>wear 'turquoise'</mark>",
   "<u>wear(url)</u> Sets the turtle image url: " +
      "<mark>wear 'http://bit.ly/1bgrQ0p'</mark>"],
  function wear(name) {
    var img = nameToImg(name);
    if (!img) return this;
    return this.direct(function(j, elem) {
      // Bug workaround - if backgroudnImg isn't cleared early enough,
      // the turtle image doesn't update.  (Even though this is done
      // later in applyImg.)
      this.css({
        backgroundImage: 'none',
      });
      // Keep the position of the origin unchanged even if the image resizes.
      watchImageToFixOriginOnLoad(elem, true);
      applyImg(this, img);
      queueWaitForImageLoad(this);
      fixOriginIfWatching(elem);
    });
  }),
  label: wraphelp(
  ["<u>label(text)</u> Labels the current position with HTML: " +
      "<mark>label 'remember'</mark>"],
  function label(html, fn) {
    return this.direct(function() {
      var out = output(html, 'label').css({
        position: 'absolute',
        display: 'inline-block',
        top: 0,
        left: 0
      }).addClass('turtle').appendTo(getTurtleClipSurface());
      out.css({
        turtlePosition: computeTargetAsTurtlePosition(
            out.get(0), this.pagexy(), null, 0, 0),
        turtleRotation: css('turtleRotation'),
        turtleScale: css('turtleScale')
      });
      if ($.isFunction(fn)) {
        out.direct(fn);
      }
    });
  }),
  reload: function reload() {
    // Used to reload images to cycle animated gifs.
    return this.direct(function(j, elem) {
      if ($.isWindow(elem) || elem.nodeType === 9) {
        window.location.reload();
        return;
      }
      if (elem.src) {
        var src = elem.src;
        elem.src = '';
        elem.src = src;
      }
    });
  },
  hatch: wraphelp(
  ["<u>hatch(count, color)</u> Hatches any number of new turtles. Optional " +
      "color name. <mark>g = hatch 5; g.direct -> @fd random 500</mark>"],
  function(count, spec) {
    if (!this.length) return;
    if (spec === undefined && !$.isNumeric(count)) {
      spec = count;
      count = 1;
    }
    // Determine the container in which to hatch the turtle.
    var container = this[0], clone = null;
    if ($.isWindow(container) || container.nodeType === 9) {
      container = getTurtleClipSurface();
    } else if (/^(?:br|img|input|hr)$/i.test(container.tagName)) {
      container = container.parentElement;
      clone = this[0];
    }
    // Create the turtle(s)
    if (count === 1) {
      // Pass through identical jquery instance in the 1 case.
      return hatchone(
          typeof spec === 'function' ? spec(0) : spec, container, clone);
    } else {
      var k = 0, result = [];
      for (; k < count; ++k) {
        result.push(hatchone(
            typeof spec === 'function' ? spec(k) : spec, container, clone)[0]);
      }
      return $(result);
    }
  }),
  pagexy: wraphelp(
  ["<u>pagexy()</u> Page coordinates {pageX:, pageY}, top-left based: " +
      "<mark>c = pagexy(); fd 500; moveto c</mark>"],
  function pagexy() {
    if (!this.length) return;
    fixOriginIfWatching(this[0]);
    return getCenterInPageCoordinates(this[0]);
  }),
  getxy: wraphelp(
  ["<u>getxy()</u> Graphing coordinates [x, y], center-based: " +
      "<mark>v = getxy(); slide -v[0], -v[1]</mark>"],
  function getxy() {
    if (!this.length) return;
    return computePositionAsLocalOffset(this[0]);
  }),
  bearing: wraphelp(
  ["<u>bearing()</u> Turtle bearing. North is 0; East is 90: " +
      "<mark>bearing()</mark>",
   "<u>bearing(obj)</u> <u>bearing(x, y)</u> Returns the direction " +
      "from the turtle towards an object or coordinate: " +
      "<mark>bearing lastclick</mark>"],
  function bearing(x, y) {
    if (!this.length) return;
    var elem = this[0], pos = x, dir, cur;
    if (pos !== undefined) {
      cur = $(elem).pagexy();
      if ($.isNumeric(y) && $.isNumeric(x)) { pos = [x, y]; }
      if ($.isArray(pos)) {
        pos = convertLocalXyToPageCoordinates(elem, [pos])[0];
      }
      if (!isPageCoordinate(pos)) { pos = $(pos).pagexy(); }
      if (!pos) { return NaN; }
      return radiansToDegrees(
          Math.atan2(pos.pageX - cur.pageX, cur.pageY - pos.pageY));
    }
    if ($.isWindow(elem) || elem.nodeType === 9) return 0;
    return getDirectionOnPage(elem);
  }),
  distance: wraphelp(
  ["<u>distance(obj)</u> Returns the distance from the turtle to " +
      "another object: <mark>distance lastclick</mark>",
   "<u>distance(x, y)</u> Returns the distance from the turtle to " +
      "graphing coorindates: <mark>distance(100, 0)</mark>"],
  function distance(pos, y) {
    if (!this.length) return;
    var elem = this[0], dx, dy, cur = $(elem).pagexy();
    if ($.isNumeric(y) && $.isNumeric(pos)) { pos = [pos, y]; }
    if ($.isArray(pos)) {
      pos = convertLocalXyToPageCoordinates(elem, [pos])[0];
    }
    if (!isPageCoordinate(pos)) { pos = $(pos).pagexy(); }
    if (!pos) { return NaN; }
    dx = pos.pageX - cur.pageX;
    dy = pos.pageY - cur.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }),
  mirror: function mirror(val) {
    if (val === undefined) {
      // Zero arguments returns true if mirrored.
      var c = $.map(this.css('turtleScale').split(' '), parseFloat),
          p = c[0] * (c.length > 1 ? c[1] : c[0]);
      return (p < 0);
    }
    return this.direct(function(j, elem) {
      var c = $.map($.css(elem, 'turtleScale').split(' '), parseFloat);
      if (c.length === 1) { c.push(c[0]); }
      if ((c[0] * c[1] < 0) === (!val)) {
        c[0] = -c[0];
        this.css('turtleScale', c.join(' '));
      }
    });
  },
  twist: wraphelp(
  ["<u>twist(degrees)</u> Set the primary direction of the turtle. Allows " +
      "use of images that face a different direction than 'up': " +
      "<mark>twist(90)</mark>"],
  function twist(val) {
    if (val === undefined) {
      return parseFloat(this.css('turtleTwist'));
    }
    return this.direct(function(j, elem) {
      if ($.isWindow(elem) || elem.nodeType === 9) return;
      this.css('turtleTwist', val);
    });
  }),
  scale: wraphelp(
  ["<u>scale(factor)</u> Scales all motion up or down by a factor. " +
      "To double all drawing: <mark>scale(2)</mark>"],
  function scale(valx, valy) {
    if (valy === undefined) { valy = valx; }
    // Disallow scaling to zero using this method.
    if (!valx || !valy) { return this; }
    return this.direct(function(j, elem) {
      if ($.isWindow(elem) || elem.nodeType === 9) return;
      var c = $.map($.css(elem, 'turtleScale').split(' '), parseFloat);
      if (c.length === 1) { c.push(c[0]); }
      c[0] *= valx;
      c[1] *= valy;
      this.css('turtleScale', $.map(c, cssNum).join(' '));
    });
  }),
  cell: wraphelp(
  ["<u>cell(r, c)</u> Row r and column c in a table. " +
      "Use together with the table function: " +
      "<mark>g = table 8, 8; g.cell(0,2).text 'hello'</mark>"],
  function cell(r, c) {
    var sel = this.find(
        $.isNumeric(r) ? 'tr:nth-of-type(' + (r + 1) + ')' : 'tr');
    return sel.find(
        $.isNumeric(c) ? 'td:nth-of-type(' + (c + 1) + ')' : 'td');
  }),
  shown: wraphelp(
  ["<u>shown()</u> True if turtle is shown, false if hidden: " +
      "<mark>do ht; write shown()</mark>"],
  function shown() {
    checkPredicate('shown', this);
    return this.is(':visible');
  }),
  hidden: wraphelp(
  ["<u>hidden()</u> True if turtle is hidden: " +
      "<mark>do ht; write hidden()</mark>"],
  function hidden() {
    checkPredicate('hidden', this);
    return this.is(':hidden');
  }),
  enclosedby: wraphelp(
  ["<u>enclosedby(obj)</u> True if the turtle is encircled by obj: " +
      "<mark>enclosedby(window)</mark>"],
  function enclosedby(elem) {
    checkPredicate('enclosedby', this);
    if (!elem) return false;
    if (typeof elem == 'string') {
      elem = $(elem);
    }
    if (elem.jquery) {
      if (!elem.length || !elem.is(':visible')) return false;
      elem = elem[0];
    }
    var gbcr0 = getPageGbcr(elem),
        encloser = null, rectenc = false,
        allok = true, j = 0, k, obj;
    for (; allok && j < this.length; ++j) {
      obj = this[j];
      // Optimize the outside-bounding-box case.
      if (isDisjointGbcr(gbcr0, getPageGbcr(obj))) {
        return false;
      }
      if (!encloser) {
        encloser = getCornersInPageCoordinates(elem);
        rectenc = polyMatchesGbcr(encloser, gbcr0);
      }
      // Optimize the rectilinear-encloser case.
      if (rectenc && gbcrEncloses(gbcr0, getPageGbcr(obj))) {
        continue;
      }
      if (isPageCoordinate(obj)) {
        allok &= pointInConvexPolygon(obj, encloser);
      } else {
        allok &= doesConvexPolygonContain(
          encloser, getCornersInPageCoordinates(obj));
      }
    }
    return !!allok;
  }),
  touches: wraphelp(
  ["<u>touches(obj)</u> True if the turtle touches obj: " +
      "<mark>touches(lastclick)</mark>",
   "<u>touches(color)</u> True if the turtle touches a drawn color: " +
      "<mark>touches red</mark>"],
  function touches(arg, y) {
    checkPredicate('touches', this);
    if (!this.is(':visible') || !this.length) { return false; }
    if (arg == 'ink' || isCSSColor(arg)) {
      return touchesPixel(this[0], arg == 'ink' ? null : arg);
    }
    if ($.isNumeric(arg) && $.isNumeric(y)) {
      arg = [arg, y];
    }
    if ($.isArray(arg) && arg.length == 2 &&
        $.isNumeric(arg[0]) && $.isNumeric(arg[1])) {
      arg = convertLocalXyToPageCoordinates(this[0] || document.body, [arg])[0];
    }
    if (!arg) return false;
    if (typeof arg === 'string') { arg = $(arg); }
    if (!arg.jquery && !$.isArray(arg)) { arg = [arg]; }
    var anyok = false, k = 0, j, obj, elem, gbcr0, toucher;
    for (;!anyok && k < this.length; ++k) {
      elem = this[k];
      gbcr0 = getPageGbcr(elem);
      toucher = null;
      for (j = 0; !anyok && j < arg.length; ++j) {
        obj = arg[j];
        // Optimize the outside-bounding-box case.
        if (isDisjointGbcr(gbcr0, getPageGbcr(obj))) {
          continue;
        }
        if (!toucher) {
          toucher = getCornersInPageCoordinates(elem);
        }
        if (isPageCoordinate(obj)) {
          anyok |= pointInConvexPolygon(obj, toucher);
        } else {
          anyok |= doConvexPolygonsOverlap(
            toucher, getCornersInPageCoordinates(obj));
        }
      }
    }
    return !!anyok;
  }),
  within: function within(distance, x, y) {
    checkPredicate('within', this);
    return withinOrNot(this, true, distance, x, y);
  },
  notwithin: function notwithin(distance, x, y) {
    checkPredicate('notwithin', this);
    return withinOrNot(this, false, distance, x, y);
  },
  direct: function direct(qname, callback, args) {
    if ($.isFunction(qname)) {
      args = callback;
      callback = qname;
      qname = 'fx';
    }
    // If animation is active, then direct will queue the callback.
    // It will also arrange things so that if the callback enqueues
    // further animations, they are inserted at the same location,
    // so that the callback can expand into several animations,
    // just as an ordinary function call expands into its subcalls.
    function enqueue(elem, index) {
       var animation = (function() {
            var saved = $.queue(this, qname),
                subst = [], inserted;
            if (saved[0] === 'inprogress') {
              subst.unshift(saved.shift());
            }
            $.queue(elem, qname, subst);
            action();
            // The Array.prototype.push is faster.
            // $.merge($.queue(elem, qname), saved);
            Array.prototype.push.apply($.queue(elem, qname), saved);
            $.dequeue(elem, qname);
          }),
          action = animation.finish = (args ?
          (function() { callback.apply($(elem), args); }) :
          (function() { callback.call($(elem), index, elem); }));
      $.queue(elem, qname, animation);
    }
    var elem, sel, length = this.length, j = 0;
    for (; j < length; ++j) {
      elem = this[j];
      // Queue an animation if there is a queue.
      if ($.queue(elem, qname).length) {
        enqueue(elem, j);
      } else if (args) {
        callback.apply($(elem), args);
      } else {
        callback.call($(elem), j, elem);
      }
    }
    return this;
  }
};

// It is unreasonable (and a common error) to queue up motions to try to
// change the value of a predicate.  The problem is that queuing will not
// do anything immediately.  This check prints a warning and flushes the
// queue when the queue is 100 long.
function checkPredicate(fname, sel) {
  if ($.turtle.nowarn) return;
  var ok = true, j;
  for (j = 0; ok && j < sel.length; ++j) {
    if ($.queue(sel[j]).length >= 100) {
      ok = false;
    }
  }
  if (!ok) {
    if (see.visible()) {
      see.html('<span style="color:red">Warning: ' + fname +
      ' may not return useful results when motion is queued. ' +
      'Try <b style="background:yellow">defaultspeed Infinity</b></span>.');
    } else {
      console.warn(fname + ' may not return useful results when motion ' +
      'is queued.  Try defaultspeed Infinity.');
    }
    sel.finish();
  }
}

$.fn.extend(turtlefn);

//////////////////////////////////////////////////////////////////////////
// TURTLE GLOBAL ENVIRONMENT
// Implements educational support when $.turtle() is called:
// * Looks for an element #id to use as the turtle (id defaults to 'turtle').
// * If not found, does a hatch(id).
// * Turns every #id into a global variable.
// * Sets up globals for "lastclick", "lastmousemove" etc.
// * Sets up global functions for all turtle functions for the main turtle.
// * Sets up a global "tick" function.
// * Sets up a global "speed" function and does a speed(10) by default.
// * Sets up a global "hatch" function to make a new turtle.
//////////////////////////////////////////////////////////////////////////

var turtleGIFUrl = "data:image/gif;base64,R0lGODlhKAAwAPEDAAFsOACSRTCuSAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJZAADACwAAAAAKAAwAAACzpyPqcvtByJ49EWBRaw8gZxNXfeB4ciVpoZWqim2zhfUNivP9h7EOQPg9VqSDVDocwUyQ8UFlrS8mobIciXoRRtBULGLBWm/EudVHA6fxVFw+v2mQtbwundhteuz2yp9z/cVMAPIhvIC2EdYiKHIxdhIBIkzgrjnCDSJiacpCbnp1HkoWklKYqo0KUfhxjhWBmQ5ibFaJTsbGYob1nb2+kdbVLNS++Lz5JVEBguhEmQW/GOcSUl09sxZffj1qP2zCPo9QBMuXVMubSS+/lAAACH5BAVkAAMALAEAAQAmAC4AAALNnI9pwKAP4wKiCiZzpLY6DR5c54XhSH5mhnbqugnBTF8wS+fBez+AvuvhdDxEA3NqXYqDnyXIcpIqu5fU8zlqr9OntgPlPrtk2TQcKKvXMpWSDYcu0vB6NVE90uskOY6fsvIGxxQDaFEIMciW6HOIKPhYYrK41qhQqXaZkFm2aSRpQxn6KUIaKVnatHfoZ6TF2sokFopY1PmIZFrryRkrk0dLpef1usXDMKXb5CIk5TqwY+s8idncw1EoPYxdjanVLSqk4aTqPGOOvaxRAAA7";

var eventfn = { click:1, mouseup:1, mousedown:1, mousemove:1,
    keydown:1, keypress:1, keyup:1 };

var global_turtle = null;
var global_turtle_methods = [];
var attaching_ids = false;
var dollar_turtle_methods = {
  cs: wraphelp(
  ["<u>cs()</u> Clear screen. Erases both graphics canvas and " +
      "body text: <mark>do cs</mark>"],
  function cs() { directIfGlobal(function() { clearField() }); }),
  cg: wraphelp(
  ["<u>cg()</u> Clear graphics. Does not alter body text: " +
      "<mark>do cg</mark>"],
  function cg() { directIfGlobal(function() {clearField('canvas turtles') });}),
  ct: wraphelp(
  ["<u>ct()</u> Clear text. Does not alter graphics canvas: " +
      "<mark>do ct</mark>"],
  function ct() { directIfGlobal(function() { clearField('text') }); }),
  tick: wraphelp(
  ["<u>tick(fps, fn)</u> Calls fn fps times per second until " +
      "<u>tick</u> is called again: " +
      "<mark>c = 10; tick 1, -> c and write(c--) or tick()</mark>"],
  function tick(tps, fn) {
    directIfGlobal(function() { globaltick(tps, fn); });
  }),
  defaultspeed: wraphelp(
  ["<u>defaultspeed(mps)</u> Sets default turtle speed for new turtles: " +
      "<mark>defaultspeed 60</mark>"],
  globaldefaultspeed),
  sound: wraphelp(
  ["<u>sound(notes)</u> Sound notes immediately. Notes are specified in " +
      "<a href=\"http://abcnotation.com/\" target=\"_blank\">" +
      "ABC notation</a>. " +
      "<mark>sound \"cc/e/c/e/g2\"</mark>"],
  function sound() { playABC(null, arguments); }),
  write: wraphelp(
  ["<u>write(html)</u> Writes text output. Arbitrary HTML may be written: " +
      "<mark>write 'Hello, world!'</mark>"],
  function write(html) { return output(html, 'div'); }),
  read: wraphelp(
  ["<u>read(html, fn)</u> Reads text or numeric input. " +
      "Calls fn once with the entered value: " +
      "<mark>read 'Your name?', (v) -> write 'Hello ' + v</mark>"],
  function read(a, b) { return input(a, b, 0); }),
  readnum: wraphelp(
  ["<u>readnum(html, fn)</u> Reads numeric input. Only numbers allowed: " +
      "<mark>readnum 'Amount?', (v) -> write 'Tip: ' + (0.15 * v)</mark>"],
  function readnum(a, b) { return input(a, b, 1); }),
  readstr: wraphelp(
  ["<u>readstr(html, fn)</u> Reads text input. Never " +
      "converts input to a number: " +
      "<mark>readstr 'Enter code', (v) -> write v.length + ' long'</mark>"],
  function readstr(a, b) { return input(a, b, -1); }),
  random: wraphelp(
  ["<u>random(n)</u> Random non-negative integer less than n: " +
      "<mark>write random 10</mark>",
   "<u>random(list)</u> Random member of the list: " +
      "<mark>write random ['a', 'b', 'c']</mark>",
   "<u>random('position')</u> Random page position: " +
      "<mark>moveto random 'position'</mark>",
   "<u>random('color')</u> Random color: " +
      "<mark>pen random 'color'</mark>"],
  random),
  hatch: wraphelp(
  ["<u>hatch(count, color)</u> Hatches any number of new turtles. Optional " +
      "color name. <mark>g = hatch 5; g.direct -> @fd random 500</mark>"],
  function hatch(count, spec) {
    if (global_turtle) return $(global_turtle).hatch(count, spec);
    else return $(document).hatch(count, spec);
  }),
  button: wraphelp(
  ["<u>button(text, fn)</u> Writes a button. Calls " +
      "fn whenever the button is clicked: " +
      "<mark>button 'GO', -> fd 100</mark>"],
  button),
  table: wraphelp(
  ["<u>table(m, n)</u> Writes m rows and c columns. " +
      "Access cells using <u>cell</u>: " +
      "<mark>g = table 8, 8; g.cell(2,3).text 'hello'</mark>",
   "<u>table(array)</u> Writes tabular data. " +
      "Each nested array is a row: " +
      "<mark>table [[1,2,3],[4,5,6]]</mark>"],
  table),
  rgb: wraphelp(
  ["<u>rgb(r,g,b)</u> Makes a color out of red, green, and blue parts. " +
      "<mark>pen rgb(150,88,255)</mark>"],
  function() { return componentColor('rgb', arguments); }),
  rgba: wraphelp(
  ["<u>rgba(r,g,b,a)</u> Makes a color out of red, green, blue, and alpha. " +
      "<mark>pen rgba(150,88,255,0.5)</mark>"],
  function() { return componentColor('rgba', arguments); }),
  hsl: wraphelp(
  ["<u>hsl(h,s,l)</u> Makes a color out of hue, saturation, and lightness. " +
      "<mark>pen hsl(120,0.65,0.75)</mark>"],
  function() { return componentColor('hsl', [arguments[0],
     (arguments[1] * 100).toFixed(0) + '%',
     (arguments[2] * 100).toFixed() + '%']); }),
  hsla: wraphelp(
  ["<u>hsla(h,s,l,a)</u> Makes a color out of hue, saturation, lightness, " +
      "alpha. <mark>pen hsla(120,0.65,0.75,0.5)</mark>"],
  function() { return componentColor('hsl', [arguments[0],
     (arguments[1] * 100).toFixed(0) + '%',
     (arguments[2] * 100).toFixed(0) + '%', arguments[3]]); }),
  help: globalhelp
};

var extrahelp = {
  remove: {helptext: ["<u>remove()</u> Removes main turtle completely. " +
      "Also removes <u>fd</u>, <u>bk</u>, <u>rt</u>, etc: " +
      "<mark>do remove</mark>"]},
  finish: {helptext: ["<u>finish()</u> Finishes turtle animation. " +
      "Does not pause for effect: " +
      "<mark>do finish</mark>"]}
};

var helpok = {};

(function() {
  var colors = [
    "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige",
    "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown",
    "burlywood", "cadetblue", "chartreuse", "chocolate", "coral",
    "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan",
    "darkgoldenrod", "darkgray", "darkgreen", "darkkhaki", "darkmagenta",
    "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon",
    "darkseagreen", "darkslateblue", "darkslategray", "darkturquoise",
    "darkviolet", "deeppink", "deepskyblue", "dimgray", "dodgerblue",
    "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro",
    "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow",
    "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki",
    "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue",
    "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray",
    "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
    "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen",
    "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue",
    "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue",
    "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue",
    "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace",
    "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod",
    "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff",
    "peru", "pink", "plum", "powderblue", "purple", "red", "rosybrown",
    "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen",
    "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray",
    "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato",
    "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow",
    "yellowgreen"
  ], j = 0;
  for (; j < colors.length; j++) {
    dollar_turtle_methods[colors[j]] = colors[j];
  }
  extrahelp.colors = {helptext:
      ["Defined colors: " + colors.join(" ")]};
})();

$.turtle = function turtle(id, options) {
  var exportedsee = false;
  if (!arguments.length) {
    id = 'turtle';
  }
  if (arguments.length == 1 && typeof(id) == 'object' && id &&
      !id.hasOwnProperty('length')) {
    options = id;
    id = 'turtle';
  }
  options = options || {};
  // Clear any previous turtle methods.
  clearGlobalTurtle();
  // Expand any <script type="text/html"> unless htmlscript is false.
  // This is to simplify literal HTML editing within templated editors.
  if (!options.hasOwnProperty('htmlscript') || options.htmlscript) {
    $('script[type="text/html"]').each(function() {
        $(this).replaceWith(
            $(this).html().replace(/^\x3c!\[CDATA\[\n?|\]\]\x3e$/g, ''));
    });
  }
  if (!drawing.ctx && options.hasOwnProperty('subpixel')) {
    drawing.subpixel = parseInt(options.subpixel);
  }
  // Set up global events.
  if (!options.hasOwnProperty('events') || options.events) {
    turtleevents(options.eventprefix);
  }
  // Set up global objects by id.
  if (!options.hasOwnProperty('ids') || options.ids) {
    turtleids(options.idprefix);
  }
  // Set up global log function.
  if (!options.hasOwnProperty('see') || options.see) {
    exportsee();
    exportedsee = true;
    if (window.addEventListener) {
      window.addEventListener('error', see);
    } else {
      window.onerror = see;
    }
  }
  // Copy $.turtle.* functions into global namespace.
  if (!options.hasOwnProperty('functions') || options.functions) {
    $.extend(window, dollar_turtle_methods);
  }
  // Set default turtle speed
  globaldefaultspeed(options.hasOwnProperty('defaultspeed') ?
      options.defaultspeed : 1);
  // Initialize audio context (avoids delay in first notes).
  try {
    getAudioTop();
  } catch (e) { }
  // Find or create a singleton turtle if one does not exist.
  var selector = null;
  if (id) {
    selector = $('#' + id);
    if (!selector.length) {
      selector = dollar_turtle_methods.hatch(id);
    }
  }
  if (selector && !selector.length) { selector = null; }
  // Globalize selected jQuery methods of a singleton turtle.
  if (selector && selector.length === 1 &&
      (!options.hasOwnProperty('global') || options.global)) {
    var extraturtlefn = {
      css:1, fadeIn:1, fadeOut:1, fadeTo:1, fadeToggle:1,
      animate:1, stop:1, toggle:1, finish:1, remove:1 };
    var globalfn = $.extend({}, turtlefn, eventfn, extraturtlefn);
    global_turtle_methods.push.apply(global_turtle_methods,
       globalizeMethods(selector, globalfn));
    global_turtle = selector[0];
    $(document).on('DOMNodeRemoved.turtle', onDOMNodeRemoved);
  }
  // Set up test console.
  if (!options.hasOwnProperty('panel') || options.panel) {
    var retval = null,
        seeopt = {
      title: 'turtle test panel - Enter commands or type help for help',
      abbreviate: [undefined, helpok],
      consolehook: seehelphook
    };
    if (selector) { seeopt.abbreviate.push(selector); }
    if (options.title) {
      seeopt.title = options.title;
    }
    if (options.panelheight) {
      seeopt.height = options.panelheight;
    }
    see.init(seeopt);
    // Return an eval loop hook string if 'see' is exported.
    if (exportedsee) {
      if (window.CoffeeScript) {
        return "see.init(eval(see.cs))";
      } else {
        return see.here;
      }
    }
  }
};

$.extend($.turtle, dollar_turtle_methods);

function seehelphook(text, result) {
  if ((typeof result == 'function' || typeof result == 'undefined')
      && /^\w+\s*$/.test(text)) {
    if (result && result.helptext) {
      globalhelp(result);
      return true;
    } else if (text in extrahelp) {
      globalhelp(text);
      return true;
    }
  } else if (typeof result == 'undefined' && /^help\s+\S+$/.test(text)) {
    globalhelp(/^help\s+(\S+)$/.exec(text)[1]);
    return true;
  }
  return false;
}

function copyhelp(method, fname, extrahelp, globalfn) {
  if (method.helptext) {
    globalfn.helptext = method.helptext;
  } else if (fname in extrahelp) {
    globalfn.helptext = extrahelp[fname].helptext;
  }
  globalfn.method = method;
  return globalfn;
}

function globalizeMethods(thisobj, fnames) {
  var replaced = [];
  for (var fname in fnames) {
    if (fnames.hasOwnProperty(fname) && !(fname in window)) {
      replaced.push(fname);
      window[fname] = (function(fname) {
        var method = thisobj[fname], target = thisobj;
        return copyhelp(method, fname, extrahelp,
            (function() { /* Use parentheses to call a function */
                return method.apply(target, arguments); }));
      })(fname);
    }
  }
  return replaced;
}

function clearGlobalTurtle() {
  global_turtle = null;
  for (var j = 0; j < global_turtle_methods.length; ++j) {
    delete window[global_turtle_methods[j]];
  }
  global_turtle_methods.length = 0;
}

function directIfGlobal(fn) {
  if (global_turtle) {
    $(global_turtle).direct(fn);
  } else {
    fn();
  }
}

function onDOMNodeRemoved(e) {
  // Undefine global variable.
  if (e.target.id && window[e.target.id] && window[e.target.id].jquery &&
      window[e.target.id].length === 1 && window[e.target.id][0] === e.target) {
    delete window[e.target.id];
  }
  // Clear global turtle.
  if (e.target === global_turtle) {
    clearGlobalTurtle();
  }
}

function isCSSColor(color) {
  return rgbaForColor(color) !== null;
}

var colorCache = {};

function rgbaForColor(color) {
  if (!color ||
      !/^[a-z]+$|^(?:rgb|hsl)a?\([^)]*\)$|^\#[a-f0-9]{3}(?:[a-f0-9]{3})?$/i
      .exec(color)) {
    return null;
  }
  if (color in colorCache) {
    return colorCache[color];
  }
  var d = document.createElement('div'), unset = d.style.color,
      result = null, m;
  d.style.color = color;
  if (unset !== d.style.color) {
    m = /rgba?\s*\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\s*\)/.exec($(d).
        css({position:'absolute',top:0,left:0}).appendTo('body').css('color'));
    if (m) {
      result = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]),
                Math.round(255 * (m[4] ? parseFloat(m[4]) : 1))];
    }
    $(d).remove();
  }
  colorCache[color] = result;
  return result;
}

function createTurtleShellOfColor(color) {
  var c = document.createElement('canvas');
  c.width = 40;
  c.height = 48;
  var ctx = c.getContext('2d'),
      cx = 20,
      cy = 26;
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  // Half of a symmetric turtle shell pattern.
  var pattern = [
    [[5, -14], [3, -11]],
    [[3, -11], [7, -8], [4, -4]],
    [[4, -4], [7, 0], [4, 4]],
    [[4, 4], [7, 8], [3, 11]],
    [[7, -8], [12, -9], null],
    [[7, 0], [15, 0], null],
    [[7, 8], [12, 9], null],
    [[3, 11], [1, 15], null]
  ];
  for (var j = 0; j < pattern.length; j++) {
    var path = pattern[j], connect = true;
    ctx.moveTo(cx + path[0][0], cy + path[0][1]);
    for (var k = 1; k < path.length; k++) {
      if (path[k] !== null) {
        ctx.lineTo(cx + path[k][0], cy + path[k][1]);
      }
    }
    for (var k = path.length - 1; k >= 0; k--) {
      if (path[k] === null) {
        k--;
        ctx.moveTo(cx - path[k][0], cy + path[k][1]);
      } else {
        ctx.lineTo(cx - path[k][0], cy + path[k][1]);
      }
    }
  }
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 15.5, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.stroke();
  return c.toDataURL();
}

function createPointerOfColor(color) {
  var c = document.createElement('canvas');
  c.width = 40;
  c.height = 48;
  var ctx = c.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(0,49);
  ctx.lineTo(20,0);
  ctx.lineTo(40,48);
  ctx.lineTo(20,42);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return c.toDataURL();
}

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"]/g, function(s) {return entityMap[s];});
}

function nameToImg(name) {
  if (name == 'turtle') { name = 'mediumseagreen'; }
  if (isCSSColor(name)) return {
    url: createTurtleShellOfColor(name),
    css: {
      width: 20,
      height: 24,
      turtleHull: "-8 -5 -8 6 0 -13 8 6 8 -5 0 9",
      transformOrigin: '10px 13px',
      opacity: 0.5,
      backgroundImage: 'url(' + turtleGIFUrl + ')',
      backgroundSize: 'contain'
    }
  };
  var openicon =
    /^openicon:\/?\/?([^@\/][^@]*)(?:@(?:(\d+):)?(\d+))?$/.exec(name);
  if (openicon) {
    var openiconName = openicon[1],
        sourceSize = parseInt(openicon[3]),
        targetSize = parseInt(openicon[2]),
        dotloc = openiconName.lastIndexOf('.'),
        openiconType = 'png';
    if (openiconName.indexOf('/') == -1) {
      openiconName = 'others/' + openiconName;
    }
    if (dotloc > 0 && dotloc <= openiconName.length - 4 &&
        dotloc >= openiconName.length - 5) {
      openiconType = openiconName.substring(dotloc + 1);
      openiconName = openiconName.substring(0, dotloc);
    }
    if (!targetSize) {
      targetSize = sourceSize || 24;
    }
    if (!sourceSize) {
      sourceSize = 48;
    }
    return {
      url: 'http://openiconlibrary.sourceforge.net/gallery2/' +
        'open_icon_library-full/icons/' + openiconType + '/' +
        sourceSize + 'x' + sourceSize + '/' +
        openiconName + '.' + openiconType,
      css: {
        width: targetSize,
        height: targetSize,
        transformOrigin: '50% 50%',
        opacity: 1
      }
    }
  }
  if (/^(?:(?:https?|data):)?\//i.exec(name)) {
    return {
      url: name,
      css: {
        transformOrigin: '50% 50%',
        opacity: 1
      }
    }
  }
  return null;
}

function hatchone(name, container, clonepos) {
  var isID = name && /^[a-zA-Z]\w*$/.exec(name),
      isTag = name && /^<.*>$/.exec(name),
      img = nameToImg(name) ||
        (isID || name === undefined) && nameToImg('turtle');

  // Don't overwrite previously existing id.
  if (isID && $('#' + name).length) { isID = false; }

  // Create an image element with the requested name.
  var result;
  if (img) {
    result = $('<img>');
    applyImg(result, img);
    queueWaitForImageLoad(result);
  } else if (isTag) {
    result = $(name);
  } else {
    result = $('<div>' + escapeHtml(name) + '</div>');
  }
  // Position the turtle inside the container.
  result.css({
    position: 'absolute',
    display: 'inline-block',
    top: 0,
    left: 0
  });
  if (!container || container.nodeType == 9 || $.isWindow(container)) {
    container = getTurtleClipSurface();
  }
  result.appendTo(container);

  // Move it to the starting pos.
  if (clonepos) {
    var t = $.style(clonepos, 'transform');
    if (t) {
      result.css({transform: $.style(clonepos, 'transform')});
    } else {
      result.home(clonepos);
    }
  } else {
    result.home(container);
  }

  // Every hatched turtle has class="turtle".
  result.addClass('turtle');

  // Set the id.
  if (isID) {
    result.attr('id', name);
    // Update global variable unless there is a conflict.
    if (attaching_ids && !window.hasOwnProperty(name)) {
      window[name] = result;
    }
  }
  // Move it to the center of the document and export the name as a global.
  return result;
}

// Simplify Math.floor(Math.random() * N) and also random choice.
function random(arg) {
  if (typeof(arg) == 'number') { return Math.floor(Math.random() * arg); }
  if (typeof(arg) == 'object' && arg.length && arg.slice) {
    return arg[Math.floor(Math.random() * arg.length)];
  }
  if (arg == 'normal') {
    // Ratio of uniforms gaussian, from tinyurl.com/9oh2nqg
    var u, v, x, y, q;
    do {
      u = Math.random();
      v = 1.7156 * (Math.random() - 0.5);
      x = u - 0.449871;
      y = Math.abs(v) + 0.386595;
      q = x * x + y * (0.19600 * y - 0.25472 * x);
    } while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));
    return v / u;
  }
  if (arg == 'position') {
    return {
      pageX: random(dw() + 1),
      pageY: random(dh() + 1)
    };
  }
  if (arg == 'color') {
    return 'hsl(' + Math.floor(Math.random() * 360) + ',100%,50%)';
  }
  if (arg == 'gray') {
    return 'hsl(0,0,' + Math.floor(Math.random() * 100) + '%)';
  }
  return Math.random();
}

// Simplify setInterval(fn, 1000) to just tick(fn).
var tickinterval = null;
function globaltick(rps, fn) {
  if (fn === undefined && $.isFunction(rps)) {
    fn = rps;
    rps = 1;
  }
  if (tickinterval) {
    window.clearInterval(tickinterval);
    tickinterval = null;
  }
  if (fn && rps) {
    tickinterval = window.setInterval(fn, 1000 / rps);
  }
}

// Allow speed to be set in moves per second.
function globaldefaultspeed(mps) {
  if (mps === undefined) {
    return 1000 / $.fx.speeds.turtle;
  } else {
    $.fx.speeds.turtle = mps > 0 ? 1000 / mps : 0;
  }
}

// Simplify $('#x').move() to just x.move()
function turtleids(prefix) {
  if (prefix === undefined) {
    prefix = '';
  }
  $('[id]').each(function(j, item) {
    window[prefix + item.id] = $('#' + item.id);
  });
  attaching_ids = true;
}

// Simplify $(window).click(function(e) { x.moveto(e); } to just
// x.moveto(lastclick).
var eventsaver = null;
function turtleevents(prefix) {
  if (prefix === undefined) {
    prefix = 'last';
  }
  if (eventsaver) {
    $(window).off($.map(eventfn, function(x,k) { return k; }).join(' '),
        eventsaver);
  }
  if (prefix || prefix === '') {
    eventsaver = (function(e) {
      window[prefix + e.type] = e;
    });
    $(window).on($.map(eventfn, function(x,k) { return k; }).join(' '),
        eventsaver);
    for (var k in eventfn) {
      if (eventfn.hasOwnProperty(k)) {
        window[prefix + k] = null;
      }
    }
  }
}

// Simplify $('body').append(html).
function output(html, defaulttag) {
  if (html === undefined || html === null) {
    // Print a turtle shell when no arguments.
    return $('<img>').wear('turtle').css({background: 'none'}).appendTo('body');
  }
  var wrapped = false, result = null;
  html = '' + html;
  while ((result === null || result.length != 1) && !wrapped) {
    // Wrap if obviously not surrounded by a tag already, or if we tried
    // to trust a surrounding tag but found multiple bits.
    if (html.charAt(0) != '<' || html.charAt(html.length - 1) != '>' ||
        (result !== null && result.length != 1)) {
      html = '<' + defaulttag + ' style="display:inline-block">' +
          html + '</' + defaulttag + '>';
      wrapped = true;
    }
    result = $(html);
  }
  result.appendTo('body');
  if (wrapped && defaulttag == 'div') {
    result.after('<br>');
  }
  return result;
}

// Simplify $('body'>.append('<button>' + label + '</button>').click(fn).
function button(name, callback) {
  if ($.isFunction(name) && callback === undefined) {
    callback = name;
    name = null;
  }
  if (name === null || name === undefined) {
    name = '\u25CE';
  }
  var result = $('<button>' + escapeHtml(name) + '</button>');
  result.appendTo('body');
  if (callback) {
    result.click(callback);
  }
  return result;
}


// Simplify $('body').append('<input>' + label) and onchange hookup.
function input(name, callback, numeric) {
  if ($.isFunction(name) && !callback) {
    callback = name;
    name = null;
  }
  name = $.isNumeric(name) || name ? name : '&rArr;';
  var textbox = $('<input>'),
      label = $(
      '<label style="display:block">' +
      name + '&nbsp;' +
      '</label>').append(textbox),
      thisval = $([textbox[0], label[0]]),
      debounce = null,
      lastseen = textbox.val();
  function dodebounce() {
    if (!debounce) {
      debounce = setTimeout(function() { debounce = null; }, 1000);
    }
  }
  function newval() {
    if (!validate()) { return false; }
    var val = textbox.val();
    if (debounce && lastseen == val) { return; }
    dodebounce();
    lastseen = val;
    textbox.remove();
    label.append(val);
    if (numeric > 0 || (
      numeric >= 0 && $.isNumeric(val) && ('' + parseFloat(val) == val))) {
      val = parseFloat(val);
    }
    if (callback) { callback.call(thisval, val); }
  }
  function validate() {
    if (!numeric) return true;
    var val = textbox.val(),
        nval = val.replace(/[^0-9\.]/g, '');
    if (val != nval || !$.isNumeric(nval)) {
      textbox.val(nval);
      return false;
    }
    return true;
  }
  function key(e) {
    if (e.which == 13) {
      if (!validate()) { return false; }
      newval();
    }
    if (numeric > 0 && (e.which >= 32 && e.which <= 127) &&
        (e.which < '0'.charCodeAt(0) || e.which > '9'.charCodeAt(0)) &&
        (e.which != '.'.charCodeAt(0) || textbox.val().indexOf('.') >= 0)) {
      return false;
    }
  }
  dodebounce();
  textbox.on('keypress keydown', key);
  textbox.on('change', newval);
  $('body').append(label);
  textbox.focus();
  return thisval;
}

// Functions to generate CSS color strings
function componentColor(t, args) {
  return t + '(' + Array.prototype.join.call(args, ',') + ')';
}

// Simplify creation of tables with cells.
function table(height, width, cellCss, tableCss) {
  var contents = null, row, col;
  if ($.isArray(height)) {
    tableCss = cellCss;
    cellCss = width;
    contents = height;
    height = contents.length;
    width = 0;
    for (row = 0; row < height; row++) {
      if ($.isArray(contents[row])) {
        width = Math.max(width, contents[row].length);
      } else {
        width = Math.max(width, 1);
      }
    }
  }
  var html = ['<table>'];
  for (row = 0; row < height; row++) {
    html.push('<tr>');
    for (col = 0; col < width; col++) {
      if (contents) {
        if ($.isArray(contents[row]) && col < contents[row].length) {
          html.push('<td>' + escapeHtml(contents[row][col]) + '</td>');
        } else if (!$.isArray(contents[row]) && col == 0) {
          html.push('<td>' + escapeHtml(contents[row]) + '</td>');
        } else {
          html.push('<td></td>');
        }
      } else {
        html.push('<td></td>');
      }
    }
    html.push('</tr>');
  }
  html.push('</table>');
  var result = $(html.join(''));
  var defaultCss = {
    borderCollapse: 'collapse',
    width: '35px',
    height: '35px',
    border: '1px solid black',
    tableLayout: 'fixed',
    textAlign: 'center',
    margin: '0',
    padding: '0'
  };
  result.css($.extend({}, defaultCss,
    { width: 'auto', height: 'auto', maxWidth: 'auto', border: 'none'},
    tableCss));
  result.find('td').css($.extend({}, defaultCss, cellCss));
  result.appendTo('body');
  return result;
}

//////////////////////////////////////////////////////////////////////////
// WEB AUDIO SUPPORT
// Definition of play("ABC") - uses ABC music note syntax.
//////////////////////////////////////////////////////////////////////////

var ABCtoken = /\s+|\[|\]|>+|<+|(?:(?:\^\^|\^|__|_|=|)[A-Ga-g](?:,+|'+|))|\d*\/\d+|\d+|\/+|[xzXZ]|./g;
var audioTop = null;
function isAudioPresent() {
  return !!(window.audioContext || window.webkitAudioContext);
}
function getAudioTop() {
  if (!audioTop) {
    var ac = new (window.AudioContext || window.webkitAudioContext),
        dcn = ac.createDynamicsCompressor(),
        firstTime = null;
    dcn.connect(ac.destination);
    audioTop = {
      ac: ac,
      out: dcn,
      // Partial workaround for http://crbug.com/254942:
      // add little extra pauses before scheduling envelopes.
      // A quarter second or so seems to be needed at initial startup,
      // then 1/64 second before scheduling each envelope afterwards.
      nextStartTime: function() {
        if (firstTime === null) {
          firstTime = ac.currentTime;
        }
        return Math.max(firstTime + 0.25,
                        ac.currentTime + 0.015625);
      }
    }
  }
  return audioTop;
}
function parseABCNotes(str) {
  var tokens = str.match(ABCtoken), result = [], stem = null,
      index = 0, dotted = 0, t;
  while (index < tokens.length) {
    if (/^s+$/.test(tokens[index])) { index++; continue; }
    if (/</.test(tokens[index])) { dotted = -tokens[index++].length; continue; }
    if (/>/.test(tokens[index])) { dotted = tokens[index++].length; continue; }
    stem = parseStem(tokens, index);
    if (stem === null) {
      // Skip unparsable bits
      index++;
      continue;
    }
    if (stem !== null) {
      if (dotted && result.length) {
        if (dotted > 0) {
          t = (1 - Math.pow(0.5, dotted)) * stem.value.time;
        } else {
          t = (Math.pow(0.5, -dotted) - 1) * result[result.length - 1].time;
        }
        result[result.length - 1].time += t;
        stem.value.time -= t;
        dotted = 0;
      }
      result.push(stem.value);
      index = stem.index;
    }
  }
  return result;
}
function parseStem(tokens, index) {
  var pitch = [];
  if (index < tokens.length && tokens[index] == '[') {
    index++;
    while (index < tokens.length && /[A-Ga-g]/.test(tokens[index])) {
      pitch.push(tokens[index++]);
    }
    if (tokens[index] != ']') {
      return null;
    }
    index++;
  } else if (index < tokens.length && /[A-Ga-g]/.test(tokens[index])) {
    pitch.push(tokens[index++]);
  } else if (/^[xzXZ]$/.test(tokens[index])) {
    // Rest - no pitch.
    index++;
  } else {
    return null;
  }
  var duration = '';
  if (tokens.length && /\d|\//.test(tokens[index])) {
    duration = tokens[index++];
  }
  return {
    index: index,
    value: {
      pitch: pitch,
      duration: duration,
      frequency: pitch.map(pitchToFrequency),
      time: durationToTime(duration)
    }
  }
}
function pitchToFrequency(pitch) {
  var m = /^(\^\^|\^|__|_|=|)([A-Ga-g])(,+|'+|)$/.exec(pitch);
  if (!m) { return null; }
  var n = {C:-9,D:-7,E:-5,F:-4,G:-2,A:0,B:2,c:3,d:5,e:7,f:8,g:10,a:12,b:14};
  var a = { '^^':2, '^':1, '': 0, '=':0, '_':-1, '__':-2 };
  var semitone = n[m[2]] + a[m[1]] + (/,/.test(m[3]) ? -12 : 12) * m[3].length;
  return 440 * Math.pow(2, semitone / 12);
}
function durationToTime(duration) {
  var m = /^(\d*)(?:\/(\d*))?$|^(\/+)$/.exec(duration), n, d;
  if (m[3]) return Math.pow(0.5, m[3].length);
  n = (m[1] ? parseFloat(m[1]) : 1);
  d = (m[2] ? parseFloat(m[2]) : /\//.test(duration) ? 2 : 1);
  return n / d;
}
function playABC(elem, args) {
  if (!isAudioPresent()) {
    if (elem) { $(elem).dequeue(); }
    return;
  }
  var atop = getAudioTop(),
      firstvoice = 0, argindex, voice, freqmult, beatsecs,
      volume = 0.5, tempo = 120, transpose = 0, type = ['square'],
      venv = {a: 0.01, d: 0.2, s: 0.1, r: 0.1}, envelope = [venv],
      start_time = null, end_time = atop.ac.currentTime,
      notes, vtype, time, fingers, strength, i, g, t,
      atime, slast, rtime, stime, dt, opts;
  if ($.isPlainObject(args[0])) {
    opts = args[0];
    if ('volume' in opts) { volume = opts.volume; }
    if ('tempo' in opts) { tempo = opts.tempo; }
    if ('transpose' in opts) { transpose = opts.transpose; }
    if ('type' in opts) { type = opts.type; }
    if ('envelope' in opts) {
      if ($.isArray(opts.envelope)) {
        envelope = []
        for (i = 0; i < opts.envelope.length; i++) {
          envelope.push($.extend({}, venv, opts.envelope[i]));
        }
      } else {
        $.extend(venv, opts.envelope);
      }
    }
    firstvoice = 1;
  }
  beatsecs = 60 / tempo;
  if (!$.isArray(type)) { type = [type]; }
  if (!$.isArray(volume)) { volume = [volume]; }
  if (!$.isArray(transpose)) { transpose = [transpose]; }
  for (argindex = firstvoice; argindex < args.length; argindex++) {
    voice = argindex - firstvoice;
    notes = parseABCNotes(args[argindex]);
    vtype = type[voice % type.length] || 'square';
    fingers = 0;
    for (i = 0; i < notes.length; i++) {
      fingers = Math.max(fingers, notes[i].frequency.length);
    }
    if (fingers == 0) { continue; }
    // Attenuate chorded voice so chorded power matches volume.
    strength = volume[voice % volume.length] / Math.sqrt(fingers);
    venv = envelope[voice % envelope.length];
    freqmult = Math.pow(2, transpose[voice % transpose.length] / 12);
    if (start_time === null) {
      start_time = atop.nextStartTime();
    }
    time = start_time;
    for (i = 0; i < notes.length; i++) {
      t = notes[i].time;
      if (notes[i].frequency.length > 0) {
        g = atop.ac.createGainNode();
        stime = t * beatsecs + time;
        atime = Math.min(t, venv.a) * beatsecs + time;
        rtime = Math.max(0, t + venv.r) * beatsecs + time;
        if (atime > rtime) { atime = rtime = (atime + rtime) / 2; }
        if (rtime < stime) { stime = rtime; rtime = t * beatsecs + time; }
        dt = venv.d * beatsecs;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(strength, atime);
        if ('setTargetAtTime' in g.gain) {
          // Current web audio spec.
          g.gain.setTargetAtTime(venv.s * strength, atime, dt);
        } else {
          // Early draft web audio spec.
          g.gain.setTargetValueAtTime(venv.s * strength, atime, dt);
        }
        slast = venv.s + (1 - venv.s) * Math.exp((atime - stime) / dt);
        g.gain.setValueAtTime(slast * strength, stime);
        g.gain.linearRampToValueAtTime(0, rtime);
        g.connect(atop.out);
        for (var x = 0; x < notes[i].frequency.length; x++) {
          var o = atop.ac.createOscillator();
          o.type = vtype;
          o.frequency.value = notes[i].frequency[x] * freqmult;
          o.connect(g);
          if ('start' in g) {
            // Current web audio spec.
            o.start(time);
            o.stop(rtime);
          } else {
            // Early draft web audio spec.
            o.noteOn(time);
            o.noteOff(rtime);
          }
        }
      }
      time += t * beatsecs;
    }
    end_time = Math.max(end_time, time);
  }
  function callDequeueWhenDone() {
    if (atop.ac.currentTime < end_time) {
      setTimeout(callDequeueWhenDone, (end_time - atop.ac.currentTime) * 1000);
    } else {
      $(elem).dequeue();
    }
  }
  if (elem) {
    callDequeueWhenDone();
  }
}


//////////////////////////////////////////////////////////////////////////
// SEE LOGGING SUPPORT
// A copy of see.js here.
//////////////////////////////////////////////////////////////////////////

// see.js version 0.2

var pulljQueryVersion = null;  // Disable auto-pull of jQuery

var seepkg = 'see'; // Defines the global package name used.
var version = '0.2';
var oldvalue = noteoldvalue(seepkg);
// Option defaults
var linestyle = 'position:relative;display:block;font-family:monospace;' +
  'word-break:break-all;margin-bottom:3px;padding-left:1em;';
var logdepth = 5;
var autoscroll = false;
var logelement = 'body';
var panel = true;
var see;  // defined below.
var paneltitle = '';
var logconsole = null;
var uselocalstorage = '_loghistory';
var panelheight = 100;
var currentscope = '';
var scopes = {
  '':  { e: window.eval, t: window },
  top: { e: window.eval, t: window }
};
var coffeescript = window.CoffeeScript;
var seejs = '(function(){return eval(arguments[0]);})';

function init(options) {
  if (arguments.length === 0) {
    options = {};
  } else if (arguments.length == 2) {
    var newopt = {};
    newopt[arguments[0]] = arguments[1];
    options = newopt;
  } else if (arguments.length == 1 && typeof arguments[0] == 'function') {
    options = {'eval': arguments[0]};
  }
  if (options.hasOwnProperty('jQuery')) { $ = options.jQuery; }
  if (options.hasOwnProperty('eval')) { scopes[''].e = options['eval']; }
  if (options.hasOwnProperty('this')) { scopes[''].t = options['this']; }
  if (options.hasOwnProperty('element')) { logelement = options.element; }
  if (options.hasOwnProperty('autoscroll')) { autoscroll = options.autoscroll; }
  if (options.hasOwnProperty('linestyle')) { linestyle = options.linestyle; }
  if (options.hasOwnProperty('depth')) { logdepth = options.depth; }
  if (options.hasOwnProperty('panel')) { panel = options.panel; }
  if (options.hasOwnProperty('height')) { panelheight = options.height; }
  if (options.hasOwnProperty('title')) { paneltitle = options.title; }
  if (options.hasOwnProperty('console')) { logconsole = options.console; }
  if (options.hasOwnProperty('history')) { uselocalstorage = options.history; }
  if (options.hasOwnProperty('coffee')) { coffeescript = options.coffee; }
  if (options.hasOwnProperty('abbreviate')) { abbreviate = options.abbreviate; }
  if (options.hasOwnProperty('consolehook')) { consolehook = options.consolehook; }
  if (options.hasOwnProperty('noconflict')) { noconflict(options.noconflict); }
  if (panel) {
    // panel overrides element and autoscroll.
    logelement = '#_testlog';
    autoscroll = '#_testscroll';
    pulljQuery(tryinitpanel);
  }
  return scope();
}

function scope(name, evalfuncarg, evalthisarg) {
  if (arguments.length <= 1) {
    if (!arguments.length) {
      name = '';
    }
    return seepkg + '.scope(' + cstring(name) + ',' + seejs + ',this)';
  }
  scopes[name] = { e: evalfuncarg, t: evalthisarg };
}

function seeeval(scope, code) {
  if (arguments.length == 1) {
    code = scope;
    scope = '';
  }
  var ef = scopes[''].e, et = scopes[''].t;
  if (scopes.hasOwnProperty(scope)) {
    if (scopes[scope].e) { ef = scopes[scope].e; }
    if (scopes[scope].t) { et = scopes[scope].t; }
  }
  return ef.call(et, code);
}

var varpat = '[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*';
var initialvardecl = new RegExp(
  '^\\s*var\\s+(?:' + varpat + '\\s*,\\s*)*' + varpat + '\\s*;\\s*');

function barecs(s) {
  // Compile coffeescript in bare mode.
  var compiler = coffeescript || window.CoffeeScript;
  var compiled = compiler.compile(s, {bare:1});
  if (compiled) {
    // Further strip top-level var decls out of the coffeescript so
    // that assignments can leak out into the enclosing scope.
    compiled = compiled.replace(initialvardecl, '');
  }
  return compiled;
}

function exportsee() {
  see.repr = repr;
  see.html = loghtml;
  see.noconflict = noconflict;
  see.init = init;
  see.scope = scope;
  see.eval = seeeval;
  see.barecs = barecs;
  see.here = 'eval(' + seepkg + '.init())';
  see.clear = seeclear;
  see.hide = seehide;
  see.show = seeshow;
  see.visible = seevisible;
  see.enter = seeenter;
  see.js = seejs;
  see.cs = '(function(){return eval(' + seepkg + '.barecs(arguments[0]));})';
  see.version = version;
  window[seepkg] = see;
}

function noteoldvalue(name) {
  return {
    name: name,
    has: window.hasOwnProperty(name),
    value: window[name]
  };
}

function restoreoldvalue(old) {
  if (!old.has) {
    delete window[old.name];
  } else {
    window[old.name] = old.value;
  }
}

function noconflict(newname) {
  if (!newname || typeof(newname) != 'string') {
    newname = 'see' + (1 + Math.random() + '').substr(2);
  }
  if (oldvalue) {
    restoreoldvalue(oldvalue);
  }
  seepkg = newname;
  oldvalue = noteoldvalue(newname);
  exportsee();
  return see;
}

function pulljQuery(callback) {
  if (!pulljQueryVersion || ($ && $.fn && $.fn.jquery)) {
    callback();
    return;
  }
  function loadscript(src, callback) {
    function setonload(script, fn) {
      script.onload = script.onreadystatechange = fn;
    }
    var script = document.createElement("script"),
       head = document.getElementsByTagName("head")[0],
       pending = 1;
    setonload(script, function() {
      if (pending && (!script.readyState ||
          {loaded:1,complete:1}[script.readyState])) {
        pending = 0;
        callback();
        setonload(script, null);
        head.removeChild(script);
      }
    });
    script.src = src;
    head.appendChild(script);
  }
  loadscript(
      '//ajax.googleapis.com/ajax/libs/jquery/' +
      pulljQueryVersion + '/jquery.min.js',
      function() {
    $ = jQuery.noConflict(true);
    callback();
  });
}

// ---------------------------------------------------------------------
// LOG FUNCTION SUPPORT
// ---------------------------------------------------------------------
var logcss = "input._log:focus{outline:none;}label._log > span:first-of-type:hover{text-decoration:underline;}samp._log > label._log,samp_.log > span > label._log{display:inline-block;vertical-align:top;}label._log > span:first-of-type{margin-left:2em;text-indent:-1em;}label._log > ul{display:none;padding-left:14px;margin:0;}label._log > span:before{content:'';font-size:70%;font-style:normal;display:inline-block;width:0;text-align:center;}label._log > span:first-of-type:before{content:'\\0025B6';}label._log > ul > li{display:block;white-space:pre-line;margin-left:2em;text-indent:-1em}label._log > ul > li > samp{margin-left:-1em;text-indent:0;white-space:pre;}label._log > input[type=checkbox]:checked ~ span{margin-left:2em;text-indent:-1em;}label._log > input[type=checkbox]:checked ~ span:first-of-type:before{content:'\\0025BC';}label._log > input[type=checkbox]:checked ~ span:before{content:'';}label._log,label._log > input[type=checkbox]:checked ~ ul{display:block;}label._log > span:first-of-type,label._log > input[type=checkbox]:checked ~ span{display:inline-block;}label._log > input[type=checkbox],label._log > input[type=checkbox]:checked ~ span > span{display:none;}";
var addedcss = false;
var cescapes = {
  '\0': '\\0', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r',
  '\t': '\\t', '\v': '\\v', "'": "\\'", '"': '\\"', '\\': '\\\\'
};
var retrying = null;
var queue = [];
see = function see() {
  if (logconsole && typeof(logconsole.log) == 'function') {
    logconsole.log.apply(window.console, arguments);
  }
  var args = Array.prototype.slice.call(arguments);
  queue.push('<samp class="_log">');
  while (args.length) {
    var obj = args.shift();
    if (vtype(obj) == 'String')  {
      // Logging a string just outputs the string without quotes.
      queue.push(htmlescape(obj));
    } else {
      queue.push(repr(obj, logdepth, queue));
    }
    if (args.length) { queue.push(' '); }
  }
  queue.push('</samp>');
  flushqueue();
};

function loghtml(html) {
  queue.push('<samp class="_log">');
  queue.push(html);
  queue.push('</samp>');
  flushqueue();
}

function vtype(obj) {
  var bracketed = Object.prototype.toString.call(obj);
  var vt = bracketed.substring(8, bracketed.length - 1);
  if (vt == 'Object') {
    if ('length' in obj && 'slice' in obj && 'number' == typeof obj.length) {
      return 'Array';
    }
    if ('originalEvent' in obj && 'target' in obj && 'type' in obj) {
      return vtype(obj.originalEvent);
    }
  }
  return vt;
}

function isprimitive(vt) {
  switch (vt) {
    case 'String':
    case 'Number':
    case 'Boolean':
    case 'Undefined':
    case 'Date':
    case 'RegExp':
    case 'Null':
      return true;
  }
  return false;
}

function isdom(obj) {
  return (obj.nodeType && obj.nodeName && typeof(obj.cloneNode) == 'function');
}

function midtruncate(s, maxlen) {
  if (maxlen && maxlen > 3 && s.length > maxlen) {
    return s.substring(0, Math.floor(maxlen / 2) - 1) + '...' +
        s.substring(s.length - (Math.ceil(maxlen / 2) - 2));
  }
  return s;
}

function cstring(s, maxlen) {
  function cescape(c) {
    if (cescapes.hasOwnProperty(c)) {
      return cescapes[c];
    }
    var temp = '0' + c.charCodeAt(0).toString(16);
    return '\\x' + temp.substring(temp.length - 2);
  }
  if (s.indexOf('"') == -1 || s.indexOf('\'') != -1) {
    return midtruncate('"' +
        htmlescape(s.replace(/[\0-\x1f\x7f-\x9f"\\]/g, cescape)) + '"', maxlen);
  } else {
    return midtruncate("'" +
        htmlescape(s.replace(/[\0-\x1f\x7f-\x9f'\\]/g, cescape)) + "'", maxlen);
  }
}
function tiny(obj, maxlen) {
  var vt = vtype(obj);
  if (vt == 'String') { return cstring(obj, maxlen); }
  if (vt == 'Undefined' || vt == 'Null') { return vt.toLowerCase(); }
  if (isprimitive(vt)) { return '' + obj; }
  if (vt == 'Array' && obj.length === 0) { return '[]'; }
  if (vt == 'Object' && isshort(obj)) { return '{}'; }
  if (isdom(obj) && obj.nodeType == 1) {
    if (obj.hasAttribute('id')) {
      return obj.tagName.toLowerCase() +
          '#' + htmlescape(obj.getAttribute('id'));
    } else {
      if (obj.hasAttribute('class')) {
        var classname = obj.getAttribute('class').split(' ')[0];
        if (classname) {
          return obj.tagName.toLowerCase() + '.' + htmlescape(classname);
        }
      }
      return obj.tagName.toLowerCase();
    }
  }
  return vt;
}
function isnonspace(dom) {
  return (dom.nodeType != 3 || /[^\s]/.exec(dom.textContent));
}
function trimemptystartline(s) {
  return s.replace(/^\s*\n/, '');
}
function isshort(obj, shallow, maxlen) {
  var vt = vtype(obj);
  if (isprimitive(vt)) { return true; }
  if (!shallow && vt == 'Array') { return !maxlen || obj.length <= maxlen; }
  if (isdom(obj)) {
    if (obj.nodeType == 9 || obj.nodeType == 11) return false;
    if (obj.nodeType == 1) {
      return (obj.firstChild === null ||
         obj.firstChild.nextSibling === null &&
         obj.firstChild.nodeType == 3 &&
         obj.firstChild.textContent.length <= maxlen);
    }
    return true;
  }
  if (vt == 'Function') {
    var sc = obj.toString();
    return (sc.length - sc.indexOf('{') <= maxlen);
  }
  if (vt == 'Error') {
    return !!obj.stack;
  }
  var count = 0;
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      count += 1;
      if (shallow && !isprimitive(vtype(obj[prop]))) { return false; }
      if (maxlen && count > maxlen) { return false; }
    }
  }
  return true;
}
function domsummary(dom, maxlen) {
  var short;
  if ('outerHTML' in dom) {
    short = isshort(dom, true, maxlen);
    var html = dom.cloneNode(short).outerHTML;
    var tail = null;
    if (!short) {
      var m = /^(.*)(<\/[^\s]*>$)/.exec(html);
      if (m) {
        tail = m[2];
        html = m[1];
      }
    }
    return [htmlescape(html), tail && htmlescape(tail)];
  }
  if (dom.nodeType == 1) {
    var parts = ['<' + dom.tagName];
    for (var j = 0; j < dom.attributes.length; ++j) {
      parts.push(domsummary(dom.attributes[j], maxlen)[0]);
    }
    short = isshort(dom, true, maxlen);
    if (short && dom.firstChild) {
      return [htmlescape(parts.join(' ') + '>' +
          dom.firstChild.textContent + '</' + dom.tagName + '>'), null];
    }
    return [htmlescape(parts.join(' ') + (dom.firstChild? '>' : '/>')),
        !dom.firstChild ? null : htmlescape('</' + dom.tagName + '>')];
  }
  if (dom.nodeType == 2) {
    return [htmlescape(dom.name + '="' +
        htmlescape(midtruncate(dom.value, maxlen), '"') + '"'), null];
  }
  if (dom.nodeType == 3) {
    return [htmlescape(trimemptystartline(dom.textContent)), null];
  }
  if (dom.nodeType == 4) {
    return ['<![CDATA[' + htmlescape(midtruncate(dom.textContent, maxlen)) +
        ']]>', null];
  }
  if (dom.nodeType == 8) {
    return ['<!--' + htmlescape(midtruncate(dom.textContent, maxlen)) +
        '-->', null];
  }
  if (dom.nodeType == 10) {
    return ['<!DOCTYPE ' + htmlescape(dom.nodeName) + '>', null];
  }
  return [dom.nodeName, null];
}
function summary(obj, maxlen) {
  var vt = vtype(obj);
  if (isprimitive(vt)) {
    return tiny(obj, maxlen);
  }
  if (isdom(obj)) {
    var ds = domsummary(obj, maxlen);
    return ds[0] + (ds[1] ? '...' + ds[1] : '');
  }
  if (vt == 'Function') {
    var ft = obj.toString();
    if (ft.length - ft.indexOf('{') > maxlen) {
      ft = ft.replace(/\{(?:.|\n)*$/, '').trim();
    }
    return ft;
  }
  if ((vt == 'Error' || vt == 'ErrorEvent') && 'message' in obj) {
    return obj.message;
  }
  var pieces = [];
  if (vt == 'Array' && obj.length < maxlen) {
    var identical = (obj.length > 1);
    var firstobj = identical && obj[0];
    for (var j = 0; j < obj.length; ++j) {
      if (identical && obj[j] !== firstobj) { identical = false; }
      pieces.push(tiny(obj[j], maxlen));
    }
    if (identical) {
      return '[' + tiny(firstobj, maxlen) + '] \xd7 ' + obj.length;
    }
    return '[' + pieces.join(', ') + ']';
  } else if (isshort(obj, false, maxlen)) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        pieces.push(quotekey(key) + ': ' + tiny(obj[key], maxlen));
      }
    }
    return (vt == 'Object' ? '{' : vt + '{') + pieces.join(', ') + '}';
  }
  if (vt == 'Array') { return 'Array(' + obj.length + ')'; }
  return vt;
}
function quotekey(k) {
  if (/^\w+$/.exec(k)) { return k; }
  return cstring(k);
}
function htmlescape(s, q) {
  var pat = /[<>&]/g;
  if (q) { pat = new RegExp('[<>&' + q + ']', 'g'); }
  return s.replace(pat, function(c) {
    return c == '<' ? '&lt;' : c == '>' ? '&gt;' : c == '&' ? '&amp;' :
           c == '"' ? '&quot;' : '&#' + c.charCodeAt(0) + ';';
  });
}
function unindented(s) {
  s = s.replace(/^\s*\n/, '');
  var leading = s.match(/^\s*\S/mg);
  var spaces = leading.length && leading[0].length - 1;
  var j = 1;
  // If the block begins with a {, ignore those spaces.
  if (leading.length > 1 && leading[0].trim() == '{') {
    spaces = leading[1].length - 1;
    j = 2;
  }
  for (; j < leading.length; ++j) {
    spaces = Math.min(leading[j].length - 1, spaces);
    if (spaces <= 0) { return s; }
  }
  var removal = new RegExp('^\\s{' + spaces + '}', 'mg');
  return s.replace(removal, '');
}
function expand(prefix, obj, depth, output) {
  output.push('<label class="_log"><input type="checkbox"><span>');
  if (prefix) { output.push(prefix); }
  if (isdom(obj)) {
    var ds = domsummary(obj, 10);
    output.push(ds[0]);
    output.push('</span><ul>');
    for (var node = obj.firstChild; node; node = node.nextSibling) {
      if (isnonspace(node)) {
        if (node.nodeType == 3) {
          output.push('<li><samp>');
          output.push(unindented(node.textContent));
          output.push('</samp></li>');
        } else if (isshort(node, true, 20) || depth <= 1) {
          output.push('<li>' + summary(node, 20) + '</li>');
        } else {
          expand('', node, depth - 1, output);
        }
      }
    }
    output.push('</ul>');
    if (ds[1]) {
      output.push('<span>');
      output.push(ds[1]);
      output.push('</span>');
    }
    output.push('</label>');
  } else {
    output.push(summary(obj, 10));
    output.push('</span><ul>');
    var vt = vtype(obj);
    if (vt == 'Function') {
      var ft = obj.toString();
      var m = /\{(?:.|\n)*$/.exec(ft);
      if (m) { ft = m[0]; }
      output.push('<li><samp>');
      output.push(htmlescape(unindented(ft)));
      output.push('</samp></li>');
    } else if (vt == 'Error') {
      output.push('<li><samp>');
      output.push(htmlescape(obj.stack));
      output.push('</samp></li>');
    } else if (vt == 'Array') {
      for (var j = 0; j < Math.min(100, obj.length); ++j) {
        try {
          val = obj[j];
        } catch(e) {
          val = e;
        }
        if (isshort(val, true, 20) || depth <= 1 || vtype(val) == 'global') {
          output.push('<li>' + j + ': ' + summary(val, 100) + '</li>');
        } else {
          expand(j + ': ', val, depth - 1, output);
        }
      }
      if (obj.length > 100) {
        output.push('<li>length=' + obj.length + ' ...</li>');
      }
    } else {
      var count = 0;
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          count += 1;
          if (count > 100) { continue; }
          var val;
          try {
            val = obj[key];
          } catch(e) {
            val = e;
          }
          if (isshort(val, true, 20) || depth <= 1 || vtype(val) == 'global') {
            output.push('<li>');
            output.push(quotekey(key));
            output.push(': ');
            output.push(summary(val, 100));
            output.push('</li>');
          } else {
            expand(quotekey(key) + ': ', val, depth - 1, output);
          }
        }
      }
      if (count > 100) {
        output.push('<li>' + count + ' properties total...</li>');
      }
    }
    output.push('</ul></label>');
  }
}
function initlogcss() {
  if (!addedcss && !window.document.getElementById('_logcss')) {
    var style = window.document.createElement('style');
    style.id = '_logcss';
    style.innerHTML = (linestyle ? 'samp._log{' +
        linestyle + '}' : '') + logcss;
    window.document.head.appendChild(style);
    addedcss = true;
  }
}
function repr(obj, depth, aoutput) {
  depth = depth || 3;
  var output = aoutput || [];
  var vt = vtype(obj);
  if (vt == 'Error' || vt == 'ErrorEvent') {
    output.push('<span style="color:red;">');
    expand('', obj, depth, output);
    output.push('</span>');
  } else if (isprimitive(vt)) {
    output.push(tiny(obj));
  } else if (isshort(obj, true, 100) || depth <= 0) {
    output.push(summary(obj, 100));
  } else {
    expand('', obj, depth, output);
  }
  if (!aoutput) {
    return output.join('');
  }
}
function aselement(s, def) {
  switch (typeof s) {
    case 'string':
      if (s == 'body') { return document.body; }
      if (document.querySelector) { return document.querySelector(s); }
      if ($) { return $(s)[0]; }
      return null;
    case 'undefined':
      return def;
    case 'boolean':
      if (s) { return def; }
      return null;
    default:
      return s;
  }
  return null;
}
function stickscroll() {
  var stick = false, a = aselement(autoscroll, null);
  if (a) {
    stick = a.scrollHeight - a.scrollTop - 10 <= a.clientHeight;
  }
  if (stick) {
    return (function() {
      a.scrollTop = a.scrollHeight - a.clientHeight;
    });
  } else {
    return (function() {});
  }
}
function flushqueue() {
  var elt = aselement(logelement, null);
  if (elt && elt.appendChild && queue.length) {
    initlogcss();
    var temp = window.document.createElement('samp');
    temp.innerHTML = queue.join('');
    queue.length = 0;
    var complete = stickscroll();
    while ((child = temp.firstChild)) {
      elt.appendChild(child);
    }
    complete();
  }
  if (!retrying && queue.length) {
    retrying = setTimeout(function() { timer = null; flushqueue(); }, 100);
  } else if (retrying && !queue.length) {
    clearTimeout(retrying);
    retrying = null;
  }
}

// ---------------------------------------------------------------------
// TEST PANEL SUPPORT
// ---------------------------------------------------------------------
var addedpanel = false;
var inittesttimer = null;
var abbreviate = [{}.undefined];
var consolehook = null;

function seehide() {
  $('#_testpanel').hide();
}
function seeshow() {
  $('#_testpanel').show();
}
function seevisible() {
  return $('#_testpanel').is(':visible');
}
function seeenter(text) {
  $('#_testinput').val(text);
}
function seeclear() {
  if (!addedpanel) { return; }
  $('#_testlog').find('._log').not('#_testpaneltitle').remove();
}
function promptcaret(color) {
  return '<samp style="position:absolute;left:0;font-size:120%;color:' + color +
      ';">&gt;</samp>';
}
function getSelectedText(){
    if(window.getSelection) { return window.getSelection().toString(); }
    else if(document.getSelection) { return document.getSelection(); }
    else if(document.selection) {
        return document.selection.createRange().text; }
}
function formattitle(title) {
  return '<samp class="_log" id="_testpaneltitle" style="font-weight:bold;">' +
      title + '</samp>';
}
function readlocalstorage() {
  if (!uselocalstorage) {
    return;
  }
  var state = { height: panelheight, history: [] };
  try {
    var result = window.JSON.parse(window.localStorage[uselocalstorage]);
    if (result && result.slice && result.length) {
      // if result is an array, then it's just the history.
      state.history = result;
      return state;
    }
    $.extend(state, result);
  } catch(e) {
  }
  return state;
}
function updatelocalstorage(state) {
  if (!uselocalstorage) {
    return;
  }
  var stored = readlocalstorage(), changed = false;
  if ('history' in state &&
      state.history.length &&
      (!stored.history.length ||
      stored.history[stored.history.length - 1] !==
      state.history[state.history.length - 1])) {
    stored.history.push(state.history[state.history.length - 1]);
    changed = true;
  }
  if ('height' in state && state.height !== stored.height) {
    stored.height = state.height;
    changed = true;
  }
  if (changed) {
    window.localStorage[uselocalstorage] = window.JSON.stringify(stored);
  }
}
function wheight() {
  return window.innerHeight || $(window).height();
}
function tryinitpanel() {
  if (addedpanel) {
    if (paneltitle) {
      if ($('#_testpaneltitle').length) {
        $('#_testpaneltitle').html(paneltitle);
      } else {
        $('#_testlog').prepend(formattitle(paneltitle));
      }
    }
    $('#_testpanel').show();
  } else {
    if (!window.document.getElementById('_testlog') && window.document.body) {
      initlogcss();
      var state = readlocalstorage();
      var titlehtml = (paneltitle ? formattitle(paneltitle) : '');
      if (state.height > wheight() - 50) {
        state.height = Math.min(wheight(), Math.max(10, wheight() - 50));
      }
      $('body').prepend(
        '<samp id="_testpanel" style="overflow:hidden;z-index:99;' +
            'position:fixed;bottom:0;left:0;width:100%;height:' + state.height +
            'px;background:rgba(240,240,240,0.8);' +
            'font:10pt monospace;' +
            // This last bit works around this position:fixed bug in webkit:
            // https://code.google.com/p/chromium/issues/detail?id=128375
            '-webkit-transform:translateZ(0);">' +
          '<samp id="_testdrag" style="' +
              'cursor:row-resize;height:6px;width:100%;' +
              'display:block;background:lightgray"></samp>' +
          '<samp id="_testscroll" style="overflow-y:scroll;overflow-x:hidden;' +
             'display:block;width:100%;height:' + (state.height - 6) + 'px;">' +
            '<samp id="_testlog" style="display:block">' +
            titlehtml + '</samp>' +
            '<samp style="position:relative;display:block;">' +
            promptcaret('blue') +
            '<input id="_testinput" class="_log" style="width:100%;' +
                'padding-left:1em;margin:0;border:0;font:inherit;' +
                'background:rgba(255,255,255,0.8);">' +
           '</samp>' +
        '</samp>');
      addedpanel = true;
      flushqueue();
      var historyindex = 0;
      var historyedited = {};
      $('#_testinput').on('keydown', function(e) {
        if (e.which == 13) {
          // Handle the Enter key.
          var text = $(this).val();
          $(this).val('');
          // Save (nonempty, nonrepeated) commands to history and localStorage.
          if (text.trim().length &&
              (!state.history.length ||
               state.history[state.history.length - 1] !== text)) {
            state.history.push(text);
            updatelocalstorage({ history: [text] });
          }
          // Reset up/down history browse state.
          historyedited = {};
          historyindex = 0;
          // Copy the entered prompt into the log, with a grayed caret.
          loghtml('<samp class="_log" style="margin-left:-1em;">' +
                  promptcaret('lightgray') +
                  htmlescape(text) + '</samp>');
          $(this).select();
          // Deal with the ":scope" command
          if (text.trim().length && text.trim()[0] == ':') {
            var scopename = text.trim().substring(1).trim();
            if (!scopename || scopes.hasOwnProperty(scopename)) {
              currentscope = scopename;
              var desc = scopename ? 'scope ' + scopename : 'default scope';
              loghtml('<span style="color:blue">switched to ' + desc + '</span>');
            } else {
              loghtml('<span style="color:red">no scope ' + scopename + '</span>');
            }
            return;
          }
          // Actually execute the command and log the results (or error).
          var hooked = false;
          try {
            var result;
            try {
              result = seeeval(currentscope, text);
            } finally {
              if (consolehook && consolehook(text, result)) {
                hooked = true;
              } else {
                // Show the result (unless abbreviated).
                for (var j = abbreviate.length - 1; j >= 0; --j) {
                  if (result === abbreviate[j]) break;
                }
                if (j < 0) {
                  loghtml(repr(result));
                }
              }
            }
          } catch (e) {
            // Show errors (unless hooked).
            if (!hooked) {
              see(e);
            }
          }
        } else if (e.which == 38 || e.which == 40) {
          // Handle the up and down arrow keys.
          // Stow away edits in progress (without saving to history).
          historyedited[historyindex] = $(this).val();
          // Advance the history index up or down, pegged at the boundaries.
          historyindex += (e.which == 38 ? 1 : -1);
          historyindex = Math.max(0, Math.min(state.history.length,
              historyindex));
          // Show the remembered command at that slot.
          var newval = historyedited[historyindex] ||
              state.history[state.history.length - historyindex];
          if (typeof newval == 'undefined') { newval = ''; }
          $(this).val(newval);
          this.selectionStart = this.selectionEnd = newval.length;
          e.preventDefault();
        }
      });
      $('#_testdrag').on('mousedown', function(e) {
        var drag = this,
            dragsum = $('#_testpanel').height() + e.pageY,
            barheight = $('#_testdrag').height(),
            dragwhich = e.which,
            dragfunc;
        if (drag.setCapture) { drag.setCapture(true); }
        dragfunc = function dragresize(e) {
          if (e.type != 'blur' && e.which == dragwhich) {
            var winheight = wheight();
            var newheight = Math.max(barheight, Math.min(winheight,
                dragsum - e.pageY));
            var complete = stickscroll();
            $('#_testpanel').height(newheight);
            $('#_testscroll').height(newheight - barheight);
            complete();
          }
          if (e.type == 'mouseup' || e.type == 'blur' ||
              e.type == 'mousemove' && e.which != dragwhich) {
            $(window).off('mousemove mouseup blur', dragfunc);
            if (document.releaseCapture) { document.releaseCapture(); }
            if ($('#_testpanel').height() != state.height) {
              state.height = $('#_testpanel').height();
              updatelocalstorage({ height: state.height });
            }
          }
        };
        $(window).on('mousemove mouseup blur', dragfunc);
        return false;
      });
      $('#_testpanel').on('mouseup', function(e) {
        if (getSelectedText()) { return; }
        // Focus without scrolling.
        var scrollpos = $('#_testscroll').scrollTop();
        $('#_testinput').focus();
        $('#_testscroll').scrollTop(scrollpos);
      });
    }
  }
  if (inittesttimer && addedpanel) {
    clearTimeout(inittesttimer);
  } else if (!addedpanel && !inittesttimer) {
    inittesttimer = setTimeout(tryinitpanel, 100);
  }
}

eval("scope('jquery-turtle', " + seejs + ", this)");

})(jQuery);
