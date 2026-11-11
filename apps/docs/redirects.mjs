// @ts-check
/**
 * Redirects from the old GitBook documentation (docs.lotta.schule/lotta/...,
 * source: github.com/lotta-schule/docs) and from earlier pages of this site
 * to their new pages, so existing links and bookmarks keep working.
 */

/** Old GitBook path (below /lotta/) → new page */
const gitbook = {
  'der-uberblick/lotta-aufsetzen': '/erste-schritte/lotta-einrichten/',
  'der-uberblick/benutzeroberflaeche': '/erste-schritte/lotta-kennenlernen/',
  'lotta-verwalten/lotta-einrichten': '/erste-schritte/lotta-einrichten/',
  'lotta-verwalten/lotta-einrichten/gruppen-erstellen': '/verwalten/gruppen/',
  'lotta-verwalten/lotta-einrichten/einschreibeschlussel':
    '/verwalten/einschreibeschluessel/',
  'lotta-verwalten/lotta-einrichten/gruppen-loschen': '/verwalten/gruppen/',
  'lotta-verwalten/lotta-einrichten/nutzer':
    '/verwalten/rechte-und-sichtbarkeit/',
  'lotta-verwalten/lotta-einrichten/nutzer/dauerhafte-and-temporare-gruppen':
    '/verwalten/schuljahreswechsel/',
  'lotta-verwalten/lotta-einrichten/nutzer/bsp.-grundschule-gruppen-und-einschreibeschlussel':
    '/verwalten/beispiele/',
  'lotta-verwalten/lotta-einrichten/nutzer/bsp.-grundschule-kategorien-and-sichtbarkeiten':
    '/verwalten/beispiele/',
  'lotta-verwalten/lotta-einrichten/nutzer/bsp.-gymnasium-gruppen-und-einschreibeschlussel':
    '/verwalten/beispiele/',
  'lotta-verwalten/lotta-einrichten/nutzer/bsp.-gymnasium-sichtbarkeit-von-kategorien-und-beitragen':
    '/verwalten/beispiele/',
  'lotta-verwalten/lotta-einrichten/kategorien-erstellen':
    '/verwalten/kategorien/',
  'lotta-verwalten/lotta-einrichten/einstellungen-fur-kategorien':
    '/verwalten/kategorie-einstellungen/',
  'lotta-verwalten/lotta-einrichten/kalender-erstellen': '/verwalten/kalender/',
  'lotta-verwalten/lotta-einrichten/marginalen': '/verwalten/marginalen/',
  'lotta-verwalten/lotta-einrichten/marginalen/kalender':
    '/verwalten/marginalen/',
  'lotta-verwalten/lotta-einrichten/marginalen/marginalen-mit-externen-kalendern':
    '/verwalten/marginalen/',
  'lotta-verwalten/lotta-einrichten/marginalen/webseite':
    '/verwalten/marginalen/',
  'lotta-verwalten/lotta-einrichten/marginalen/vertretungsplan':
    '/verwalten/marginalen/',
  'lotta-verwalten/lotta-einrichten/grundeinstellungen-and-darstellung':
    '/verwalten/darstellung/',
  'lotta-verwalten/beitrage-freigeben-und-verwalten':
    '/verwalten/beitraege-freigeben/',
  'lotta-verwalten/feedback': '/verwalten/feedback/',
  'lotta-verwalten/nutzung-and-statistiken':
    '/verwalten/nutzung-und-statistiken/',
  'lotta-verwalten/besonderheiten': '/nutzen/navigation/',
  'lotta-nutzen/account': '/nutzen/profil/',
  'lotta-nutzen/account/registrierung': '/erste-schritte/anmelden/',
  'lotta-nutzen/account/login': '/erste-schritte/anmelden/',
  'lotta-nutzen/account/profil-bearbeiten': '/nutzen/profil/',
  'lotta-nutzen/dateien-verwalten': '/nutzen/dateien/',
  'lotta-nutzen/dateien': '/beitraege/veroeffentlichen/',
  'lotta-nutzen/nachrichten': '/nutzen/nachrichten/',
  'lotta-nutzen/beitrage-schreiben': '/beitraege/erster-beitrag/',
  'lotta-nutzen/beitrage-schreiben/die-module-allgemeines':
    '/beitraege/module/',
  'lotta-nutzen/beitrage-schreiben/text': '/beitraege/module/text/',
  'lotta-nutzen/beitrage-schreiben/das-dateimodul': '/beitraege/module/datei/',
  'lotta-nutzen/beitrage-schreiben/bild': '/beitraege/module/bild/',
  'lotta-nutzen/beitrage-schreiben/das-audiomodul': '/beitraege/module/audio/',
  'lotta-nutzen/beitrage-schreiben/video': '/beitraege/module/video/',
  'lotta-nutzen/beitrage-schreiben/galerie': '/beitraege/module/galerie/',
  'lotta-nutzen/beitrage-schreiben/tabelle': '/beitraege/module/tabelle/',
  'lotta-nutzen/beitrage-schreiben/formular': '/beitraege/module/formular/',
  'lotta-nutzen/beitrage-schreiben/reaktionen-auf-beitrage':
    '/nutzen/reaktionen/',
  'lotta-nutzen/beitrage-schreiben/beitragseinstellungen':
    '/beitraege/einstellungen/',
  'lotta-nutzen/feedback': '/nutzen/feedback/',
  'aktualisierungen/lotta-6.1': '/neuigkeiten/lotta-6-1/',
};

/** Pages of the first version of this site → new page */
const previous = {
  '/anleitung/erste-schritte': '/erste-schritte/anmelden/',
  '/administration/benutzer-und-gruppen': '/verwalten/mitglieder/',
};

export const redirects = {
  '/lotta': '/',
  ...Object.fromEntries(
    Object.entries(gitbook).map(([from, to]) => [`/lotta/${from}`, to])
  ),
  ...previous,
};

/** The old GitBook paths, for the redirect check in the README */
export const gitbookPaths = Object.keys(gitbook);
