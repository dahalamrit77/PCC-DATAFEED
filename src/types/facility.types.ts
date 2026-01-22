export interface Facility {
  orgId: number;
  orgUuid: string;
  facId: number;
  facilityName: string;
  country: string;
  addressLine1: string;
  postalCode: string;
  phone: string;
  city: string;
  state: string;
  fax: string;
  bedCount: number;
  lineOfBusiness: {
    shortDesc: string;
    longDesc: string;
  };
  healthType: string;
  facilityCode: string;
  orgName: string;
  environment: string;
  facilityStatus: string;
  countryId: number;
  timeZoneOffset: number;
  orgDbType: string;
  billingStyleCountry: string;
  timeZone: string;
  active: boolean;
  headOffice: boolean;
}



