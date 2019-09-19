// Make the type mockable and replace each function with a mock.
export type MockableType<T> = { -readonly [P in keyof T]: Mocked<T[P]> };

type Mocked<T> = T extends ((...args: infer U) => infer V)
  ? jest.Mock<V, U>
  : T;
