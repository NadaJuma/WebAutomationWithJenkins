export type SuggestionCase = {
  title: string;

  // Entity
  entitySearch: string;
  entityOption: string;

  // Service
  service: string;

  // Location
  governorate: string;
  wilayat: string;
  village: string;

  // Description
  description: string;

  // Map
  mapSearch: string;
  mapResult: string;

  // Optional attachment
  attachment?: string;
};

export const suggestionData: SuggestionCase[] = [

  // ✅ Happy Path
  {
    title: 'Valid suggestion - Ad Dhahirah',
    entitySearch: 'minstry of',
    entityOption: 'Ministry of information',
    service: 'Cinema film permit.',
    governorate: 'Ad Dhahirah',
    wilayat: 'Ibri',
    village: 'Al-Bidah',
    description: 'terwetwt',
    mapSearch: 'muscat',
    mapResult: 'Oman',
    attachment: 'tests/fixtures/Edit_Request_Test_Scenarios.xlsx'
  },

  // ❌ Empty description (validation case)
  {
    title: 'Empty description validation',
    entitySearch: 'minstry of',
    entityOption: 'Ministry of information',
    service: 'Cinema film permit.',
    governorate: 'Ad Dhahirah',
    wilayat: 'Ibri',
    village: 'Al-Bidah',
    description: '',
    mapSearch: 'muscat',
    mapResult: 'Oman'
  },

  // Boundary text
  {
    title: 'Max length description',
    entitySearch: 'minstry of',
    entityOption: 'Ministry of information',
    service: 'Cinema film permit.',
    governorate: 'Ad Dhahirah',
    wilayat: 'Ibri',
    village: 'Al-Bidah',
    description: 'x'.repeat(250),
    mapSearch: 'muscat',
    mapResult: 'Oman'
  },

  // Different location
  {
    title: 'Different wilayat',
    entitySearch: 'minstry of',
    entityOption: 'Ministry of information',
    service: 'Cinema film permit.',
    governorate: 'Dhofar',
    wilayat: 'Taqah',
    village: 'Addamar',
    description: 'Location variation test',
    mapSearch: 'dhofar',
    mapResult: 'Dhofar Governorate'
  },

  // No village (optional field)

];
