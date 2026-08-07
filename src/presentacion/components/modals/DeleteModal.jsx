export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}) {

if (!isOpen) return null;


return (

<div className="
  fixed inset-0
  bg-black/40
  flex items-center justify-center
  z-50
">


  <div className="
    bg-white
    w-full max-w-md
    rounded-2xl
    p-6
    shadow-xl
  ">


    <h2 className="
      text-xl
      font-bold
      text-slate-800
      mb-3
    ">
      {title}
    </h2>



    <p className="
      text-slate-500
      mb-6
    ">
      {message}
    </p>



    <div className="flex justify-end gap-3">


      <button
        onClick={onClose}
        className="
          px-4 py-2
          rounded-xl
          bg-slate-200
          hover:bg-slate-300
          text-gray-700
        "
      >
        {cancelText}
      </button>



      <button
        onClick={onConfirm}
        className="
          px-4 py-2
          rounded-xl
          bg-[#e8192c]
          text-white
          hover:bg-[#c8111f]
        "
      >
        {confirmText}
      </button>


    </div>


  </div>


</div>

);

}