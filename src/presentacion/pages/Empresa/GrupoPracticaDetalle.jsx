import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  ClipboardList,
  Trash2,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import Layout from "../../shared/Layouts/Layout";
import ConfirmModal from "../../components/modals/ConfirmModal";
import AperturaVacanteModal from "../../components/modals/AperturaVacanteModal.jsx";

import { vacanteRepository } from "../../../infraestructura/repository/vacanteRepository.js";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";

import { getVacantesByEmpresa } from "../../../aplicacion/vacante/getVacantesByEmpresa.js";
import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";

import { aperturaVacanteRepository } from "../../../infraestructura/repository/aperturaVacanteRepository.js";

import { crearAperturaVacante } from "../../../aplicacion/aperturaVacante/crearAperturaVacante.js";
import { getAperturasVacantes } from "../../../aplicacion/aperturaVacante/getAperturasVacantes.js";
import { actualizarAperturaVacante } from "../../../aplicacion/aperturaVacante/actualizarAperturaVacante.js";
import { eliminarAperturaVacante } from "../../../aplicacion/aperturaVacante/eliminarAperturaVacante.js";
import { getTutorEmpresariales } from "../../../aplicacion/tutorEmpresarial/getTutorEmpresarial.js";
import { tutorEmpresarialRepository } from "../../../infraestructura/repository/tutorEmpresarialRepository.js";

import { EmpresaRepository } from "../../../infraestructura/repository/empresaRepository.js";
import { obtenerDetalleGrupoEmpresa } from "../../../aplicacion/empresa/obtenerDetalleGrupoEmpresa.js";

import toast from "react-hot-toast";

import GenericTable from "../../components/Table/GenericTable.jsx";


