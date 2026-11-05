import { Eye, Search, ChevronDown, X } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge.jsx";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { postulacionRepository } from "../../../infraestructura/repository/postulacionRepository.js";
import { obtenerCandidatosEmpresa } from "../../../aplicacion/postulacion/obtenerCandidatosEmpresa.js";

const CandidatosEmpresa = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {

    const cargarCandidatos = async () => {

      try {

        setLoading(true);

        const candidatos =
          await obtenerCandidatosEmpresa(
            postulacionRepository
          );

        setRows(candidatos);

      } catch (error) {

        console.error(
          "Error al cargar los candidatos de la empresa:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    cargarCandidatos();

  }, []);


  const candidatosFiltrados = useMemo(() => {

    const prioridadEstado = {
      POSTULADO: 1,
      ACEPTADO: 2,
      RECHAZADO: 3,
    };

    const texto = busqueda.toLowerCase().trim();

    return rows
      .filter((candidato) => {

        const coincideEstado =
          estadoFiltro === "TODOS" ||
          candidato.estado === estadoFiltro;

        const coincideBusqueda =
          !texto ||
          candidato.codigo?.toLowerCase().includes(texto) ||
          candidato.nombre?.toLowerCase().includes(texto) ||
          candidato.vacante?.toLowerCase().includes(texto);

        return coincideEstado && coincideBusqueda;

      })
      .sort((a, b) => {

        return (
          (prioridadEstado[a.estado] ?? 99) -
          (prioridadEstado[b.estado] ?? 99)
        );

      });

  }, [rows, estadoFiltro, busqueda]);


  const handleView = (id) => {

    const candidato = rows.find(
      (c) => c.id === id
    );

    navigate(`/empresa/candidatos/${id}`, {
      state: { candidato }
    });

  };

  return (

    <div>

      <h1
        className="
          text-[26px]
          font-extrabold
          text-slate-800
          text-center
          mb-7
          tracking-tight
        "
      >
        Candidatos a practicas
      </h1>

      {/* FILTROS */}
      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-4
          mb-5
        "
      >

        {/* FILTRO ESTADO */}
        <div className="flex items-center gap-3">

          <label
            htmlFor="estado"
            className="text-sm font-semibold text-slate-600"
          >
            Estado
          </label>

          <div className="relative">

            <select
              id="estado"
              value={estadoFiltro}
              onChange={(e) => {
                setEstadoFiltro(e.target.value);
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
              <option value="POSTULADO">Postulados</option>
              <option value="ACEPTADO">Aceptados</option>
              <option value="RECHAZADO">Rechazados</option>
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
            placeholder="Buscar candidato..."
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

      {/* SKELETON / TABLA */}

      {loading ? (

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* ENCABEZADO */}
          <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-3 w-20 rounded bg-slate-200 animate-pulse"
              />
            ))}
          </div>

          {/* FILAS */}
          {[1, 2, 3].map((fila) => (
            <div
              key={fila}
              className="grid grid-cols-5 gap-4 items-center px-5 py-4 border-b border-slate-100 last:border-0"
            >
              {[1, 2, 3, 4].map((columna) => (
                <div
                  key={columna}
                  className={`h-3 rounded bg-slate-200 animate-pulse ${columna === 2 ? "w-3/4" : "w-2/3"
                    }`}
                />
              ))}

              <div className="flex justify-center">
                <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}

        </div>

      ) : (
        <GenericTable
          rows={candidatosFiltrados}
          currentPage={currentPage}
          onPageChange={setCurrentPage}

          columns={[
            {
              key: "codigo",
              label: "Código",
              primary: true
            },
            {
              key: "nombre",
              label: "Nombre"
            },
            {
              key: "vacante",
              label: "Vacante"
            },
            {
              key: "estado",
              label: "Estado",
              render: (row) => (
                <EstadoBadge estado={row.estado} />
              )
            }
          ]}

          actions={[
            {
              icon: <Eye size={24} />,
              className: "hover:bg-blue-100",
              onClick: handleView
            }
          ]}

          emptyMessage="No hay candidatos que coincidan con los filtros."
          pageSize={6}
        />
      )}


    </div>

  );

};

export default CandidatosEmpresa;