/** A Math.js compatible expression string; @see src/consts/math.const.ts for valid operations. */
export type AuthorMapFormulaEquation = string;

export interface AuthorMapFormulaFilter {
  equation: AuthorMapFormulaEquation;
  threshold: number;
}
