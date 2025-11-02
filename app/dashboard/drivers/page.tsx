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
    <div className="flex-1 w-full flex flex-col gap-10 items-center p-8">
      <h1 className="text-2xl font-bold">Driver & Truck Intake</h1>

      {/* Error/Success Messages */}
      {searchParams.error && (
        <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-4">
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
        <div className="w-full max-w-2xl bg-green-50 border border-green-200 rounded-lg p-4">
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
      <div className="w-full max-w-2xl border rounded-lg p-6 shadow-sm bg-blue-50">
        <h2 className="text-xl font-semibold mb-4">رفع ملف جماعي / Bulk Upload via CSV or Excel</h2>
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
        <form action={uploadDriverCSV} encType="multipart/form-data" className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Contractor:</label>
            <select
              name="contractor_id"
              required
              className="w-full border rounded p-2"
            >
              <option value="">-- Choose a contractor --</option>
              {contractors?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload File (CSV or Excel):</label>
            <input
              type="file"
              name="driver_file"
              accept=".csv,.xlsx,.xls"
              required
              className="w-full border rounded p-2"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            Upload List
          </button>
        </form>
      </div>

      {/* Manual Entry Form */}
      <DriverIntakeForm contractors={contractors || []} />

      {/* Display existing drivers */}
      <div className="w-full max-w-6xl mt-8">
        <h2 className="text-xl font-semibold mb-4">Registered Drivers</h2>
        {drivers.length === 0 ? (
          <p className="text-gray-500">No drivers registered yet.</p>
        ) : (
          <div className="space-y-4">
            {drivers.map((driver) => {
              const truck = driver.truck && driver.truck.length > 0 ? driver.truck[0] : null;
              return (
                <div
                  key={driver.id}
                  className="border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-4">
                    {/* Display mode */}
                    <div className="flex-1">
                      <div className="font-medium text-lg mb-2">{driver.name}</div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-semibold">Contractor:</span>{' '}
                          {driver.contractor?.name || 'N/A'}
                        </div>
                        {driver.national_id && (
                          <div>
                            <span className="font-semibold">National ID:</span>{' '}
                            {driver.national_id}
                          </div>
                        )}
                        {driver.phone && (
                          <div>
                            <span className="font-semibold">Phone:</span> {driver.phone}
                          </div>
                        )}
                        {truck && (
                          <>
                            <div>
                              <span className="font-semibold">Truck Plate:</span>{' '}
                              {truck.plate_no}
                            </div>
                            {truck.vehicle_type && (
                              <div>
                                <span className="font-semibold">Vehicle Type:</span>{' '}
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
                          className="border p-1 text-sm rounded"
                        />
                        <input
                          name="national_id"
                          defaultValue={driver.national_id ?? ''}
                          placeholder="National ID"
                          className="border p-1 text-sm rounded"
                        />
                        <input
                          name="phone"
                          defaultValue={driver.phone ?? ''}
                          placeholder="Phone"
                          className="border p-1 text-sm rounded"
                        />
                        <select
                          name="contractor_id"
                          defaultValue={driver.contractor_id}
                          required
                          className="border p-1 text-sm rounded"
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
                          className="border p-1 text-sm rounded"
                        />
                        <input
                          name="vehicle_type"
                          defaultValue={truck?.vehicle_type ?? ''}
                          placeholder="Vehicle Type"
                          className="border p-1 text-sm rounded"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                      </form>

                      {/* Delete form */}
                      <form action={deleteDriver} className="flex items-center">
                        <input type="hidden" name="driver_id" value={driver.id} />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
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
