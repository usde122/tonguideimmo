import type {VideoData} from '../engine/types';

/**
 * Vidéo : « Prix affiché = arnaque ? » — tout le contenu est ici.
 * Pour une nouvelle vidéo : copier ce fichier, le modifier, l'ajouter dans
 * src/videos/index.ts, puis `npm run voice -- <id>` et `npm run render -- <id>`.
 */
export const bonneAffaire: VideoData = {
  id: 'bonne-affaire',
  title: 'Prix affiché = arnaque ?',
  voice: {
    edgeVoice: 'fr-FR-RemyMultilingualNeural',
    rate: '+8%',
  },
  script: [
    "Si tu paies le prix affiché en deux mille vingt-six, t'as perdu de l'argent. Regarde les chiffres.",
    "Le marché a changé de camp. En un an, le nombre de biens à vendre a augmenté de neuf pour cent, et la demande de seulement un pour cent. Il y a plus de vendeurs que d'acheteurs : c'est toi qui as le pouvoir.",
    "Résultat : neuf ventes sur dix se négocient, avec une remise moyenne de quatre virgule huit pour cent. Sur un appart à deux cent cinquante mille euros, ça fait douze mille euros que les autres gardent dans leur poche. Si tu paies le prix affiché, c'est toi qui les perds.",
    "Signal numéro un : le temps en ligne. Un bien met en moyenne cent un jours à se vendre. Au-delà de trois mois, le vendeur commence à douter, et c'est là que les remises grimpent.",
    "Signal numéro deux, le plus gros : le DPE. D'après les notaires, une maison classée G se vend en moyenne vingt-cinq pour cent moins cher qu'une maison classée D. Une maison qui vaut trois cent mille euros en D, en G, c'est deux cent vingt-cinq mille. Si les travaux coûtent moins que les soixante-quinze mille euros de remise, t'as trouvé ta bonne affaire.",
    "Dans la prochaine vidéo, je te montre comment calculer ton offre pour faire baisser le prix sans braquer le vendeur. Si t'es pas abonné, tu la rates.",
  ],
  scenes: [
    {
      id: 'accroche',
      at: 'Si tu paies le prix affiché',
      beats: [
        {at: 'Si tu paies', block: {kind: 'title', text: 'PRIX AFFICHÉ = ARNAQUE ?', size: 128, zoom: true}},
        {at: 'le prix affiché', block: {kind: 'priceTag', price: '250 000 €', strikeAt: "t'as perdu"}},
      ],
    },
    {
      id: 'marche',
      at: 'Le marché a changé de camp',
      source: 'Laforêt, sept. 2026',
      beats: [
        {at: 'Le marché', block: {kind: 'title', text: 'Le marché a changé de camp', size: 84}},
        {
          at: 'En un an',
          clear: true,
          block: {
            kind: 'bars',
            bars: [
              {label: 'Offre', display: '+9 %', value: 9, at: 'neuf pour cent'},
              {label: 'Demande', display: '+1 %', value: 1, at: 'seulement un pour cent'},
            ],
          },
        },
        {
          at: 'Il y a plus de vendeurs',
          clear: true,
          block: {
            kind: 'statement',
            lines: [
              {text: 'Plus de vendeurs', size: 92},
              {text: "que d'acheteurs", size: 92},
            ],
          },
        },
        {
          at: "c'est toi qui as le pouvoir",
          block: {kind: 'statement', lines: [{text: "Le pouvoir, c'est toi", tone: 'accent', size: 80}]},
        },
      ],
    },
    {
      id: 'preuve',
      at: 'Résultat',
      source: 'Laforêt, T3 2026',
      beats: [
        {at: 'Résultat', block: {kind: 'iconGrid', count: 10, highlighted: 9, label: '9 ventes sur 10 négociées', highlightAt: 'neuf ventes'}},
        {
          at: 'Sur un appart',
          clear: true,
          block: {kind: 'calc', base: '250 000 €', operation: '– 4,8 %', operationAt: 'mille euros'},
        },
        {
          at: 'ça fait douze mille',
          block: {kind: 'counter', from: 0, to: 12000, suffix: ' €', label: 'économisés', reachAt: 'que les autres gardent', size: 150},
        },
        {
          at: 'Si tu paies le prix affiché, c',
          clear: true,
          block: {
            kind: 'statement',
            lines: [
              {text: 'Prix affiché', size: 88},
              {text: '–12 000 €', tone: 'loss', size: 150},
            ],
          },
        },
      ],
    },
    {
      id: 'temps-en-ligne',
      at: 'Signal numéro un',
      source: 'Laforêt, T3 2026 · Investissement-Locatif.com, S1 2026',
      beats: [
        {at: 'Signal numéro un', block: {kind: 'kicker', text: 'SIGNAL N°1'}},
        {at: 'le temps en ligne', block: {kind: 'title', text: 'Le temps en ligne', size: 104}},
        {
          at: 'Un bien met',
          clear: true,
          block: {kind: 'counter', from: 0, to: 101, suffix: ' jours', label: 'en moyenne pour vendre', reachAt: 'jours à se vendre', size: 170},
        },
        {
          at: 'Au-delà de trois mois',
          block: {
            kind: 'statement',
            lines: [
              {text: 'En ligne depuis', size: 64},
              {text: '+ de 100 jours', size: 84},
              {text: '=', size: 64},
              {text: "jusqu'à 8 % de remise", tone: 'accent', size: 84},
            ],
          },
        },
      ],
    },
    {
      id: 'dpe',
      at: 'Signal numéro deux',
      source: 'Notaires de France, ventes 2024',
      beats: [
        {at: 'Signal numéro deux', block: {kind: 'kicker', text: 'SIGNAL N°2'}},
        {at: 'le plus gros', block: {kind: 'title', text: 'Le DPE', size: 150}},
        {
          at: "D'après les notaires",
          clear: true,
          block: {
            kind: 'energyScale',
            highlights: [
              {letter: 'G', at: 'classée G'},
              {letter: 'D', at: 'classée D'},
            ],
            badge: {text: '–25 %', at: 'vingt-cinq pour cent', near: 'G'},
          },
        },
        {
          at: 'Une maison qui vaut',
          clear: true,
          block: {
            kind: 'priceDrop',
            from: 300000,
            to: 225000,
            fromLabel: 'D',
            toLabel: 'G',
            dropAt: 'en G',
            reachAt: 'vingt-cinq mille',
            delta: '–75 000 €',
            deltaAt: 'Si les travaux',
          },
        },
        {
          at: "t'as trouvé ta bonne affaire",
          clear: true,
          block: {
            kind: 'statement',
            lines: [
              {text: 'Travaux < 75 000 €', size: 88},
              {text: '= bonne affaire', tone: 'accent', size: 100},
            ],
          },
        },
      ],
    },
    {
      id: 'fin',
      at: 'Dans la prochaine vidéo',
      beats: [
        {at: 'Dans la prochaine vidéo', block: {kind: 'kicker', text: 'PARTIE 2 :'}},
        {at: 'calculer ton offre', block: {kind: 'title', text: 'calculer ton offre', size: 110}},
        {at: "Si t'es pas abonné", block: {kind: 'cta', button: 'Abonne-toi', caption: 'pour ne pas la rater'}},
      ],
    },
  ],
};
