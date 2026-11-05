import { Eye, ChevronDown } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getGruposByPractica } from "../../../aplicacion/tutorDocente/getGruposByPractica";
import { tutorDocenteRepository } from "../../../infraestructura/repository/tutorDocenteRepository";

import { getPracticas } from "../../../aplicacion/practica/getPracticas";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository";


// ==========================================
// SKELETON
// ==========================================

const GruposSkeleton = ({ filas = 6 }) => (
  <div
    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    aria-busy="true"
    aria-label="Cargando grupos"
  >

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
    {Array.from({ length: filas }).map((_, fila) => (
      <div
        key={fila}
        className="grid grid-cols-5 gap-4 items-center px-5 py-4 border-b border-slate-100 last:border-0"
      >
        {/* Nombre */}
        <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />

        {/* Periodo */}
        <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />

        {/* Estado */}
        <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />

        {/* Practicantes */}
        <div className="h-3 w-8 rounded bg-slate-200 animate-pulse" />

        {/* Acciones */}
        <div className="flex justify-center">
          <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
        </div>
      </div>
    ))}

  </div>
);


const GruposTutorDocente = () => {

  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [practicaId, setPracticaId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadPracticas();
  }, []);


  useEffect(() => {

    if (practicaId) {
      loadGrupos();
    } else {
      setRows([]);
    }

  }, [practicaId]);


  const loadPracticas = async () => {

    try {

      const data = await getPracticas({
        practicaRepository
      });

      setPracticas(data);

      if (data.length > 0) {
        setPracticaId(data[0].id);
      } else {
        // No hay prácticas: no habrá carga de grupos
        setLoading(false);
      }

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Error al cargar las prácticas"
      );

      setLoading(false);

    }

  };


  const loadGrupos = async () => {

    try {

      setLoading(true);

      const data = await getGruposByPractica({
        tutorDocenteRepository,
        practicaId
      });

      const formattedData = data.map(grupo => ({
        id: grupo.id,
        nombre: grupo.nombre,
        estado: grupo.estado || "SIN ESTADO",
        periodo: grupo.periodo || "SIN PERIODO",
        cantidadPracticantes:
          grupo.cantidadPracticantes ?? 0
      }));

      setRows(formattedData);
      setCurrentPage(1);

    } catch (error) {

      console.error("Error grupos:", error);

      toast.error(
        error.response?.data?.message ||
        "Error al cargar los grupos"
      );

      setRows([]);

    } finally {

      setLoading(false);

    }

  };


  const handleView = (id) => {

    navigate(`/grupos/${id}/practicantes`, {
      state: {
        practicaId
      }
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
        Mis Grupos Académicos
      </h1>


      {/* SELECT PRÁCTICA */}
      <div className="mb-6">

        <label
          htmlFor="practica"
          className="block text-sm font-semibold text-slate-600 mb-2"
        >
          Práctica
        </label>

        <div className="relative">

          <select
            id="practica"
            value={practicaId}
            onChange={(e) => setPracticaId(e.target.value)}
            className="
              appearance-none
              w-full
              h-10
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

            {practicas.length === 0 ? (

              <option value="">
                No hay prácticas disponibles
              </option>

            ) : (

              practicas.map(practica => (

                <option
                  key={practica.id}
                  value={practica.id}
                >
                  {practica.Periodo?.nombre ||
                    practica.periodo ||
                    `Práctica ${practica.id}`}
                </option>

              ))

            )}

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


      {/* SKELETON / TABLA */}
      {loading ? (

        <GruposSkeleton />

      ) : (

        <GenericTable
          rows={rows}
          currentPage={currentPage}
          onPageChange={setCurrentPage}

          columns={[
            {
              key: "nombre",
              label: "Nombre",
              primary: true
            },
            {
              key: "periodo",
              label: "Periodo"
            },
            {
              key: "estado",
              label: "Estado",
              render: (row) => <EstadoBadge estado={row.estado} />
            },
            {
              key: "cantidadPracticantes",
              label: "Practicantes"
            }
          ]}

          actions={[
            {
              icon: <Eye size={24} />,
              className: "hover:bg-green-100",
              onClick: handleView
            }
          ]}

          emptyMessage={
            practicaId
              ? "No se le han asignado grupos."
              : "Seleccione una práctica."
          }

          pageSize={6}
        />

      )}

    </div>

  );

};


export default GruposTutorDocente;