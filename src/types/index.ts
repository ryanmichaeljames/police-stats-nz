export interface MonthlyRecord {
  year: number;
  month: number;
  month_label: string;
  victimisations: number;
  unique_victims: number;
}

export interface DistrictRecord {
  year: number;
  district: string;
  victimisations: number;
  unique_victims: number;
}

export interface OffenceRecord {
  year: number;
  offence_category: string;
  victimisations: number;
}

export interface AgeRecord {
  year: number;
  age_group: string;
  victimisations: number;
}

export interface SexRecord {
  year: number;
  sex: string;
  victimisations: number;
}

export interface EthnicityRecord {
  year: number;
  ethnicity: string;
  victimisations: number;
}

export interface DemographicsData {
  by_age: AgeRecord[];
  by_sex: SexRecord[];
  by_ethnicity: EthnicityRecord[];
}

export interface OffenderMonthlyRecord {
  year: number;
  month: number;
  month_label: string;
  proceedings: number;
  unique_offenders: number;
}

export interface OffenderDistrictRecord {
  year: number;
  district: string;
  proceedings: number;
  unique_offenders: number;
}

export interface OffenderOffenceRecord {
  year: number;
  offence_category: string;
  proceedings: number;
}

export interface OffenderAgeRecord {
  year: number;
  age_group: string;
  proceedings: number;
}

export interface OffenderSexRecord {
  year: number;
  sex: string;
  proceedings: number;
}

export interface OffenderEthnicityRecord {
  year: number;
  ethnicity: string;
  proceedings: number;
}

export interface OffenderDemographicsData {
  by_age: OffenderAgeRecord[];
  by_sex: OffenderSexRecord[];
  by_ethnicity: OffenderEthnicityRecord[];
}

export interface DeporteeRecord {
  year: number;
  total_deportees: number;
  male: number;
  female: number;
  age_under_25: number;
  age_25_34: number;
  age_35_44: number;
  age_45_plus: number;
}

export interface DemandRecord {
  year: number;
  month: number;
  month_label: string;
  total_demand: number;
  crime_demand: number;
  non_crime_demand: number;
  proactive: number;
}

export interface Metadata {
  last_updated: string;
  data_from: string;
  data_to: string;
  source: string;
  license: string;
  source_url: string;
  update_frequency: string;
}

export type District =
  | 'Northland'
  | 'Waitemata'
  | 'Auckland City'
  | 'Counties/Manukau'
  | 'Waikato'
  | 'Bay of Plenty'
  | 'Eastern'
  | 'Central'
  | 'Wellington'
  | 'Tasman'
  | 'Canterbury'
  | 'Southern';

export type OffenceCategory =
  | 'Acts intended to cause injury'
  | 'Sexual assault and related offences'
  | 'Robbery, extortion and related offences'
  | 'Unlawful entry with intent / Burglary'
  | 'Theft and related offences'
  | 'Motor vehicle theft'
  | 'Property damage'
  | 'Fraud and deception'
  | 'Illicit drug offences'
  | 'Public order offences'
  | 'Homicide and related offences'
  | 'Traffic offences';
