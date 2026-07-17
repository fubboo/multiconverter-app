// Multi-language strings for the homepage / converter landing.
// Adding a language = add its code to Lang + LANGS and a full Dict entry below.

export type Lang = 'en' | 'es' | 'fr' | 'de' | 'pt'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
]

export interface Dict {
  htmlLang: string
  metaTitle: string
  metaDesc: string
  badge: string
  hPre: string
  hAccent: string
  hPost: string
  subtitle: string
  alwaysFree: string
  early1: string
  early2: string
  comingSoon: string
  getNotified: string
  cardTitle: string
  add: string
  calculate: string
  midMarket: string
  featTitle: string
  featSub: string
  features: { title: string; desc: string }[]
  popTitle: string
  popSub: string
  faqTitle: string
  faqIntro: string
  faqs: { q: string; a: string }[]
  rhTag: string
  rhTitle: string
  rhSub: string
  setAlert: string
  forReference: string
  blog: string
  privacy: string
  terms: string
  contact: string
}

export const T: Record<Lang, Dict> = {
  en: {
    htmlLang: 'en',
    metaTitle: 'Free Currency Converter — 100+ Currencies, Live Rates & Calculator | Multi Converter',
    metaDesc: 'Free currency converter with 100+ currencies, live exchange rates updated daily, and a built-in calculator. Convert multiple currencies at once. No ads, no signup.',
    badge: 'Free · No signup · 100+ currencies',
    hPre: 'The only', hAccent: 'currency converter', hPost: 'you need',
    subtitle: 'Convert between multiple currencies at once. See all your rates update instantly as you type. Live exchange rates updated daily. Built-in calculator.',
    alwaysFree: 'Always free.',
    early1: 'Now in early access', early2: 'Be among the first to try it',
    comingSoon: 'Coming soon', getNotified: 'Get notified at launch',
    cardTitle: 'Currency converter', add: 'Add', calculate: 'Calculate:', midMarket: 'Mid-market rates · For reference only',
    featTitle: 'Everything you need to convert',
    featSub: 'A fast, clean currency converter — without the ads, signups, and clutter of every other one.',
    features: [
      { title: '100+ currencies', desc: 'Every major and minor world currency, each with its country flag.' },
      { title: 'Live daily rates', desc: 'Mid-market exchange rates refreshed every day from a trusted public source.' },
      { title: 'Convert many at once', desc: 'See all your currencies update together as you type — not just one pair.' },
      { title: 'Built-in calculator', desc: 'Add, subtract, multiply, divide and apply percentages right inside the converter.' },
      { title: 'Works offline', desc: 'The latest rates are cached on your device, so you can convert without internet.' },
      { title: 'No ads, no tracking', desc: 'No accounts, no analytics, no advertising. Free forever and private by design.' },
    ],
    popTitle: 'Popular conversions', popSub: "Check today's live rate for the most-searched currency pairs.",
    faqTitle: 'Frequently asked questions',
    faqIntro: 'Everything you need to know about our free online currency converter and live exchange rates.',
    faqs: [
      { q: 'Is Multi Converter free?', a: 'Yes. Multi Converter is completely free with no ads, no subscriptions, and no signup required.' },
      { q: 'How many currencies can I convert?', a: 'Multi Converter supports 100+ world currencies with live mid-market exchange rates updated daily.' },
      { q: 'How often are exchange rates updated?', a: 'Exchange rates are refreshed daily from a public exchange-rate dataset.' },
      { q: 'Can I convert multiple currencies at once?', a: 'Yes. Multi Converter shows all of your selected currencies updating together as you type — not just one pair at a time.' },
      { q: 'Does it work offline?', a: 'Yes. The latest rates are cached on your device, so you can keep converting even without an internet connection.' },
      { q: 'Do you collect my data?', a: 'No. Multi Converter collects no personal data, uses no tracking or analytics, and requires no account.' },
      { q: 'Is there a built-in calculator?', a: 'Yes. You can add, subtract, multiply, divide, and apply percentages directly inside the converter.' },
    ],
    rhTag: 'Rate History', rhTitle: 'Explore exchange rate trends', rhSub: 'See how any currency pair has moved over time',
    setAlert: 'Set rate alert', forReference: 'For reference only',
    blog: 'Blog', privacy: 'Privacy Policy', terms: 'Terms of Use', contact: 'Contact',
  },
  es: {
    htmlLang: 'es',
    metaTitle: 'Conversor de divisas gratis — Más de 100 monedas y tasas en vivo | Multi Converter',
    metaDesc: 'Conversor de divisas gratis con más de 100 monedas, tipos de cambio en vivo actualizados a diario y calculadora integrada. Convierte varias divisas a la vez. Sin anuncios ni registro.',
    badge: 'Gratis · Sin registro · Más de 100 monedas',
    hPre: 'El único', hAccent: 'conversor de divisas', hPost: 'que necesitas',
    subtitle: 'Convierte entre varias divisas a la vez. Mira cómo se actualizan todas las tasas al instante mientras escribes. Tipos de cambio en vivo actualizados a diario. Calculadora integrada.',
    alwaysFree: 'Siempre gratis.',
    early1: 'Ahora en acceso anticipado', early2: 'Sé de los primeros en probarlo',
    comingSoon: 'Próximamente', getNotified: 'Avísame al lanzamiento',
    cardTitle: 'Conversor de divisas', add: 'Añadir', calculate: 'Calcular:', midMarket: 'Tasa media de mercado · Solo de referencia',
    featTitle: 'Todo lo que necesitas para convertir',
    featSub: 'Un conversor de divisas rápido y limpio, sin los anuncios, registros y desorden de todos los demás.',
    features: [
      { title: 'Más de 100 monedas', desc: 'Todas las divisas del mundo, principales y secundarias, con la bandera de su país.' },
      { title: 'Tasas diarias en vivo', desc: 'Tipos de cambio medios de mercado actualizados cada día desde una fuente pública fiable.' },
      { title: 'Convierte varias a la vez', desc: 'Mira todas tus monedas actualizarse juntas mientras escribes, no solo un par.' },
      { title: 'Calculadora integrada', desc: 'Suma, resta, multiplica, divide y aplica porcentajes dentro del propio conversor.' },
      { title: 'Funciona sin conexión', desc: 'Las últimas tasas se guardan en tu dispositivo, para convertir sin internet.' },
      { title: 'Sin anuncios ni rastreo', desc: 'Sin cuentas, sin analíticas, sin publicidad. Gratis para siempre y privado por diseño.' },
    ],
    popTitle: 'Conversiones populares', popSub: 'Consulta la tasa en vivo de hoy para los pares de divisas más buscados.',
    faqTitle: 'Preguntas frecuentes',
    faqIntro: 'Todo lo que necesitas saber sobre nuestro conversor de divisas gratuito en línea y los tipos de cambio en vivo.',
    faqs: [
      { q: '¿Multi Converter es gratis?', a: 'Sí. Multi Converter es completamente gratis, sin anuncios, sin suscripciones y sin necesidad de registro.' },
      { q: '¿Cuántas monedas puedo convertir?', a: 'Multi Converter admite más de 100 monedas del mundo con tipos de cambio medios de mercado actualizados a diario.' },
      { q: '¿Con qué frecuencia se actualizan las tasas?', a: 'Los tipos de cambio se actualizan a diario desde un conjunto de datos público.' },
      { q: '¿Puedo convertir varias monedas a la vez?', a: 'Sí. Multi Converter muestra todas tus monedas seleccionadas actualizándose juntas mientras escribes, no solo un par.' },
      { q: '¿Funciona sin conexión?', a: 'Sí. Las últimas tasas se guardan en tu dispositivo, así que puedes seguir convirtiendo sin conexión a internet.' },
      { q: '¿Recopilan mis datos?', a: 'No. Multi Converter no recopila datos personales, no usa rastreo ni analíticas y no requiere ninguna cuenta.' },
      { q: '¿Tiene calculadora integrada?', a: 'Sí. Puedes sumar, restar, multiplicar, dividir y aplicar porcentajes directamente dentro del conversor.' },
    ],
    rhTag: 'Historial de tasas', rhTitle: 'Explora las tendencias del tipo de cambio', rhSub: 'Mira cómo ha evolucionado cualquier par de divisas con el tiempo',
    setAlert: 'Crear alerta de tasa', forReference: 'Solo de referencia',
    blog: 'Blog', privacy: 'Privacidad', terms: 'Términos de uso', contact: 'Contacto',
  },
  fr: {
    htmlLang: 'fr',
    metaTitle: 'Convertisseur de devises gratuit — Plus de 100 devises, taux en direct | Multi Converter',
    metaDesc: 'Convertisseur de devises gratuit avec plus de 100 devises, taux de change en direct mis à jour chaque jour et calculatrice intégrée. Convertissez plusieurs devises à la fois. Sans publicité ni inscription.',
    badge: 'Gratuit · Sans inscription · Plus de 100 devises',
    hPre: 'Le seul', hAccent: 'convertisseur de devises', hPost: "dont vous avez besoin",
    subtitle: 'Convertissez plusieurs devises à la fois. Voyez tous vos taux se mettre à jour instantanément pendant que vous tapez. Taux de change en direct mis à jour chaque jour. Calculatrice intégrée.',
    alwaysFree: 'Toujours gratuit.',
    early1: "Désormais en accès anticipé", early2: 'Soyez parmi les premiers à l’essayer',
    comingSoon: 'Bientôt disponible', getNotified: 'Être prévenu au lancement',
    cardTitle: 'Convertisseur de devises', add: 'Ajouter', calculate: 'Calculer :', midMarket: 'Taux interbancaire · À titre indicatif',
    featTitle: 'Tout ce qu’il faut pour convertir',
    featSub: 'Un convertisseur de devises rapide et épuré, sans les publicités, inscriptions et fouillis de tous les autres.',
    features: [
      { title: 'Plus de 100 devises', desc: 'Toutes les devises du monde, principales et secondaires, avec le drapeau de leur pays.' },
      { title: 'Taux quotidiens en direct', desc: 'Taux interbancaires actualisés chaque jour depuis une source publique fiable.' },
      { title: 'Convertir plusieurs à la fois', desc: 'Voyez toutes vos devises se mettre à jour ensemble pendant que vous tapez, pas seulement une paire.' },
      { title: 'Calculatrice intégrée', desc: 'Additionnez, soustrayez, multipliez, divisez et appliquez des pourcentages dans le convertisseur.' },
      { title: 'Fonctionne hors ligne', desc: 'Les derniers taux sont enregistrés sur votre appareil, pour convertir sans internet.' },
      { title: 'Sans publicité ni suivi', desc: 'Aucun compte, aucune analyse, aucune publicité. Gratuit pour toujours et privé par conception.' },
    ],
    popTitle: 'Conversions populaires', popSub: 'Consultez le taux en direct du jour pour les paires de devises les plus recherchées.',
    faqTitle: 'Questions fréquentes',
    faqIntro: 'Tout ce qu’il faut savoir sur notre convertisseur de devises gratuit en ligne et les taux de change en direct.',
    faqs: [
      { q: 'Multi Converter est-il gratuit ?', a: 'Oui. Multi Converter est entièrement gratuit, sans publicité, sans abonnement et sans inscription.' },
      { q: 'Combien de devises puis-je convertir ?', a: 'Multi Converter prend en charge plus de 100 devises mondiales avec des taux interbancaires mis à jour chaque jour.' },
      { q: 'À quelle fréquence les taux sont-ils mis à jour ?', a: 'Les taux de change sont actualisés chaque jour à partir d’un jeu de données public.' },
      { q: 'Puis-je convertir plusieurs devises à la fois ?', a: 'Oui. Multi Converter affiche toutes vos devises sélectionnées qui se mettent à jour ensemble pendant que vous tapez, pas seulement une paire.' },
      { q: 'Fonctionne-t-il hors ligne ?', a: 'Oui. Les derniers taux sont enregistrés sur votre appareil, vous pouvez donc continuer à convertir sans connexion internet.' },
      { q: 'Collectez-vous mes données ?', a: 'Non. Multi Converter ne collecte aucune donnée personnelle, n’utilise ni suivi ni analyse et ne nécessite aucun compte.' },
      { q: 'Y a-t-il une calculatrice intégrée ?', a: 'Oui. Vous pouvez additionner, soustraire, multiplier, diviser et appliquer des pourcentages directement dans le convertisseur.' },
    ],
    rhTag: 'Historique des taux', rhTitle: 'Explorez les tendances des taux de change', rhSub: 'Voyez l’évolution de n’importe quelle paire de devises dans le temps',
    setAlert: 'Créer une alerte de taux', forReference: 'À titre indicatif',
    blog: 'Blog', privacy: 'Confidentialité', terms: 'Conditions d’utilisation', contact: 'Contact',
  },
  de: {
    htmlLang: 'de',
    metaTitle: 'Kostenloser Währungsrechner — Über 100 Währungen mit Live-Kursen | Multi Converter',
    metaDesc: 'Kostenloser Währungsrechner mit über 100 Währungen, täglich aktualisierten Live-Wechselkursen und integriertem Taschenrechner. Mehrere Währungen gleichzeitig umrechnen. Ohne Werbung, ohne Anmeldung.',
    badge: 'Kostenlos · Ohne Anmeldung · Über 100 Währungen',
    hPre: 'Der einzige', hAccent: 'Währungsrechner', hPost: 'den du brauchst',
    subtitle: 'Rechne mehrere Währungen gleichzeitig um. Sieh zu, wie sich alle Kurse sofort aktualisieren, während du tippst. Täglich aktualisierte Live-Wechselkurse. Integrierter Taschenrechner.',
    alwaysFree: 'Immer kostenlos.',
    early1: 'Jetzt im Early Access', early2: 'Sei einer der Ersten',
    comingSoon: 'Demnächst', getNotified: 'Zum Start benachrichtigen',
    cardTitle: 'Währungsrechner', add: 'Hinzufügen', calculate: 'Rechnen:', midMarket: 'Mittelkurs · Nur als Referenz',
    featTitle: 'Alles, was du zum Umrechnen brauchst',
    featSub: 'Ein schneller, klarer Währungsrechner – ohne die Werbung, Anmeldungen und das Durcheinander aller anderen.',
    features: [
      { title: 'Über 100 Währungen', desc: 'Alle großen und kleinen Weltwährungen, jeweils mit Länderflagge.' },
      { title: 'Tägliche Live-Kurse', desc: 'Mittelkurse, jeden Tag aus einer vertrauenswürdigen öffentlichen Quelle aktualisiert.' },
      { title: 'Mehrere gleichzeitig', desc: 'Sieh alle deine Währungen zusammen aktualisieren, während du tippst – nicht nur ein Paar.' },
      { title: 'Integrierter Rechner', desc: 'Addieren, subtrahieren, multiplizieren, dividieren und Prozente direkt im Rechner.' },
      { title: 'Funktioniert offline', desc: 'Die neuesten Kurse werden auf deinem Gerät gespeichert – Umrechnen ohne Internet.' },
      { title: 'Keine Werbung, kein Tracking', desc: 'Keine Konten, keine Analyse, keine Werbung. Für immer kostenlos und von Grund auf privat.' },
    ],
    popTitle: 'Beliebte Umrechnungen', popSub: 'Sieh den heutigen Live-Kurs für die meistgesuchten Währungspaare.',
    faqTitle: 'Häufige Fragen',
    faqIntro: 'Alles Wissenswerte über unseren kostenlosen Online-Währungsrechner und die Live-Wechselkurse.',
    faqs: [
      { q: 'Ist Multi Converter kostenlos?', a: 'Ja. Multi Converter ist völlig kostenlos – ohne Werbung, ohne Abo und ohne Anmeldung.' },
      { q: 'Wie viele Währungen kann ich umrechnen?', a: 'Multi Converter unterstützt über 100 Weltwährungen mit täglich aktualisierten Mittelkursen.' },
      { q: 'Wie oft werden die Kurse aktualisiert?', a: 'Die Wechselkurse werden täglich aus einem öffentlichen Datensatz aktualisiert.' },
      { q: 'Kann ich mehrere Währungen gleichzeitig umrechnen?', a: 'Ja. Multi Converter zeigt alle ausgewählten Währungen, die sich beim Tippen zusammen aktualisieren – nicht nur ein Paar.' },
      { q: 'Funktioniert es offline?', a: 'Ja. Die neuesten Kurse werden auf deinem Gerät gespeichert, sodass du auch ohne Internetverbindung weiter umrechnen kannst.' },
      { q: 'Sammelt ihr meine Daten?', a: 'Nein. Multi Converter sammelt keine personenbezogenen Daten, nutzt kein Tracking und keine Analyse und benötigt kein Konto.' },
      { q: 'Gibt es einen integrierten Taschenrechner?', a: 'Ja. Du kannst direkt im Rechner addieren, subtrahieren, multiplizieren, dividieren und Prozente anwenden.' },
    ],
    rhTag: 'Kursverlauf', rhTitle: 'Entdecke Wechselkurs-Trends', rhSub: 'Sieh, wie sich ein beliebiges Währungspaar über die Zeit entwickelt hat',
    setAlert: 'Kursalarm erstellen', forReference: 'Nur als Referenz',
    blog: 'Blog', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', contact: 'Kontakt',
  },
  pt: {
    htmlLang: 'pt',
    metaTitle: 'Conversor de moedas grátis — Mais de 100 moedas e taxas ao vivo | Multi Converter',
    metaDesc: 'Conversor de moedas grátis com mais de 100 moedas, taxas de câmbio ao vivo atualizadas diariamente e calculadora integrada. Converta várias moedas de uma vez. Sem anúncios nem cadastro.',
    badge: 'Grátis · Sem cadastro · Mais de 100 moedas',
    hPre: 'O único', hAccent: 'conversor de moedas', hPost: 'de que você precisa',
    subtitle: 'Converta várias moedas de uma vez. Veja todas as taxas se atualizarem na hora enquanto você digita. Taxas de câmbio ao vivo atualizadas diariamente. Calculadora integrada.',
    alwaysFree: 'Sempre grátis.',
    early1: 'Agora em acesso antecipado', early2: 'Seja um dos primeiros a usar',
    comingSoon: 'Em breve', getNotified: 'Avise-me no lançamento',
    cardTitle: 'Conversor de moedas', add: 'Adicionar', calculate: 'Calcular:', midMarket: 'Taxa média de mercado · Apenas para referência',
    featTitle: 'Tudo o que você precisa para converter',
    featSub: 'Um conversor de moedas rápido e limpo — sem os anúncios, cadastros e bagunça de todos os outros.',
    features: [
      { title: 'Mais de 100 moedas', desc: 'Todas as moedas do mundo, principais e secundárias, cada uma com a bandeira do país.' },
      { title: 'Taxas diárias ao vivo', desc: 'Taxas médias de mercado atualizadas todos os dias a partir de uma fonte pública confiável.' },
      { title: 'Converta várias de uma vez', desc: 'Veja todas as suas moedas se atualizarem juntas enquanto digita — não só um par.' },
      { title: 'Calculadora integrada', desc: 'Some, subtraia, multiplique, divida e aplique porcentagens dentro do próprio conversor.' },
      { title: 'Funciona offline', desc: 'As taxas mais recentes ficam salvas no seu dispositivo, para converter sem internet.' },
      { title: 'Sem anúncios nem rastreio', desc: 'Sem contas, sem análises, sem publicidade. Grátis para sempre e privado por princípio.' },
    ],
    popTitle: 'Conversões populares', popSub: 'Veja a taxa ao vivo de hoje para os pares de moedas mais procurados.',
    faqTitle: 'Perguntas frequentes',
    faqIntro: 'Tudo o que você precisa saber sobre o nosso conversor de moedas grátis online e as taxas de câmbio ao vivo.',
    faqs: [
      { q: 'O Multi Converter é grátis?', a: 'Sim. O Multi Converter é totalmente grátis, sem anúncios, sem assinaturas e sem necessidade de cadastro.' },
      { q: 'Quantas moedas posso converter?', a: 'O Multi Converter suporta mais de 100 moedas do mundo com taxas médias de mercado atualizadas diariamente.' },
      { q: 'Com que frequência as taxas são atualizadas?', a: 'As taxas de câmbio são atualizadas diariamente a partir de um conjunto de dados público.' },
      { q: 'Posso converter várias moedas de uma vez?', a: 'Sim. O Multi Converter mostra todas as suas moedas selecionadas se atualizando juntas enquanto você digita — não só um par por vez.' },
      { q: 'Funciona offline?', a: 'Sim. As taxas mais recentes ficam salvas no seu dispositivo, então você pode continuar convertendo mesmo sem conexão com a internet.' },
      { q: 'Vocês coletam meus dados?', a: 'Não. O Multi Converter não coleta dados pessoais, não usa rastreio nem análises e não exige nenhuma conta.' },
      { q: 'Tem calculadora integrada?', a: 'Sim. Você pode somar, subtrair, multiplicar, dividir e aplicar porcentagens diretamente dentro do conversor.' },
    ],
    rhTag: 'Histórico de taxas', rhTitle: 'Explore as tendências do câmbio', rhSub: 'Veja como qualquer par de moedas se moveu ao longo do tempo',
    setAlert: 'Criar alerta de taxa', forReference: 'Apenas para referência',
    blog: 'Blog', privacy: 'Privacidade', terms: 'Termos de uso', contact: 'Contato',
  },
}

