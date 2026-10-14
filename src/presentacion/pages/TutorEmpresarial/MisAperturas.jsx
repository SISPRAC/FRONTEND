import { Eye } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { obtenerAperturasByTutorEmpresa } from "../../../aplicacion/tutorEmpresarial/obtenerAperturasByTutorEmpresa.js";
import { tutorEmpresarialRepository } from "../../../infraestructura/repository/tutorEmpresarialRepository.js";

import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";


const AperturasTutorEmpresarial = () => {

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
      loadAperturas();
    } else {
      setRows([]);
      setLoading(false);
    }

  }, [practicaId]);


  const loadPracticas = async () => {

    try {

      const data = await getPracticas({
        practicaRepository
      });

      console.log("Prácticas obtenidas:", data);

      setPracticas(data);

      if (data.length > 0) {
        setPracticaId(data[0].id);
      }

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Error al cargar las prácticas"
      );

    }

  };


  const loadAperturas = async () => {

    try {

      setLoading(true);

      const practicaSeleccionada = practicas.find(
        practica => String(practica.id) === String(practicaId)
      );

      const periodoId =
        practicaSeleccionada?.periodo_id ||
        practicaSeleccionada?.Periodo?.id;

      const data = await obtenerAperturasByTutorEmpresa({
        tutorEmpresarialRepository,
        periodoId,
        practicaId
      });

      console.log("Asignaciones obtenidas:", data);

      const formattedData = data.map(practica => ({
        id: practica.practica_id,

        periodo:
          practica.periodo || "SIN PERIODO",

        fecha_inicio:
          practica.fecha_inicio || "",

        fecha_fin:
          practica.fecha_fin || "",

        cantidadAperturas:
          practica.cantidadAperturas ?? 0,

        cantidadPracticantes:
          practica.cantidadPracticantes ?? 0,

        estado:
          practica.estado || "SIN ESTADO"
      }));

      setRows(formattedData);
      setCurrentPage(1);

    } catch (error) {

      console.error("Error asignaciones:", error);

      toast.error(
        error.response?.data?.message ||
        "Error al cargar las asignaciones"
      );

      setRows([]);

    } finally {

      setLoading(false);

    }

  };


  const handleView = (id) => {

    navigate(`/mis-aperturas/${id}`);

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
        Mis Asignaciones
      </h1>


      <div className="mb-6">

        <label
          className="
            block
            text-sm
            font-semibold
            text-slate-700
            mb-2
          "
        >
          Práctica
        </label>

        <select
          value={practicaId}
          onChange={(e) => setPracticaId(e.target.value)}
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-2.5
            text-sm
            text-gray-700
            outline-none
            focus:border-red-500
            focus:ring-1
            focus:ring-red-500
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

      </div>


      <GenericTable
        rows={rows}
        loading={loading}
        currentPage={currentPage}
        onPageChange={setCurrentPage}

        columns={[
          {
            key: "periodo",
            label: "Práctica",
            primary: true
          },
          {
            key: "fecha_inicio",
            label: "Fecha inicio"
          },
          {
            key: "fecha_fin",
            label: "Fecha fin"
          },
          {
            key: "cantidadAperturas",
            label: "Aperturas"
          },
          {
            key: "cantidadPracticantes",
            label: "Practicantes"
          },
          {
            key: "estado",
            label: "Estado"
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
            ? "No tiene aperturas de vacante asignadas."
            : "Seleccione una práctica."
        }

        pageSize={6}
      />

    </div>

  );

};


export default AperturasTutorEmpresarial;