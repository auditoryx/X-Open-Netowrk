import ProfileForm from '@/components/forms/ProfileForm';

export default function CreateProfilePage() {
  return (
    <div className='max-w-3xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Create Your Profile</h1>
      <ProfileForm />
    </div>
  );
}
