import { UserPlus, Armchair } from "lucide-react";

const ACCENT_COLORS = [
  "#E8192C",
  "#4A6CF7",
  "#0A8A6E",
  "#7C3AED",
  "#D97706",
  "#0284C7",
];

function getIniciales(nombre = "") {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function LogoEmpresa({ empresa, index }) {
  if (empresa?.logoUrl) {
    return (
      <img
        src={empresa.logoUrl}
        alt={`Logo ${empresa.nombre}`}
        className="w-full h-full object-contain"
      />
    );
  }

  const color = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <span
      className="text-base font-semibold"
      style={{ color }}
    >
      {getIniciales(empresa?.nombre)}
    </span>
  );
}

export default function VacanteCard({
  vacante,
  index,
  onPostular,
}) {
  const {
    empresa,
    titulo,
    descripcion,
    cuposDisponibles,
    periodo,
    perfiles,
  } = vacante;

  const tieneCupos = cuposDisponibles > 0;

  return (
    <div
      className={`
        bg-white rounded-xl p-4 flex flex-col gap-3 transition-all duration-150
        ${
          tieneCupos
            ? "border-2 border-red-500 shadow-sm"
            : "border border-gray-200 opacity-75"
        }
      `}
    >
      {/* Cabecera */}
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          <LogoEmpresa
            empresa={empresa}
            index={index}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs text-gray-400">
              {empresa?.nombre}
            </span>

            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[11px]">
              {periodo?.nombre}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-1">
            {titulo}
          </h3>

          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {descripcion}
          </p>

          {perfiles?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {perfiles.map((perfil) => (
                <span
                  key={perfil.id}
                  className="
                    px-2 py-1 text-xs
                    bg-blue-50 text-blue-700
                    rounded-md border border-blue-100
                  "
                >
                  {perfil.nombre} - {perfil.nivel_minimo}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pie */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div
          className={`flex items-center gap-1.5 text-xs ${
            tieneCupos
              ? "text-gray-600"
              : "text-gray-400"
          }`}
        >
          <Armchair size={15} />

          <span
            className={`font-semibold text-sm ${
              tieneCupos
                ? "text-gray-800"
                : "text-gray-400"
            }`}
          >
            {cuposDisponibles}
          </span>

          <span>
            cupo{cuposDisponibles !== 1 ? "s" : ""} disponible
            {cuposDisponibles !== 1 ? "s" : ""}
          </span>
        </div>

        <button
          onClick={() => onPostular(vacante)}

          title="Postular candidato"
          aria-label={`Postular candidato a ${empresa?.nombre}`}
          className="
            w-9 h-9 rounded-full
            border border-gray-200
            flex items-center justify-center
            text-gray-400
            transition-all duration-150

            hover:bg-red-600
            hover:border-red-600
            hover:text-white

            disabled:opacity-50
            disabled:cursor-not-allowed
            disabled:hover:bg-transparent
            disabled:hover:border-gray-200
            disabled:hover:text-gray-400
          "
        >
          <UserPlus size={15} />
        </button>
      </div>
    </div>
  );
}