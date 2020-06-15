import _i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    de: {
        translation: {
            files: {
                file: 'Datei',
                files: '{{count}} Datei',
                files_plural: '{{count}} Dateien',
                format: 'Format',
                formats: '{{count}} Format',
                formats_plural: '{{count}} Formate',
                explorer: {
                    filesAreBeingUploaded: '$t(files.file) wird hochgeladen',
                    filesAreBeingUploaded_plural: '$t(files.files, {"count": {{count}}}) werden hochgeladen',
                    dropFilesToUpload: 'Loslassen, um Datei hochzuladen.',
                    dropFilesToUpload_plural: 'Loslassen, um $t(files.files, {"count": {{count}}}) hochzuladen.',
                    markedFiles: '$t(files.files, {"count": {{count}}}) von $t(files.files, {"count": {{total}}}) ausgewählt.',
                    totalFiles: '$t(files.files, {"count": {{count}}}) im Ordner',
                    selectFiles: '$t(files.files, {"count": {{count}}}) auswählen',
                },
                usage: {
                    preview: 'Vorschaubild',
                    banner: 'Bannerbild',
                    file: 'Moduldatei',
                    avatar: 'Profilbild',
                    logo: 'Logo',
                    background: 'Hintergrundbild'
                },
                filetypes: {
                    PDF: 'PDF-Dokument',
                    IMAGE: 'Bild',
                    VIDEO: 'Video',
                    AUDIO: 'Audio-Aufnahme',
                    MISC: 'Sonstiges',
                    DIRECTORY: 'Ordner'
                }
            },
            widgets: {
                widget: 'Marginale',
                widgets: '{{count}} Marginale',
            },
            administration: {
                result: 'Ergebnis',
                results: '{{count}} Ergebnis',
                results_plural: '{{count}} Ergebnisse',
                results_0: '0 Ergebnisse',
            }
        }
    }
};

_i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'de',

        keySeparator: '.',

        interpolation: {
            escapeValue: false
        }
    });

export const i18n = _i18n;
