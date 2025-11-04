import { createClient } from '@/lib/supabase/server';
import DriverIntakeForm from './DriverIntakeForm';
import { fetchDrivers, updateDriver, deleteDriver, uploadDriverCSV } from './actions';

export default async function DriversPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  const supabase = await createClient();

  // 1. Fetch the contractors you just built
  const { data: contractors } = await supabase
    .from('contractor')
    .select('id, name')
    .order('name', { ascending: true });

  // 2. Fetch existing drivers to display
  const drivers = await fetchDrivers();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          السائقين والشاحنات / Drivers & Trucks
        </h1>
        <p className="text-gray-600">
          Manage driver intake and truck assignments
        </p>
      </div>

      {/* Error/Success Messages */}
      {searchParams.error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">خطأ / Error</h3>
              <p className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{decodeURIComponent(searchParams.error)}</p>
            </div>
          </div>
        </div>
      )}

      {searchParams.success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">نجح / Success</h3>
              <p className="mt-1 text-sm text-green-700">{decodeURIComponent(searchParams.success)}</p>
            </div>
          </div>
        </div>
      )}

      {/* CSV/Excel Upload Form */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">رفع ملف جماعي / Bulk Upload via CSV or Excel</h2>
        <div className="text-sm text-gray-600 mb-4 space-y-2">
          <p>Upload a CSV or Excel file (.xlsx, .xls)</p>
          <p className="font-medium">Required columns (الأعمدة المطلوبة):</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li><strong>الاسم / name</strong> (required / مطلوب)</li>
            <li><strong>رقم السيارة / plate_no</strong> (required / مطلوب)</li>
            <li>رقم الهوية / national_id (optional / اختياري)</li>
            <li>رقم الجوال / phone (optional / اختياري)</li>
            <li>النوع / vehicle_type (optional / اختياري)</li>
            <li>الحمولة / capacity_tons (optional / اختياري)</li>
            <li>عدد المشاتيح / capacity_pallets (optional / اختياري)</li>
          </ul>
        </div>
        <form action={uploadDriverCSV} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Select Contractor:</label>
            <select
              name="contractor_id"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose a contractor --</option>
              {contractors?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Upload File (CSV or Excel):</label>
            <input
              type="file"
              name="driver_file"
              accept=".csv,.xlsx,.xls"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Upload List
          </button>
        </form>
      </div>

      {/* Manual Entry Form */}
      <div className="mb-8">
        <DriverIntakeForm contractors={contractors || []} />
      </div>

      {/* Display existing drivers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Registered Drivers ({drivers.length})</h2>
        {drivers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No drivers registered yet.</p>
        ) : (
          <div className="space-y-4">
            {drivers.map((driver) => {
              const truck = driver.truck && driver.truck.length > 0 ? driver.truck[0] : null;
              return (
                <div
                  key={driver.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    {/* Display mode */}
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-2 text-gray-900">{driver.name}</div>
                      <div className="text-sm space-y-1 text-gray-600">
                        <div>
                          <span className="font-medium">Contractor:</span>{' '}
                          {driver.contractor?.name || 'N/A'}
                        </div>
                        {driver.national_id && (
                          <div>
                            <span className="font-medium">National ID:</span>{' '}
                            {driver.national_id}
                          </div>
                        )}
                        {driver.phone && (
                          <div>
                            <span className="font-medium">Phone:</span> {driver.phone}
                          </div>
                        )}
                        {truck && (
                          <>
                            <div>
                              <span className="font-medium">Truck Plate:</span>{' '}
                              {truck.plate_no}
                            </div>
                            {truck.vehicle_type && (
                              <div>
                                <span className="font-medium">Vehicle Type:</span>{' '}
                                {truck.vehicle_type}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Edit and Delete forms */}
                    <div className="flex gap-2">
                      {/* Update form */}
                      <form action={updateDriver} className="flex flex-col gap-2">
                        <input type="hidden" name="driver_id" value={driver.id} />
                        <input type="hidden" name="truck_id" value={truck?.id || ''} />

                        <input
                          name="driverName"
                          defaultValue={driver.name}
                          placeholder="Driver Name"
                          required
                          className="border border-gray-300 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          name="national_id"
                          defaultValue={driver.national_id ?? ''}
                          placeholder="National ID"
                          className="border border-gray-300 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          name="phone"
                          defaultValue={driver.phone ?? ''}
                          placeholder="Phone"
                          className="border border-gray-300 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          name="contractor_id"
                          defaultValue={driver.contractor_id}
                          required
                          className="border border-gray-300 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {contractors?.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <input
                          name="truck_plate"
                          defaultValue={truck?.plate_no ?? ''}
                          placeholder="Truck Plate"
                          required
                          className="border border-gray-300 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          name="vehicle_type"
                          defaultValue={truck?.vehicle_type ?? ''}
                          placeholder="Vehicle Type"
                          className="border border-gray-300 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-medium transition-colors"
                        >
                          Save
                        </button>
                      </form>

                      {/* Delete form */}
                      <form action={deleteDriver} className="flex items-start">
                        <input type="hidden" name="driver_id" value={driver.id} />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
