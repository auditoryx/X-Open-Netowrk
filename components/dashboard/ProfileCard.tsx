export default function ProfileCard(): JSX.Element {
  return (
    <div className="p-4 bg-neutral-dark rounded-lg shadow">
      <h2 className="text-xl font-semibold">Profile</h2>
      <p>Name: John Doe</p>
      <p>Email: johndoe@example.com</p>
      <button className="mt-2 btn btn-primary">Edit Profile</button>
    </div>
  );
}
