import Layout from "../../shared/Layouts/Layout";
import { Eye } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const GruposPractica = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const [periodoFiltro, setPeriodoFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  const navigate = useNavigate();


  // DATOS TEMPORALES
  // Después estos datos vendrán del backend.
  const [rows] = useState([
    {
      id: 1,
      grupo: "Grupo 1",
      periodo: "2026-01",
      practica: "Práctica 2026-01",
      candidatos: 5
    },
    {
      id: 2,
      grupo: "Grupo 2",
      periodo: "2026-01",
      practica: "Práctica 2026-01",
      candidatos: 4
    },
    {
      id: 3,
      grupo: "Grupo 3",
      periodo: "2026-01",
      practica: "Práctica 2026-01",
      candidatos: 6
    },
    {
      id: 4,
      grupo: "Grupo 1",
      periodo: "2026-02",
      practica: "Práctica 2026-02",
      candidatos: 3
    },
    {
      id: 5,
      grupo: "Grupo 2",
      periodo: "2026-02",
      practica: "Práctica 2026-02",
      candidatos: 5
    },
    {
      id: 6,
      grupo: "Grupo 1",
      periodo: "2025-02",
      practica: "Práctica 2025-02",
      candidatos: 7
    }
  ]);


  // PERIODOS DISPONIBLES PARA EL FILTRO
  const periodos = useMemo(() => {

    return [
      ...new Set(
        rows.map((grupo) => grupo.periodo)
      )
    ];

  }, [rows]);


  // FILTRAR GRUPOS
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

  }, [rows, periodoFiltro, busqueda]);


  // VER GRUPO
  const handleView = (id) => {

    const grupo = rows.find(
      (g) => g.id === id
    );

    navigate(`/director/grupos/${id}`, {
      state: { grupo }
    });

  };


  return (
    <Layout footerLabel="Director de programa">

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
            key: "candidatos",
            label: "Candidatos"
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

    </Layout>
  );
};

export default GruposPractica;