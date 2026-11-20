import GenericTable from "../../components/Table/GenericTable";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge.jsx";
import VacanteModal from "../../components/vacantes/VacanteModal.jsx";
import ConfirmarCierreModal from "../../components/vacantes/ConfirmarCierreModal.jsx";
import VacantesSkeleton from "../../components/vacantes/VacantesSkeleton.jsx";

import { Pencil, Trash2, Plus, Search, ChevronDown, X } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";

import { vacanteRepository } from "../../../infraestructura/repository/vacanteRepository.js";
import { getVacantesByEmpresa } from "../../../aplicacion/vacante/getVacantesByEmpresa.js";
import { crearVacante } from "../../../aplicacion/vacante/crearVacante.js";
import { eliminarVacante } from "../../../aplicacion/vacante/eliminarVacante.js";
import { actualizarVacante } from "../../../aplicacion/vacante/actualizarVacante.js";

const VacantesEmpresa = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal crear / editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState("crear");
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);

  // Modal cerrar vacante
  const [vacanteEliminar, setVacanteEliminar] = useState(null);

  const [cargando, setCargando] = useState(false);

  /* =========================
     CARGAR
  ========================= */

  const cargarVacantes = async () => {
    try {
      const vacantes = await getVacantesByEmpresa(vacanteRepository);

      const vacantesFormateadas = vacantes.map((vacante) => ({
        ...vacante,
        convenio: vacante.Convenio ? vacante.Convenio.estado : "Sin convenio",
        empresa: vacante.Convenio?.Empresa?.nombre ?? "",
        estado:
          vacante.estado === "DISPONIBLE"
            ? "Disponible"
            : vacante.estado === "CERRADA"
            ? "Cerrada"
            : vacante.estado,
      }));

      setRows(vacantesFormateadas);
    } catch (error) {
      console.error("Error al cargar las vacantes:", error);
      toast.error("Error al cargar las vacantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVacantes();
  }, []);

  /* =========================
     FILTROS
  ========================= */

  const vacantesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return rows.filter((vacante) => {
      const coincideEstado =
        estadoFiltro === "TODOS" || vacante.estado === estadoFiltro;

      const coincideBusqueda =
        !texto ||
        vacante.nombre?.toLowerCase().includes(texto) ||
        vacante.descripcion?.toLowerCase().includes(texto) ||
        vacante.convenio?.toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }, [rows, estadoFiltro, busqueda]);

  /* =========================
     CREAR / EDITAR
  ========================= */

  const handleCrear = () => {
    setModoModal("crear");
    setVacanteSeleccionada(null);
    setModalAbierto(true);
  };

  const handleEditar = (id) => {
    const vacante = rows.find((item) => item.id === id);
    if (!vacante) return;

    setModoModal("editar");
    setVacanteSeleccionada(vacante);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVacanteSeleccionada(null);
  };

  // `datos` ya viene validado y normalizado desde VacanteModal
  const handleGuardar = async (datos) => {
    try {
      setCargando(true);

      if (modoModal === "crear") {
        await crearVacante(vacanteRepository, {
          nombre: datos.nombre,
          descripcion: datos.descripcion,
        });

        toast.success("Vacante creada correctamente");
      } else {
        await actualizarVacante(vacanteRepository, vacanteSeleccionada.id, {
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          estado: datos.estado,
        });

        toast.success("Vacante actualizada correctamente");
      }

      cerrarModal();
      await cargarVacantes();
    } catch (error) {
      console.error("Error al guardar la vacante:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          (modoModal === "crear"
            ? "Error al crear la vacante"
            : "Error al actualizar la vacante")
      );
    } finally {
      setCargando(false);
    }
  };

  /* =========================
     CERRAR VACANTE
  ========================= */

  const handleEliminar = (id) => {
    const vacante = rows.find((item) => item.id === id);
    if (!vacante) return;

    setVacanteEliminar(vacante);
  };

  const confirmarEliminar = async () => {
    if (!vacanteEliminar) return;

    try {
      setCargando(true);

      await eliminarVacante(vacanteRepository, vacanteEliminar.id);

      setVacanteEliminar(null);
      await cargarVacantes();

      toast.success("Vacante cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar la vacante:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error al cerrar la vacante"
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <h1 className="mb-7 text-center text-[26px] font-extrabold tracking-tight text-slate-800">
        Vacantes
      </h1>

      {/* =========================
          ENCABEZADO
      ========================= */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* FILTROS */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
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
                className="h-10 min-w-[160px] cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <option value="TODOS">Todos</option>
                <option value="Disponible">Disponibles</option>
                <option value="Cerrada">Cerradas</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* BUSCADOR */}
          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar vacante..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />

            {busqueda && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setCurrentPage(1);
                }}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* CREAR */}
        <button
          type="button"
          onClick={handleCrear}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          <Plus size={18} />
          Nueva vacante
        </button>
      </div>

      {/* =========================
          SKELETON / TABLA
      ========================= */}
      {loading ? (
        <VacantesSkeleton />
      ) : (
        <GenericTable
          rows={vacantesFiltradas}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          columns={[
            { key: "nombre", label: "Vacante", primary: true },
            { key: "descripcion", label: "Descripción" },
            { key: "convenio", label: "Convenio" },
            {
              key: "estado",
              label: "Estado",
              render: (row) => <EstadoBadge estado={row.estado} />,
            },
          ]}
          actions={[
            {
              icon: <Pencil size={21} />,
              className: "hover:bg-yellow-100",
              onClick: handleEditar,
            },
            {
              icon: <Trash2 size={21} />,
              className: "hover:bg-red-100",
              onClick: handleEliminar,
            },
          ]}
          emptyMessage="No hay vacantes que coincidan con los filtros."
          pageSize={6}
        />
      )}

      {/* =========================
          MODAL CREAR / EDITAR
      ========================= */}
      {modalAbierto && (
        <VacanteModal
          key={vacanteSeleccionada?.id ?? "nueva"}
          modo={modoModal}
          vacante={vacanteSeleccionada}
          cargando={cargando}
          onSubmit={handleGuardar}
          onClose={cerrarModal}
        />
      )}

      {/* =========================
          MODAL CONFIRMAR CIERRE
      ========================= */}
      {vacanteEliminar && (
        <ConfirmarCierreModal
          vacante={vacanteEliminar}
          cargando={cargando}
          onConfirm={confirmarEliminar}
          onCancel={() => setVacanteEliminar(null)}
        />
      )}
    </div>
  );
};

export default VacantesEmpresa;