const add = require('../tests/math'); //../ starts at root so fix as needed

test('adds 1 + 2 to equal 3', () => {
    expect(add(1, 2)).toBe(3);
});