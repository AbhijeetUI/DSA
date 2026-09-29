/*
Main idea
 - If you see an opening bracket, push it onto the stack
 - If you see a closing bracket, pop the top
 - Check whether it matches the correct closing bracket
 - If it does not match, return false
 - At the end, the stack must be empty
*/
var isValid = function (s) {
  let stack = [];
  const map = {
    "{": "}",
    "[": "]",
    "(": ")",
  };
  for (let i = 0; i < s.length; i++) {
    if (map[s[i]]) {
      //if(s[i] === "(" || s[i]=== "[" || s[i] === "{"){
      stack.push(s[i]);
    } else {
      let top = stack.pop(); // to handle [()]} here stack is empty when we are at } bracket
      // (top === "[" && s[i] !== "]") || (top === "(" && s[i] !== ")") || (top === "{" && s[i] !== "}")
      if (!top || s[i] !== map[top]) return false;
      //“If there is no opening bracket to match, or
      // if the current closing bracket is not the correct match for the most recent opening bracket,
      // then the parentheses are invalid.”
    }
  }
  return stack.length === 0;
};

console.log(isValid("([{}])"));
console.log(isValid("()]"));

/*
    - Time complexity = O(n) => use 1 loop to traverse the string
    - Space complexity = O(n) => extra space of stack and it goes as n
*/
/*
DRY RUN 1: "([{}])"
stack = []

i = 0, s[0] = '('
- '(' is an opening bracket
- push '(' into stack
- stack = ['(']

i = 1, s[1] = '['
- push '['
- stack = ['(', '[']

i = 2, s[2] = '{'
- push '{'
- stack = ['(', '[', '{']

i = 3, s[3] = '}'
- '}' is a closing bracket, so pop the top = '{'
- check if map['{'] === '}'
- yes, it matches
- stack = ['(', '[']

i = 4, s[4] = ']'
- pop top = '['
- check if map['['] === ']'
- yes, it matches
- stack = ['(']

i = 5, s[5] = ')'
- pop top = '('
- check if map['('] === ')'
- yes, it matches
- stack = []

At the end, stack is empty, so the string is valid.

DRY RUN 2: "()]"
stack = []

i = 0, s[0] = '('
- push '('
- stack = ['(']

i = 1, s[1] = ')'
- pop top = '('
- check if map['('] === ')'
- yes, it matches
- stack = []

i = 2, s[2] = ']'
- ']' is a closing bracket, but stack is empty
- top = undefined
- condition fails
- return false

So "()]" is invalid.
*/
