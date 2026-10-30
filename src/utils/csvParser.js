import Papa from 'papaparse';

/**
 * Parses CSV text content into standardized Question objects matching Firestore schema.
 * Supports both quizQuestion.csv format and PRD specification format.
 */
export function parseQuestionsCsv(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          const questions = [];
          const rawRows = results.data;

          rawRows.forEach((row, index) => {
            // Find keys dynamically to handle variations
            const keys = Object.keys(row);
            const findKey = (...candidates) => {
              for (const cand of candidates) {
                const match = keys.find(k => k.toLowerCase().replace(/[-_\s]/g, '') === cand.toLowerCase().replace(/[-_\s]/g, ''));
                if (match && row[match] !== undefined) return row[match].toString().trim();
              }
              return '';
            };

            const qIdRaw = findKey('sno', 'questionid', 'qid', 'id') || `Q${index + 1}`;
            const questionText = findKey('question', 'questiontext', 'text');
            const optA = findKey('optiona', 'optiona', 'a');
            const optB = findKey('optionb', 'optionb', 'b');
            const optC = findKey('optionc', 'optionc', 'c');
            const optD = findKey('optiond', 'optiond', 'd');
            let answer = findKey('answer', 'correctoption', 'correct').toUpperCase();
            const marksStr = findKey('marks', 'mark', 'points');
            const marks = marksStr ? (parseInt(marksStr, 10) || 1) : 1;

            // Only include rows that have question text and valid options
            if (questionText && optA && optB) {
              // Standardize answer to A, B, C, or D
              if (!['A', 'B', 'C', 'D'].includes(answer)) {
                console.warn(`Row ${index + 1}: Invalid or missing answer '${answer}'. Defaulting to 'A'.`);
                answer = 'A';
              }

              questions.push({
                questionId: String(qIdRaw),
                order: index + 1,
                questionText: questionText,
                options: {
                  A: optA,
                  B: optB,
                  C: optC || '',
                  D: optD || ''
                },
                correctOption: answer,
                marks: marks
              });
            }
          });

          resolve(questions);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * Trigger browser download for CSV string
 */
export function downloadCsvFile(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate CSV for Leaderboard export
 */
export function exportLeaderboardToCsv(submissions, filename = 'leaderboard.csv') {
  const data = submissions.map((sub, idx) => ({
    Rank: idx + 1,
    'User Email': sub.userEmail || '',
    'Display Name': sub.displayName || '',
    'Total Score': sub.totalScore ?? 0,
    'Max Score': sub.maxScore ?? 0,
    'Attempt Number': sub.attemptNumber || 1,
    'Submitted At (IST)': sub.submittedAt || '',
    'User ID': sub.userId || ''
  }));

  const csv = Papa.unparse(data);
  downloadCsvFile(filename, csv);
}
