import { Eye, Search, ChevronDown, X } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge"; // <- ajusta la ruta
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmpresaRepository } from "../../../infraestructura/repository/empresaRepository";
import { obtenerGruposEmpresa } from "../../../aplicacion/empresa/obtenerGruposEmpresa";


// ==========================================
// SKELETON
// ==========================================

const Bone = ({ className = "" }) => (
  <div className={`bg-slate-200 rounded-lg ${className}`} />
);

const GruposSkeleton = ({ rows = 6 }) => (
  <div className="animate-pulse" aria-busy="true" aria-label="Cargando grupos">

    {/* Filtros */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
      <div className="flex items-center gap-2">
        <Bone className="h-4 w-16" />
        <Bone className="h-10 w-40 rounded-xl" />
      </div>
      <Bone className="h-10 w-full md:w-72 rounded-xl" />
    </div>

    {/* Tabla */}
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="grid grid-cols-6 gap-4 px-5 py-4 bg-slate-50 border-b border-slate-200">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bone key={i} className="h-3 w-20" />
        ))}
      </div>

      {/* Filas */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-6 gap-4 items-center px-5 py-4 border-b border-slate-100 last:border-b-0"
        >
          <Bone className="h-4 w-24" />
          <Bone className="h-4 w-16" />
          <Bone className="h-4 w-28" />
          <Bone className="h-4 w-10" />
          <Bone className="h-4 w-10" />
          <Bone className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>

    {/* Paginación */}
    <div className="flex justify-center gap-2 mt-5">
      <Bone className="h-9 w-9 rounded-lg" />
      <Bone className="h-9 w-9 rounded-lg" />
      <Bone className="h-9 w-9 rounded-lg" />
    </div>
  </div>
);


const GruposPractica = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const [periodoFiltro, setPeriodoFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();


  // ==========================================
  // OBTENER GRUPOS DE LA EMPRESA
  // ==========================================

  useEffect(() => {

    const cargarGrupos = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await obtenerGruposEmpresa(EmpresaRepository);

        const data = response?.data ?? [];

        const grupos = data.map((grupo) => ({
          id: grupo.practica_id,
          grupo: `Grupo ${grupo.practica_id}`,
          periodo: grupo.periodo,
          practica: `Práctica ${grupo.periodo}`,
          practicantes: grupo.practicantes ?? 0,
          aperturas: grupo.aperturas?.length ?? 0,
          estado: grupo.estado,
          practica_id: grupo.practica_id
        }));

        setRows(grupos);

      } catch (error) {

        console.error("Error al obtener los grupos:", error);

        setError(
          error?.response?.data?.message ||
          "No fue posible cargar los grupos."
        );

      } finally {

        setLoading(false);

      }

    };

    cargarGrupos();

  }, []);


  // ==========================================
  // PERIODOS DISPONIBLES
  // ==========================================

  const periodos = useMemo(() => {
    return [...new Set(rows.map((grupo) => grupo.periodo))];
  }, [rows]);


  // ==========================================
  // FILTRAR GRUPOS
  // ==========================================

  const gruposFiltrados = useMemo(() => {

    const texto = busqueda.toLowerCase().trim();

    return rows.filter((grupo) => {

      const coincidePeriodo =
        periodoFiltro === "TODOS" ||
        grupo.periodo === periodoFiltro;

      const coincideBusqueda =
        !texto ||
        grupo.grupo.toLowerCase().includes(texto) ||
        grupo.periodo.toLowerCase().includes(texto) ||
        grupo.practica.toLowerCase().includes(texto);

      return coincidePeriodo && coincideBusqueda;

    });

  }, [rows, periodoFiltro, busqueda]);


  // ==========================================
  // VER GRUPO
  // ==========================================

  const handleView = (id) => {
    navigate(`/empresa/grupos/${id}`);
  };


  return (
    <div>

      <h1 className="text-[26px] font-extrabold text-slate-800 text-center mb-7 tracking-tight">
        Grupos de Práctica
      </h1>


      {/* CARGANDO */}
      {loading && <GruposSkeleton />}


      {/* ERROR */}
      {!loading && error && (
        <div className="text-center py-10 text-red-500 font-medium">
          {error}
        </div>
      )}


      {/* CONTENIDO */}
      {!loading && !error && (

        <>

          {/* FILTROS */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

            {/* FILTRO PERIODO */}
            <div className="flex items-center gap-3">

              <label
                htmlFor="periodo"
                className="text-sm font-semibold text-slate-600"
              >
                Periodo
              </label>

              <div className="relative">

                <select
                  id="periodo"
                  value={periodoFiltro}
                  onChange={(e) => {
                    setPeriodoFiltro(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="
                    appearance-none
                    h-10
                    min-w-[160px]
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
                  <option value="TODOS">Todos</option>

                  {periodos.map((periodo) => (
                    <option key={periodo} value={periodo}>
                      {periodo}
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


            {/* BUSCADOR */}
            <div className="relative w-full md:w-72">

              <Search
                size={16}
                className="
                  pointer-events-none
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar grupo..."
                className="
                  w-full
                  h-10
                  pl-10 pr-9
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-sm text-slate-700
                  placeholder:text-slate-400
                  shadow-sm
                  transition
                  hover:border-slate-300
                  focus:outline-none
                  focus:border-blue-400
                  focus:ring-4 focus:ring-blue-100
                "
              />

              {busqueda && (
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda("");
                    setCurrentPage(1);
                  }}
                  aria-label="Limpiar búsqueda"
                  className="
                    absolute right-2.5 top-1/2
                    -translate-y-1/2
                    p-1 rounded-full
                    text-slate-400
                    hover:text-slate-600 hover:bg-slate-100
                    transition
                  "
                >
                  <X size={14} />
                </button>
              )}

            </div>

          </div>


          {/* TABLA */}
          <GenericTable

            rows={gruposFiltrados}

            currentPage={currentPage}

            onPageChange={setCurrentPage}

            columns={[
              { key: "grupo", label: "Grupo", primary: true },
              { key: "periodo", label: "Periodo" },
              { key: "practica", label: "Práctica" },
              { key: "practicantes", label: "Practicantes" },
              { key: "aperturas", label: "Aperturas" },
              {
                key: "estado",
                label: "Estado",
                render: (row) => <EstadoBadge estado={row.estado} />
              }
            ]}

            actions={[
              {
                icon: <Eye size={24} />,
                className: "hover:bg-blue-100",
                onClick: handleView
              }
            ]}

            emptyMessage="No hay grupos que coincidan con los filtros."

            pageSize={6}

          />

        </>

      )}

    </div>
  );
};

export default GruposPractica;