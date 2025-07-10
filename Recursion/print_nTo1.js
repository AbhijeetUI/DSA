function printDescOrder(n) {
  if (n < 1) return;
  console.log(n);
  printDescOrder(--n); // n = n - 1
}

function printAscOrder(x) {
  let n = 5;
  if (x > n) return;
  console.log(x);
  printAscOrder(++x); // x = x + 1
}

console.log("############# RECURSION #############");
printDescOrder(5); // 5 4 3 2 1   // at the end call stack becomes empty when base condition passes
printAscOrder(1); // 1 2 3 4 5
