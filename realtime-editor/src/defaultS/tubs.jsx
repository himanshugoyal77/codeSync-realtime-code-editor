const stubs = {};

stubs.cpp = `
#include <iostream>
#include <stdio.h>
using namespace std;

int main() {
    cout << "Hello World!";
    return 0;
}
`;

stubs.js = `
console.log("Hello World!");
`;

stubs.py = `
print("Hello World!")
`;

export default stubs;
