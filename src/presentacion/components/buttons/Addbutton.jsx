import { Plus } from "lucide-react";

export default function AddButton({
  label = "Agregar",
  onClick
}) {
  return (
    <div className="flex justify-end mt-5">

      <button
        onClick={onClick}
        className="
          flex items-center gap-2
          bg-[#e8192c]
          hover:bg-[#c8111f]
          active:scale-95
          text-white
          font-bold
          text-[15px]
          px-7 py-2.5
          rounded-full
          shadow-[0_4px_14px_rgba(232,25,44,0.3)]
          transition-all duration-150
        "
      >
        <Plus strokeWidth={3} />
        {label}
      </button>

    </div>
  );
}