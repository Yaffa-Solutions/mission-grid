'use client';

import { useState } from 'react';
import { closeMission } from './actions';
import ExportButton from './ExportButton';

type Mission = {
  id: string;
  name: string;
  start_date: string;
  status: string;
  closed_at: string | null;
  closed_by: string | null;
};

type MissionEntry = {
  id: string;
  current_status: string;
  pallets_loaded: number;
  pallets_received: number;
  fuel_liters_company: number;
  fuel_liters_driver: number;
  fuel_station_name: string | null;
  damage_notes: string | null;
  truck: Array<{
    plate_no: string;
    vehicle_type: string | null;
  }> | {
    plate_no: string;
    vehicle_type: string | null;
  };
  driver: Array<{
    name: string;
    national_id: string | null;
    contractor: Array<{
      name: string;
    }> | null;
  }> | null;
};

type ReconciliationViewProps = {
  mission: Mission;
  entries: MissionEntry[];
  missionId: string;
};

export default function ReconciliationView({
  mission,
  entries,
  missionId,
}: ReconciliationViewProps) {
  const [isClosing, setIsClosing] = useState(false);
  const isClosed = mission.status === 'Closed';

  const handleCloseMission = async () => {
    if (!confirm('Are you sure you want to close this mission? This action cannot be undone.')) {
      return;
    }

    setIsClosing(true);
    const result = await closeMission(missionId);

    if (result.success) {
      alert('Mission closed successfully!');
    } else {
      alert(`Error: ${result.error}`);
    }

    setIsClosing(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{mission.name}</h1>
            <p className="text-gray-600 mt-2">Mission Reconciliation & Export</p>
          </div>
          <div className="flex gap-3">
            {!isClosed && (
              <button
                onClick={handleCloseMission}
                disabled={isClosing}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isClosing ? 'Closing...' : '🔒 Close Mission'}
              </button>
            )}
            <ExportButton missionId={missionId} missionName={mission.name} />
          </div>
        </div>

        {/* Mission Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Mission Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(mission.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  isClosed
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {mission.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Trucks</p>
              <p className="font-semibold text-gray-900">{entries.length}</p>
            </div>
          </div>

          {isClosed && mission.closed_at && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Mission closed on{' '}
                {new Date(mission.closed_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Mission Data Summary
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete reconciliation data for all trucks on this mission
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Truck Plate</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Vehicle Type</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Driver</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Driver ID</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Contractor</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Pallets Loaded</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Pallets Received</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Fuel (Co)</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Fuel (Driver)</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Station</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Damage Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-gray-500">
                    No data available for this mission.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const truck = Array.isArray(entry.truck) ? entry.truck[0] : entry.truck;
                  const driver = Array.isArray(entry.driver) ? entry.driver?.[0] : entry.driver;
                  const contractorData = driver?.contractor;
                  const contractor = Array.isArray(contractorData) ? contractorData?.[0] : contractorData;

                  return (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm font-medium">{truck?.plate_no || '—'}</td>
                      <td className="p-3 text-sm text-gray-600">{truck?.vehicle_type || '—'}</td>
                      <td className="p-3 text-sm">{driver?.name || '—'}</td>
                      <td className="p-3 text-sm text-gray-600">{driver?.national_id || '—'}</td>
                      <td className="p-3 text-sm">{contractor?.name || '—'}</td>
                      <td className="p-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {entry.current_status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-center">{entry.pallets_loaded || 0}</td>
                      <td className="p-3 text-sm text-center">{entry.pallets_received || 0}</td>
                      <td className="p-3 text-sm text-center">{entry.fuel_liters_company || 0}L</td>
                      <td className="p-3 text-sm text-center">{entry.fuel_liters_driver || 0}L</td>
                      <td className="p-3 text-sm text-gray-600">{entry.fuel_station_name || '—'}</td>
                      <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                        {entry.damage_notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-6 text-sm">
            <div>
              <p className="text-gray-600">Total Pallets Loaded</p>
              <p className="font-semibold text-gray-900 text-lg">
                {entries.reduce((sum, e) => sum + (e.pallets_loaded || 0), 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Pallets Received</p>
              <p className="font-semibold text-gray-900 text-lg">
                {entries.reduce((sum, e) => sum + (e.pallets_received || 0), 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Fuel (Company)</p>
              <p className="font-semibold text-gray-900 text-lg">
                {entries.reduce((sum, e) => sum + (e.fuel_liters_company || 0), 0)}L
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Fuel (Driver)</p>
              <p className="font-semibold text-gray-900 text-lg">
                {entries.reduce((sum, e) => sum + (e.fuel_liters_driver || 0), 0)}L
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
