import BookingsViewer from '@/app/components/BookingsViewer';

export default function ProducerDashboard() {
  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome, Producer</h1>
      <BookingsViewer />
    </div>
  );
}
