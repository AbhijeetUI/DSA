/*
Input:
nums1 = [1,2,3,0,0,0], m = 3
nums2 = [2,5,6]      , n = 3

Output:
[1,2,2,3,5,6], m + n

Solution:

Approach 1: Put all elements nums1 [1,2,3,2,5,6] and nums1.sort(), but this bruthe force approach and 
time complexity would be O(m + n) and best time complexity of sorting algorithm is O(n log n)

Approach 2: Create copy of nums1 as copyNums1 = [1,2,3] and nums2 = [2,5,6]
here we can compare value of each array using 2 pointers and compare element at 0 with element at 0 of other array which is the loweset,
we can add that value in nums array 
Move the pointer which is lowest
p1    p2   result
1     2    1
2     2    2
2     5    2
3     5    3
X     5,6 => 1,2,2,3,5,6 

Time complexity: O(n+m) and space complexity: O(m)

Aprroach 3: without using extra space, we can not make copy of nums1 array instead we can fill it in reverse order by checking
greatest among p1 and p2 by decreasing, if p2 is -1 we can end loop
*/

const mergeSortedArrays = function (nums1, m, nums2, n) {
  let nums1Copy = nums1.slice(0, m); // it creates copy of m elements and creates extra space
  let p1 = 0;
  let p2 = 0;

  //this loop fills our nums1 array
  for (let i = 0; i < m + n; i++) {
    if (p2 >= n || (p1 < m && nums1Copy[p1] < nums2[p2])) {
      nums1[i] = nums1Copy[p1];
      p1++;
    } else {
      nums1[i] = nums2[p2];
      p2++;
    }
  }
  console.log(nums1);
};

const mergeSortedArraysWithoutSpace = function (nums1, m, nums2, n) {
  let p1 = m - 1;
  let p2 = n - 1;
  let res = [];
  //this loop fills our nums1 array
  for (let i = m + n - 1; i >= 0; i--) {
    if (p2 < 0)
      // p2 is negative we have to break the loop
      break;

    // but if p1 breaks we have to copy rest of the elements
    if (p1 >= 0 && nums1[p1] > nums2[p2]) {
      nums1[i] = nums1[p1--];
    } else {
      nums1[i] = nums2[p2--];
    }
  }
  console.log(nums1);
};

/* 
Pointer move logic
p1 - when p1 will go, when nums1Copy[p1] < nums2[p2] && p1 < m OR p2 >= n
otherwise p2 will go
*/

console.log("############ MERGED SORTED ARRAYS ###########");
console.log(mergeSortedArrays([1, 2, 3], 3, [2, 5, 6], 3));
console.log(mergeSortedArraysWithoutSpace([1, 2, 3], 3, [2, 5, 6], 3));
