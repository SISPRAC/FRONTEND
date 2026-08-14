import Layout from "../../shared/Layouts/Layout";
import GenericTable from "../../components/Table/GenericTable";

import {
  Eye,
  Pencil,
  Trash2,
  Plus
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { vacanteRepository } from "../../../infraestructura/repository/vacanteRepository.js";
import { getVacantesByEmpresa } from "../../../aplicacion/vacante/getVacantesByEmpresa.js";
import { crearVacante } from "../../../aplicacion/vacante/crearVacante.js";
import { actualizarVacante } from "../../../aplicacion/vacante/actualizarVacante.js";

const VacantesEmpresa = () => {

  const [currentPage, setCurrentPage] = useState(1);

  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");

  const [busqueda, setBusqueda] = useState("");

  const [rows, setRows] = useState([]);

  const [modalAbierto, setModalAbierto] = useState(false);

  const [modoModal, setModoModal] = useState("crear");

  const [vacanteSeleccionada, setVacanteSeleccionada] =
    useState(null);

  const [modalEliminar, setModalEliminar] = useState(false);

  const [vacanteEliminar, setVacanteEliminar] =
    useState(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    cantidad: 1,
    estado: "DISPONIBLE"
  });

  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();


  /* =========================
     CARGAR VACANTES
  ========================= */

  const cargarVacantes = async () => {

    try {

      const vacantes =
        await getVacantesByEmpresa(
          vacanteRepository
        );

      const vacantesFormateadas =
        vacantes.map((vacante) => {

          return {
            ...vacante,

            convenio:
              vacante.Convenio
                ? vacante.Convenio.estado
                : "Sin convenio",

            empresa:
              vacante.Convenio?.Empresa?.nombre
                ?? "",

            aperturas:
              vacante.AperturaVacantes?.length ?? 0,

            estado:
              vacante.estado === "DISPONIBLE"
                ? "Disponible"
                : vacante.estado === "CERRADA"
                  ? "Cerrada"
                  : vacante.estado
          };

        });

      setRows(vacantesFormateadas);

    } catch (error) {

      console.error(
        "Error al cargar las vacantes:",
        error
      );

    }

  };


  useEffect(() => {

    cargarVacantes();

  }, []);


  /* =========================
     FILTROS
  ========================= */

  const vacantesFiltradas = useMemo(() => {

    return rows.filter((vacante) => {

      const coincideEstado =
        estadoFiltro === "TODOS" ||
        vacante.estado === estadoFiltro;

      const texto =
        busqueda.toLowerCase().trim();

      const coincideBusqueda =
        !texto ||
        vacante.nombre
          ?.toLowerCase()
          .includes(texto) ||
        vacante.descripcion
          ?.toLowerCase()
          .includes(texto) ||
        vacante.convenio
          ?.toLowerCase()
          .includes(texto);

      return (
        coincideEstado &&
        coincideBusqueda
      );

    });

  }, [
    rows,
    estadoFiltro,
    busqueda
  ]);


  /* =========================
     CREAR
  ========================= */

  const handleCrear = () => {

    setModoModal("crear");

    setVacanteSeleccionada(null);

    setForm({
      nombre: "",
      descripcion: "",
      cantidad: 1,
      estado: "DISPONIBLE"
    });

    setModalAbierto(true);

  };


  /* =========================
     EDITAR
  ========================= */

  const handleEditar = (id) => {

    const vacante =
      rows.find(
        (item) => item.id === id
      );

    if (!vacante) return;

    setModoModal("editar");

    setVacanteSeleccionada(vacante);

    setForm({
      nombre: vacante.nombre ?? "",
      descripcion:
        vacante.descripcion ?? "",
      cantidad:
        vacante.cantidad ?? 1,

      estado:
        vacante.estado === "Disponible"
          ? "DISPONIBLE"
          : vacante.estado === "Cerrada"
            ? "CERRADA"
            : vacante.estado
    });

    setModalAbierto(true);

  };


  /* =========================
     GUARDAR
  ========================= */

  const handleGuardar = async (e) => {

    e.preventDefault();

    try {

      setCargando(true);

      if (modoModal === "crear") {

        await crearVacante(
          vacanteRepository,
          {
            nombre: form.nombre,
            descripcion: form.descripcion,
            cantidad:
              Number(form.cantidad)
          }
        );

      } else {

        await actualizarVacante(
          vacanteRepository,
          vacanteSeleccionada.id,
          {
            nombre: form.nombre,
            descripcion: form.descripcion,
            cantidad:
              Number(form.cantidad),
            estado: form.estado
          }
        );

      }

      setModalAbierto(false);

      await cargarVacantes();

    } catch (error) {

      console.error(
        "Error al guardar la vacante:",
        error
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "No se pudo guardar la vacante"
      );

    } finally {

      setCargando(false);

    }

  };


  /* =========================
     ELIMINAR / CERRAR
  ========================= */

  const handleEliminar = (id) => {

    const vacante =
      rows.find(
        (item) => item.id === id
      );

    if (!vacante) return;

    setVacanteEliminar(vacante);

    setModalEliminar(true);

  };


  const confirmarEliminar = async () => {

    if (!vacanteEliminar) return;

    try {

      setCargando(true);

      /*
       * NO eliminamos físicamente.
       * La cerramos.
       */

      await actualizarVacante(
        vacanteRepository,
        vacanteEliminar.id,
        {
          estado: "CERRADA"
        }
      );

      setModalEliminar(false);

      setVacanteEliminar(null);

      await cargarVacantes();

    } catch (error) {

      console.error(
        "Error al cerrar la vacante:",
        error
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "No se pudo cerrar la vacante"
      );

    } finally {

      setCargando(false);

    }

  };


  /* =========================
     VER DETALLE
  ========================= */

  const handleView = (id) => {

    const vacante =
      rows.find(
        (item) => item.id === id
      );

    navigate(
      `/empresa/vacantes/${id}`,
      {
        state: {
          vacante
        }
      }
    );

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
        Vacantes
      </h1>


      {/* =========================
          ENCABEZADO
      ========================= */}

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

        {/* FILTROS */}

        <div className="flex items-center gap-3">

          <label
            htmlFor="estado"
            className="
              text-sm
              font-medium
              text-slate-600
            "
          >
            Estado:
          </label>

          <select
            id="estado"
            value={estadoFiltro}
            onChange={(e) => {

              setEstadoFiltro(
                e.target.value
              );

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

            <option value="Disponible">
              Disponibles
            </option>

            <option value="Cerrada">
              Cerradas
            </option>

          </select>


          <input
            type="text"
            value={busqueda}
            onChange={(e) => {

              setBusqueda(
                e.target.value
              );

              setCurrentPage(1);

            }}
            placeholder="Buscar vacante..."
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


        {/* CREAR */}

        <button
          type="button"
          onClick={handleCrear}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            bg-red-600
            hover:bg-red-700
            text-white
            px-4
            py-2
            rounded-md
            text-sm
            font-semibold
            transition
          "
        >

          <Plus size={18} />

          Nueva vacante

        </button>

      </div>


      {/* =========================
          TABLA
      ========================= */}

      <GenericTable

        rows={vacantesFiltradas}

        currentPage={currentPage}

        onPageChange={setCurrentPage}

        columns={[
          {
            key: "nombre",
            label: "Vacante",
            primary: true
          },
          {
            key: "descripcion",
            label: "Descripción"
          },
          {
            key: "cantidad",
            label: "Cupos"
          },
          {
            key: "aperturas",
            label: "Aperturas"
          },
          {
            key: "convenio",
            label: "Convenio"
          },
          {
            key: "estado",
            label: "Estado"
          }
        ]}

        actions={[
          {
            icon: <Eye size={22} />,
            className: "hover:bg-blue-100",
            onClick: handleView
          },
          {
            icon: <Pencil size={21} />,
            className: "hover:bg-yellow-100",
            onClick: handleEditar
          },
          {
            icon: <Trash2 size={21} />,
            className: "hover:bg-red-100",
            onClick: handleEliminar
          }
        ]}

        emptyMessage="No hay vacantes que coincidan con los filtros."

        pageSize={6}

      />


      {/* =========================
          MODAL CREAR / EDITAR
      ========================= */}

      {modalAbierto && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            px-4
          "
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-xl
              bg-white
              shadow-xl
              p-6
            "
          >

            <h2
              className="
                text-xl
                font-bold
                text-slate-800
                mb-5
              "
            >
              {modoModal === "crear"
                ? "Crear vacante"
                : "Editar vacante"}
            </h2>


            <form
              onSubmit={handleGuardar}
              className="space-y-4"
            >

              {/* NOMBRE */}

              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-700
                    mb-1
                  "
                >
                  Nombre
                </label>

                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombre: e.target.value
                    })
                  }
                  required
                  maxLength={15}
                  className="
                    w-full
                    border
                    border-slate-300
                    rounded-md
                    px-3
                    py-2
                    text-sm
                    focus:outline-none
                    focus:ring-2
                    focus:ring-slate-300
                  "
                />

              </div>


              {/* DESCRIPCIÓN */}

              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-700
                    mb-1
                  "
                >
                  Descripción
                </label>

                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      descripcion:
                        e.target.value
                    })
                  }
                  required
                  rows={4}
                  className="
                    w-full
                    border
                    border-slate-300
                    rounded-md
                    px-3
                    py-2
                    text-sm
                    resize-none
                    focus:outline-none
                    focus:ring-2
                    focus:ring-slate-300
                  "
                />

              </div>


              {/* CANTIDAD */}

              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-700
                    mb-1
                  "
                >
                  Cantidad máxima de cupos
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.cantidad}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cantidad:
                        e.target.value
                    })
                  }
                  required
                  className="
                    w-full
                    border
                    border-slate-300
                    rounded-md
                    px-3
                    py-2
                    text-sm
                    focus:outline-none
                    focus:ring-2
                    focus:ring-slate-300
                  "
                />

              </div>


              {/* ESTADO SOLO EDITAR */}

              {modoModal === "editar" && (

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      text-slate-700
                      mb-1
                    "
                  >
                    Estado
                  </label>

                  <select
                    value={form.estado}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estado:
                          e.target.value
                      })
                    }
                    className="
                      w-full
                      border
                      border-slate-300
                      rounded-md
                      px-3
                      py-2
                      text-sm
                      bg-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-slate-300
                    "
                  >

                    <option value="DISPONIBLE">
                      Disponible
                    </option>

                    <option value="CERRADA">
                      Cerrada
                    </option>

                  </select>

                </div>

              )}


              {/* CONVENIO */}

              {modoModal === "editar" &&
                vacanteSeleccionada?.Convenio && (

                  <div>

                    <label
                      className="
                        block
                        text-sm
                        font-medium
                        text-slate-700
                        mb-1
                      "
                    >
                      Convenio
                    </label>

                    <div
                      className="
                        w-full
                        bg-slate-100
                        border
                        border-slate-200
                        rounded-md
                        px-3
                        py-2
                        text-sm
                        text-slate-600
                      "
                    >
                      Convenio #{vacanteSeleccionada.Convenio.id}
                      {" - "}
                      {vacanteSeleccionada.Convenio.estado}
                    </div>

                    <p
                      className="
                        text-xs
                        text-slate-500
                        mt-1
                      "
                    >
                      El convenio no puede modificarse.
                    </p>

                  </div>

                )}


              {/* BOTONES */}

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  pt-3
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setModalAbierto(false)
                  }
                  className="
                    px-4
                    py-2
                    rounded-md
                    border
                    border-slate-300
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  disabled={cargando}
                  className="
                    px-4
                    py-2
                    rounded-md
                    bg-red-600
                    text-white
                    text-sm
                    font-semibold
                    hover:bg-red-700
                    disabled:opacity-50
                  "
                >

                  {cargando
                    ? "Guardando..."
                    : modoModal === "crear"
                      ? "Crear vacante"
                      : "Guardar cambios"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =========================
          MODAL CONFIRMAR CIERRE
      ========================= */}

      {modalEliminar && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            px-4
          "
        >

          <div
            className="
              w-full
              max-w-md
              rounded-xl
              bg-white
              shadow-xl
              p-6
            "
          >

            <h2
              className="
                text-xl
                font-bold
                text-slate-800
                mb-3
              "
            >
              Cerrar vacante
            </h2>

            <p
              className="
                text-sm
                text-slate-600
                leading-6
              "
            >
              ¿Está seguro de que desea cerrar la vacante{" "}
              <strong>
                {vacanteEliminar?.nombre}
              </strong>
              ?
            </p>

            <p
              className="
                text-xs
                text-slate-500
                mt-2
              "
            >
              La vacante no será eliminada. Se conservará
              para mantener el historial de sus aperturas.
            </p>


            <div
              className="
                flex
                justify-end
                gap-3
                mt-6
              "
            >

              <button
                type="button"
                onClick={() => {
                  setModalEliminar(false);
                  setVacanteEliminar(null);
                }}
                className="
                  px-4
                  py-2
                  rounded-md
                  border
                  border-slate-300
                  text-sm
                  font-medium
                  text-slate-700
                  hover:bg-slate-50
                "
              >
                Cancelar
              </button>


              <button
                type="button"
                onClick={confirmarEliminar}
                disabled={cargando}
                className="
                  px-4
                  py-2
                  rounded-md
                  bg-red-600
                  text-white
                  text-sm
                  font-semibold
                  hover:bg-red-700
                  disabled:opacity-50
                "
              >
                {cargando
                  ? "Cerrando..."
                  : "Sí, cerrar vacante"}
              </button>

            </div>

          </div>

        </div>

      )}

    </Layout>
  );
};

export default VacantesEmpresa;