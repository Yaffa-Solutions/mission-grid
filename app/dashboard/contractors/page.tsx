import { createContractor, updateContractor, deleteContractor, fetchContractors } from "./actions";

type Contractor = {
  id: string;
  name: string;
  poc_name?: string | null;
  poc_phone?: string | null;
  created_at?: string;
};

export default async function ContractorsPage() {
  const contractors = await fetchContractors();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          المقاولين / Contractors
        </h1>
        <p className="text-gray-600">
          Manage contractor relationships and contact information
        </p>
      </div>

      {/* Add New Contractor Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Contractor</h2>
        <form action={createContractor} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
              Contractor Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contractor name"
            />
          </div>

          <div>
            <label htmlFor="poc_name" className="block text-sm font-medium mb-2 text-gray-700">
              Point of Contact (Name)
            </label>
            <input
              id="poc_name"
              name="poc_name"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contact person name"
            />
          </div>

          <div>
            <label htmlFor="poc_phone" className="block text-sm font-medium mb-2 text-gray-700">
              Point of Contact (Phone)
            </label>
            <input
              id="poc_phone"
              name="poc_phone"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phone number"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              + Add Contractor
            </button>
          </div>
        </form>
      </div>

      {/* Existing Contractors List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          All Contractors ({contractors?.length || 0})
        </h2>

        {!contractors || contractors.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No contractors yet. Add one above to get started.</p>
        ) : (
          <div className="space-y-4">
            {(contractors as Contractor[]).map((c: Contractor) => (
              <div
                key={c.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  {/* Display mode */}
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2 text-gray-900">{c.name}</div>
                    <div className="text-sm space-y-1 text-gray-600">
                      {c.poc_name && (
                        <div>
                          <span className="font-medium">POC:</span> {c.poc_name}
                        </div>
                      )}
                      {c.poc_phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {c.poc_phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit and Delete forms */}
                  <div className="flex gap-2">
                    <form action={updateContractor} className="flex flex-col gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <input
                        name="name"
                        defaultValue={c.name}
                        placeholder="Contractor Name"
                        required
                        className="border border-gray-300 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        name="poc_name"
                        defaultValue={c.poc_name ?? ""}
                        placeholder="POC Name"
                        className="border border-gray-300 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        name="poc_phone"
                        defaultValue={c.poc_phone ?? ""}
                        placeholder="POC Phone"
                        className="border border-gray-300 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-medium transition-colors"
                      >
                        Save
                      </button>
                    </form>

                    <form action={deleteContractor} className="flex items-start">
                      <input type="hidden" name="id" value={c.id} />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
