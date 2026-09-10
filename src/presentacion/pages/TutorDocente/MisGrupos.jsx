import Layout from "../../shared/Layouts/Layout";
import { Eye } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getGruposByPractica } from "../../../aplicacion/tutorDocente/getGruposByPractica";
import { tutorDocenteRepository } from "../../../infraestructura/repository/tutorDocenteRepository";

import { getPracticas } from "../../../aplicacion/practica/getPracticas";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository";


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


  const loadGrupos = async () => {

    try {

      setLoading(true);

      const data = await getGruposByPractica({
        tutorDocenteRepository,
        practicaId
      });

      console.log("Grupos obtenidos:", data);

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

    navigate(`/grupos/${id}/practicantes`);

  };


  return (

    <Layout footerLabel="Tutor Docente">

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
            label: "Estado"
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

    </Layout>

  );

};


export default GruposTutorDocente;