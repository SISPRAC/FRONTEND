import ProgramaLogo from "../../../assets/images/logo/Logo_Programa_blanco.png";
import { Menu } from "lucide-react";

export default function TopBar({ collapsed = false, onToggle }) {
  return (
    <header
      className="
        sticky
        top-0
        z-30
        w-full
        h-[80px]
        flex-shrink-0
        flex
        items-center
        justify-between
        px-8
        bg-red-600
        border-b
        border-white/15
        shadow-sm
      "
    >

      {/* BOTÓN HAMBURGUESA (solo escritorio) */}
      <button
        onClick={onToggle}
        className="
          hidden
          md:flex
          items-center
          justify-center
          w-11
          h-11
          rounded-lg
          text-white
          bg-white/10
          hover:bg-white/20
          border
          border-white/15
          transition-colors
          duration-200
        "
        aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
      >
        <Menu size={24} strokeWidth={2.5} />
      </button>

      {/* LOGO DEL PROGRAMA */}
      <img
        src={ProgramaLogo}
        alt="Programa de Ingeniería de Sistemas"
        className="h-[94px] object-contain ml-auto"
      />

    </header>
  );
}