import { create, evaluateDependencies } from 'mathjs/lib/esm/number';

const add = (a: number, b: number) => a + b;
const subtract = (a: number, b: number) => a - b;
const multiply = (a: number, b: number) => a * b;
const divide = (a: number, b: number) => a / b;

const arithmetic = { add, subtract, multiply, divide };

const sin = Math.sin;
const sinh = Math.sinh;
const cos = Math.cos;
const cosh = Math.cosh;
const tan = Math.tan;
const tanh = Math.tanh;

const trigonometric = { sin, sinh, cos, cosh, tan, tanh };

const math = create(evaluateDependencies);

math.import({ ...arithmetic, ...trigonometric }, { override: true });

export { math };
