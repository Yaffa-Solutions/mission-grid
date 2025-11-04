import { createDriver } from './actions';

type Contractor = {
  id: string;
  name: string;
};

type DriverIntakeFormProps = {
  contractors: Contractor[];
};

export default function DriverIntakeForm({
  contractors,
}: DriverIntakeFormProps) {
  return (
    <div className="w-full max-w-2xl">
      <section className="mb-8 border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New Driver & Truck</h2>

        <form action={createDriver} className="flex flex-col gap-4">
          {/* Driver Name */}
          <div>
            <label htmlFor="driverName" className="block font-medium mb-1">
              Driver Name <span className="text-red-500">*</span>
            </label>
            <input
              id="driverName"
              name="driverName"
              type="text"
              required
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter driver's full name"
            />
          </div>

          {/* National ID */}
          <div>
            <label htmlFor="national_id" className="block font-medium mb-1">
              National ID
            </label>
            <input
              id="national_id"
              name="national_id"
              type="text"
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter national ID (optional)"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block font-medium mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number (optional)"
            />
          </div>

          {/* Contractor Dropdown */}
          <div>
            <label htmlFor="contractor_id" className="block font-medium mb-1">
              Contractor <span className="text-red-500">*</span>
            </label>
            <select
              id="contractor_id"
              name="contractor_id"
              required
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select a contractor --</option>
              {contractors.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Truck Plate */}
          <div>
            <label htmlFor="truck_plate" className="block font-medium mb-1">
              Truck Plate Number <span className="text-red-500">*</span>
            </label>
            <input
              id="truck_plate"
              name="truck_plate"
              type="text"
              required
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter truck plate number"
            />
          </div>

          {/* Vehicle Type */}
          <div>
            <label htmlFor="vehicle_type" className="block font-medium mb-1">
              Vehicle Type
            </label>
            <input
              id="vehicle_type"
              name="vehicle_type"
              type="text"
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Pickup, Van, Truck (optional)"
            />
          </div>

          {/* Submit Button */}
          <div className="mt-2">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
            >
              Add Driver & Truck
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
