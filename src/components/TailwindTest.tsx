'use client';

export default function TailwindTest() {
  return (
    <div className="p-4 m-4 bg-blue-500 text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold">Tailwind CSS Test</h2>
      <p className="mt-2">If you can see this styled with blue background and white text, Tailwind CSS is working!</p>
      <button className="mt-4 px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-100 transition-colors">
        Test Button
      </button>
    </div>
  );
}