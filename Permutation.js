/* This class represents a permutation, and encapsulates
 * some useful behaviors for dealing with them, such as
 * cloning and toString.
 *
 * Now, you can compose permutations with .compose(), and 
 * intialize them from cycle notation with Permutation.fromCycleString().
 * 
 * The cycles of a permutation can be accessed with the .cycles property,
 * which is a lazy initializer pattern which returns an array of subcycles,
 * each of which is an array.
 *
 * The .toCycleString() method prints a nice cycle representation of the permutation.
 *
 * I still need to find a nice way of making these permutations immutable, though,
 * since changing the value of any of their indicies would break the class.
 */


//
// Array Utilities required for Permutation.js
//
Array.prototype.hasDuplicates = function() {
  var counts = {};
  for (var i = 0; i < this.length; ++i) {
    if (counts[this[i]] === undefined) {
      counts[this[i]] = 0;
    } 
    ++counts[this[i]];
  }

  for (var key in counts) {
    if (counts[key] >= 2) {
      return true;
    }
  }
  return false;
}
//
// An easy foreach construct with Arrays. Functions
// passed to be executed are passed two arguments,
// func(value, index), for each element in the array.
Array.prototype.forEach = function(func) {
  for (var i = 0; i < this.length; ++i) {
    func(this[i], i);
  }
}


//
// Permutation Helpers
//

function validatePermutationArray(arr) {
  if (arr.hasDuplicates()) {
    if (console) {
      console.error("The array passed to initialize the permutation " +
          "contained duplicates, thus it does not correspond to a 1-1 function.");
    }
    return false;
  }
  else {
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] > MAX_ALLOWED_PERMUTATION_INDEX ||
          arr[i] < PERMUTATION_INDEX) {
        if (console) {
          console.error("The array passed to initialize the permutation " +
              "had the element " + arr[i] + " which was either too high or low.");
        }
        return false;
      }
    }
  }

  return true;
}

//
// Permutation Class
//

Permutation = function(arr) {
  // if the array passed isn't suitable, just leave
  if (!validatePermutationArray(arr)) {
    return undefined;
  }

  var _length = arr.length;
  // I'd prefer this to be readonly
  this.__defineGetter__("length", function() {
    return _length;
  });

  for (var i = 0; i < arr.length; ++i) {
    this[PERMUTATION_INDEX + i] = arr[i];
  }

  var _cycles = undefined;
  var getCycles = function(perm) {
    var already_used = {};

    var cycles = [];

    for (var i = 0; i < perm.length; ++i) {
      if (perm[i] != i && already_used[i] == undefined) {
        var curr_cycle = [i];
        already_used[i] = true;

        var j = perm[i];
        while (j != i) {
          curr_cycle.push(j);
          already_used[j] = true;
          j = perm[j];
        }

        cycles.push(curr_cycle);
      } 
    }

    return cycles;
  }
  this.__defineGetter__("cycles", function() {
    if (_cycles == undefined) {
      _cycles = getCycles(this);
    }

    return _cycles;
  });
}

Permutation.fromFunction = function(func, n) {
  var arr = [];

  for (var i = 0; i < n; ++i) {
    arr.push(func(i));
  }

  return new Permutation(arr);
}

Permutation.getIdentity = function(n) {
  return Permutation.fromFunction(function(i) { return i + PERMUTATION_INDEX; }, n);
}

Permutation.prototype.toString = function() {
  var total = [];

  for (var i = PERMUTATION_INDEX; i < this.length + PERMUTATION_INDEX; ++i) {
    total.push(Permutation.getChar(this[i]));
  }

  return total.join('');
}

Permutation.prototype.toCycleString = function() {
  var result = "";

  for (var i = 0; i < this.cycles.length; ++i) {
    result += '(' + this.cycles[i].join('') + ')';
  }

  return result;
}

Permutation.prototype.clone = function() {
  var clone_arr = [];

  for (var i = PERMUTATION_INDEX; i < this.length + PERMUTATION_INDEX; ++i) {
    clone_arr.push(this[i]);
  }

  return new Permutation(clone_arr);
}

Permutation.prototype.at = function(i) {
  return this[i+PERMUTATION_INDEX];
}

