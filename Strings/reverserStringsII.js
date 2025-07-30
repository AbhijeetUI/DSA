// https://leetcode.com/problems/reverse-string-ii/

/**
 * @param {string} s
 * @param {number} k
 * @return {string}
 */
var reverseStr = function (s, k) {
  s = s.split("");

  for (let x = 0; x < s.length; x = x + 2 * k) {
    let n = k;
    // reverse first k elements, starting from x
    let mid = Math.floor(k / 2); // loop run till k/2
    for (let i = 0; i < mid; i = i + k) {
      let temp = s[x + i];
      s[x + i] = s[x + n - 1 - i];
      s[x + n - 1 - i] = temp;
    }
  }
  return s.join("");
};

/*
Index:    0   1   2   3   4   5   6
Chars:    a   b   c   d   e   f   g

Iteration 1

Before swap:   a   b   c   d   e   f   g
                 ^       ^
              (x+i)   (x+n-1-i)
Swap:            a <-> b

After swap:    b   a   c   d   e   f   g
 
Iteration 2

Before swap:   b   a   c   d   e   f   g
                             ^       ^
                          (x+i)   (x+n-1-i)
Swap:                        e <-> f

After swap:    b   a   c   d   f   e   g

time complexity O(n) => even 2 loops. bcoz loops not run n * n
space complexity O(n) => bcoz you're creating an array
space complexity O(1) => if not converting to array
*/
