// call: runs the function immediately with a chosen `this` value.
Function.prototype.myCall = function (context, ...args) {
  context = context || globalThis;
  context.tempFunction = this;

  const result = context.tempFunction(...args);
  delete context.tempFunction;

  return result;
};

// apply: same as call, but receives arguments as an array.
Function.prototype.myApply = function (context, args) {
  return this.myCall(context, ...(args || []));
};

// bind: returns a new function that can be called later.
Function.prototype.myBind = function (context, ...boundArgs) {
  const originalFunction = this;

  return function (...newArgs) {
    return originalFunction.myCall(context, ...boundArgs, ...newArgs);
  };
};

function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: "Abhijeet" };

// call: arguments are passed one by one.
console.log(greet.myCall(person, "Hello", "!"));

// apply: arguments are passed in an array.
console.log(greet.myApply(person, ["Hi", "."]));

// bind: creates a new function with `this` and some arguments already fixed.
const greetPerson = greet.myBind(person, "Welcome");
console.log(greetPerson("!"));
