// Language-neutral company data: the single source of truth for contact details and config.
// Values marked TODO(client) are confirmed with the client in phase 5 (see docs/PLAN.md).

export const site = {
  name: 'OCAN',
  legalName: 'OCAN Industrial Sourcing & Solutions',
  url: 'https://www.ocansolutions.com', // final domain, live after phase 5
  email: 'ocan@ocansolutions.com',
  phone: { display: '+90 532 563 95 09', tel: '+905325639509' },
  whatsapp: '905325639509', // TODO(client): confirm this number uses WhatsApp
  address: {
    street: 'Şehit H. Temel Kuguoğlu Cad. No:4',
    postalCode: '06490',
    district: 'Çankaya',
    city: 'Ankara',
    country: 'Turkey',
    countryCode: 'TR',
  },
  managingDirector: 'N. Oğulcan Akbaykal',
  web3formsKey: '', // TODO(client): access key created with ocan@ocansolutions.com. Empty = form disabled.
};
