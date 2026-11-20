const EXAM_DATE_PREFIX = "Tarix: ";
const EXAM_DESCRIPTION_PREFIX = "Açıqlama: ";
const AZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avqust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
] as const;

export function formatAzDate(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;

  const [, year, month, day] = match;
  const monthName = AZ_MONTHS[Number(month) - 1];
  if (!monthName) return date;

  return `${Number(day)} ${monthName} ${year}`;
}

export function buildExamNotificationBody(
  examDate: string,
  description?: string | null,
) {
  const formattedDate = formatAzDate(examDate);
  const formattedDescription = description?.trim() || "Açıqlama əlavə edilməyib.";

  return `${EXAM_DATE_PREFIX}${formattedDate}\n${EXAM_DESCRIPTION_PREFIX}${formattedDescription}`;
}

export function examinationIdFromEventKey(eventKey: string) {
  const match = /^exam-create:([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.exec(
    eventKey,
  );
  return match?.[1] ?? null;
}

export function parseExamNotificationBody(body: string) {
  const [dateLine, ...descriptionLines] = body.split("\n");
  const description = descriptionLines.join("\n");

  if (
    dateLine.startsWith(EXAM_DATE_PREFIX) &&
    description.startsWith(EXAM_DESCRIPTION_PREFIX)
  ) {
    return {
      date: dateLine.slice(EXAM_DATE_PREFIX.length),
      description: description.slice(EXAM_DESCRIPTION_PREFIX.length),
      examTitle: null,
      questionCount: null,
    };
  }

  const legacyMatch = /^(.*?)\s+·\s+(\d{4}-\d{2}-\d{2})\s+·\s+(\d+)\s+sual$/.exec(
    body.trim(),
  );
  if (!legacyMatch) return null;

  return {
    date: formatAzDate(legacyMatch[2]),
    description: null,
    examTitle: legacyMatch[1].trim(),
    questionCount: Number(legacyMatch[3]),
  };
}