// Returns a new Permutation consisting of theta
// composed with this, i.e. this(theta)
Permutation.prototype.compose = function(theta) {
  if (theta.length != this.length) {
    return undefined;
  }

  var arr = [];

  for (var i = 0; i < this.length; ++i) {
    arr[i] = this[theta[i]];
  }

  return new Permutation(arr);
}

Permutation.equals = function(left, right) {
  for (var i = 0; i < this.length; ++i) {
    if (left.at(i) != right.at(i)) {
      return false;
    }
  }

  return true;
}
Permutation.prototype.equals = function(right) {
  return Permutation.equals(this, right);
}

var C0 = '0'.charCodeAt(0);
var C9 = '9'.charCodeAt(0);

var CA = 'A'.charCodeAt(0);
var CZ = 'Z'.charCodeAt(0);

// Controls whether permutations
// are indexed with the first element at 0 or 1.
// Also controls the string version of permutations.
var PERMUTATION_INDEX = 0;

// Represents the highest number that can be
// represented in a single character in a permutation.
// Currently 35, which is represented by 'Z'
var MAX_ALLOWED_PERMUTATION_INDEX = 35;
// Gets the character used to represent the given
// number in a string version of a permutation, according
// to the following pattern:
//    If i = 0..9, then return '0'..'9' 
//    If i = 10..35 then return 'A'..'Z'
Permutation.getChar = function(i) {
  if (i >= 0 && i <= 9) {
    return String.fromCharCode(C0 + i);
  } else if (i <= MAX_ALLOWED_PERMUTATION_INDEX) {
    return String.fromCharCode(CA + (i - 10));
  } else {
    if (console) {
      console.error("getChar could not represent the integer " + i +
          " in a single character. The max allowable is " + 
          MAX_ALLOWED_PERMUTATION_INDEX + ".");
    }
  }
}

Permutation.parseChar = function(c) {
  var i = c.charCodeAt(0);
  if (i >= C0 && i <= C9) {
    return (i - C0);
  } else if (i >= CA && i <= CZ) {
    return ((i + 10) - CA);
  } else {
    if (console) {
      console.error("parseChar could not parse the character '" + c + "'.");
    }
  }
}

Permutation.fromString = function(s) {
  if (s.indexOf('(') >= 0) {
    // if this is a cycle string, pass it to the cycle string
    // parsing function
    return Permutation.fromCycleString(s);
  } else {
    var arr = [];

    var max_char = 0; // gets 
    for (var i = 0; i < s.length; ++i) {
      var curr_char = Permutation.parseChar(s[i]);
      if (curr_char > max_char) {
        max_char = curr_char;
      }
    }

    for (var j = 0; j <= max_char; ++j) {
      if (j < s.length) {
        arr.push(Permutation.parseChar(s[j]));
      } else {
        arr.push(j);
      }
    }

    return new Permutation(arr);
  }
}

Permutation.fromCycleString = function(s, n) {
  function splitCycles(s) {
    var result = [];

    for (var i = s.indexOf('('); i>=0; i = s.indexOf('(', i+1)) {
      var j = s.indexOf(')', i);
      if (j > 0 && j > i + 2) {
        result.push(s.substring(i+1,j));
      }
    }

    return result;
  }
  function followCycles(cycles, char) {
    var value = char;
    for (var i = cycles.length - 1; i >= 0; --i) {
      var index = cycles[i].indexOf(value);
      if (index >= 0) {
        if (index < cycles[i].length - 1) {
          value = cycles[i][index+1];
        } else {
          value = cycles[i][0];
        }
      }
    }

    return value;
  }

  function getHighestChar(cycles) {
    var highest = 0;

    for (var i = 0; i < cycles.length; ++i) {
      for (var j = 0; j < cycles[i].length; ++j) {
        var curr_code = Permutation.parseChar(cycles[i][j]);
        if (curr_code > highest) {
          highest = curr_code;
        }
      }
    }

    return highest;
  }

  var splits = splitCycles(s);
  if (n == undefined) {
    n = getHighestChar(splits);
  }

  var arr = [];
  for (var i = 0; i <= n; ++i) {
    arr.push(Permutation.parseChar(followCycles(splits, Permutation.getChar(i))));
  }
  
  return new Permutation(arr);
}
