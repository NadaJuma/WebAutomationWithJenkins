import { buildSuggestionCases } from './suggestion.factory';

export type SuggestionCase = {
  title: string;

  entitySearch: string;
  entityOption: string;

  service: string;

  governorate: string;
  wilayat: string;
  village?: string; // optional

  description: string;

  expectError?: boolean;
  expectNotInDropdown?: boolean;

  mapSearch: string;
  mapResult: string;

  attachment?: string;
};

// generate large dataset
export const suggestionData = buildSuggestionCases(350);
