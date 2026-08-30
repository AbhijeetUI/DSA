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
