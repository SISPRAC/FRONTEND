import { useState } from "react";

export default function ImgUpload({ onFileSelect }) {
const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };
  const truncate = (name, max = 20) =>
  name.length > max ? name.substring(0, max) + "..." : name;

  return (
    <label className=" mt-4 flex items-center justify-between bg-white border-2 border-gray-200 hover:border-red-500 rounded-xl px-4 py-2.5 cursor-pointer font-bold text-gray-600 transition-colors">
      
      {fileName ? truncate(fileName) : "Adjunte el logo de la empresa"}

      <input
        type="file"
        name="logo"
        className="hidden"
        accept=".jpg,.jpeg,.png"
        onChange={handleChange}
      />

     <svg 
      className="w-5 h-5 text-gray-500" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 00-5.656-5.656L6.343 10.172a6 6 0 108.485 8.485L20 13"
      />
    </svg>

    </label>
  );
}