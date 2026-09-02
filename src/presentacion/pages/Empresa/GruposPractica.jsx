import Layout from "../../shared/Layouts/Layout";
import { Eye } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmpresaRepository } from "../../../infraestructura/repository/empresaRepository";
import { obtenerGruposEmpresa } from "../../../aplicacion/empresa/obtenerGruposEmpresa";


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

        console.log("Respuesta grupos empresa:", response);

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

        console.error(
          "Error al obtener los grupos:",
          error
        );

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

    return [
      ...new Set(
        rows.map((grupo) => grupo.periodo)
      )
    ];

  }, [rows]);


  // ==========================================
  // FILTRAR GRUPOS
  // ==========================================

  const gruposFiltrados = useMemo(() => {

    return rows.filter((grupo) => {

      const coincidePeriodo =
        periodoFiltro === "TODOS" ||
        grupo.periodo === periodoFiltro;

      const texto = busqueda
        .toLowerCase()
        .trim();

      const coincideBusqueda =
        !texto ||
        grupo.grupo
          .toLowerCase()
          .includes(texto) ||
        grupo.periodo
          .toLowerCase()
          .includes(texto) ||
        grupo.practica
          .toLowerCase()
          .includes(texto);

      return coincidePeriodo && coincideBusqueda;

    });

  }, [
    rows,
    periodoFiltro,
    busqueda
  ]);


  // ==========================================
  // VER GRUPO
  // ==========================================

  const handleView = (id) => {

    navigate(`/empresa/grupos/${id}`);

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
        Grupos de Práctica
      </h1>


      {/* ==========================================
          CARGANDO
      ========================================== */}

      {loading && (

        <div className="text-center py-10 text-slate-500">

          Cargando grupos...

        </div>

      )}


      {/* ==========================================
          ERROR
      ========================================== */}

      {!loading && error && (

        <div
          className="
            text-center
            py-10
            text-red-500
            font-medium
          "
        >

          {error}

        </div>

      )}


      {/* ==========================================
          CONTENIDO
      ========================================== */}

      {!loading && !error && (

        <>

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

            {/* FILTRO PERIODO */}

            <div className="flex items-center gap-2">

              <label
                htmlFor="periodo"
                className="
                  text-sm
                  font-medium
                  text-slate-600
                "
              >
                Periodo:
              </label>

              <select
                id="periodo"
                value={periodoFiltro}
                onChange={(e) => {

                  setPeriodoFiltro(e.target.value);
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

                <option value="TODOS">
                  Todos
                </option>

                {periodos.map((periodo) => (

                  <option
                    key={periodo}
                    value={periodo}
                  >
                    {periodo}
                  </option>

                ))}

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
              placeholder="Buscar grupo..."
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

            rows={gruposFiltrados}

            currentPage={currentPage}

            onPageChange={setCurrentPage}

            columns={[

              {
                key: "grupo",
                label: "Grupo",
                primary: true
              },

              {
                key: "periodo",
                label: "Periodo"
              },

              {
                key: "practica",
                label: "Práctica"
              },

              {
                key: "practicantes",
                label: "Practicantes"
              },
              {
                key: "aperturas",
                label: "Aperturas"
              },
              {
                key: "estado",
                label: "Estado",

                render: (row) => (
                  <span
                    className={`
        inline-flex
        items-center
        px-3
        py-1
        rounded-full
        text-xs
        font-bold
        ${row.estado === "EN_CURSO"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                      }
      `}
                  >
                    {row.estado === "EN_CURSO"
                      ? "En curso"
                      : "Finalizada"}
                  </span>
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

            emptyMessage="No hay grupos que coincidan con los filtros."

            pageSize={6}

          />

        </>

      )}

    </Layout>
  );
};

export default GruposPractica;