import { useState } from "react";
import { FilePlus } from 'lucide-react';

export default function FileUpload({ onFileSelect }) {
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
    <label className="mt-3 flex items-center justify-between bg-white border-2 border-gray-200 hover:border-red-500 rounded-xl px-4 py-2.5 cursor-pointer font-bold text-gray-600 transition-colors">

      {fileName ? truncate(fileName) : "Hoja del candidato"}
      <input
        type="file"
        name="cv"
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
      />
      <FilePlus className="ml-2 text-gray-400" />

    </label>
  );
}

