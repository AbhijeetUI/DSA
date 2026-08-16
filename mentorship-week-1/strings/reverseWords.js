/*
Given a string s, find a way to reverse the order of the words in the given string.

Note: string may contain leading or trailing dots(.) or multiple trailing dots(.) between two words. The returned string should only have a single dot(.) separating the words.

Input: s = "i.like.this.program.very.much" 
Output: much.very.program.this.like.i
Explanation: The words in the input string are reversed while maintaining the dots as separators, resulting in "much.very.program.this.like.i".

Input: s = ”..geeks..for.geeks.” 
Output: geeks.for.geeks

Input: s = "...home......"
Output: home
*/

function reverseWords(str) {
  // Two-pointer scan: one pointer advances over the string,
  // while the second pointer marks the current word boundary.
  const words = [];
  let start = 0;

  for (let end = 0; end <= str.length; end++) {
    if (str[end] === "." || end === str.length) {
      if (start < end) {
        const word = str.slice(start, end);
        if (word.length > 0) {
          words.push(word);
        }
      }
      start = end + 1;
    }
  }

  // Two-pointer reversal on the collected word list.
  let left = 0;
  let right = words.length - 1;

  while (left < right) {
    [words[left], words[right]] = [words[right], words[left]];
    left++;
    right--;
  }

  return words.join(".");
}

/*
Dry run for "i.like.this.program.very.much":
Input:  i.like.this.program.very.much
Scan with start/end pointers:
  - capture 'i' between 0 and 1
  - capture 'like' between dots
  - capture 'this'
  - capture 'program'
  - capture 'very'
  - capture 'much'
Resulting words array: ['i', 'like', 'this', 'program', 'very', 'much']
Now reverse with two pointers:
  left = 0, right = 5
  swap i <-> much -> ['much', 'like', 'this', 'program', 'very', 'i']
  left = 1, right = 4
  swap like <-> very -> ['much', 'very', 'this', 'program', 'like', 'i']
  left = 2, right = 3
  swap this <-> program -> ['much', 'very', 'program', 'this', 'like', 'i']
  left = 3, right = 2 -> stop
Return: 'much.very.program.this.like.i'

Dry run for "..geeks..for.geeks.":
Input:  ..geeks..for.geeks.
Scan with start/end pointers:
  - skip two leading dots
  - capture 'geeks' between dots
  - skip empty dot-run
  - capture 'for'
  - capture 'geeks'
Resulting words array: ['geeks', 'for', 'geeks']
Now reverse with two pointers:
  left = 0, right = 2
  swap geeks <-> geeks -> ['geeks', 'for', 'geeks']
  left = 1, right = 1 -> stop
Return: 'geeks.for.geeks'

Dry run for '...home......':
Input:  ...home......
Scan extracts only the non-empty word 'home'
words = ['home']
left = 0, right = 0 -> no swap
Return: 'home'
*/

console.log(reverseWords("i.like.this.program.very.much"));
console.log(reverseWords(".geeks..for.geeks."));
console.log(reverseWords("...home......"));
