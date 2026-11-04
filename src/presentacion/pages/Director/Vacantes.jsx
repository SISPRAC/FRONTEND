import { useEffect, useState } from "react";

import { Building2, ChevronDown } from "lucide-react";
import PostularCandidatoModal from "./PostularCandidatoModal";
import VacanteCard from "../../components/cards/VacanteCard";
import { vacanteRepository } from "../../../infraestructura/repository/vacanteRepository";
import { periodoRepository } from "../../../infraestructura/repository/periodoRepository";
import { getAperturasVacantes } from "../../../aplicacion/vacante/getAperturasVacantes";
import { getPeriodos } from "../../../aplicacion/periodo/getPeriodos";
import toast from "react-hot-toast";


// ==========================================
// SKELETON
// ==========================================

const VacanteCardSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">

    {/* Empresa */}
    <div className="flex items-center gap-3 mb-4">
      <div className="h-11 w-11 rounded-xl bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-1/3 rounded bg-slate-200" />
      </div>
    </div>

    {/* Título */}
    <div className="h-4 w-3/4 rounded bg-slate-200 mb-3" />

    {/* Descripción */}
    <div className="space-y-2 mb-4">
      <div className="h-3 w-full rounded bg-slate-200" />
      <div className="h-3 w-5/6 rounded bg-slate-200" />
      <div className="h-3 w-2/3 rounded bg-slate-200" />
    </div>

    {/* Etiquetas */}
    <div className="flex gap-2 mb-5">
      <div className="h-6 w-16 rounded-full bg-slate-200" />
      <div className="h-6 w-20 rounded-full bg-slate-200" />
    </div>

    {/* Botón */}
    <div className="h-10 w-full rounded-xl bg-slate-200" />

  </div>
);

const VacantesSkeleton = ({ cantidad = 6 }) => (
  <div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    aria-busy="true"
    aria-label="Cargando vacantes"
  >
    {Array.from({ length: cantidad }).map((_, i) => (
      <VacanteCardSkeleton key={i} />
    ))}
  </div>
);


export default function VacantesDirector() {
  const [vacantes, setVacantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null); // null = "Todos activos"
  const [vacanteFocus, setVacanteFocus] = useState(null); // para el modal futuro
  const [loading, setLoading] = useState(true);
  const [postularModalOpen, setPostularModalOpen] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);


  const cargarDatos = async () => {
    try {
      setLoading(true);
      const periodosData = await getPeriodos({
        periodoRepository
      });

      const vacantesData = await getAperturasVacantes(vacanteRepository);

      const vacantesNormalizadas = vacantesData.map((item) => ({
        id: item.id,

        // Datos de la vacante
        vacante_id: item.vacante_id,
        titulo: item.Vacante?.nombre ?? "",
        descripcion: item.Vacante?.descripcion ?? "",

        // Empresa
        empresa: item.Vacante?.Convenio?.Empresa ?? null,

        // Convenio
        convenio: item.Vacante?.Convenio ?? null,

        // Periodo
        periodo: item.practica?.Periodo ?? null,

        // Práctica
        practica: item.practica ?? null,

        // Apertura
        cuposDisponibles:
          Math.max(
            0,
            (item.cupos ?? 0) -
            (item.Postulacions?.filter(
              p => p.estado === "POSTULADO" || p.estado === "ACEPTADO"
            ).length ?? 0)
          ),
        estado: item.estado,

        // Perfiles de la vacante
        perfiles: item.Vacante?.Perfils ?? [],

        // Tutor
        tutorEmpresa: item.TutorEmpresa ?? null,

        // Postulaciones
        postulaciones: item.Postulacions ?? [],

        // Mantener el objeto original por si luego lo necesitamos
        aperturaVacante: item,
      }));

      setVacantes(vacantesNormalizadas);
      setPeriodos(periodosData);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  /** Solo muestra vacantes cuyo convenio tenga periodo activo (o el filtrado seleccionado). */
  const vacantesFiltradas = vacantes.filter((v) => {
    if (v.convenio?.estado !== "APROBADO") {
      return false;
    }

    if (periodoSeleccionado === null) {
      return true;
    }

    return v.periodo?.id === periodoSeleccionado;
  });

  const handlePostular = (vacante) => {
    setVacanteFocus(vacante);
    setPostularModalOpen(true);
  };

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-slate-800 text-center mb-7 tracking-tight">
        Vacantes en empresas
      </h1>

      {/* ── Filtro por periodo ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">

        <label
          htmlFor="filtro-periodo"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 whitespace-nowrap"
        >
          <Building2 size={15} />
          Periodo
        </label>

        <div className="relative">

          <select
            id="filtro-periodo"
            value={periodoSeleccionado ?? ""}
            onChange={(e) =>
              setPeriodoSeleccionado(
                e.target.value === ""
                  ? null
                  : Number(e.target.value)
              )
            }
            className="
              appearance-none
              h-10
              min-w-[200px]
              pl-4 pr-10
              rounded-xl
              border border-slate-200
              bg-white
              text-sm font-medium text-slate-700
              shadow-sm
              cursor-pointer
              transition
              hover:border-slate-300
              focus:outline-none
              focus:border-blue-400
              focus:ring-4 focus:ring-blue-100
            "
          >
            <option value="">Todos los activos</option>

            {periodos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="
              pointer-events-none
              absolute right-3.5 top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

        </div>

      </div>

      {/* ── Grid de vacantes ──────────────────────────────────────────────── */}
      {loading ? (
        <VacantesSkeleton />
      ) : vacantesFiltradas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay vacantes para este periodo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vacantesFiltradas.map((vacante, index) => (
            <VacanteCard
              key={vacante.id}
              vacante={vacante}
              index={index}
              onPostular={handlePostular}
            />
          ))}
        </div>
      )}

      {postularModalOpen && (
        <PostularCandidatoModal
          vacante={vacanteFocus}
          onClose={() => setPostularModalOpen(false)}
          onSuccess={() => { cargarDatos(); setPostularModalOpen(false); }}
        />
      )}
    </div>
  );
}