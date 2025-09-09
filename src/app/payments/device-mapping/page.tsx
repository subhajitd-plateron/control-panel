'use client';

export default function DeviceMappingPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <iframe
          src="https://main.d2ash7zmho974r.amplifyapp.com/devices"
          className="w-full h-screen min-h-[800px]"
          frameBorder="0"
          title="Restaurant Device Management"
          style={{
            border: 'none',
            width: '100%',
            minHeight: '800px'
          }}
        />
      </div>
    </div>
  );
}