// Smaller UI strings (converter widgets, modals, blog nav).
export interface UIDict {
  offline: string; updating: string; rates: string; loading: string
  addCurrency: string; changeCurrency: string; searchCurrency: string; noResults: string; popular: string; search: string
  alertTitle: string; above: string; below: string; targetRate: string; notifBlocked: string; saving: string; setAlert: string; activeAlerts: string; triggered: string
  openConverter: string; navConverter: string; navFaq: string
  refreshRates: string; toggleTheme: string; scrollDown: string
  dragToReorder: string; selectCurrency: string; removeCurrency: string; copyAmount: string; copied: string; amountLabel: string
}

export const UI: Record<Lang, UIDict> = {
  en: {
    offline: 'Offline', updating: 'Updating…', rates: 'Rates', loading: 'Loading',
    addCurrency: 'Add currency', changeCurrency: 'Change currency', searchCurrency: 'Search currency...', noResults: 'No results', popular: 'Popular', search: 'Search…',
    alertTitle: 'Rate Alert', above: 'Above', below: 'Below', targetRate: 'Target rate', notifBlocked: 'Browser notifications are blocked. Enable them in browser settings.', saving: 'Saving…', setAlert: 'Set Alert', activeAlerts: 'Active alerts', triggered: 'Triggered',
    openConverter: 'Open converter', navConverter: 'Converter', navFaq: 'FAQ',
    refreshRates: 'Refresh rates', toggleTheme: 'Toggle dark/light theme', scrollDown: 'Scroll to converter',
    dragToReorder: 'Drag to reorder', selectCurrency: 'Select currency', removeCurrency: 'Remove currency', copyAmount: 'Copy amount', copied: 'Copied', amountLabel: 'Amount',
  },
  es: {
    offline: 'Sin conexión', updating: 'Actualizando…', rates: 'Tasas', loading: 'Cargando',
    addCurrency: 'Añadir moneda', changeCurrency: 'Cambiar moneda', searchCurrency: 'Buscar moneda...', noResults: 'Sin resultados', popular: 'Populares', search: 'Buscar…',
    alertTitle: 'Alerta de tasa', above: 'Por encima', below: 'Por debajo', targetRate: 'Tasa objetivo', notifBlocked: 'Las notificaciones del navegador están bloqueadas. Actívalas en los ajustes del navegador.', saving: 'Guardando…', setAlert: 'Crear alerta', activeAlerts: 'Alertas activas', triggered: 'Activada',
    openConverter: 'Abrir conversor', navConverter: 'Conversor', navFaq: 'FAQ',
    refreshRates: 'Actualizar tasas', toggleTheme: 'Cambiar tema claro/oscuro', scrollDown: 'Ir al conversor',
    dragToReorder: 'Arrastra para reordenar', selectCurrency: 'Seleccionar moneda', removeCurrency: 'Eliminar moneda', copyAmount: 'Copiar cantidad', copied: 'Copiado', amountLabel: 'Cantidad',
  },
  fr: {
    offline: 'Hors ligne', updating: 'Mise à jour…', rates: 'Taux', loading: 'Chargement',
    addCurrency: 'Ajouter une devise', changeCurrency: 'Changer de devise', searchCurrency: 'Rechercher une devise...', noResults: 'Aucun résultat', popular: 'Populaires', search: 'Rechercher…',
    alertTitle: 'Alerte de taux', above: 'Au-dessus', below: 'En dessous', targetRate: 'Taux cible', notifBlocked: 'Les notifications du navigateur sont bloquées. Activez-les dans les paramètres du navigateur.', saving: 'Enregistrement…', setAlert: 'Créer l’alerte', activeAlerts: 'Alertes actives', triggered: 'Déclenchée',
    openConverter: 'Ouvrir le convertisseur', navConverter: 'Convertisseur', navFaq: 'FAQ',
    refreshRates: 'Actualiser les taux', toggleTheme: 'Basculer thème clair/sombre', scrollDown: 'Aller au convertisseur',
    dragToReorder: 'Glisser pour réorganiser', selectCurrency: 'Sélectionner une devise', removeCurrency: 'Supprimer la devise', copyAmount: 'Copier le montant', copied: 'Copié', amountLabel: 'Montant',
  },
  de: {
    offline: 'Offline', updating: 'Wird aktualisiert…', rates: 'Kurse', loading: 'Lädt',
    addCurrency: 'Währung hinzufügen', changeCurrency: 'Währung ändern', searchCurrency: 'Währung suchen...', noResults: 'Keine Ergebnisse', popular: 'Beliebt', search: 'Suchen…',
    alertTitle: 'Kursalarm', above: 'Über', below: 'Unter', targetRate: 'Zielkurs', notifBlocked: 'Browser-Benachrichtigungen sind blockiert. Aktiviere sie in den Browsereinstellungen.', saving: 'Wird gespeichert…', setAlert: 'Alarm erstellen', activeAlerts: 'Aktive Alarme', triggered: 'Ausgelöst',
    openConverter: 'Rechner öffnen', navConverter: 'Rechner', navFaq: 'FAQ',
    refreshRates: 'Kurse aktualisieren', toggleTheme: 'Hell-/Dunkelmodus umschalten', scrollDown: 'Zum Rechner scrollen',
    dragToReorder: 'Zum Umsortieren ziehen', selectCurrency: 'Währung auswählen', removeCurrency: 'Währung entfernen', copyAmount: 'Betrag kopieren', copied: 'Kopiert', amountLabel: 'Betrag',
  },
  pt: {
    offline: 'Offline', updating: 'Atualizando…', rates: 'Taxas', loading: 'Carregando',
    addCurrency: 'Adicionar moeda', changeCurrency: 'Trocar moeda', searchCurrency: 'Buscar moeda...', noResults: 'Sem resultados', popular: 'Populares', search: 'Buscar…',
    alertTitle: 'Alerta de taxa', above: 'Acima', below: 'Abaixo', targetRate: 'Taxa alvo', notifBlocked: 'As notificações do navegador estão bloqueadas. Ative-as nas configurações do navegador.', saving: 'Salvando…', setAlert: 'Criar alerta', activeAlerts: 'Alertas ativos', triggered: 'Disparado',
    openConverter: 'Abrir conversor', navConverter: 'Conversor', navFaq: 'FAQ',
    refreshRates: 'Atualizar taxas', toggleTheme: 'Alternar tema claro/escuro', scrollDown: 'Ir para o conversor',
    dragToReorder: 'Arraste para reordenar', selectCurrency: 'Selecionar moeda', removeCurrency: 'Remover moeda', copyAmount: 'Copiar valor', copied: 'Copiado', amountLabel: 'Valor',
  },
}

