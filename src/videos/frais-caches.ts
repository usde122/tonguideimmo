import type {VideoData} from '../engine/types';

const SP_GARANTIE = 'service-public.fr, fiche F34997, vérifiée le 16/10/2026';
const SP_TAXE = 'service-public.fr, fiche F3171, vérifiée le 25/09/2026';
const SP_COPRO = 'service-public.fr, fiche F34026, vérifiée le 09/06/2026';

/** Vidéo : « Les 3 frais cachés quand tu achètes ton premier appart ». */
export const fraisCaches: VideoData = {
  id: 'frais-caches',
  title: 'Les 3 frais cachés quand tu achètes ton premier appart',
  voice: {
    edgeVoice: 'fr-FR-HenriNeural',
    rate: '+10%',
  },
  script: [
    'Trois frais cachés sur ton premier appart.',
    "Personne ne te les annonce. Un : la garantie du prêt. Ta banque peut exiger une caution ou une hypothèque, et ça se paie. Bonne nouvelle : la caution coûte moins cher, et tu peux en récupérer une partie à la fin du prêt.",
    "Deux : la taxe foncière. Le vendeur la paie pour toute l'année, alors chez le notaire, tu lui rembourses ta part. Exemple officiel : mille cinq cents euros de taxe, vente le vingt et un mai, neuf cent vingt euros pour toi.",
    'Trois : le fonds de travaux de la copro. Chaque année, au moins cinq pour cent du budget de la copro. Et quand tu revends, tu ne le récupères pas.',
    'Recherche personnalisée gratuite, lien en bio.',
  ],
  scenes: [
    {
      id: 'accroche',
      at: 'Trois frais cachés',
      beats: [
        {at: 'Trois frais', block: {kind: 'title', text: 'TROIS FRAIS CACHÉS', size: 130, zoom: true}},
        {at: 'premier appart', block: {kind: 'icon', name: 'key', size: 230, label: 'Ton premier appart'}},
        {at: 'Personne ne te', clear: true, block: {kind: 'stamp', text: 'PERSONNE NE TE', tone: 'loss'}},
        {at: 'les annonce', block: {kind: 'stamp', text: 'LES ANNONCE', tone: 'loss'}},
      ],
    },
    {
      id: 'garantie',
      at: 'Un : la garantie',
      source: SP_GARANTIE,
      beats: [
        {at: 'Un', block: {kind: 'kicker', text: 'FRAIS N°1'}},
        {at: 'la garantie du prêt', block: {kind: 'title', text: 'La garantie du prêt', size: 104}},
        {at: 'Ta banque', clear: true, block: {kind: 'icon', name: 'bank', size: 220, label: 'Ta banque peut exiger'}},
        {at: 'une caution', block: {kind: 'line', label: 'Une caution'}},
        {at: 'une hypothèque', block: {kind: 'line', label: 'Une hypothèque'}},
        {at: 'et ça se paie', block: {kind: 'stamp', text: 'PAYANT'}},
        {at: 'Bonne nouvelle', clear: true, block: {kind: 'title', text: 'Bonne nouvelle', size: 100, tone: 'accent'}},
        {at: 'la caution coûte', block: {kind: 'icon', name: 'shield', size: 200}},
        {at: 'moins cher', block: {kind: 'line', label: 'Caution', value: 'moins chère'}},
        {at: 'tu peux en récupérer', block: {kind: 'line', label: 'Une partie', value: 'récupérable'}},
        {at: 'à la fin du prêt', block: {kind: 'kicker', text: 'À LA FIN DU PRÊT'}},
      ],
    },
    {
      id: 'taxe-fonciere',
      at: 'Deux : la taxe foncière',
      source: SP_TAXE,
      beats: [
        {at: 'Deux', block: {kind: 'kicker', text: 'FRAIS N°2'}},
        {at: 'la taxe foncière', block: {kind: 'title', text: 'La taxe foncière', size: 110}},
        {at: 'Le vendeur', clear: true, block: {kind: 'icon', name: 'receipt', size: 220, label: 'Le vendeur la paie'}},
        {at: "pour toute l'année", block: {kind: 'line', label: "Toute l'année", value: '100 %'}},
        {at: 'chez le notaire', clear: true, block: {kind: 'title', text: 'Chez le notaire', size: 100}},
        {at: 'tu lui rembourses', block: {kind: 'stamp', text: 'TU REMBOURSES', tone: 'loss'}},
        {at: 'ta part', block: {kind: 'line', label: 'Ta part de l’année', tone: 'loss'}},
        {at: 'Exemple officiel', clear: true, block: {kind: 'kicker', text: 'EXEMPLE OFFICIEL'}},
        {at: 'mille cinq cents', block: {kind: 'line', label: 'Taxe foncière', value: '1 500 €', valueAt: 'euros de taxe'}},
        {at: 'vente le', block: {kind: 'line', label: 'Vente le', value: '21 mai', valueAt: 'vingt et un mai'}},
        {at: 'neuf cent vingt', block: {kind: 'line', label: 'À rembourser', value: '920,55 €', tone: 'loss'}},
      ],
    },
    {
      id: 'copro',
      at: 'Trois : le fonds',
      source: SP_COPRO,
      beats: [
        {at: 'Trois', block: {kind: 'kicker', text: 'FRAIS N°3'}},
        {at: 'le fonds de travaux', block: {kind: 'title', text: 'Le fonds de travaux', size: 104}},
        {at: 'de la copro', block: {kind: 'icon', name: 'building', size: 220}},
        {at: 'Chaque année', clear: true, block: {kind: 'icon', name: 'calendar', size: 200, label: 'Chaque année'}},
        {
          at: 'au moins cinq',
          block: {kind: 'counter', from: 0, to: 5, suffix: ' %', label: 'minimum', reachAt: 'pour cent', size: 190},
        },
        {at: 'du budget de la copro', block: {kind: 'line', label: 'du budget prévisionnel'}},
        {at: 'Et quand tu revends', clear: true, block: {kind: 'icon', name: 'coins', size: 220, label: 'Tu revends ?'}},
        {at: 'tu ne le récupères pas', block: {kind: 'stamp', text: 'NON RÉCUPÉRABLE'}},
      ],
    },
    {
      id: 'fin',
      at: 'Recherche personnalisée',
      beats: [
        {at: 'Recherche personnalisée', block: {kind: 'title', text: 'Recherche personnalisée', size: 100}},
        {at: 'gratuite', block: {kind: 'kicker', text: 'GRATUITE'}},
        {at: 'lien en bio', block: {kind: 'cta', button: 'Lien en bio', caption: 'Ton Guide Immo', symbol: 'arrow'}},
      ],
    },
  ],
  sources: [
    {
      claim: 'Garantie du prêt : la banque peut imposer une caution (ou une hypothèque) ; la caution coûte moins cher et une partie des frais peut être récupérée à la fin du prêt',
      source: 'Service-Public.fr — « Faut-il avoir une caution bancaire pour obtenir un crédit immobilier ? » (F34997), vérifiée le 16 octobre 2026',
      url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F34997',
      checked: 'page lue le 17/11/2026',
      quote:
        "Pour vous accorder un crédit immobilier, la banque peut vous imposer d'avoir une caution. […] Souscrire à une caution bancaire est moins coûteux que de consentir à une hypothèque conventionnelle ou une hypothèque légale spéciale de prêteur de deniers. Mais vous pouvez récupérer une partie des frais de souscription à l'échéance du prêt […], sous certaines conditions.",
    },
    {
      claim: 'Taxe foncière : le vendeur paie 100 % de l’année ; exemple officiel 1 500 €, vente le 21 mai → 920,55 € remboursés par l’acheteur',
      source: 'Service-Public.fr — « Taxe foncière sur les propriétés bâties (TFPB) » (F3171), vérifiée le 25 septembre 2026',
      url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F3171',
      checked: 'page lue le 17/11/2026',
      quote:
        "Vous devez payer cet impôt en totalité, car l’administration fiscale ne tient pas compte des changements de propriétaires en cours d’année. […] chez le notaire, le jour de la vente : un accord est conclu entre le vendeur et l’acheteur, pour répartir la taxe foncière au prorata de l’année […]. La vente de votre maison est signée chez le notaire le 21 mai 2025. La taxe foncière 2024 était de 1 500 €. […] L’acheteur va rembourser par avance au vendeur : 1500 x 224 / 365 jours = 920,55 €",
    },
    {
      claim: 'Fonds de travaux de copropriété : cotisation annuelle d’au moins 5 % du budget prévisionnel, non récupérable à la revente',
      source: 'Service-Public.fr — « Fonds de travaux mis en place dans les copropriétés » (F34026), vérifiée le 9 juin 2026',
      url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F34026',
      checked: 'page lue le 17/11/2026',
      quote:
        "Lorsque l'assemblée générale n'a pas adopté de PPT, le montant de la cotisation annuelle ne doit pas être inférieur à 5 % du budget prévisionnel. […] Les sommes versées pour le fonds de travaux ne peuvent pas être récupérées par un copropriétaire qui vend son lot de copropriété.",
    },
  ],
};
