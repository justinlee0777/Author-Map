import { AuthorInclusionReason } from '../models';

export interface IdentityTransform {
  type: 'identity';
}

export interface ScaleTransform {
  type: 'scale';
  value: number;
}

export interface TanhTransform {
  type: 'tanh';
}

export type ValueTransform = ScaleTransform | TanhTransform | IdentityTransform;

export type AuthorMapFormulaEquation = {
  [key in AuthorInclusionReason['type']]: ValueTransform;
};

export interface AuthorMapFormulaFilter {
  equation: AuthorMapFormulaEquation;
  threshold: number;
}
