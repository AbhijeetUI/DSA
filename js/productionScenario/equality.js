// Loose equality (==) allows certain type conversions before comparing.
console.log('5 == "5" =>', 5 == "5");

// Strict equality (===) compares both value and type without coercion.
console.log('5 === "5" =>', 5 === "5");

// With ==, null and undefined are equal to each other and to no other value.
console.log("null == undefined =>", null == undefined);
console.log("null === undefined =>", null === undefined);
console.log("null == 0 =>", null == 0);

// NaN is unequal to every value, including itself.
console.log("NaN == NaN =>", NaN == NaN);
console.log("Number.isNaN(NaN) =>", Number.isNaN(NaN));

// [] becomes "", then 0; ![] is false, which becomes 0 in this comparison.
console.log("[] == ![] =>", [] == ![]);

// false becomes 0, and the string "0" also converts to 0.
console.log('"0" == false =>', "0" == false);

// Object.is treats NaN as equal to itself, unlike == and ===.
console.log("Object.is(NaN, NaN) =>", Object.is(NaN, NaN));

// Object.is distinguishes positive and negative zero; === does not.
console.log("Object.is(0, -0) =>", Object.is(0, -0));
console.log("0 === -0 =>", 0 === -0);
