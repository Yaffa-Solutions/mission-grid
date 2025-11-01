'use client';

import { useState } from 'react';
import { exportMissionCSV } from './actions';

type ExportButtonProps = {
  missionId: string;
  missionName: string;
};

export default function ExportButton({ missionId, missionName }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    const result = await exportMissionCSV(missionId);

    if (!result.success || !result.csvString) {
      alert(`Error: ${result.error || 'Failed to export CSV'}`);
      setIsExporting(false);
      return;
    }

    // Create a blob and trigger download
    const blob = new Blob([result.csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `mission_${missionName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isExporting ? (
        <>
          <span className="animate-spin">⏳</span>
          Exporting...
        </>
      ) : (
        <>
          📊 Export to CSV
        </>
      )}
    </button>
  );
}
