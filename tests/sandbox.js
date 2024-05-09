const arr = [1, 1, 3, 3, 3, 6, 6, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 10, 10];

const groups = [];

while (arr.length > 0) {
	groups.push(arr.splice(arr.indexOf(arr[0]), arr.lastIndexOf(arr[0]) - arr.indexOf(arr[0]) + 1));
}

console.dir(groups);
