/* This class represents a permutation, and encapsulates
 * some useful behaviors for dealing with them, such as
 * cloning and toString.
 * 
 * Coming Soon:
 *  - Cycle notation compatibility, both through a
 *  Permutation.fromCycleString function and a .toCycleString
 *  function. These will be compatible with nondisjoint permutations.
 *  - Permutation composition, resulting in a new permutation,
 *  to be implemented with a .compose function.
 *  - A .cycles property which consists in an array of cycles
 *  of this permutation, indexed by element. Thus .cycles[0] gives
 *  the cycle containing 0.
 *
 *
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
    total.push(this.getChar(this[i]));
  }

  return total.join('');
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
Permutation.prototype.getChar = function(i) {
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
