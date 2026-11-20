type ResultRow = {
  examination_id: string;
  student_id: string;
  correct_answers: number;
};

type ExistingResult = {
  student_id: string;
  correct_answers: number;
};

export function classifyResultChanges(
  rows: ResultRow[],
  existingResults: ExistingResult[],
) {
  const previousByStudent = new Map(
    existingResults.map((result) => [result.student_id, result.correct_answers]),
  );
  const changedRows = rows.filter(
    (row) => previousByStudent.get(row.student_id) !== row.correct_answers,
  );

  return {
    changedRows,
    newlyPublishedStudentIds: changedRows
      .filter((row) => !previousByStudent.has(row.student_id))
      .map((row) => row.student_id),
    updatedStudentIds: changedRows
      .filter((row) => previousByStudent.has(row.student_id))
      .map((row) => row.student_id),
  };
}
