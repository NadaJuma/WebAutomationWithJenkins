export type ComplaintData = {
  username: string;
  password: string;
  entity: string;
  serviceCatalogue: string;
  complaintType: string;
  complaintCatalogueValue: string;
  governorate: string;
  wilayat: string;
  village: string;
  description: string;
  mapSearch: string;
  mapPickText: string;
};

export class ComplaintFactory {

  static create(index: number): ComplaintData {
    return {
      username: 'nada1',
      password: 'V*!m@KB518',

      entity: 'Ash Sharqiyah South',
      serviceCatalogue: 'Renewal of lease contract',
      complaintType: 'General compalint',
      complaintCatalogueValue: '155092712167572628',

      governorate: 'Ash Sharqiyah North',
      wilayat: 'Ibra',
      village: 'Al-Haymah',

      description: `Auto complaint ${index}`,
      mapSearch: 'ibra',
      mapPickText: 'Oman'
    };
  }
}