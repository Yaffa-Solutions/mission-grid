'use client';

import { useState } from 'react';
import { updateTruckStatus, requestGL, approveGL, logFuel, logDelivery } from './actions';

type MissionStep = {
  step_name: string;
  requires_gl: boolean;
};

type TruckEntry = {
  id: string;
  truck_id: string;
  driver_id: string | null;
  current_status: string;
  gl_requested: boolean;
  gl_approved: boolean;
  fuel_liters_company: number;
  fuel_liters_driver: number;
  fuel_station_name: string | null;
  truck: {
    plate_no: string;
    vehicle_type: string | null;
  }[];
  driver:
    | {
        name: string;
      }[]
    | null;
};

type DispatchBoardProps = {
  mission_id: string;
  mission_name: string;
  steps: MissionStep[];
  entries: TruckEntry[];
};

export default function DispatchBoard({
  mission_id,
  mission_name,
  steps,
  entries,
}: DispatchBoardProps) {
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState('');

  // Fuel modal state
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelEntryId, setFuelEntryId] = useState<string | null>(null);
  const [fuelData, setFuelData] = useState({
    fuel_liters_company: 0,
    fuel_liters_driver: 0,
    fuel_station_name: '',
  });

  // Delivery modal state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryEntryId, setDeliveryEntryId] = useState<string | null>(null);
  const [deliveryData, setDeliveryData] = useState({
    pallets_loaded: 0,
    pallets_received: 0,
    damage_notes: '',
  });

  // Toggle selection
  const toggleSelection = (entryId: string) => {
    setSelectedEntryIds((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId]
    );
  };

  // Select all
  const selectAll = () => {
    if (selectedEntryIds.length === entries.length) {
      setSelectedEntryIds([]);
    } else {
      setSelectedEntryIds(entries.map((e) => e.id));
    }
  };

  // Get current status of selected trucks
  const getSelectedStatuses = () => {
    const selected = entries.filter((e) => selectedEntryIds.includes(e.id));
    return [...new Set(selected.map((e) => e.current_status))];
  };

  // Determine next step based on current status
  const getNextSteps = () => {
    const statuses = getSelectedStatuses();

    // If multiple different statuses, can't determine next step
    if (statuses.length !== 1) {
      return [];
    }

    const currentStatus = statuses[0];
    const currentStepIndex = steps.findIndex(
      (s) => s.step_name === currentStatus
    );

    if (currentStepIndex === -1) {
      // Current status is not a step (e.g., "Dispatched"), show all steps
      return steps;
    }

    // Return remaining steps after current
    return steps.slice(currentStepIndex + 1);
  };

  // Check if next step requires GL
  const nextStepRequiresGL = () => {
    const nextSteps = getNextSteps();
    return nextSteps.length > 0 && nextSteps[0].requires_gl;
  };

  // Check if all selected have GL approved
  const allHaveGLApproved = () => {
    const selected = entries.filter((e) => selectedEntryIds.includes(e.id));
    return selected.every((e) => e.gl_approved);
  };

  // Check if all selected have requested GL
  const allHaveRequestedGL = () => {
    const selected = entries.filter((e) => selectedEntryIds.includes(e.id));
    return selected.every((e) => e.gl_requested);
  };

  // Handle status update for single truck
  const handleUpdateSingleStatus = async (entryId: string, newStatus: string) => {
    // Check if the new status requires GL approval
    const targetStep = steps.find((s) => s.step_name === newStatus);
    const entry = entries.find((e) => e.id === entryId);

    if (targetStep?.requires_gl && !entry?.gl_approved) {
      alert('GL approval required before moving to this status. Please request GL first.');
      return;
    }

    setIsUpdating(true);
    await updateTruckStatus(mission_id, [entryId], newStatus);
    setIsUpdating(false);
    setActiveRowId(null);
    setSelectedNewStatus('');
  };

  // Handle GL request for single truck
  const handleRequestSingleGL = async (entryId: string) => {
    setIsUpdating(true);
    await requestGL(mission_id, [entryId]);
    setIsUpdating(false);
  };

  // Handle status update for multiple trucks
  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    await updateTruckStatus(mission_id, selectedEntryIds, newStatus);
    setIsUpdating(false);
    setShowStatusModal(false);
    setSelectedEntryIds([]);
  };

  // Get next steps for a specific truck
  const getNextStepsForTruck = (currentStatus: string) => {
    const currentStepIndex = steps.findIndex(
      (s) => s.step_name === currentStatus
    );

    if (currentStepIndex === -1) {
      return steps;
    }

    return steps.slice(currentStepIndex + 1);
  };

  // Handle GL request
  const handleRequestGL = async () => {
    setIsUpdating(true);
    await requestGL(mission_id, selectedEntryIds);
    setIsUpdating(false);
  };

  // Handle GL approval
  const handleApproveGL = async () => {
    setIsUpdating(true);
    await approveGL(mission_id, selectedEntryIds);
    setIsUpdating(false);
  };

  // Handle fuel logging
  const handleLogFuel = async () => {
    if (!fuelEntryId) return;

    setIsUpdating(true);
    const result = await logFuel(mission_id, fuelEntryId, fuelData);

    if (result.success) {
      setShowFuelModal(false);
      setFuelEntryId(null);
      setFuelData({
        fuel_liters_company: 0,
        fuel_liters_driver: 0,
        fuel_station_name: '',
      });
    } else {
      alert(`Error: ${result.error}`);
    }

    setIsUpdating(false);
  };

  // Handle delivery logging
  const handleLogDelivery = async () => {
    if (!deliveryEntryId) return;

    setIsUpdating(true);
    const result = await logDelivery(mission_id, deliveryEntryId, deliveryData);

    if (result.success) {
      setShowDeliveryModal(false);
      setDeliveryEntryId(null);
      setDeliveryData({
        pallets_loaded: 0,
        pallets_received: 0,
        damage_notes: '',
      });
    } else {
      alert(`Error: ${result.error}`);
    }

    setIsUpdating(false);
  };

  // Open fuel modal
  const openFuelModal = (entryId: string, entry: TruckEntry) => {
    setFuelEntryId(entryId);
    setFuelData({
      fuel_liters_company: entry.fuel_liters_company || 0,
      fuel_liters_driver: entry.fuel_liters_driver || 0,
      fuel_station_name: entry.fuel_station_name || '',
    });
    setShowFuelModal(true);
  };

  const selectedCount = selectedEntryIds.length;
  const nextSteps = getNextSteps();
  const requiresGL = nextStepRequiresGL();

  return (
    <div>
      <div className="rounded-lg shadow-md p-6 mb-6 bg-white border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-gray-700">Mission Steps:</span>
          {steps.map((step, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                step.requires_gl
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {step.step_name}
              {step.requires_gl && ' 🚦'}
            </span>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedCount > 0 && (
        <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4 mb-4 sticky top-4 z-10">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold">
                {selectedCount} truck(s) selected
              </span>
              {getSelectedStatuses().length === 1 && (
                <span className="ml-4 text-sm">
                  Current: {getSelectedStatuses()[0]}
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {/* Request GL Button */}
              {requiresGL && !allHaveGLApproved() && (
                <button
                  onClick={handleRequestGL}
                  disabled={isUpdating || allHaveRequestedGL()}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {allHaveRequestedGL() ? '⏳ GL Requested' : '🚦 Request GL'}
                </button>
              )}

              {/* Approve GL Button (for Ops Manager) */}
              {requiresGL && allHaveRequestedGL() && !allHaveGLApproved() && (
                <button
                  onClick={handleApproveGL}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                  ✅ Approve GL
                </button>
              )}

              {/* Update Status Button */}
              <button
                onClick={() => setShowStatusModal(true)}
                disabled={
                  isUpdating ||
                  (requiresGL && !allHaveGLApproved()) ||
                  getSelectedStatuses().length !== 1
                }
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {requiresGL && !allHaveGLApproved()
                  ? '🔒 GL Required'
                  : '📝 Update Status'}
              </button>

              <button
                onClick={() => setSelectedEntryIds([])}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ✕ Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Truck List */}
      <div className="rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedEntryIds.length === entries.length &&
                    entries.length > 0
                  }
                  onChange={selectAll}
                  className="w-5 h-5 cursor-pointer"
                />
              </th>
              <th className="p-4 text-left font-semibold">Truck</th>
              <th className="p-4 text-left font-semibold">Driver</th>
              <th className="p-4 text-left font-semibold">Current Status</th>
              <th className="p-4 text-left font-semibold">GL Status</th>
              <th className="p-4 text-left font-semibold">Fuel</th>
              <th className="p-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No trucks assigned to this mission yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const truck = entry.truck && entry.truck[0];
                const driver = entry.driver && entry.driver[0];
                const isSelected = selectedEntryIds.includes(entry.id);
                const isActiveRow = activeRowId === entry.id;
                const nextSteps = getNextStepsForTruck(entry.current_status);

                // Check if next step requires GL
                const nextStepRequiresGLForTruck = nextSteps.length > 0 && nextSteps[0].requires_gl;
                const needsGLApproval = nextStepRequiresGLForTruck && !entry.gl_approved;

                return (
                  <tr key={entry.id} className={`border-b ${isActiveRow ? 'bg-blue-50' : ''}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(entry.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-semibold">
                      🚚 {truck?.plate_no || 'Unknown'}
                      {truck?.vehicle_type && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({truck.vehicle_type})
                        </span>
                      )}
                    </td>
                    <td className="p-4">{driver?.name || 'No driver'}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {entry.current_status}
                      </span>
                    </td>
                    <td className="p-4">
                      {entry.gl_approved ? (
                        <span className="text-green-600 font-semibold">
                          ✅ Approved
                        </span>
                      ) : entry.gl_requested ? (
                        <span className="text-yellow-600 font-semibold">
                          ⏳ Requested
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      {entry.fuel_liters_company > 0 ||
                      entry.fuel_liters_driver > 0 ? (
                        <div>
                          <div>Co: {entry.fuel_liters_company}L</div>
                          <div>Driver: {entry.fuel_liters_driver}L</div>
                          {entry.fuel_station_name && (
                            <div className="text-xs text-gray-500">
                              @ {entry.fuel_station_name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isActiveRow ? (
                        <div className="flex gap-2 items-center">
                          <select
                            value={selectedNewStatus}
                            onChange={(e) => setSelectedNewStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select status...</option>
                            {nextSteps.map((step, idx) => (
                              <option key={idx} value={step.step_name}>
                                {step.step_name} {step.requires_gl ? '🚦' : ''}
                              </option>
                            ))}
                            <option value="In Maintenance">🔧 In Maintenance</option>
                            <option value="Completed">✅ Completed</option>
                          </select>
                          <button
                            onClick={() => handleUpdateSingleStatus(entry.id, selectedNewStatus)}
                            disabled={!selectedNewStatus || isUpdating}
                            className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setActiveRowId(null);
                              setSelectedNewStatus('');
                            }}
                            className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          {/* Request GL button if next step requires GL */}
                          {needsGLApproval && !entry.gl_requested && (
                            <button
                              onClick={() => handleRequestSingleGL(entry.id)}
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              🚦 Request GL
                            </button>
                          )}
                          {/* Show GL status if requested */}
                          {entry.gl_requested && !entry.gl_approved && (
                            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs rounded border border-yellow-300">
                              ⏳ GL Pending
                            </span>
                          )}
                          <button
                            onClick={() => setActiveRowId(entry.id)}
                            disabled={isUpdating || needsGLApproval}
                            className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            title={needsGLApproval ? 'GL approval required' : ''}
                          >
                            {needsGLApproval ? '🔒 Status' : 'Status'}
                          </button>
                          <button
                            onClick={() => openFuelModal(entry.id, entry)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            ⛽ Fuel
                          </button>
                          <button
                            onClick={() => {
                              setDeliveryEntryId(entry.id);
                              setShowDeliveryModal(true);
                            }}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            📦 Delivery
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal (Bulk) */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Bulk Update Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">{selectedCount}</span> truck(s) selected
              </p>
            </div>

            {nextSteps.length === 0 ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded">
                <p className="text-red-700 text-sm">
                  Cannot determine next step. Selected trucks have different statuses.
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select new status:
                </label>
                <select
                  value={selectedNewStatus}
                  onChange={(e) => setSelectedNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a status...</option>
                  <optgroup label="Next Steps">
                    {nextSteps.map((step, idx) => (
                      <option key={idx} value={step.step_name}>
                        {step.step_name} {step.requires_gl ? '🚦' : ''}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Special Statuses">
                    <option value="In Maintenance">🔧 In Maintenance</option>
                    <option value="Completed">✅ Completed</option>
                  </optgroup>
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedNewStatus)}
                disabled={!selectedNewStatus || isUpdating}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Log Fuel</h3>
              <button
                onClick={() => setShowFuelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Fuel (Liters)
                </label>
                <input
                  type="number"
                  value={fuelData.fuel_liters_company}
                  onChange={(e) => setFuelData({ ...fuelData, fuel_liters_company: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Fuel (Liters)
                </label>
                <input
                  type="number"
                  value={fuelData.fuel_liters_driver}
                  onChange={(e) => setFuelData({ ...fuelData, fuel_liters_driver: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station Name
                </label>
                <input
                  type="text"
                  value={fuelData.fuel_station_name}
                  onChange={(e) => setFuelData({ ...fuelData, fuel_station_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter station name"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFuelModal(false)}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogFuel}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Saving...' : 'Save Fuel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery/Reconciliation Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Log Delivery</h3>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pallets Loaded
                </label>
                <input
                  type="number"
                  value={deliveryData.pallets_loaded}
                  onChange={(e) => setDeliveryData({ ...deliveryData, pallets_loaded: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pallets Received
                </label>
                <input
                  type="number"
                  value={deliveryData.pallets_received}
                  onChange={(e) => setDeliveryData({ ...deliveryData, pallets_received: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Damage Notes
                </label>
                <textarea
                  value={deliveryData.damage_notes}
                  onChange={(e) => setDeliveryData({ ...deliveryData, damage_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter any damage or issues..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeliveryModal(false)}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogDelivery}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Saving...' : 'Save Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
