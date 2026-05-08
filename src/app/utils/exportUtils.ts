import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Timetable, DAYS, PERIODS, PERIOD_TIMINGS, SUBJECTS, FACULTIES, CLASSROOMS } from '../data/mockData';

/**
 * Export timetable to PDF
 */
export function exportToPDF(timetable: Timetable) {
  const doc = new jsPDF('landscape');

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SCHEDULIX - AI TIMETABLE SCHEDULER', 148, 15, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Department: ${timetable.department} | Semester: ${timetable.semester} | Section: ${timetable.section}`,
    148,
    25,
    { align: 'center' }
  );

  // Table headers
  const startX = 10;
  const startY = 35;
  const cellWidth = 35;
  const cellHeight = 10;
  const headerHeight = 12;

  // Draw header row
  doc.setFillColor(59, 130, 246); // Blue background
  doc.setTextColor(255, 255, 255); // White text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  // Day/Period header
  doc.rect(startX, startY, cellWidth, headerHeight, 'F');
  doc.text('Day / Period', startX + 2, startY + 8);

  // Period headers
  PERIODS.slice(0, 8).forEach((period, index) => {
    const x = startX + cellWidth + index * cellWidth;
    doc.rect(x, startY, cellWidth, headerHeight, 'F');
    doc.text(`P${period}`, x + cellWidth / 2, startY + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.text(PERIOD_TIMINGS[period], x + cellWidth / 2, startY + 10, { align: 'center' });
    doc.setFontSize(9);
  });

  // Draw data rows
  doc.setTextColor(0, 0, 0); // Black text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  let currentY = startY + headerHeight;

  DAYS.forEach((day) => {
    // Day column
    doc.setFillColor(243, 244, 246); // Light gray background
    doc.rect(startX, currentY, cellWidth, cellHeight, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.text(day, startX + 2, currentY + 7);
    doc.setFont('helvetica', 'normal');

    // Period columns
    PERIODS.slice(0, 8).forEach((period, pIndex) => {
      const x = startX + cellWidth + pIndex * cellWidth;
      const entry = timetable.entries.find(e => e.day === day && e.period === period && !e.isCancelled);

      doc.rect(x, currentY, cellWidth, cellHeight, 'D');

      if (entry) {
        const subject = SUBJECTS.find(s => s.id === entry.subjectId);
        const faculty = FACULTIES.find(f => f.id === entry.facultyId);
        const classroom = CLASSROOMS.find(c => c.id === entry.classroomId);

        if (subject && faculty && classroom) {
          doc.setFontSize(7);
          doc.text(subject.subjectCode, x + 2, currentY + 3);
          doc.text(faculty.name.split(' ')[1] || faculty.name, x + 2, currentY + 6);
          doc.text(classroom.classroomNumber, x + 2, currentY + 9);
          doc.setFontSize(8);
        }
      } else {
        doc.setTextColor(150, 150, 150);
        doc.text('---', x + cellWidth / 2, currentY + 7, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
    });

    currentY += cellHeight;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    148,
    currentY + 15,
    { align: 'center' }
  );

  // Save PDF
  doc.save(`Timetable_${timetable.department}_${timetable.section}.pdf`);
}

/**
 * Export timetable to Excel
 */
export function exportToExcel(timetable: Timetable) {
  // Create worksheet data
  const data: any[][] = [];

  // Header row 1 - Title
  data.push([`SCHEDULIX - ${timetable.department} ${timetable.section} Timetable (Semester ${timetable.semester})`]);
  data.push([]); // Empty row

  // Header row - Period timings
  const periodHeaders = ['Day / Period'];
  PERIODS.slice(0, 8).forEach(period => {
    periodHeaders.push(`Period ${period}\n${PERIOD_TIMINGS[period]}`);
  });
  data.push(periodHeaders);

  // Data rows
  DAYS.forEach(day => {
    const row = [day];

    PERIODS.slice(0, 8).forEach(period => {
      const entry = timetable.entries.find(e => e.day === day && e.period === period && !e.isCancelled);

      if (entry) {
        const subject = SUBJECTS.find(s => s.id === entry.subjectId);
        const faculty = FACULTIES.find(f => f.id === entry.facultyId);
        const classroom = CLASSROOMS.find(c => c.id === entry.classroomId);

        if (subject && faculty && classroom) {
          row.push(`${subject.subjectCode}\n${faculty.name}\n${classroom.classroomNumber}`);
        } else {
          row.push('---');
        }
      } else {
        row.push('---');
      }
    });

    data.push(row);
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths = [{ wch: 15 }];
  for (let i = 0; i < 8; i++) {
    colWidths.push({ wch: 20 });
  }
  ws['!cols'] = colWidths;

  // Set row heights
  const rowHeights = [{ hpt: 20 }, { hpt: 10 }, { hpt: 30 }];
  for (let i = 0; i < DAYS.length; i++) {
    rowHeights.push({ hpt: 60 });
  }
  ws['!rows'] = rowHeights;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable');

  // Save file
  XLSX.writeFile(wb, `Timetable_${timetable.department}_${timetable.section}.xlsx`);
}

/**
 * Export faculty timetable to PDF
 */
export function exportFacultyToPDF(facultyName: string, entries: any[], department: string) {
  const doc = new jsPDF('landscape');

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SCHEDULIX - FACULTY TIMETABLE', 148, 15, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Faculty: ${facultyName} | Department: ${department}`, 148, 25, { align: 'center' });

  // Table (similar structure to main timetable)
  const startX = 10;
  const startY = 35;
  const cellWidth = 35;
  const cellHeight = 10;
  const headerHeight = 12;

  // Header
  doc.setFillColor(59, 130, 246);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.rect(startX, startY, cellWidth, headerHeight, 'F');
  doc.text('Day / Period', startX + 2, startY + 8);

  PERIODS.slice(0, 8).forEach((period, index) => {
    const x = startX + cellWidth + index * cellWidth;
    doc.rect(x, startY, cellWidth, headerHeight, 'F');
    doc.text(`P${period}`, x + cellWidth / 2, startY + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.text(PERIOD_TIMINGS[period], x + cellWidth / 2, startY + 10, { align: 'center' });
    doc.setFontSize(9);
  });

  // Data rows
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  let currentY = startY + headerHeight;

  DAYS.forEach(day => {
    doc.setFillColor(243, 244, 246);
    doc.rect(startX, currentY, cellWidth, cellHeight, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.text(day, startX + 2, currentY + 7);
    doc.setFont('helvetica', 'normal');

    PERIODS.slice(0, 8).forEach((period, pIndex) => {
      const x = startX + cellWidth + pIndex * cellWidth;
      const entry = entries.find(e => e.day === day && e.period === period && !e.isCancelled);

      doc.rect(x, currentY, cellWidth, cellHeight, 'D');

      if (entry) {
        doc.setFontSize(7);
        doc.text(entry.subject || '---', x + 2, currentY + 4);
        doc.text(entry.section || '', x + 2, currentY + 7);
        doc.setFontSize(8);
      } else {
        doc.setTextColor(150, 150, 150);
        doc.text('---', x + cellWidth / 2, currentY + 7, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
    });

    currentY += cellHeight;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    148,
    currentY + 15,
    { align: 'center' }
  );

  doc.save(`Faculty_Timetable_${facultyName.replace(/\s+/g, '_')}.pdf`);
}
