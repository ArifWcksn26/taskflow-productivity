import { Task, Category, TeamMember } from '../types';

export class ExportService {
  /**
   * Export tasks to CSV with full UTF-8 support
   */
  public static exportToCSV(tasks: Task[], categories: Category[], members: TeamMember[]): void {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const memberMap = new Map(members.map((m) => [m.id, m.name]));

    const headers = [
      'ID',
      'Judul Tugas',
      'Deskripsi',
      'Kategori',
      'Prioritas',
      'Status',
      'Tanggal Tenggat',
      'Jam Tenggat',
      'Pengingat (Menit)',
      'Subtask Selesai',
      'Total Subtask',
      'Ditugaskan Kepada',
      'Pengulangan',
      'Estimasi Waktu (Menit)',
      'Tanggal Dibuat',
    ];

    const rows = tasks.map((task) => {
      const categoryName = categoryMap.get(task.categoryId) || 'Umum';
      const assignedNames = task.assignedMemberIds.map((id) => memberMap.get(id) || id).join('; ');
      const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
      const totalSubtasks = task.subtasks.length;
      const statusStr = task.isCompleted ? 'Selesai' : 'Belum Selesai';

      return [
        task.id,
        `"${(task.title || '').replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        `"${categoryName}"`,
        task.priority.toUpperCase(),
        statusStr,
        task.dueDate || '-',
        task.dueTime || '-',
        task.reminderMinutesBefore ? `${task.reminderMinutesBefore} mnt` : 'Tidak Ada',
        completedSubtasks.toString(),
        totalSubtasks.toString(),
        `"${assignedNames}"`,
        task.recurrence || 'none',
        task.estimatedMinutes ? `${task.estimatedMinutes} mnt` : '-',
        task.createdAt || '-',
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TaskFlow_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export comprehensive PDF report (dynamically imports jsPDF)
   */
  public static async exportToPDF(
    tasks: Task[],
    categories: Category[],
    members: TeamMember[],
    reportTitle: string = 'Laporan Aktivitas & Produktivitas Tugas'
  ): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const memberMap = new Map(members.map((m) => [m.id, m.name]));

    // Statistics Calculation
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const today = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter((t) => !t.isCompleted && t.dueDate < today).length;

    // Header Background
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 38, 'F');

    // Brand & Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TASKFLOW', 14, 16);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225); // Slate-300
    doc.text(reportTitle, 14, 24);

    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.setFontSize(9);
    doc.text(`Dihasilkan pada: ${dateStr}`, 14, 31);

    // Summary Metric Cards
    const startY = 46;
    const cardWidth = 42;
    const cardHeight = 22;

    const stats = [
      { label: 'Total Tugas', value: `${total}`, color: [59, 130, 246] }, // Blue
      { label: 'Telah Selesai', value: `${completed}`, color: [16, 185, 129] }, // Emerald
      { label: 'Pending', value: `${pending}`, color: [245, 158, 11] }, // Amber
      { label: 'Penyelesaian', value: `${completionRate}%`, color: [139, 92, 246] }, // Purple
    ];

    stats.forEach((stat, i) => {
      const x = 14 + i * (cardWidth + 5);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'FD');

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, x + 4, startY + 7);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.text(stat.value, x + 4, startY + 16);
    });

    if (overdue > 0) {
      doc.setFontSize(9);
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.text(`⚠️ Perhatian: Terdapat ${overdue} tugas yang melewati batas waktu (overdue).`, 14, startY + cardHeight + 8);
    }

    // Task Table
    const tableData = tasks.map((task, idx) => {
      const cat = categoryMap.get(task.categoryId) || 'Umum';
      const assigned = task.assignedMemberIds.map((id) => memberMap.get(id) || id).join(', ') || '-';
      const subDone = task.subtasks.filter((s) => s.isCompleted).length;
      const subTotal = task.subtasks.length;
      const subtaskStr = subTotal > 0 ? `${subDone}/${subTotal}` : '-';
      const statusStr = task.isCompleted ? 'SELESAI' : task.dueDate < today ? 'TERLAMBAT' : 'AKTIF';

      return [
        (idx + 1).toString(),
        task.title,
        cat,
        task.priority.toUpperCase(),
        `${task.dueDate} ${task.dueTime || ''}`.trim(),
        subtaskStr,
        assigned,
        statusStr,
      ];
    });

    autoTable(doc, {
      startY: overdue > 0 ? startY + cardHeight + 12 : startY + cardHeight + 8,
      head: [['#', 'Judul Tugas', 'Kategori', 'Prioritas', 'Tenggat', 'Subtask', 'Penanggung Jawab', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 50 },
        2: { cellWidth: 24 },
        3: { cellWidth: 18 },
        4: { cellWidth: 25 },
        5: { cellWidth: 15 },
        6: { cellWidth: 32 },
        7: { cellWidth: 20 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 7) {
          const val = data.cell.raw;
          if (val === 'SELESAI') {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'TERLAMBAT') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [59, 130, 246];
          }
        }
      },
    });

    // Save and Trigger Download
    doc.save(`TaskFlow_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Generate .ICS calendar file for export
   */
  public static exportToICS(tasks: Task[]): void {
    const calendarEvents: string[] = [];

    tasks.forEach((task) => {
      if (!task.dueDate) return;

      const dateClean = task.dueDate.replace(/-/g, '');
      const timeClean = (task.dueTime || '09:00').replace(/:/g, '') + '00';
      const dtStart = `${dateClean}T${timeClean}`;

      const desc = `${task.description || ''}\\n\\nPrioritas: ${task.priority.toUpperCase()}\\nSubtasks: ${task.subtasks.map((s) => (s.isCompleted ? '✓' : '□') + ' ' + s.text).join('\\n')}`;

      const event = [
        'BEGIN:VEVENT',
        `UID:taskflow-${task.id}@taskflow.app`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtStart}`,
        `SUMMARY:${task.title.replace(/[,;]/g, ' ')}`,
        `DESCRIPTION:${desc.replace(/[\n\r]/g, '\\n')}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n');

      calendarEvents.push(event);
    });

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TaskFlow//Kalender & Pengingat//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...calendarEvents,
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TaskFlow_Calendar_${new Date().toISOString().split('T')[0]}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate Google Calendar Event Link for a specific task
   */
  public static getGoogleCalendarUrl(task: Task): string {
    const dateClean = task.dueDate.replace(/-/g, '');
    const timeClean = (task.dueTime || '09:00').replace(/:/g, '') + '00';
    const startIso = `${dateClean}T${timeClean}`;

    const text = encodeURIComponent(task.title);
    const details = encodeURIComponent(
      `${task.description || ''}\n\nPrioritas: ${task.priority.toUpperCase()}\nStatus: ${task.isCompleted ? 'Selesai' : 'Belum Selesai'}`
    );
    const dates = `${startIso}/${startIso}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
  }
}
