const RichEditor = ({ value, onChange, placeholder }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-2 border-b flex gap-2">
        <button type="button" className="px-2 py-1 text-xs font-medium hover:bg-gray-200 rounded">B</button>
        <button type="button" className="px-2 py-1 text-xs font-medium hover:bg-gray-200 rounded italic">I</button>
        <button type="button" className="px-2 py-1 text-xs font-medium hover:bg-gray-200 rounded underline">U</button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[120px] p-2 text-xs focus:outline-none resize-none"
      />
    </div>
  );
};

export default RichEditor;
