// @TODO sample config
export default {
  issuer: 'http://localhost:3000',
  settings: {
    claims: {
      address: {
        address: null,
      },
      email: {
        email: null,
        email_verified: null,
      },
      phone: {
        phone_number: null,
        phone_number_verified: null,
      },
      profile: {
        birthdate: null,
        family_name: null,
        gender: null,
        given_name: null,
        locale: null,
        middle_name: null,
        name: null,
        nickname: null,
        picture: null,
        preferred_username: null,
        profile: null,
        updated_at: null,
        website: null,
        zoneinfo: null,
      },
    },
    features: {
      claimsParameter: true,
      clientCredentials: true,
      encryption: true,
      introspection: true,
      registration: true,
      request: true,
      requestUri: true,
      revocation: true,
      sessionManagement: true,
    },
    pairwiseSalt: 'da1c442b365b563dfc121f285a11eedee5bbff7110d55c88',
  },
};
