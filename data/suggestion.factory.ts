import type { SuggestionCase } from './suggestion.data';

type Location = { governorate: string; wilayat: string; village?: string };
type ServiceCase = { entitySearch: string; entityOption: string; service: string };

const locations: Location[] = [
  { governorate: 'Ad Dhahirah', wilayat: 'Ibri', village: 'Al-Bidah' },
  { governorate: 'Dhofar', wilayat: 'Taqah', village: 'Addamar' },
  { governorate: 'Ad Dhahirah', wilayat: 'Dhank', village: 'Abu Kurbah' },
  { governorate: 'Al Batinah North', wilayat: 'Al Awabi', village: 'Al-Dar' }, // same wilayat different governorate to test search robustness
  { governorate: 'Al Buraymi', wilayat: 'Al Awabi', village: 'Al-Dar' }, // same wilayat different governorate to test search robustness
  { governorate: 'Al Wusta', wilayat: 'Duqm', village: 'Dithab' },
  { governorate: 'Ash Sharqiyah North', wilayat: 'Al Qabil', village: 'Adfan' }, //
  { governorate: 'Musandam', wilayat: 'Dibba', village: 'Addamar' }, //
  { governorate: 'Al Batinah North', wilayat: 'Liwa', village: 'Al-Ghatal' },
  { governorate: 'Ash Sharqiyah South', wilayat: 'Jalan Bani Buhassan', village: 'Al-Bulayda' },
  { governorate: 'Al Buraymi', wilayat: 'As Sunainah', village: 'Al-Manazil' },
  { governorate: 'Dhofar', wilayat: 'Sidhah', village: 'Anhazi' },
  // add more locations...
];

const services: ServiceCase[] = [
  {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of information',
    service: 'Cinema film permit.',
  },
   {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of Culture, Sports and Youth',
    service: 'Cinema Texts License',
  },
   {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of information',
    service: 'Cinema film permit.',
  },
   {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of Education',
    service: 'Other',
  },
   {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of Endowments and Religious Affairs',
    service: 'Endowment Asset Management',
  },
   {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of Energy and Minerals',
    service: 'Calculating the value of the community contribution',
  },
   {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of Finance',
    service: 'Beneficiary System',
  },
   {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of information',
    service: 'Cinema film permit.',
  },
   {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of Heritage and Tourism',
    service: 'Initial approval for licensing private heritage house',
  },
   {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of information',
    service: 'Cinema film permit.',
  },
   {
    entitySearch: 'minstry of',
    entityOption: 'Ministry of Housing and Urban Planning',
    service: 'Release of a usufruct contract',
  }
  // add more service options...
];

const descriptions = [
  'Short valid text',
  'Location variation test',
  'x'.repeat(50),
  'x'.repeat(2000), // boundary
];

export function buildSuggestionCases(targetCount = 300): SuggestionCase[] {
  const cases: SuggestionCase[] = [];

  // ✅ Add some negative/validation cases first (important)
  cases.push({
    title: 'Empty description validation',
    entitySearch: 'minstry of',
    entityOption: 'Ministry of information',
    service: 'Cinema film permit.',
    governorate: 'Ad Dhahirah',
    wilayat: 'Ibri',
    village: 'Al-Bidah',
    description: '',
    mapSearch: 'muscat',
    mapResult: 'Oman',
    expectError: true,
  });

  // ✅ Generate positive variations
  let i = 1;
  for (const s of services) {
    for (const l of locations) {
      for (const d of descriptions) {
        if (cases.length >= targetCount) return cases;

        cases.push({
          title: `Suggestion #${i++} - ${s.service} - ${l.governorate}/${l.wilayat}`,
          entitySearch: s.entitySearch,
          entityOption: s.entityOption,
          service: s.service,
          governorate: l.governorate,
          wilayat: l.wilayat,
          village: l.village ?? '', // if optional you can handle differently
          description: d,
          mapSearch: l.governorate.toLowerCase(),
          mapResult: l.governorate === 'Dhofar' ? 'Dhofar Governorate' : 'Oman',
        });
      }
    }
  }

  return cases;
}
