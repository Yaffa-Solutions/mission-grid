import { createClient } from '@/lib/supabase/server';
import DriverIntakeForm from './DriverIntakeForm';
import { fetchDrivers, updateDriver, deleteDriver } from './actions';

export default async function DriversPage() {
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
