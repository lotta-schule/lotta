'use client';

import * as React from 'react';
import { Box } from '@lotta-schule/hubert';
import { Header, Main, Sidebar } from 'layout';

import styles from './PrivacyPage.module.scss';

export const PrivacyPage = () => {
  return (
    <>
      <Main className={styles.root}>
        <Header>
          <Box>
            <h3>Datenschutzerklärung</h3>
          </Box>
        </Header>
        <Box className={styles.box}>
          <h4>Einleitung</h4>
          <p>
            Mit der folgenden Datenschutzerklärung möchten wir dich darüber
            aufklären, welche Arten deiner personenbezogenen Daten (nachfolgend
            auch kurz als &quot;Date&quot; bezeichnet) wir zu welchen Zwecken
            und in welchem Umfang verarbeiten. Die Datenschutzerklärung gilt für
            alle von uns durchgeführten Verarbeitungen personenbezogener Daten,
            sowohl im Rahmen der Erbringung unserer Leistungen als auch
            insbesondere auf unseren Webseiten, in mobilen Applikationen sowie
            innerhalb externer Onlinepräsenzen, wie z.B. unserer
            Social-Media-Profile (nachfolgend zusammenfassend bezeichnet als
            &quot;Onlineangebot&quot;).
          </p>
          <p>Stand: 14. März 2024</p>
        </Box>

        <Box className={styles.box}>
          <h4>Verantwortlicher</h4>
          <p>
            <strong>einsA GbR</strong>
            <br />
            Wilhelminenstraße 10
            <br />
            04129 Leipzig
            <br />
            <br />
            kontakt[at]einsa(punkt)net
            <br />
            <br />
            vertretungsberechtigte Person: <strong>Eike Wiewiorra</strong>
          </p>
        </Box>

        <Box className={styles.box}>
          <h4>Übersicht der Verarbeitungen</h4>
          <p>
            Die nachfolgende Übersicht fasst die Arten der verarbeiteten Daten
            und die Zwecke ihrer Verarbeitung zusammen und verweist auf die
            betroffenen Personen.
          </p>
          <h5>Arten der verarbeiteten Daten</h5>
          <p>
            <ul>
              <li>Bestandsdaten (z.B. Namen, Klasse).</li>
              <li>Inhaltsdaten (z.B. Texteingaben, Fotografien, Videos).</li>
              <li>Kontaktdaten (z.B. E-Mail).</li>
              <li>
                Meta-/Kommunikationsdaten (z.B. Geräte-Informationen,
                IP-Adressen).
              </li>
              <li>Nutzungsdaten (z.B. besuchte Seiten, Zugriffszeiten).</li>
            </ul>
          </p>

          <h5>Kategorien betroffener Personen</h5>
          <p>
            <ul>
              <li>
                Nutzer (z.B. Webseitenbesucher, Nutzer von Onlinediensten).
              </li>
            </ul>
          </p>

          <h5>Zwecke der Verarbeitung</h5>
          <p>
            <ul>
              <li>
                Content Delivery Network (optimale Auslieferung von Daten).
              </li>
              <li>
                Logspeicherung zum aufspüren von Fehlern oder
                sicherheitsrelevanten Ereignissen.
              </li>
              <li>
                Vertragliche Leistungen und Service für die Administratoren.
              </li>
              <li>
                Um Nutzer wiederzuerkennen und ihnen die passenden Ansichten
                anzubieten (Vertretungsplan, eigene Beiträge, u.s.w.)
              </li>
              <li>Verwaltung und Beantwortung von Anfragen.</li>
            </ul>
          </p>
        </Box>

        <Box className={styles.box}>
          <h4>Maßgebliche Rechtsgrundlagen</h4>
          <p>
            Im Folgenden teilen wir die Rechtsgrundlagen der
            Datenschutzgrundverordnung (DSGVO), auf deren Basis wir die
            personenbezogenen Daten verarbeiten, mit. Bitte beachte, dass
            zusätzlich zu den Regelungen der DSGVO die nationalen
            Datenschutzvorgaben in deinem bzw. unserem Wohn- und Sitzland gelten
            können.
          </p>
          <p>
            <ul>
              <li>
                <strong>Einwilligung (Art. 6 Abs. 1 S. 1 lit. a DSGVO)</strong>{' '}
                - Die betroffene Person hat ihre Einwilligung in die
                Verarbeitung der sie betreffenden personenbezogenen Daten für
                einen spezifischen Zweck oder mehrere bestimmte Zwecke gegeben.
              </li>
              <li>
                <strong>
                  Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1
                  S. 1 lit. b. DSGVO)
                </strong>{' '}
                - Die Verarbeitung ist für die Erfüllung eines Vertrags, dessen
                Vertragspartei die betroffene Person ist, oder zur Durchführung
                vorvertraglicher Maßnahmen erforderlich, die auf Anfrage der
                betroffenen Person erfolgen.
              </li>
              <li>
                <strong>
                  Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO)
                </strong>{' '}
                - Die Verarbeitung ist zur Wahrung der berechtigten Interessen
                des Verantwortlichen oder eines Dritten erforderlich, sofern
                nicht die Interessen oder Grundrechte und Grundfreiheiten der
                betroffenen Person, die den Schutz personenbezogener Daten
                erfordern, überwiegen.
              </li>
            </ul>
          </p>
          <p>
            <strong>Nationale Datenschutzregelungen in Deutschland:</strong>{' '}
            Zusätzlich zu den Datenschutzregelungen der
            Datenschutz-Grundverordnung gelten nationale Regelungen zum
            Datenschutz in Deutschland. Hierzu gehört insbesondere das Gesetz
            zum Schutz vor Missbrauch personenbezogener Daten bei der
            Datenverarbeitung (Bundesdatenschutzgesetz – BDSG). Das BDSG enthält
            insbesondere Spezialregelungen zum Recht auf Auskunft, zum Recht auf
            Löschung, zum Widerspruchsrecht, zur Verarbeitung besonderer
            Kategorien personenbezogener Daten, zur Verarbeitung für andere
            Zwecke und zur Übermittlung sowie automatisierten
            Entscheidungsfindung im Einzelfall einschließlich Profiling. Des
            Weiteren regelt es die Datenverarbeitung für Zwecke des
            Beschäftigungsverhältnisses (§ 26 BDSG), insbesondere im Hinblick
            auf die Begründung, Durchführung oder Beendigung von
            Beschäftigungsverhältnissen sowie die Einwilligung von
            Beschäftigten. Ferner können Landesdatenschutzgesetze der einzelnen
            Bundesländer zur Anwendung gelangen.
          </p>
        </Box>

        <Box className={styles.box}>
          <h4>Sicherheitsmaßnahmen</h4>
          <p>
            Wir treffen nach Maßgabe der gesetzlichen Vorgaben unter
            Berücksichtigung des Stands der Technik, der Implementierungskosten
            und der Art, des Umfangs, der Umstände und der Zwecke der
            Verarbeitung sowie der unterschiedlichen
            Eintrittswahrscheinlichkeiten und des Ausmaßes der Bedrohung der
            Rechte und Freiheiten natürlicher Personen geeignete technische und
            organisatorische Maßnahmen, um ein dem Risiko angemessenes
            Schutzniveau zu gewährleisten.
          </p>
          <p>
            Zu den Maßnahmen gehören insbesondere die Sicherung der
            Vertraulichkeit, Integrität und Verfügbarkeit von Daten durch
            Kontrolle des physischen und elektronischen Zugangs zu den Daten als
            auch des sie betreffenden Zugriffs, der Eingabe, der Weitergabe, der
            Sicherung der Verfügbarkeit und ihrer Trennung. Des Weiteren haben
            wir Verfahren eingerichtet, die eine Wahrnehmung von
            Betroffenenrechten, die Löschung von Daten und Reaktionen auf die
            Gefährdung der Daten gewährleisten. Ferner berücksichtigen wir den
            Schutz personenbezogener Daten bereits bei der Entwicklung bzw.
            Auswahl von Hardware, Software sowie Verfahren entsprechend dem
            Prinzip des Datenschutzes, durch Technikgestaltung und durch
            datenschutzfreundliche Voreinstellungen.
          </p>
        </Box>

        <Box className={styles.box}>
          <h4>Datenverarbeitung in Drittländern</h4>
          <p>
            Sofern wir Daten in einem Drittland (d.h., außerhalb der
            Europäischen Union (EU), des Europäischen Wirtschaftsraums (EWR))
            verarbeiten oder die Verarbeitung im Rahmen der Inanspruchnahme von
            Diensten Dritter oder der Offenlegung bzw. Übermittlung von Daten an
            andere Personen, Stellen oder Unternehmen stattfindet, erfolgt dies
            nur im Einklang mit den gesetzlichen Vorgaben.
          </p>
          <p>
            Vorbehaltlich ausdrücklicher Einwilligung oder vertraglich oder
            gesetzlich erforderlicher Übermittlung verarbeiten oder lassen wir
            die Daten nur in Drittländern mit einem anerkannten
            Datenschutzniveau, zu denen die unter dem "Privacy-Shield"
            zertifizierten US-Verarbeiter gehören, oder auf Grundlage besonderer
            Garantien, wie z.B. vertraglicher Verpflichtung durch sogenannte
            Standardschutzklauseln der EU-Kommission, des Vorliegens von
            Zertifizierungen oder verbindlicher interner
            Datenschutzvorschriften, verarbeiten (Art. 44 bis 49 DSGVO,
            Informationsseite der EU-Kommission:
            <a
              href="https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection_de"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection_de
            </a>
            ).
          </p>
          <p>
            Alle von Nutzern hochgeladenen Daten werden von uns bei dem
            Unternehmen
            <a
              href="https://www.scaleway.com/en/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Scaleway
            </a>
            auf Servern mit Standorten innerhalb der EU (Polen und Frankreich)
            gespeichert.
          </p>
          <p>
            Wir erstellen momentan ein tägliches Backup unserer Datenbank, das
            wir für 2 Wochen aufheben.
          </p>
          <p>
            Bei uns kommt kein Analytics-Tool von Drittanbietern zum Einsatz.
          </p>
        </Box>

        <Box className={styles.box}>
          <h4>Einsatz von Cookies</h4>
          <p>
            Als "Cookies" werden kleine Dateien bezeichnet, die auf Geräten der
            Nutzer gespeichert werden. Mittels Cookies können unterschiedliche
            Angaben gespeichert werden. Zu den Angaben können z.B. der
            Loginstatus, oder die Stelle, an der ein Video geschaut wurde,
            gehören.
          </p>
          <p>
            Cookies werden im Regelfall auch dann eingesetzt, wenn die
            Interessen eines Nutzers oder sein Verhalten (z.B. Betrachten
            bestimmter Inhalte, Nutzen von Funktionen etc.) auf einzelnen
            Webseiten in einem Nutzerprofil gespeichert werden. Solche Profile
            dienen dazu, den Nutzern z.B. Inhalte anzuzeigen, die ihren
            potentiellen Interessen entsprechen. Dieses Verfahren wird auch als
            "Tracking", d.h., Nachverfolgung der potentiellen Interessen der
            Nutzer bezeichnet. Zu dem Begriff der Cookies zählen wir ferner
            andere Technologien, die die gleichen Funktionen wie Cookies
            erfüllen (z.B., wenn Angaben der Nutzer anhand pseudonymer
            Onlinekennzeichnungen gespeichert werden, auch als "Nutzer-IDs"
            bezeichnet).
          </p>
          <p>
            Soweit wir Cookies oder "Tracking"-Technologien einsetzen,
            informieren wir Sie gesondert in unserer Datenschutzerklärung.
          </p>
          <p>
            <strong>Hinweise zu Rechtsgrundlagen:</strong> Die Rechtsgrundlage
            der Verarbeitung Ihrer Daten ist unserer berechtigten Interessen
            (z.B. betriebswirtschaftlichen Betrieb unseres Onlineangebotes und
            dessen Verbesserung) oder, wenn der Einsatz von Cookies erforderlich
            ist, um unsere vertraglichen Verpflichtungen zu erfüllen.
          </p>
          <p>
            <strong>Widerruf und Widerspruch (Opt-Out):</strong> Du hast
            jederzeit die Möglichkeit, eine erteilte Einwilligung zu widerrufen
            oder der Verarbeitung Deiner Daten durch Cookie-Technologien zu
            widersprechen (zusammenfassend als "Opt-Out" bezeichnet).
            <br />
            Du kannst deinen Widerspruch zunächst mittels der Einstellungen
            deines Browsers erklären, z.B., indem Sie die Nutzung von Cookies
            deaktivierst (wobei hierdurch auch die Funktionsfähigkeit deines
            Onlineangebotes eingeschränkt werden kann).
            <br />
            Für andere Möglichkeiten, schreib uns doch einfach eine Email und
            wir können mit dir weitere Lösungen besprechen.
          </p>
        </Box>

        <Box className={styles.box}>
          <h4>Registrierung und Anmeldung</h4>
          <p>
            Nutzer können ein Nutzerkonto anlegen. Im Rahmen der Registrierung
            werden den Nutzern die erforderlichen Pflichtangaben mitgeteilt und
            zu Zwecken der Bereitstellung des Nutzerkontos auf Grundlage
            vertraglicher Pflichterfüllung verarbeitet. Zu den verarbeiteten
            Daten gehören insbesondere die Login-Informationen (Name, Passwort
            sowie eine E-Mail-Adresse). Die im Rahmen der Registrierung
            eingegebenen Daten werden für die Zwecke der Nutzung des
            Nutzerkontos und dessen Zwecks verwendet.
          </p>
          <p>
            Die Nutzer können über Vorgänge, die für deren Nutzerkonto relevant
            sind, wie z.B. technische Änderungen, per E-Mail informiert werden.
            Wenn Nutzer ihr Nutzerkonto gekündigt haben, werden deren Daten im
            Hinblick auf das Nutzerkonto, vorbehaltlich einer gesetzlichen
            Aufbewahrungspflicht, gelöscht. Es obliegt den Nutzern, ihre Daten
            bei erfolgter Kündigung vor dem Vertragsende zu sichern. Wir sind
            berechtigt, sämtliche während der Vertragsdauer gespeicherte Daten
            des Nutzers unwiederbringlich zu löschen.
          </p>
          <p>
            Im Rahmen der Inanspruchnahme unserer Registrierungs- und
            Anmeldefunktionen sowie der Nutzung des Nutzerkontos speichern wir
            die IP-Adresse und den Zeitpunkt der jeweiligen Nutzerhandlung. Die
            Speicherung erfolgt auf Grundlage unserer berechtigten Interessen
            als auch jener der Nutzer an einem Schutz vor Missbrauch und
            sonstiger unbefugter Nutzung. Eine Weitergabe dieser Daten an Dritte
            erfolgt grundsätzlich nicht, es sei denn, sie ist zur Verfolgung
            unserer Ansprüche erforderlich oder es besteht hierzu besteht eine
            gesetzliche Verpflichtung.
          </p>
          <div>
            <ul>
              <li>
                <strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z.B.
                Namen, Adressen), Kontaktdaten (z.B. E-Mail, Telefonnummern),
                Inhaltsdaten (z.B. Texteingaben, Fotografien, Videos),
                Meta-/Kommunikationsdaten (z.B. Geräte-Informationen,
                IP-Adressen).
              </li>
              <li>
                <strong>Betroffene Personen:</strong> Nutzer (z.B.
                Webseitenbesucher, Nutzer von Onlinediensten).
              </li>
              <li>
                <strong>Zwecke der Verarbeitung:</strong> Vertragliche
                Leistungen und Service, Sicherheitsmaßnahmen, Verwaltung und
                Beantwortung von Anfragen.
              </li>
              <li>
                <strong>Rechtsgrundlagen:</strong> Einwilligung (Art. 6 Abs. 1
                S. 1 lit. a DSGVO), Vertragserfüllung und vorvertragliche
                Anfragen (Art. 6 Abs. 1 S. 1 lit. b. DSGVO), Berechtigte
                Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO).
              </li>
            </ul>
          </div>
        </Box>

        <Box className={styles.box}>
          <h4>Bereitstellung des Onlineangebotes</h4>
          <p>
            Um unser Onlineangebot sicher und effizient bereitstellen zu können,
            nehmen wir die Leistungen von einem oder mehreren
            Webhosting-Anbietern in Anspruch, von deren Servern (bzw. von ihnen
            verwalteten Servern) das Onlineangebot abgerufen werden kann. Zu
            diesen Zwecken können wir Infrastruktur- und
            Plattformdienstleistungen, Rechenkapazität, Speicherplatz und
            Datenbankdienste sowie Sicherheitsleistungen und technische
            Wartungsleistungen in Anspruch nehmen.
          </p>
          <p>
            Zu den im Rahmen der Bereitstellung des Hostingangebotes
            verarbeiteten Daten können alle die Nutzer unseres Onlineangebotes
            betreffenden Angaben gehören, die im Rahmen der Nutzung und der
            Kommunikation anfallen. Hierzu gehören regelmäßig die IP-Adresse,
            die notwendig ist, um die Inhalte von Onlineangeboten an Browser
            ausliefern zu können, und alle innerhalb unseres Onlineangebotes
            oder von Webseiten getätigten Eingaben.
          </p>
          <p>
            Content-Delivery-Network: Wir setzen ein "Content-Delivery-Network"
            (CDN) ein. Ein CDN ist ein Dienst, mit dessen Hilfe Inhalte eines
            Onlineangebotes, insbesondere große Mediendateien, wie Grafiken oder
            Programm-Skripte, mit Hilfe regional verteilter und über das
            Internet verbundener Server schneller und sicherer ausgeliefert
            werden können.
          </p>
          <div>
            <ul>
              <li>
                <strong>Verarbeitete Datenarten:</strong> Inhaltsdaten (z.B.
                Texteingaben, Fotografien, Videos), Nutzungsdaten (z.B. besuchte
                Webseiten, Interesse an Inhalten, Zugriffszeiten),
                Meta-/Kommunikationsdaten (z.B. Geräte-Informationen,
                IP-Adressen).
              </li>
              <li>
                <strong>Betroffene Personen:</strong> Nutzer (z.B.
                Webseitenbesucher, Nutzer von Onlinediensten).
              </li>
              <li>
                <strong>Zwecke der Verarbeitung:</strong> Content Delivery
                Network (CDN).
              </li>
              <li>
                <strong>Rechtsgrundlagen:</strong> Berechtigte Interessen (Art.
                6 Abs. 1 S. 1 lit. f. DSGVO).
              </li>
            </ul>
          </div>
          <h5>Eingesetzte Dienste und Diensteanbieter:</h5>
          <p>
            <ul>
              <li>
                <strong>Scaleway:</strong> Cloud; Dienstanbieter: SCALEWAY,
                Simplified joint stock company with a capital of 214 410,50
                Euros SIREN: 433 115 904 RCS Paris Registered office: 8 rue de
                la Ville l’Evêque, 75008 Paris, Frankreich VAT number: FR 35
                433115904 Director of publication: Arnaud Brindejonc de
                Bermingham Hosted by: SCALEWAY SAS BP 438 75366 PARIS CEDEX 08
                FRANCE; Website: https://scaleway.org; Datenschutzerklärung:
                https://www.scaleway.com/en/privacy-policy/;
              </li>
              <li>
                <strong>Mailgun:</strong> Transactional Emails Dienstanbieter:
                Mailgun Technologies Inc, 112 E Pecan St. #1135 San Antonio
                Texas 78205, Vereinigte Staaten von Amerika Datenschutz:
                https://www.mailgun.com/legal/privacy-policy/ ; DSGVO
                https://www.mailgun.com/resources/learn/gdpr/
              </li>
            </ul>
          </p>
        </Box>

        <Box className={styles.box}>
          <h4>Änderung und Aktualisierung der Datenschutzerklärung</h4>
          <p>
            Wir bitten Sie, sich regelmäßig über den Inhalt unserer
            Datenschutzerklärung zu informieren. Wir passen die
            Datenschutzerklärung an, sobald Änderungen an den von uns
            durchgeführten Datenverarbeitungen dies erforderlich machen. Wir
            informieren Sie, sobald durch die Änderungen eine
            Mitwirkungshandlung Ihrerseits (z.B. Einwilligung) oder eine
            sonstige individuelle Benachrichtigung erforderlich wird.
          </p>
        </Box>

        <Box className={styles.box}>
          <h4>Rechte der betroffenen Personen</h4>
          <p>
            Ihnen wird freigestellt, ob Sie einen der folgenden Ansprüche
            gesetzlich geltend machen:
          </p>
          <div>
            <ul>
              <li>
                <strong>Widerspruchsrecht:</strong> Sie haben das Recht, aus
                Gründen, die sich aus Ihrer besonderen Situation ergeben,
                jederzeit gegen die Verarbeitung der Sie betreffenden
                personenbezogenen Daten, die aufgrund von Art. 6 Abs. 1 lit. e
                oder f DSGVO erfolgt, Widerspruch einzulegen; dies gilt auch für
                ein auf diese Bestimmungen gestütztes Profiling. Werden die Sie
                betreffenden personenbezogenen Daten verarbeitet, um
                Direktwerbung zu betreiben, haben Sie das Recht, jederzeit
                Widerspruch gegen die Verarbeitung der Sie betreffenden
                personenbezogenen Daten zum Zwecke derartiger Werbung
                einzulegen; dies gilt auch für das Profiling, soweit es mit
                solcher Direktwerbung in Verbindung steht.
              </li>
              <li>
                <strong>Widerrufsrecht bei Einwilligungen:</strong> Sie haben
                das Recht, erteilte Einwilligungen jederzeit zu widerrufen.
              </li>
              <li>
                <strong>Auskunftsrecht:</strong> Sie haben das Recht, eine
                Bestätigung darüber zu verlangen, ob betreffende Daten
                verarbeitet werden und auf Auskunft über diese Daten sowie auf
                weitere Informationen und Kopie der Daten entsprechend den
                gesetzlichen Vorgaben.
              </li>
              <li>
                <strong>Recht auf Berichtigung:</strong> Sie haben entsprechend
                den gesetzlichen Vorgaben das Recht, die Vervollständigung der
                Sie betreffenden Daten oder die Berichtigung der Sie
                betreffenden unrichtigen Daten zu verlangen.
              </li>
              <li>
                <strong>
                  Recht auf Löschung und Einschränkung der Verarbeitung:
                </strong>{' '}
                Sie haben nach Maßgabe der gesetzlichen Vorgaben das Recht, zu
                verlangen, dass Sie betreffende Daten unverzüglich gelöscht
                werden, bzw. alternativ nach Maßgabe der gesetzlichen Vorgaben
                eine Einschränkung der Verarbeitung der Daten zu verlangen.
              </li>
              <li>
                <strong>Recht auf Datenübertragbarkeit:</strong> Sie haben das
                Recht, Sie betreffende Daten, die Sie uns bereitgestellt haben,
                nach Maßgabe der gesetzlichen Vorgaben in einem strukturierten,
                gängigen und maschinenlesbaren Format zu erhalten oder deren
                Übermittlung an einen anderen Verantwortlichen zu fordern.
              </li>
              <li>
                <strong>Beschwerde bei Aufsichtsbehörde:</strong> Sie haben
                ferner nach Maßgabe der gesetzlichen Vorgaben das Recht, bei
                einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat Ihres
                gewöhnlichen Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts
                des mutmaßlichen Verstoßes, wenn Sie der Ansicht sind, dass die
                Verarbeitung der Sie betreffenden personenbezogenen Daten gegen
                die DSGVO verstößt.
              </li>
            </ul>
          </div>
          <h5>Für uns zuständige Aufsichtsbehörde:</h5>
          <p>
            <strong>Andreas Schurig</strong>
            <br />
            Devrientstraße 5<br />
            01067 Dresden
            <br />
            <br />
            Telefon: 03 51/85471-101
            <br />
            Telefax: 03 51/85471-109
            <br />
          </p>
        </Box>

        <Box className={styles.box}>
          <h4>Begriffsdefinitionen</h4>
          <p>
            In diesem Abschnitt erhalten Sie eine Übersicht über die in dieser
            Datenschutzerklärung verwendeten Begrifflichkeiten. Viele der
            Begriffe sind dem Gesetz entnommen und vor allem im Art. 4 DSGVO
            definiert. Die gesetzlichen Definitionen sind verbindlich. Die
            nachfolgenden Erläuterungen sollen dagegen vor allem dem Verständnis
            dienen. Die Begriffe sind alphabetisch sortiert.
          </p>
          <ul>
            <li>
              <strong>Content Delivery Network (CDN):</strong> Ein "Content
              Delivery Network" (CDN) ist ein Dienst, mit dessen Hilfe Inhalte
              eines Onlineangebotes, insbesondere große Mediendateien, wie
              Grafiken oder Programm-Skripte mit Hilfe regional verteilter und
              über das Internet verbundener Server, schneller und sicherer
              ausgeliefert werden können.
            </li>
            <li>
              <strong>Personenbezogene Daten:</strong> "Personenbezogene Daten"
              sind alle Informationen, die sich auf eine identifizierte oder
              identifizierbare natürliche Person (im Folgenden "betroffene
              Person") beziehen; als identifizierbar wird eine natürliche Person
              angesehen, die direkt oder indirekt, insbesondere mittels
              Zuordnung zu einer Kennung wie einem Namen, zu einer Kennnummer,
              zu Standortdaten, zu einer Online-Kennung (z.B. Cookie) oder zu
              einem oder mehreren besonderen Merkmalen identifiziert werden
              kann, die Ausdruck der physischen, physiologischen, genetischen,
              psychischen, wirtschaftlichen, kulturellen oder sozialen Identität
              dieser natürlichen Person sind.
            </li>
            <li>
              <strong>Verantwortlicher:</strong> Als "Verantwortlicher" wird die
              natürliche oder juristische Person, Behörde, Einrichtung oder
              andere Stelle, die allein oder gemeinsam mit anderen über die
              Zwecke und Mittel der Verarbeitung von personenbezogenen Daten
              entscheidet, bezeichnet.
            </li>
            <li>
              <strong>Verarbeitung:</strong> "Verarbeitung" ist jeder mit oder
              ohne Hilfe automatisierter Verfahren ausgeführte Vorgang oder jede
              solche Vorgangsreihe im Zusammenhang mit personenbezogenen Daten.
              Der Begriff reicht weit und umfasst praktisch jeden Umgang mit
              Daten, sei es das Erheben, das Auswerten, das Speichern, das
              Übermitteln oder das Löschen.
            </li>
          </ul>
        </Box>
      </Main>
      <Sidebar isEmpty />
    </>
  );
};
