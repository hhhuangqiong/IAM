const WEEK = 60 * 60 * 24 * 7 * 1000;
export const settings = {
  features: {
    discovery: true,
    clientCredentials: true,
    encryption: true,
    introspection: true,
    registration: false,
    refreshToken: false,
    request: true,
    requestUri: true,
    revocation: true,
    sessionManagement: true,
  },
  interactionPath: function interactionPath(grant) {
    return `/openid/interaction/${grant}`;
  },
  cookies: {
    long: {
      httpOnly: true,
      // the time limit for the each login session on IAM
      maxAge: 2 * WEEK,
      signed: true,
    },
  },
  ttl: {
    AccessToken: 2 * 60 * 60, // 2 hours
    AuthorizationCode: 10 * 60, // 10 minutes
    IdToken: 2 * 60 * 60, // 2 hours
  },
};

export const certificates = [{
  kty: 'RSA',
  kid: 'ef96IdnItEyuVANwqtxTasA9iA32SwcYGQtl5R7Bbdw',
  use: 'sig',
  e: 'AQAB',
  n: 'gYcdeMJH49dbqqdnVeEr-H6RwrCNkyB9m-dxI5TOiDsWNS4mPzOxBw-IcYy-MDhZ47q_5lPlZ7ssalFQCaStAbOR1EjCrhtjG4olhmTAwd_ZZLqZolddwZQxZFeR2lZeKQJkc2h3Ufx6_yeW5qzmWPaBa8NnlCzSay5QRZQHenNLKCHpAZR6Y2oyD_gy8qO2jEvgm64LROpgL3WiEj1PwjIhhyL_x75jiwiiC9UWBoqtmuo2KB5QvZIa3SjVirVW2gi-WXNY80Kqrr4VfXRY0iMdcNSmmUSYiXkQzEf7zLeE7LZMcrpt4n0TD7mtGXh3D3nYZWi65joRLZ7epjhc2w',
  d: 'HVuIfIRcUvHO3wEOVNKyaqIVW3E0xXIJxjpQ1GW34fyybd9F3_FRYG5O2J2zxa4gAZOkRwog5r_vszE22NiwNcCDfv_20At5DRbkpm9TmR2pYkFA7SCsKWHzR_DpJ_mHYfge2GGHGdgF8KsCcsohc2x7rPcfFOCL2KsomnyQrVn7lfSPx3QWkX5gZ5q7GC49ZDpKsmfiNHwxgw2LYKCK_ZyjVCbntecxKrNNgjaDTNRSkgWJcx0Saf_WEMW0cbmfB4kOBfs3ebwbakMleRdRvzkrgI_M1BtQo0I9bHFyQ1UzxyUQsfv2DDLrGtW9U_jlJwSPTKNleqAkR76eAmOUcQ',
  p: '5dP-LerhfvuEvqC4q-O9iv_CcMVM7Hewxlv_-i4RRyenazECBYTHiRu4eURsQirCFPkOCIzFzwPc_g__RnV_w3lnBqq4aLsZjq8mMyQjnh9dK9u-xLTGFeaGa0p1iGXa3TjCK18-Zy4Y2FZztHYWSNLybXkV5zFlvK99y58gMlc',
  q: 'kEckbL2iTHvWY8k6CPScYTV5W8O4w5c9bU4mggqj_eGWqB8lohxgysDbuFDEdEDaSgDAO6itGfSt6Et-m2XmUaAfMRBb6sqXY8pl8YLWLZupzfsOacUxqpxHvQDKTdE98QMdLzCz5k0bM7JC-DrES0K9AuAk4MUJSwQGbyVC_x0',
  dp: 'yej8nYqEoPKHJJI-q4RguQUI5dnwQq7Edv_MWxatxz1nMBzWEdMdGa9o2eDq2xaFe7dyRMCn578VH38eXeBMZob5pDnH2PrG8Tue678MK5aSXD2p01ad0A--d_PqXfJd3YxHyaLbR_qPiUAqVpiH62Kn6NVAEOSs5J-ofINH3fE',
  dq: 'Hb589OoXdpslNMc8brI3Nxc2IMP16GTaphkxeSfGbUW_sINTV9tv3Pzrj1EfXzQrjIwhFWuN3EcEP1qpDFJyrCtNoujTelEv6sPERokJrLdlx3BVpVqhBaJYa8-o5WgY1AInVx48SGNnEz5R7ij3ZOiqXNhm4evdIZj_1pQg_sU',
  qi: '1VPFd0zGPDLhEBgfi6rpz5AkarvXakrWPo-4_J2KkQ9-K_kx4ZbhC4Wz8M6VkNOgsR_1hZAovwkl_UetbIN8hg43GgD7Al1pqKhueZP4yj0jYokKJxIIFImfX66HKPnTeEp7HgDvE6tohuhLaJIQ_IUGiHNsGfZdoSxmSs09rNQ',
}, {
  kty: 'RSA',
  kid: 'Q7FivCmU9X2CxUFve0llD10OMAetGaQ5av-RmX9f_-k',
  use: 'enc',
  e: 'AQAB',
  n: 'olYJdALKRw-7oQpzSDoWUKb4CLEAeg_vCw6dlXVb3mpyzEQW17HlwajNklD1ZM-9wYxHWeAPycaNDuYG9nSANLBYjWcWPJyhS4ctv_g_aB8ciKKqBMYjLuBWUybFR2EufGpmHUbgPSzdGOQ8xnsAX7hRV01efMJklbXF7m-n5_a83JNa6QXPM51xt5VnQ59gqCSTSuAOXzgjAJpVO7RrAC4RDFZk_KO5YN26qlWiNCvYvj_Vpp16ySfZeyc86oGeulqsvSIkjpV20iItNevZnZRXiuIb75ergw0OoHYQ2qXE-ef-ECFwK5qpnQYCUgJjOk1K5kSqLfxRxiPx9M8Ktw',
  d: 'fYC8wDbkAXpVWdSFeeKGnAXqHnYRY0zsRwUeqYzY4KQ1alx9uHYtpcIGZEc44J6HGpqEEyTZr-pT5Z_K5ED_WTy4yWFYXLXPMWAp649WHf5nhe8UOKqiSrxfoNuJi3zDfqaXmazQ8hq8OGFD50Ly8A3EvRTwps13DBNDGeqyye7HnqO_JnVUOezHe0teUEofw5QJ0nI7qah5NJRxOXYseiS673olf1dEzsQiNhSQ5NVWMH0kucUrHwz1t05KkItE6QZUvAVRnqwwyyYqlb57Jh5bDnd9flPqiazisIDzZmrf8mYjBScBwNTxDLRWUxPJ45GKsc-kWQZY_f8Yj2hKGQ',
  p: '5JXWURBPnrcD_SLxpHDUFtDuk8UZx34dlILksfGG_fJY8zgZ2LjREWtMrWIuGiaHqmQZGW_HO7kEqzNFHq5NOW6g9AEzmELMGuWUapCkTA1dk7lBV4QTNIOiKK9hV6eNdlgvMORdCnVAxTIaygHM6bH5fPQq5H--XrlLYYzl5PU',
  q: 'tc4tMSoxSEsUMjRK3hqnrW3LZXn7QgOjNwUr5RhkZgjMjpjRSp5-MOjlHfwS0ixCSCQ5Jp4IHbRloPFwNoYa1RFhxGdhogRnhz-UCC4QKCZMfsk-M42E9KNAQJ-wwh2Vq55NBG4Fkj3eUP_xeZXzBzc3QDvTlKguL2q5CHaURXs',
  dp: 'UPUMeZtoR5MUE5RLtuzLAOWwiZ92GOR-v3l4W9lp8QjjHgkRhmM2kI_LEWFDaLmatOtMxGiFTI6jq6q14T7kVOHsmV7Pki6eMSx8Wx2tQs49BTPIg6FgV-oDBZvPwwaxoGdtF0jZ9vk-Hlk3ibIHjAEflnS3uEPR_aRsoTkQtv0',
  dq: 'E9OPNBxg0Xx2kF8Jhx0rCgu-MavSzcktxHNI7SvyzvnIrQhXUqbkJhtP2SxDNS5kcA-bN-3l_q9MofeSgC-xv2is28lWaV_HloVFdHrpgidjEjSKFv8o77DZ8fI4SYMGbnfN-FyzONaMZxLyV4sVvMS1vsiHc1-_4aXm1dhwpP8',
  qi: 'SO3diLx9ygrEmU5iNiqMhLMczvyivrc9HPOn1NYoiNupHQnLrMlRJGgYzkifglr2GwkiIXjw-zRZZuAztUnHBa06ehTrthurO_n7yhelUrXIc2sNerhiUuyttl8_b9VUF_OTAmPqKvp1LY7rLDN1dAGqwcO_CwWvEKOJPlyBtOU',
}, {
  kty: 'EC',
  kid: 'G_8ItS0e-z0UMiVD70mOgslrbWUkL1XJdnGN6O5efwc',
  crv: 'P-256',
  x: '2f-PdxddyKb32clD_Re4vNePjCumCEiQcI4N8ZgAaPw',
  y: 'fGTKyuMnaOPcQvXj95kzdD3Q3wjZoKTecfQxHVwxkt4',
  d: 'eq5whNtJAQrm2uyitPadc2ZO5yod-Zy5ZpqA_jem0SE',
}, { kty: 'EC',
  kid: 'FbPTFhAsE9x5Jw5TuapumovTwmjVa3oCOXcCwDSwjEo',
  crv: 'P-384',
  x: '-G6N7a1lUF8SZEDvieTmkhmuW31S4VpNLMs0M9ejAXpfFT9LxPnbNa5IH1Y57CEg',
  y: 'RDjMm1nxYdtqOICHCxor7Qc63kGG8hxK_8ZbWuWKwaGioCXUOKJg_1mjYZBNH4wE',
  d: 'jCz4dKcEInyoj6kNq96WYhHO0fMFEzs_FudgsnYvwqdtXK9MmKTP9c1QZpvv3JsJ',
}, { kty: 'EC',
  kid: '81O_Ov7vLPLu6w6L2k6rUv3538Uu2BWo2v_U5c1FCOs',
  crv: 'P-521',
  x: 'AIQZLD1Xrla2lmIHUe8sGEhDAi2ysgowXbrQcVzP_OryYEj8Sd4_91BVHf1N8Msh51MTvFkhLdfNHEvdOAIYjVPO',
  y: 'AJDXC-qMD5EV3u-5dWjNhy0MOrGjTeA0MOPSP7wzhn9jQ8C3hW2W52wKQ8nGwhhoz4tPXHD6LSVJZVuDvAjvvDe8',
  d: 'AcDfAoZ8YyGYDPW-VG0Hl0JaxlyXjgW2MKqb3BuxhPGaE8xJoXcLt-VHoip0CBJAs_16e9691OBs8ZgbdwFYb0cz',
}];
