/**
 * Alle Texte an einer Stelle.
 *
 * Ehrlichkeitsregel: keine erfundenen Kunden, Logos oder Testimonials.
 * Zahlen ausschließlich als ausgewiesene Zielkorridore.
 */

export const CLAIM = "Intelligent Systems. Real Business Impact.";

export const CONTACT = {
  // Platzhalter — bitte durch die echte Adresse ersetzen.
  email: "kontakt@orvidion.de",
};

/**
 * Anwendungsfälle.
 *
 * Bewusst als „Heute / Danach" statt als Leistungsbeschreibung: Wer
 * Automatisierung sucht, erkennt sich an der Beschreibung seines Alltags
 * wieder, nicht an einer Technologieliste. Alle vier sind Abläufe, die im
 * Mittelstand regelmäßig vorkommen.
 */
export const CASES = [
  {
    n: "01",
    title: "Angebote aus Anfragen",
    today:
      "Anfragen kommen als E-Mail oder PDF. Jemand liest sie, sucht Preise und Textbausteine zusammen und tippt das Angebot.",
    after:
      "Positionen, Mengen und Kundendaten werden ausgelesen, das Angebot entsteht als Entwurf im eigenen System. Freigegeben wird weiterhin von Hand.",
  },
  {
    n: "02",
    title: "Rechnungseingang",
    today:
      "Jede Rechnung wird gesichtet, gegen Bestellung und Lieferschein gehalten, bei Abweichung wird nachtelefoniert.",
    after:
      "Der Abgleich gegen Bestellung läuft automatisch. Auf dem Tisch landet nur noch, was abweicht — mit dem Hinweis, woran es liegt.",
  },
  {
    n: "03",
    title: "Anfragen und Tickets",
    today:
      "Der Posteingang wird morgens sortiert und weitergeleitet, häufig zweimal, weil beim ersten Mal der falsche Bereich zuständig war.",
    after:
      "Eingänge werden klassifiziert, dem zuständigen Bereich zugeordnet und mit einem Antwortentwurf versehen.",
  },
  {
    n: "04",
    title: "Stammdaten",
    today:
      "Dieselbe Adresse steht in drei Systemen. Zwei davon sind veraltet, und niemand weiß, welches führt.",
    after:
      "Eine Quelle führt, die übrigen ziehen nach. Änderungen laufen an einer Stelle ein statt an dreien.",
  },
];

/** Die vier Arbeitsbereiche — kompakt, als Ergänzung zu den Anwendungsfällen. */
export const CAPABILITIES = [
  {
    title: "KI-Automatisierung",
    body: "Wiederkehrende Entscheidungen und Textarbeit übernehmen Modelle — in klaren Regeln, mit nachvollziehbarem Ergebnis.",
  },
  {
    title: "Verbundene Abläufe",
    body: "Bestehende Systeme geben Daten direkt weiter. Keine Exporte, keine Zwischenschritte, keine doppelte Pflege.",
  },
  {
    title: "Struktur & Datenmodell",
    body: "Wir klären erst, was wo gilt und wer entscheidet. Ohne Modell automatisiert man das Chaos mit.",
  },
  {
    title: "Betrieb & Messung",
    body: "Wir übergeben nicht nur, wir betreiben mit: Kennzahlen, Fehlerbilder, laufendes Nachschärfen.",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Analyse",
    body: "Wir nehmen die tatsächlichen Abläufe auf — nicht die dokumentierten — und rechnen den Aufwand gegen die eingesparte Handarbeit. Am Ende steht eine Zahl, keine Präsentation.",
  },
  {
    n: "02",
    title: "Struktur",
    body: "Datenmodell, Regeln und Verantwortlichkeiten werden festgelegt. Erst danach wird gebaut.",
  },
  {
    n: "03",
    title: "Umsetzung",
    body: "Automatisierung geht in kleinen, prüfbaren Schritten in Betrieb. Jeder Schritt ist für sich nützlich.",
  },
  {
    n: "04",
    title: "Betrieb",
    body: "Messen, nachschärfen, auf weitere Bereiche ausdehnen. Danach beginnt die nächste Analyse.",
  },
];

export const TARGETS = [
  {
    value: "60–80 %",
    label: "weniger manuelle Übergaben",
    note: "in den Abläufen, die wir automatisieren",
  },
  {
    value: "4–8 Wochen",
    label: "bis zum ersten produktiven Ablauf",
    note: "vom Analysegespräch bis in den Betrieb",
  },
  {
    value: "1 Modell",
    label: "ein Datenmodell statt gewachsener Parallelstrukturen",
    note: "eine Quelle für alles, was vorher mehrfach gepflegt wurde",
  },
];

/**
 * Klartext.
 *
 * Die Fragen, die in jedem ersten Gespräch kommen — beantwortet, bevor sie
 * gestellt werden müssen. Die Mitbestimmung nach § 87 BetrVG steht bewusst
 * dabei: sie ist einer der häufigsten Gründe, warum Automatisierungsprojekte
 * im Mittelstand hängenbleiben, und fast niemand spricht sie vorher an.
 */
export const ANSWERS = [
  {
    q: "Wohin gehen unsere Daten?",
    a: "In die EU. Wir arbeiten mit Modellen, die in europäischen Rechenzentren laufen, mit Auftragsverarbeitungsvertrag. Wo Daten das Haus gar nicht verlassen dürfen, läuft das Modell bei Ihnen.",
  },
  {
    q: "Was bedeutet der EU AI Act für uns?",
    a: "Die Abläufe, über die wir meistens sprechen, sind Systeme mit geringem Risiko. Wir dokumentieren trotzdem von Anfang an, was das System tut, worauf es entscheidet und wer eingreift. Diese Arbeit fällt später ohnehin an.",
  },
  {
    q: "Muss der Betriebsrat zustimmen?",
    a: "Sobald Beschäftigtendaten berührt sind oder Verhalten messbar wird: ja, § 87 BetrVG. Wir planen das als Schritt ein statt als Überraschung. Eine Betriebsvereinbarung braucht Wochen — daran sollte kein Projekt scheitern.",
  },
  {
    q: "Machen wir uns von Ihnen abhängig?",
    a: "Nein. Was wir bauen, läuft in Ihren Systemen und Ihren Konten. Sie bekommen Dokumentation, Zugänge und die Regeln in lesbarer Form. Wenn Sie uns nicht mehr brauchen, läuft es weiter.",
  },
  {
    q: "Und wenn es sich nicht rechnet?",
    a: "Dann sagen wir das. Die Analyse endet mit einer Zahl: geschätzter Aufwand gegen eingesparte Handarbeit. Trägt sie nicht, raten wir ab — das ist billiger für Sie als ein Projekt, das niemand nutzt.",
  },
  {
    q: "Warum stehen hier keine Kundenlogos?",
    a: "Weil ORVIDION jung ist und fremde Logos nichts über die Arbeit sagen. Was wir belegen können, belegen wir im Gespräch an einem Ihrer Abläufe — mit offenem Aufwand und offener Grenze.",
  },
];
