let queue = [];
queue.push(1);
queue.push(2); // this is enqueue, add elements
queue.push(3);
queue.push(4);

queue.shift(); // removes first element of the queue, is called as dequeue
queue.shift();

console.log(queue); // [3]

let front = q[0]; // gives first element which is 3

// NEVER DO THIS - queue.pop()
// bcoz purpose of queue is enqueue, dequeue and peek front element
