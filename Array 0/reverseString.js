/* 
Write a function that reverses a string which is an array of characters 
You must do this by modifying the input array in-place with O(1) extra memory
in-place means you can not use extra space and modify input array

Approach: we can swap as 1st character with last character and so on.

swap(0, n-1)
swap(1, n-2)
swap(2, n-3)
in-shore swap(i, n-1-i) first half need to swap with second half
*/

/* 
SUDO code with DRY RUN for even number of elements 
our loop will also work for odd elements because when odd element is there our loop ends as i not less than n/2

n = ['a','b','h','i','j','e','e','t'];

for(let i = 0;i<n/2;i++){
    swap(i, n - 1 - i); // to swap we can third temp variable in the loop
}

i   n - 1 - i     swap
0   7             t
1   6             e
2   5             e
3   4             j
4   3             i
5   2             h
6   1             b
7   0             a


*/

function reverseString(s) {
  let len = s.length;
  let halfLen = Math.floor(len / 2); // to get length in number;
  for (let i = 0; i < halfLen; i++) {
    //swapping s[i], s[len-1-i]
    let temp = s[i];
    s[i] = s[len - 1 - i];
    s[len - 1 - i] = temp;
  }
  return s;
}

console.log("############# REVERSE STRING ############");
console.log(reverseString(["h", "e", "l", "l", "o"])); // ['o','l','l','e','h']

/* DRY RUN 
Input: s = ["h", "e", "l", "l", "o"]
len = 5, halfLen = 2

i = 0 -> swap s[0] and s[4] -> ['o','e','l','l','h']
i = 1 -> swap s[1] and s[3] -> ['o','l','l','e','h']

Complexity
Time: O(N)
Space: O(1)
 */
