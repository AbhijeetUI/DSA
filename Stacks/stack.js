let stack = [];
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack[2]); // Invalid stack operation, bcoz you you're using stack as an array
console.log(stack); //[1,2,3]
stack.pop();
console.log(stack); //[1,2]
console.log(stack[stack.length - 1]); // 1
