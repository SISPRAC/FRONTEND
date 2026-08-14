import { useEffect, useState } from "react";
import Layout from "../../shared/Layouts/Layout";

import { Building2 } from "lucide-react";
import PostularCandidatoModal from "./PostularCandidatoModal";
import VacanteCard from "../../components/cards/VacanteCard";
import { vacanteRepository } from "../../../infraestructura/repository/vacanteRepository";
import { periodoRepository } from "../../../infraestructura/repository/periodoRepository";
import { getAperturasVacantes } from "../../../aplicacion/vacante/getAperturasVacantes";
import { getPeriodos } from "../../../aplicacion/periodo/getPeriodos";
import toast from "react-hot-toast";

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
      console.log("Periodos obtenidos:", periodosData);


      const vacantesData = await getAperturasVacantes(vacanteRepository);

      console.log("Vacantes obtenidas:", vacantesData);

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
    <Layout footerLabel="Director">
      <h1 className="text-[26px] font-extrabold text-slate-800 text-center mb-6 tracking-tight">
        Vacantes en empresas
      </h1>

      {/* ── Filtro por periodo ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <label htmlFor="filtro-periodo" className="text-sm text-gray-500 flex items-center gap-1 whitespace-nowrap">
          <Building2 size={14} />
          Periodo:
        </label>

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
        border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700
        bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400
        transition-all duration-150 cursor-pointer
    "
        >
          <option value="">
            Todos los activos
          </option>

          {periodos.map((p) => {
            console.log("PERIODO RENDERIZADO:", p);

            return (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            );
          })}
        </select>
      </div>

      {/* ── Grid de vacantes ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Cargando vacantes...
        </div>
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
    </Layout >
  );
}
