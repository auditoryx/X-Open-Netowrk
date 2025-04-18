export default function ProfileCard() {
  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow">
      <h2 className="text-xl font-semibold">Profile</h2>
      <p>Name: John Doe</p>
      <p>Email: johndoe@example.com</p>
      <button className="mt-2 px-4 py-2 bg-blue-500 rounded">Edit Profile</button>
    </div>
  );
}