const GrupoPracticaDetalle = () => {

  const { id } = useParams();
  const navigate = useNavigate();


  // ============================================================
  // DATOS PARA CREAR APERTURA
  // ============================================================

  const [vacantesEmpresa, setVacantesEmpresa] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [grupo, setGrupo] = useState(null);
  const [loadingGrupo, setLoadingGrupo] = useState(true);
  const [errorGrupo, setErrorGrupo] = useState("");
  const [tutoresEmpresariales, setTutoresEmpresariales] = useState([]);

  const scrollRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkOverflow = () => {
    const el = scrollRef.current;
    if (!el) return;
    setHasOverflow(el.scrollWidth > el.clientWidth + 1);
  };

  const scrollAperturas = (direction) => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const cargarDetalleGrupo = async () => {
    try {
      setLoadingGrupo(true);
      setErrorGrupo("");

      const response = await obtenerDetalleGrupoEmpresa(
        EmpresaRepository,
        id
      );

      const grupoData = response?.data ?? null;

      console.log("Detalles Grupo", grupoData);

      setGrupo(grupoData);

      // 👇 esto es lo que faltaba
      setAperturas(
        Array.isArray(grupoData?.aperturas)
          ? grupoData.aperturas
          : []
      );


    } catch (error) {
      console.error("Error al obtener detalle del grupo:", error);
      setErrorGrupo(
        error?.response?.data?.message ||
        "No fue posible cargar el detalle del grupo."
      );
    } finally {
      setLoadingGrupo(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarDetalleGrupo();
    }
  }, [id]);


  // ============================================================
  // PRACTICANTES
  // ============================================================

  const practicantes = grupo?.practicantes ?? [];
  const practicaFinalizada =
    grupo?.practica?.estado === "FINALIZADA";

  // ============================================================
  // APERTURAS TEMPORALES
  // ============================================================

  const [aperturas, setAperturas] = useState([]);


  // ============================================================
  // MODAL CREAR APERTURA
  // ============================================================

  const [aperturaModal, setAperturaModal] = useState({
    isOpen: false,
    mode: "crear",
    apertura: null,
  });


  const abrirEditarApertura = (apertura) => {

    if (practicaFinalizada) {
      toast.error(
        "No se pueden editar aperturas en una práctica finalizada"
      );
      return;
    }

    setAperturaModal({
      isOpen: true,
      mode: "editar",
      apertura: apertura,
    });

  };

  // ============================================================
  // MODAL ELIMINAR
  // ============================================================

  const [aperturaAEliminar, setAperturaAEliminar] = useState(null);


  // ============================================================
  // SELECCIONADOS
  // ============================================================

  const [seleccionados, setSeleccionados] = useState([]);


  // ============================================================
  // CARGAR VACANTES Y PRÁCTICAS
  // ============================================================

  useEffect(() => {

    cargarDatosApertura();

  }, []);


  const cargarDatosApertura = async () => {

    try {

      const [
        vacantesData,
        practicasData,
        tutoresData
      ] = await Promise.all([

        getVacantesByEmpresa(
          vacanteRepository
        ),

        getPracticas(
          { practicaRepository }
        ),

        getTutorEmpresariales({
          tutorEmpresarialRepository
        })

      ]);

      setVacantesEmpresa(
        Array.isArray(vacantesData)
          ? vacantesData
          : []
      );


      setTutoresEmpresariales(
        Array.isArray(tutoresData)
          ? tutoresData
          : []
      );



    } catch (error) {

      console.error(
        "Error al cargar datos para apertura:",
        error
      );

    }

  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [aperturas]);

  // ============================================================
  // SELECCIÓN DE PRACTICANTES
  // ============================================================

  const toggleSeleccionado = (practicanteId) => {

    setSeleccionados((prev) =>
      prev.includes(practicanteId)
        ? prev.filter(
          (pid) => pid !== practicanteId
        )
        : [
          ...prev,
          practicanteId
        ]
    );

  };


  const toggleSeleccionarTodos = () => {

    setSeleccionados((prev) =>
      prev.length === practicantes.length
        ? []
        : practicantes.map(
          (p) => p.id
        )
    );

  };


  // ============================================================
  // VER CANDIDATO
  // ============================================================

  const handleVerCandidato = (practicante) => {
    navigate(
      `/director/candidatos/${practicante.practicante_id}`,
      {
        state: {
          candidato: practicante
        }
      }
    );
  };


  // ============================================================
  // ENCUESTA
  // ============================================================

  const handleEncuesta = (practicante) => {

    alert(
      `Encuesta pendiente de implementar para: ${practicante.nombres}`
    );

  };


  // ============================================================
  // ABRIR MODAL CREAR APERTURA
  // ============================================================

  const abrirCrearApertura = () => {

    if (practicaFinalizada) {
      toast.error(
        "No se pueden crear aperturas en una práctica finalizada"
      );
      return;
    }

    setAperturaModal({
      isOpen: true,
      mode: "crear",
      apertura: null,
    });

  };


  // ============================================================
  // CERRAR MODAL
  // ============================================================

  const cerrarAperturaModal = () => {

    setAperturaModal({
      isOpen: false,
      mode: "crear",
      apertura: null,
    });

  };


  // ============================================================
  // GUARDAR APERTURA
  // ============================================================

  const handleGuardarApertura = async (data) => {
    try {

      if (aperturaModal.mode === "crear") {

        await crearAperturaVacante(
          aperturaVacanteRepository,
          data
        );

        toast.success(
          "Apertura de vacante creada correctamente"
        );
      }

      if (aperturaModal.mode === "editar") {

        await actualizarAperturaVacante(
          aperturaVacanteRepository,
          aperturaModal.apertura.id,
          data
        );

        toast.success(
          "Apertura de vacante actualizada correctamente"
        );
      }

      // CERRAR INMEDIATAMENTE EL MODAL
      cerrarAperturaModal();

      // Luego actualizamos la información de la pantalla
      await cargarDatosApertura();
      await cargarDetalleGrupo();

    } catch (error) {

      console.error(
        "Error al guardar apertura:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        "No fue posible guardar la apertura de vacante."
      );

    }
  };

  const handleConfirmarEliminar = async () => {

    if (!aperturaAEliminar) return;

    console.log("APERTURA A ELIMINAR:", aperturaAEliminar);
    console.log("ID A ELIMINAR:", aperturaAEliminar.id);

    try {

      await eliminarAperturaVacante(
        aperturaVacanteRepository,
        aperturaAEliminar.id
      );

      toast.success(
        "Apertura de vacante eliminada correctamente"
      );

      setAperturaAEliminar(null);

      await cargarDatosApertura();
      await cargarDetalleGrupo();

    } catch (error) {

      console.error(
        "Error al eliminar apertura:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        "No fue posible eliminar la apertura de vacante."
      );

    } finally {

      setAperturaAEliminar(null);

    }
  };

  if (loadingGrupo) {

    return (
      <Layout footerLabel="Empresa">

        <div className="text-center py-10 text-slate-500">
          Cargando detalle del grupo...
        </div>

      </Layout>
    );

  }


  if (errorGrupo) {

    return (
      <Layout footerLabel="Empresa">

        <div className="text-center py-10 text-red-500 font-medium">
          {errorGrupo}
        </div>

      </Layout>
    );

  }


  if (!grupo) {

    return (
      <Layout footerLabel="Empresa">

        <div className="text-center py-10 text-slate-500">
          No se encontró el grupo.
        </div>

      </Layout>
    );

  }


  return (

    <Layout footerLabel="Director de programa">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="relative flex items-center justify-center mb-8">

        <button
          onClick={() => navigate(-1)}
          className="
            absolute left-0
            flex items-center gap-2
            text-slate-600 hover:text-slate-900
            font-medium text-sm
            px-3 py-2
            rounded-md
            hover:bg-slate-100
            transition-colors
          "
        >

          <ArrowLeft size={20} />

          Volver

        </button>

      </div>


      {/* ======================================================
    PERIODO / ESTADO
====================================================== */}



      <div className=" flex flex-col md:flex-row justify-between items-center gap-6 mb-8 max-w-5xl mx-auto ">
        <div className="text-center md:text-left">
          <p className=" text-sm font-semibold text-slate-600 mb-1 ">
            Periodo Lectivo </p>
          <p className=" text-2xl font-extrabold text-slate-800 ">
            {grupo.practica?.periodo ?? "—"}
          </p>
        </div>

        <div className="text-center">

          <p className="text-sm font-semibold text-slate-600 mb-1">
            Estado
          </p>

          <span
            className={`
        inline-flex
        items-center
        px-4
        py-1.5
        rounded-full
        text-sm
        font-bold
        ${grupo.practica?.estado === "EN_CURSO"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
              }
      `}
          >
            {grupo.practica?.estado === "EN_CURSO"
              ? "En curso"
              : "Finalizada"}
          </span>

        </div>
      </div>


      {/* ======================================================
          PRACTICANTES
      ====================================================== */}

      <h2 className="
        text-2xl
        font-extrabold
        text-slate-800
        text-center
        mb-4
      ">
        Practicantes
      </h2>


      <div className="
        max-w-5xl
        mx-auto
        mb-12
        overflow-x-auto
        rounded-xl
        border
        border-slate-200
        shadow-sm
      ">

        <GenericTable
          rows={practicantes}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          rowKey="practicante_id"

          columns={[
            {
              key: "nombres",
              label: "Nombre",
              primary: true,

              render: (row) =>
                `${row.nombres ?? ""} ${row.apellidos ?? ""}`.trim() || "—"
            },

            {
              key: "apertura",
              label: "Vacante",

              render: (row) =>
                row.apertura?.vacante ?? "—"
            },

            {
              key: "correo",
              label: "Correo",

              render: (row) =>
                row.correo ?? "—"
            },

            {
              key: "estado",
              label: "Estado",

              render: (row) =>
                row.estado ?? "—"
            }
          ]}

          actions={[
            {
              icon: <Eye size={18} />,
              className: "text-slate-600 hover:bg-blue-100",

              onClick: (id) => {

                const practicante =
                  practicantes.find(
                    (p) => p.practicante_id === id
                  );

                if (practicante) {
                  handleVerCandidato(practicante);
                }

              },
            },

            {
              icon: <ClipboardList size={18} />,
              className: "text-slate-600 hover:bg-amber-100",

              onClick: (id) => {

                const practicante =
                  practicantes.find(
                    (p) =>
                      p.practicante_id === id
                  );

                if (practicante) {
                  handleEncuesta(practicante);
                }

              },
            },
          ]}

          emptyMessage="No hay practicantes registrados."

          pageSize={3}
        />

      </div>



      {/* ======================================================
    APERTURAS DE VACANTE
====================================================== */}

      <div className="max-w-5xl mx-auto flex items-center justify-between mb-4">

        <h2 className="text-2xl font-extrabold text-slate-800">
          Aperturas de Vacante
        </h2>

        <button
          onClick={abrirCrearApertura}
          disabled={practicaFinalizada}
          className={`
      flex items-center gap-1.5
      px-3 py-1.5
      rounded-lg
      text-sm font-semibold
      transition-colors
      ${practicaFinalizada
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600"
            }
    `}
          title={
            practicaFinalizada
              ? "No se pueden crear aperturas en una práctica finalizada"
              : "Crear apertura"
          }
        >
          <Plus size={16} />
          Agregar
        </button>

      </div>

      <div className="max-w-5xl mx-auto mb-16">

        {aperturas.length === 0 ? (

          <div className="
      border-2 border-dashed border-slate-200
      rounded-2xl
      py-10
      text-center
      text-slate-400
      text-sm
    ">
            No hay aperturas registradas todavía.
          </div>

        ) : (

          <div className="relative flex items-center gap-2">

            {/* FLECHA IZQUIERDA */}
            {hasOverflow && (
              <button
                onClick={() => scrollAperturas("left")}
                className="
            hidden sm:flex
            shrink-0
            items-center justify-center
            w-9 h-9
            rounded-full
            bg-white
            border border-slate-200
            shadow-md
            text-slate-500
            hover:bg-slate-50
          "
                aria-label="Anterior"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* SCROLLER */}
            <div
              ref={scrollRef}
              className={`
          flex
          gap-5
          overflow-x-auto
          scroll-smooth
          snap-x
          snap-mandatory
          py-1
          flex-1
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          ${hasOverflow ? "" : "justify-center"}
        `}
            >

              {aperturas.map((apertura) => (

                <div
                  key={apertura.id}
                  className="
              snap-start
              shrink-0
              w-[270px]
              border-2 border-red-200
              rounded-2xl
              p-5
              bg-white
              shadow-sm
              flex flex-col justify-between
            "
                >

                  <div>
                    <p className="font-bold text-slate-800 mb-2">
                      {apertura.vacante ?? "Vacante"}
                    </p>

                    <p className="text-sm text-slate-500 mb-1">
                      Practica:{" "}
                      {grupo.practica?.periodo ?? grupo.practica?.periodo_nombre ?? "—"}
                    </p>

                    <p className="text-sm text-slate-500">
                      Cupos: {apertura.cupos}
                    </p>

                    <p className="text-sm text-slate-500">
                      Estado: {apertura.estado}
                    </p>

                    <p className="text-sm text-slate-500">
                      Tutor: {apertura.tutor_empresarial ?? "Sin asignar"}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">

                    <button
                      onClick={() => abrirEditarApertura(apertura)}
                      disabled={practicaFinalizada}
                      className={`
                  p-1.5 rounded-md
                  ${practicaFinalizada
                          ? "text-slate-300 cursor-not-allowed"
                          : "hover:bg-blue-100 text-blue-500"
                        }
                `}
                      title={
                        practicaFinalizada
                          ? "No se puede editar una práctica finalizada"
                          : "Editar apertura"
                      }
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => setAperturaAEliminar(apertura)}
                      disabled={practicaFinalizada}
                      className={`
                  p-1.5 rounded-md
                  ${practicaFinalizada
                          ? "text-slate-300 cursor-not-allowed"
                          : "hover:bg-red-100 text-red-500"
                        }
                `}
                      title={
                        practicaFinalizada
                          ? "No se puede eliminar una práctica finalizada"
                          : "Eliminar apertura"
                      }
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </div>

              ))}

            </div>

            {/* FLECHA DERECHA */}
            {hasOverflow && (
              <button
                onClick={() => scrollAperturas("right")}
                className="
            hidden sm:flex
            shrink-0
            items-center justify-center
            w-9 h-9
            rounded-full
            bg-white
            border border-slate-200
            shadow-md
            text-slate-500
            hover:bg-slate-50
          "
                aria-label="Siguiente"
              >
                <ChevronRight size={20} />
              </button>
            )}

          </div>

        )}

      </div>


      {/* ======================================================
          MODAL CREAR APERTURA
      ====================================================== */}

      <AperturaVacanteModal
        isOpen={aperturaModal.isOpen}
        mode={aperturaModal.mode}
        initialData={aperturaModal.apertura}

        vacantes={vacantesEmpresa}

        practica={grupo.practica}

        tutores={tutoresEmpresariales}

        aperturas={aperturas}

        onClose={cerrarAperturaModal}
        onSave={handleGuardarApertura}
      />


      {/* ======================================================
          CONFIRMAR ELIMINACIÓN
      ====================================================== */}

      <ConfirmModal
        isOpen={!!aperturaAEliminar}
        title="Eliminar apertura"
        message="¿Seguro que desea eliminar esta apertura de vacante?"
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onCancel={() => setAperturaAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
      />

    </Layout>

  );

};


export default GrupoPracticaDetalle;