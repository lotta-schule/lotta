import _i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    de: {
        translation: {
            files: {
                file: 'Datei',
                files_one: '{{count}} Datei',
                files_other: '{{count}} Dateien',
                format: 'Format',
                formats_one: '{{count}} Format',
                formats_other: '{{count}} Formate',
                explorer: {
                    filesAreBeingUploaded: '$t(files.file) wird hochgeladen',
                    filesAreBeingUploaded_other:
                        '$t(files.files, {"count": {{count}}}) werden hochgeladen',
                    dropFilesToUpload_one: 'Loslassen, um Datei hochzuladen.',
                    dropFilesToUpload_other:
                        'Loslassen, um $t(files.files, {"count": {{count}}}) hochzuladen.',
                    markedFiles:
                        '$t(files.files, {"count": {{count}}}) von $t(files.files, {"count": {{total}}}) ausgewählt.',
                    totalFiles:
                        '$t(files.files, {"count": {{count}}}) im Ordner',
                    selectFiles:
                        '$t(files.files, {"count": {{count}}}) auswählen',
                },
                usage: {
                    preview: 'Vorschaubild',
                    banner: 'Bannerbild',
                    file: 'Moduldatei',
                    avatar: 'Profilbild',
                    logo: 'Logo',
                    background: 'Hintergrundbild',
                },
                filetypes: {
                    PDF: 'PDF-Dokument',
                    IMAGE: 'Bild',
                    VIDEO: 'Video',
                    AUDIO: 'Audio-Aufnahme',
                    MISC: 'Sonstiges',
                    DIRECTORY: 'Ordner',
                },
            },
            widgets: {
                widget: 'Marginale',
                widgets: '{{count}} Marginale',
            },
            administration: {
                result: 'Ergebnis',
                results_one: '{{count}} Ergebnis',
                results_other: '{{count}} Ergebnisse',
                results_zero: '0 Ergebnisse',
            },
        },
    },
};

_i18n.use(initReactI18next).init({
    resources,
    lng: 'de',

    keySeparator: '.',

    interpolation: {
        escapeValue: false,
    },
});

export const i18n = _i18n;
