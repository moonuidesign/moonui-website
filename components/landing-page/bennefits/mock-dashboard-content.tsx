export const MockDashboardContent = ({ type }: { type: string }) => {
  return (
    <div className="w-full h-full bg-white p-6 grid grid-cols-12 gap-6 overflow-hidden">
      <div className="col-span-3 lg:col-span-2 space-y-4 border-r border-gray-100 pr-4">
        <div className="h-8 w-8 bg-purple-600 rounded-lg mb-6"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-100 rounded"></div>
            <div
              className={`h-2.5 bg-gray-100 rounded ${
                i === 2 ? 'w-12 bg-purple-100' : 'w-16'
              }`}
            ></div>
          </div>
        ))}
      </div>
      <div className="col-span-9 lg:col-span-10 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-4 w-32 bg-gray-100 rounded mb-2"></div>
            <div className="h-3 w-20 bg-gray-50 rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-24 bg-white border border-gray-200 rounded-lg"></div>
            <div className="h-9 w-32 bg-[#7D52F4] rounded-lg shadow-md shadow-purple-200"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 h-full">
          <div className="col-span-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full border-[10px] border-gray-50 border-t-purple-500 mb-3"></div>
            <div className="h-3 w-12 bg-gray-100 rounded"></div>
          </div>
          <div className="col-span-2 grid grid-rows-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex justify-between items-center">
              <div className="w-12 h-12 bg-green-50 rounded-full"></div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex gap-3"></div>
          </div>
          <div className="col-span-3 h-24 bg-gray-50 rounded-xl border border-gray-100 mt-2"></div>
        </div>
      </div>
    </div>
  );
};
