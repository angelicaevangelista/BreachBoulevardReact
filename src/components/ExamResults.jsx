import React from 'react';
export function searchExamResults(query) {
  const database = [
    { id: 1, course: 'Biology', semester: 'Spring 2023', grade: 'A' },
    { id: 2, course: 'Mathematics', semester: 'Fall 2022', grade: 'B' },
    { id: 3, course: 'Programming', semester: 'Spring 2023', grade: 'A' },
  ];
  return [
    ...database.filter(
      (record) =>
        record.course.toLowerCase().includes(query.toLowerCase()) ||
        record.semester.toLowerCase().includes(query.toLowerCase())
    ),
    ...(query.toLowerCase().includes('union')
      ? [{ id: 4, course: 'Admin Access', semester: 'Root Access', grade: 'N/A' }]
      : []),
  ];
}
export default function ExamResults({ query }) {
  if (query === null) return null;
  const records = searchExamResults(query);
  if (!records.length) return <p className="text-red-600">No results found for "{query}".</p>;
  return (
    <table className="w-full bg-white text-left rounded-lg shadow-md">
      <thead className="bg-orange-600 text-white">
        <tr>
          {['ID', 'Course', 'Semester', 'Grade'].map((label) => (
            <th key={label} className="py-2 px-4">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.id} className="hover:bg-gray-200">
            {Object.values(record).map((value, index) => (
              <td key={index} className="py-2 px-4">
                {value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
