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
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Manage Contractors</h1>

      <section className="mb-8">
        <h2 className="font-semibold mb-2">Add New Contractor</h2>
  <form action={createContractor} className="flex flex-col gap-2">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" required className="border p-2" />

          <label htmlFor="poc_name">Point of Contact (name)</label>
          <input id="poc_name" name="poc_name" type="text" className="border p-2" />

          <label htmlFor="poc_phone">Point of Contact (phone)</label>
          <input id="poc_phone" name="poc_phone" type="text" className="border p-2" />

          <div>
            <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
              Add Contractor
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Existing Contractors</h2>

        {!contractors || contractors.length === 0 ? (
          <p>No contractors yet.</p>
        ) : (
          <ul className="space-y-4">
            {(contractors as Contractor[]).map((c: Contractor) => (
              <li key={c.id} className="border p-3 rounded">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    {c.poc_name && <div className="text-sm">POC: {c.poc_name}</div>}
                    {c.poc_phone && <div className="text-sm">Phone: {c.poc_phone}</div>}
                  </div>

                  <div className="flex gap-2">
                    <form action={updateContractor} className="flex flex-col gap-1">
                      <input type="hidden" name="id" value={c.id} />
                      <input name="name" defaultValue={c.name} className="border p-1" />
                      <input name="poc_name" defaultValue={c.poc_name ?? ""} className="border p-1" />
                      <input name="poc_phone" defaultValue={c.poc_phone ?? ""} className="border p-1" />
                      <div className="flex gap-2 mt-1">
                        <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                          Save
                        </button>
                      </div>
                    </form>

                    <form action={deleteContractor} className="flex items-center">
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
