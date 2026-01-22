/*### Context in Arrow Functions**

**Question:** What will be the output? Can the context of `greet` be changed using `.call()`? Why or why not?*/

const profile = {
  userName: "Abhijeet",
  greet: () => {
    console.log(`Hi, I'm ${this.userName}`);
  },
  welcome: function () {
    console.log(`Welcome, ${this.userName}`);
  },
};

const friend = { userName: "Candidate" };

profile.greet.call(friend);
profile.welcome.call(friend);

/*
=> profile.greet.call(friend);
    - greet is an arrow function
    - arrow functions ignore .call(), .apply(), .bind()
    - arrow functions inherit this from enclosing scope which is global object(window/global)
    - this.userName in global = undefined => Hi, I'm undefined
=> profile.welcome.call(friend);
    - welcome is regular function and has their own this
    - .call(friend) explicitly sets this to friend
    - this.userName = friend.userName = Candidate
    - Welcome, Candidate
*/

/* const profile = {
  userName: "Vasanth",

  // ❌ Arrow function - inherits this from outer scope (global)
  greet: () => {
    console.log(this); // window/global object
    console.log(this.userName); // undefined
  },

  // ✓ Regular function - has its own this
  welcome: function () {
    console.log(this); // profile object
    console.log(this.userName); // 'Vasanth' (or 'Candidate' with .call)
  },
};

const friend = { userName: "Candidate" };

// Arrow function ignores .call()
profile.greet.call(friend); // this = global, output: undefined
profile.greet.call(profile); // this = global, output: undefined
profile.greet.call(null); // this = global, output: undefined

// Regular function respects .call()
profile.welcome.call(friend); // this = friend, output: Candidate
profile.welcome.call(profile); // this = profile, output: Vasanth
profile.welcome.call(null); // this = null, output: (error or undefined)
*/

// Bottom Line: Arrow functions lock this to their creation scope. Regular functions have dynamic this based on how they're called. 🎯
