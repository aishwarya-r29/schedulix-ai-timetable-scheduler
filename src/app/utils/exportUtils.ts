import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import {
  Timetable,
  DAYS,
  PERIODS,
  PERIOD_TIMINGS,
  SUBJECTS,
  FACULTIES,
  CLASSROOMS,
} from '../data/mockData';
import { fetchSubjects, fetchFaculties, fetchClassrooms } from '../utils/api';
import logo from '../assets/logo.png';

// ─── Helper ───────────────────────────────────────────────────────────────────

function normalizeDay(day: string) {
  return day.trim().toLowerCase();
}

// ─── Export Timetable to PDF ──────────────────────────────────────────────────

/**
 * Exports a section timetable to a PDF that looks exactly like the dashboard table.
 */
export async function exportToPDF(timetable: Timetable) {
  console.log('exportToPDF – start', timetable.section);

  // Fetch fresh data (fall back to mock constants if API is down)
  const [subjectData, facultyData, classroomData] = await Promise.all([
    fetchSubjects().catch(() => SUBJECTS),
    fetchFaculties().catch(() => FACULTIES),
    fetchClassrooms().catch(() => CLASSROOMS),
  ]);

  // Build a fast lookup map: "monday_1" → entry
  const entryMap = new Map<string, (typeof timetable.entries)[0]>();
  for (const entry of timetable.entries) {
    const key = `${normalizeDay(entry.day)}_${entry.period}`;
    if (!entryMap.has(key)) entryMap.set(key, entry);
  }

  // ── Document setup ─────────────────────────────────────────────────────────
  const doc = new jsPDF('l', 'mm', 'a4'); // A4 landscape

  // ── Banner ─────────────────────────────────────────────────────────────────
  doc.setFillColor(30, 58, 138); // same dark‑blue as the UI gradient
  doc.rect(0, 0, 297, 35, 'F');

  if (logo) {
    try { doc.addImage(logo, 'PNG', 8, 4, 26, 26); } catch { /* ignore */ }
  }

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('PSG COLLEGE OF TECHNOLOGY', 160, 14, { align: 'center' });
  doc.setFontSize(13);
  doc.text('SCHEDULIX – AI TIMETABLE SCHEDULER', 160, 24, { align: 'center' });

  // ── Info bar ───────────────────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 35, 297, 12, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`DEPARTMENT : ${timetable.department.toUpperCase()}`, 15, 43);
  doc.text(`SECTION : ${timetable.section}`, 110, 43);
  doc.text(`SEMESTER : ${timetable.semester}`, 210, 43);

  // ── Table layout ───────────────────────────────────────────────────────────
  const startX = 10;
  const startY = 51;
  const periodColWidth = 38; // first column: "DAY / PERIOD"
  const dayColWidth     = (297 - startX * 2 - periodColWidth) / DAYS.length; // ~43 mm
  const headerH = 11;
  const cellH   = 17;

  // ── Header row ─────────────────────────────────────────────────────────────
  // "DAY / PERIOD" cell
  doc.setFillColor(30, 58, 138);
  doc.rect(startX, startY, periodColWidth, headerH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DAY / PERIOD', startX + periodColWidth / 2, startY + 7, { align: 'center' });

  // Day name cells (mirrors the blue header in the UI)
  DAYS.forEach((day, i) => {
    const x = startX + periodColWidth + i * dayColWidth;
    doc.setFillColor(59, 130, 246); // indigo‑500 matches UI header
    doc.rect(x, startY, dayColWidth, headerH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(String(day).toUpperCase(), x + dayColWidth / 2, startY + 7, { align: 'center' });
  });

  // ── Data rows ──────────────────────────────────────────────────────────────
  let curY = startY + headerH;

  PERIODS.slice(0, 8).forEach((period, pIdx) => {
    // Period label cell (matches the "sticky left" column in the UI)
    const rowBg = pIdx % 2 === 0 ? [255, 255, 255] : [250, 251, 252];
    doc.setFillColor(241, 245, 249);
    doc.rect(startX, curY, periodColWidth, cellH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`Period ${period}`, startX + 2, curY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(PERIOD_TIMINGS[period] ?? '', startX + 2, curY + 12);

    // Day cells
    DAYS.forEach((day, dIdx) => {
      const x   = startX + periodColWidth + dIdx * dayColWidth;
      const key = `${normalizeDay(day)}_${period}`;
      const entry = entryMap.get(key);

      // Alternating row background
      doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
      doc.rect(x, curY, dayColWidth, cellH, 'FD');

      if (!entry) {
        // Empty slot
        doc.setTextColor(203, 213, 225);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('—', x + dayColWidth / 2, curY + cellH / 2 + 2, { align: 'center' });
        return;
      }

      if (entry.isCancelled) {
        // Red cancelled label
        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('CANCELLED', x + dayColWidth / 2, curY + cellH / 2 + 2, { align: 'center' });
        doc.setTextColor(30, 41, 59);
        return;
      }

      const subject   = subjectData.find(s => s.id === entry.subjectId);
      const faculty   = facultyData.find(f => f.id === entry.facultyId);
      const classroom = classroomData.find(c => c.id === entry.classroomId);

      if (subject && faculty && classroom) {
        // Line 1 – subject code (bold, like the UI)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255); // white‑ish but on light bg → use dark
        doc.setTextColor(30, 41, 59);
        doc.text(subject.subjectCode, x + dayColWidth / 2, curY + 5, { align: 'center' });

        // Line 2 – subject name (smaller, slate‑300 equivalent)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        const nameTrunc = subject.subjectName.length > 14
          ? subject.subjectName.slice(0, 13) + '…'
          : subject.subjectName;
        doc.text(nameTrunc, x + dayColWidth / 2, curY + 10, { align: 'center' });

        // Line 3 – "LastName | Room" (tiny, slate‑400 equivalent)
        doc.setFontSize(5.5);
        doc.setTextColor(148, 163, 184);
        const lastName = faculty.name ? faculty.name.split(' ').pop() ?? faculty.name : 'N/A';
        const roomLine = `${lastName} | ${classroom.classroomNumber}`;
        const roomTrunc = roomLine.length > 16 ? roomLine.slice(0, 15) + '…' : roomLine;
        doc.text(roomTrunc, x + dayColWidth / 2, curY + 14.5, { align: 'center' });


      } else {
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('—', x + dayColWidth / 2, curY + cellH / 2 + 2, { align: 'center' });
      }
    });

    curY += cellH;
  });

  // ── Footer ─────────────────────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `PSG College of Technology – Generated by Schedulix AI  |  ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    148.5,
    208,
    { align: 'center' }
  );

  doc.save(`PSG_Timetable_${(timetable.section || 'export').replace(/\s+/g, '_')}.pdf`);
  console.log('exportToPDF – done');
}

// ─── Export Timetable to Excel ────────────────────────────────────────────────

export async function exportToExcel(timetable: Timetable) {
  const [subjectData, facultyData, classroomData] = await Promise.all([
    fetchSubjects().catch(() => SUBJECTS),
    fetchFaculties().catch(() => FACULTIES),
    fetchClassrooms().catch(() => CLASSROOMS),
  ]);

  const normalizeDay = (d: string) => d.trim().toLowerCase();
  const entryMap = new Map<string, (typeof timetable.entries)[0]>();
  for (const entry of timetable.entries) {
    const key = `${normalizeDay(entry.day)}_${entry.period}`;
    if (!entryMap.has(key)) entryMap.set(key, entry);
  }

  const data: string[][] = [];
  data.push([`PSG COLLEGE OF TECHNOLOGY – ${timetable.department} ${timetable.section} (Sem ${timetable.semester})`]);
  data.push([]);

  const headers = ['Day / Period', ...PERIODS.slice(0, 8).map(p => `Period ${p}\n${PERIOD_TIMINGS[p] ?? ''}`)];
  data.push(headers);

  DAYS.forEach(day => {
    const row: string[] = [day];
    PERIODS.slice(0, 8).forEach(period => {
      const key   = `${normalizeDay(day)}_${period}`;
      const entry = entryMap.get(key);
      if (!entry) { row.push(''); return; }
      if (entry.isCancelled) { row.push('CANCELLED'); return; }
      const subject   = subjectData.find(s => s.id === entry.subjectId);
      const faculty   = facultyData.find(f => f.id === entry.facultyId);
      const classroom = classroomData.find(c => c.id === entry.classroomId);
      if (subject && faculty && classroom) {
        row.push(`${subject.subjectCode}\n${subject.subjectName}\n${faculty.name}\n${classroom.classroomNumber}`);
      } else {
        row.push('---');
      }
    });
    data.push(row);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 18 }, ...Array(8).fill({ wch: 24 })];
  ws['!rows'] = [{ hpt: 20 }, { hpt: 5 }, { hpt: 28 }, ...Array(DAYS.length).fill({ hpt: 55 })];
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
  XLSX.writeFile(wb, `PSG_Timetable_${timetable.department}_${timetable.section}.xlsx`);
}

// ─── Export Faculty Timetable to PDF ──────────────────────────────────────────

export function exportFacultyToPDF(facultyName: string, entries: any[], department: string) {
  const doc = new jsPDF('l', 'mm', 'a4');

  // Banner
  doc.setFillColor(22, 101, 52);
  doc.rect(0, 0, 297, 35, 'F');
  if (logo) {
    try { doc.addImage(logo, 'PNG', 8, 4, 26, 26); } catch { /* ignore */ }
  }
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('PSG COLLEGE OF TECHNOLOGY', 160, 14, { align: 'center' });
  doc.setFontSize(13);
  doc.text('FACULTY TIMETABLE', 160, 24, { align: 'center' });

  // Info bar
  doc.setFillColor(240, 253, 244);
  doc.rect(0, 35, 297, 12, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(`FACULTY : ${facultyName.toUpperCase()}`, 15, 43);
  doc.text(`DEPARTMENT : ${department.toUpperCase()}`, 120, 43);
  doc.text(`DATE : ${new Date().toLocaleDateString()}`, 220, 43);

  // Table layout
  const startX = 10;
  const startY = 51;
  const periodColWidth = 38;
  const dayColWidth = (297 - startX * 2 - periodColWidth) / DAYS.length;
  const headerH = 11;
  const cellH   = 17;

  // Header row
  doc.setFillColor(22, 101, 52);
  doc.rect(startX, startY, periodColWidth, headerH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DAY / PERIOD', startX + periodColWidth / 2, startY + 7, { align: 'center' });

  DAYS.forEach((day, i) => {
    const x = startX + periodColWidth + i * dayColWidth;
    doc.setFillColor(34, 197, 94);
    doc.rect(x, startY, dayColWidth, headerH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(String(day).toUpperCase(), x + dayColWidth / 2, startY + 7, { align: 'center' });
  });

  // Data rows
  let curY = startY + headerH;
  PERIODS.slice(0, 8).forEach((period, pIdx) => {
    const rowBg = pIdx % 2 === 0 ? [255, 255, 255] : [250, 251, 252];
    doc.setFillColor(241, 245, 249);
    doc.rect(startX, curY, periodColWidth, cellH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`Period ${period}`, startX + 2, curY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(PERIOD_TIMINGS[period] ?? '', startX + 2, curY + 12);

    DAYS.forEach((day, dIdx) => {
      const x = startX + periodColWidth + dIdx * dayColWidth;
      const entry = entries.find(e => e.day === day && e.period === period && !e.isCancelled);
      doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
      doc.rect(x, curY, dayColWidth, cellH, 'FD');
      if (entry) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(entry.subject || '---', x + dayColWidth / 2, curY + 5, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text(entry.section || '', x + dayColWidth / 2, curY + 10, { align: 'center' });
        doc.setFontSize(5.5);
        doc.setTextColor(148, 163, 184);
        doc.text(entry.classroom || '', x + dayColWidth / 2, curY + 14.5, { align: 'center' });
      } else {
        doc.setTextColor(203, 213, 225);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('—', x + dayColWidth / 2, curY + cellH / 2 + 2, { align: 'center' });
      }
    });
    curY += cellH;
  });

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `PSG College of Technology – Generated by Schedulix AI  |  ${new Date().toLocaleDateString()}`,
    148.5, 208, { align: 'center' }
  );

  const safeName = (facultyName || 'Faculty').replace(/\s+/g, '_');
  doc.save(`PSG_Faculty_${safeName}.pdf`);
}
