'use client';

import { useState } from 'react';
import { approveGL } from './actions';

type GLRequest = {
  id: string;
  current_status: string;
  mission: {
    id: string;
    name: string;
  };
  truck: {
    plate_no: string;
  };
  driver: {
    name: string;
  } | null;
};

type OpsConsoleProps = {
  requests: GLRequest[];
};

export default function OpsConsole({ requests }: OpsConsoleProps) {
  console.log('requests: ', requests);
  const [approving, setApproving] = useState<string | null>(null);

  const handleApprove = async (entryId: string, missionId: string) => {
    setApproving(entryId);
    const result = await approveGL(entryId, missionId);

    if (result.success) {
      // The page will automatically refresh due to revalidatePath
    } else {
      alert(`Error: ${result.error}`);
    }

    setApproving(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-700">
                Mission
              </th>
              <th className="p-4 text-left font-semibold text-gray-700">
                Truck
              </th>
              <th className="p-4 text-left font-semibold text-gray-700">
                Driver
              </th>
              <th className="p-4 text-left font-semibold text-gray-700">
                Current Status
              </th>
              <th className="p-4 text-left font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const mission = request.mission;
              const truck = request.truck;
              const driver = request.driver;

              return (
                <tr key={request.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">
                      {mission.name}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span>🚚</span>
                      <span className="font-medium">{truck.plate_no}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-700">
                      {driver?.name || 'No driver'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {request.current_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleApprove(request.id, mission.id)}
                      disabled={approving === request.id}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      {approving === request.id ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          Approving...
                        </span>
                      ) : (
                        '✅ Approve GL'
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            <span className="font-semibold text-gray-900">
              {requests.length}
            </span>{' '}
            pending request(s)
          </span>
          <span className="text-xs">
            Green Light approval allows trucks to proceed to the next mission
            step
          </span>
        </div>
      </div>
    </div>
  );
}
