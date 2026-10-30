// Foto de cada linha quando o revendedor ainda não cadastrou a da unidade.
// São fotos do Wikimedia Commons com licença livre; o crédito aparece no site.
export interface FotoPadrao {
  url: string;
  autor: string;
  licenca: string;
  fonte: string;
  ilustrativa: string;
}

export const FOTOS_PADRAO: { [linha: string]: FotoPadrao } = {
  ENTRADA: {
    url: '/img/thinkpad-t14-gen2.jpg',
    autor: 'Edvard10',
    licenca: 'CC0',
    fonte: 'https://commons.wikimedia.org/wiki/File:ThinkPad_T14.jpg',
    ilustrativa: 'Foto ilustrativa do ThinkPad T14.'
  },
  INTERMEDIARIO: {
    url: '/img/latitude-5430.jpg',
    autor: 'Ahunt',
    licenca: 'CC0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Dell_Latitude_7490_running_Ubuntu_Cinnamon_23.10.jpg',
    ilustrativa: 'Foto ilustrativa (Latitude 7490, parecido).'
  },
  PRO: {
    url: '/img/macbook-air-m2.jpg',
    autor: 'KKPCW',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:M2_Macbook_Air_Starlight_model.jpg',
    ilustrativa: 'Foto ilustrativa do MacBook Air M2.'
  }
};
