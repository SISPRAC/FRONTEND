import Layout from "../../shared/Layouts/Layout";
import { Eye } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { postulacionRepository } from "../../../infraestructura/repository/postulacionRepository.js";
import { obtenerCandidatosEmpresa } from "../../../aplicacion/postulacion/obtenerCandidatosEmpresa.js";

const CandidatosEmpresa = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  const [rows, setRows] = useState([]);

  const navigate = useNavigate();


  useEffect(() => {

    const cargarCandidatos = async () => {

      try {

        const candidatos =
          await obtenerCandidatosEmpresa(
            postulacionRepository
          );

        const candidatosFormateados = candidatos.map((candidato) => ({
          ...candidato,

          estado:
            candidato.estado === "POSTULADO"
              ? "Postulado"
              : candidato.estado === "ACEPTADO"
                ? "Aceptado"
                : candidato.estado === "RECHAZADO"
                  ? "Rechazado"
                  : candidato.estado === "RETIRADO"
                    ? "Retirado"
                    : candidato.estado
        }));

        setRows(candidatosFormateados);

      } catch (error) {

        console.error(
          "Error al cargar los candidatos de la empresa:",
          error
        );

      }

    };

    cargarCandidatos();

  }, []);


  const candidatosFiltrados = useMemo(() => {

    return rows.filter((candidato) => {

      const coincideEstado =
        estadoFiltro === "TODOS" ||
        candidato.estado === estadoFiltro;

      const texto = busqueda.toLowerCase().trim();

      const coincideBusqueda =
        !texto ||
        candidato.codigo.toLowerCase().includes(texto) ||
        candidato.nombre.toLowerCase().includes(texto) ||
        candidato.vacante.toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
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
    <Layout footerLabel="Empresa">

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
        Candidatos
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
        <div className="flex items-center gap-2">

          <label
            htmlFor="estado"
            className="text-sm font-medium text-slate-600"
          >
            Estado:
          </label>

          <select
            id="estado"
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value);
              setCurrentPage(1);
            }}
            className="
              border
              border-slate-300
              rounded-md
              px-3
              py-2
              text-sm
              text-slate-700
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-slate-300
            "
          >
            <option value="TODOS">Todos</option>
            <option value="Postulado">Postulados</option>
            <option value="Aceptado">Aceptados</option>
            <option value="Rechazado">Rechazados</option>
            <option value="Retirado">Retirados</option>
          </select>

        </div>


        {/* BUSCADOR */}
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
            md:w-64
            border
            border-slate-300
            rounded-md
            px-3
            py-2
            text-sm
            text-slate-700
            bg-white
            focus:outline-none
            focus:ring-2
            focus:ring-slate-300
          "
        />

      </div>


      {/* TABLA */}
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
            label: "Estado"
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

    </Layout>
  );
};

export default CandidatosEmpresa;