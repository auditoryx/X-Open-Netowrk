export default function ServicesList() {
  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow">
      <h2 className="text-xl font-semibold">Your Services</h2>
      <ul>
        <li>Mixing & Mastering - $100</li>
        <li>Beat Production - $250</li>
      </ul>
      <button className="mt-2 px-4 py-2 bg-green-500 rounded">Manage Services</button>
    </div>
  );
}
