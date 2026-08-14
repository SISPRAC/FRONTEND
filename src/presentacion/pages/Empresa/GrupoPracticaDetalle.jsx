import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  ClipboardList,
  Trash2,
  Plus
} from "lucide-react";

import Layout from "../../shared/Layouts/Layout";
import ConfirmModal from "../../components/modals/ConfirmModal";
import AperturaVacanteModal from "../../components/modals/VacanteModal.jsx";

import { vacanteRepository } from "../../../infraestructura/repository/vacanteRepository.js";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";

import { getVacantesByEmpresa } from "../../../aplicacion/vacante/getVacantesByEmpresa.js";
import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";

import { aperturaVacanteRepository } from "../../../infraestructura/repository/aperturaVacanteRepository.js";

import { crearAperturaVacante } from "../../../aplicacion/aperturaVacante/crearAperturaVacante.js";
import { getAperturasVacantes } from "../../../aplicacion/aperturaVacante/getAperturasVacantes.js";
import { actualizarAperturaVacante } from "../../../aplicacion/aperturaVacante/actualizarAperturaVacante.js";
import { eliminarAperturaVacante } from "../../../aplicacion/aperturaVacante/eliminarAperturaVacante.js";

import GenericTable from "../../components/Table/GenericTable.jsx";


const GrupoPracticaDetalle = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();


  // ============================================================
  // GRUPO
  // ============================================================

  const [grupo] = useState(
    location.state?.grupo ?? {
      id,
      grupo: "",
      periodo: "",
      practica: "",
      tutor: "",
    }
  );


  // ============================================================
  // DATOS PARA CREAR APERTURA
  // ============================================================

  const [vacantesEmpresa, setVacantesEmpresa] = useState([]);
  const [practicas, setPracticas] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  // ============================================================
  // PRACTICANTES
  // ============================================================

  const [practicantes] = useState([
    {
      id: 1,
      nombre: "Carlos Linero",
      vacante: "QA",
      desempeno: "Bueno",
      estado: "APROBADO"
    },
    {
      id: 2,
      nombre: "María Suarez",
      vacante: "Backend",
      desempeno: "Excelente",
      estado: "APROBADO"
    },
    {
      id: 3,
      nombre: "Angie Cortez",
      vacante: "Frontend",
      desempeno: "Bueno",
      estado: "APROBADO"
    },
  ]);


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
        aperturasData
      ] = await Promise.all([

        getVacantesByEmpresa(
          vacanteRepository
        ),

        getPracticas(
          { practicaRepository }
        ),

        getAperturasVacantes(
          aperturaVacanteRepository
        )

      ]);


      setVacantesEmpresa(
        Array.isArray(vacantesData)
          ? vacantesData
          : []
      );


      setPracticas(
        Array.isArray(practicasData)
          ? practicasData
          : []
      );
      console.log("Aperturas obtenidas:", aperturasData);

      setAperturas(
        Array.isArray(aperturasData)
          ? aperturasData
          : []
      );


    } catch (error) {

      console.error(
        "Error al cargar datos para apertura:",
        error
      );

    }

  };


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
      `/director/candidatos/${practicante.id}`,
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
      `Encuesta pendiente de implementar para: ${practicante.nombre}`
    );

  };


  // ============================================================
  // ABRIR MODAL CREAR APERTURA
  // ============================================================

  const abrirCrearApertura = () => {

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

      }

      if (aperturaModal.mode === "editar") {

        await actualizarAperturaVacante(
          aperturaVacanteRepository,
          aperturaModal.apertura.id,
          data
        );

      }


      await cargarDatosApertura();

      cerrarAperturaModal();


    } catch (error) {

      console.error(
        "Error al guardar apertura:",
        error
      );

    }

  };


  // ============================================================
  // ELIMINAR APERTURA
  // ============================================================

  const handleConfirmarEliminar = async () => {

    if (!aperturaAEliminar) return;


    try {

      await eliminarAperturaVacante(
        aperturaVacanteRepository,
        aperturaAEliminar.id
      );


      await cargarDatosApertura();

      setAperturaAEliminar(null);


    } catch (error) {

      console.error(
        "Error al eliminar apertura:",
        error
      );

    }

  };

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
          PERIODO / TUTOR
      ====================================================== */}

      <div className="
        flex
        flex-col
        md:flex-row
        justify-between
        items-center
        gap-6
        mb-8
        max-w-5xl
        mx-auto
      ">

        <div className="text-center md:text-left">

          <p className="
            text-sm
            font-semibold
            text-slate-600
            mb-1
          ">
            Periodo Lectivo
          </p>

          <p className="
            text-2xl
            font-extrabold
            text-slate-800
          ">
            {grupo.periodo || "—"}
          </p>

        </div>


        <div className="text-center md:text-right">

          <p className="
            text-sm
            font-semibold
            text-slate-600
            mb-1
          ">
            Tutor Asignado:
          </p>

          <p className="
            text-2xl
            font-extrabold
            text-slate-800
          ">
            {grupo.tutor || "—"}
          </p>

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

          columns={[
            {
              key: "nombre",
              label: "Nombre",
              primary: true,
            },

            {
              key: "vacante",
              label: "Vacante",
              render: (row) =>
                typeof row.vacante === "object"
                  ? row.vacante?.nombre ?? "—"
                  : row.vacante ?? "—",
            },

            {
              key: "desempeno",
              label: "Desempeño",
            },

            {
              key: "estado",
              label: "Estado",
              render: (row) =>
                row.estado === "APROBADO"
                  ? "Aprobado"
                  : row.estado ?? "—",
            },
          ]}

          actions={[
            {
              icon: <Eye size={18} />,
              className: "text-slate-600 hover:bg-blue-100",
              onClick: (id) => {
                const practicante = practicantes.find(
                  (p) => p.id === id
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
                const practicante = practicantes.find(
                  (p) => p.id === id
                );

                if (practicante) {
                  handleEncuesta(practicante);
                }
              },
            },
          ]}

          emptyMessage="No hay practicantes registrados."

          pageSize={6}
        />

      </div>


      {/* ======================================================
          APERTURAS DE VACANTE
      ====================================================== */}

      <div className="
        flex
        items-center
        justify-center
        gap-3
        mb-4
      ">

        <h2 className="
          text-2xl
          font-extrabold
          text-slate-800
        ">
          Aperturas de Vacante
        </h2>

      </div>


      <div className="
        max-w-5xl
        mx-auto
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-5
        mb-16
      ">


        {/* APERTURAS EXISTENTES */}

        {aperturas.map((apertura) => {

          const vacante =
            vacantesEmpresa.find(
              (v) =>
                v.id ===
                apertura.vacante_id
            );

          const practica =
            practicas.find(
              (p) =>
                p.id ===
                apertura.practica_id
            );


          return (

            <div
              key={apertura.id}
              className="
                border-2
                border-red-200
                rounded-2xl
                p-5
                bg-white
                shadow-sm
                flex
                flex-col
                justify-between
              "
            >

              <div>

                <p className="
                  font-bold
                  text-slate-800
                  mb-2
                ">
                  {vacante?.nombre ??
                    "Vacante"}
                </p>


                <p className="
                  text-sm
                  text-slate-500
                  mb-1
                ">
                  Práctica:{" "}
                  {practica?.Periodo?.nombre ??
                    "—"}
                </p>


                <p className="
                  text-sm
                  text-slate-500
                ">
                  Cupos:{" "}
                  {apertura.cupos}
                </p>


                <p className="
                  text-sm
                  text-slate-500
                ">
                  Estado:{" "}
                  {apertura.estado}
                </p>

              </div>


              <div className="
                flex
                justify-end
                gap-2
                mt-4
              ">

                <button
                  onClick={() =>
                    setAperturaAEliminar(
                      apertura
                    )
                  }
                  className="
                    p-1.5
                    rounded-md
                    hover:bg-red-100
                    text-red-500
                  "
                  title="Eliminar apertura"
                >

                  <Trash2 size={18} />

                </button>

              </div>

            </div>

          );

        })}


        {/* CREAR APERTURA */}

        <button
          onClick={abrirCrearApertura}
          className="
            border-2
            border-red-200
            rounded-2xl
            flex
            items-center
            justify-center
            min-h-[140px]
            bg-white
            hover:bg-red-50
            transition-colors
          "
          title="Crear apertura"
        >

          <Plus
            size={36}
            className="text-red-500"
          />

        </button>

      </div>


      {/* ======================================================
          MODAL CREAR APERTURA
      ====================================================== */}

      <AperturaVacanteModal

        isOpen={
          aperturaModal.isOpen
        }

        mode={
          aperturaModal.mode
        }

        initialData={
          aperturaModal.apertura
        }

        vacantes={
          vacantesEmpresa
        }

        practicas={
          practicas
        }

        /*
         * Por ahora no tenemos CRUD
         * de tutores.
         *
         * El modal recibe temporalmente
         * el tutor con ID 1.
         */

        tutores={[
          {
            id: 1,
            nombre: "Tutor empresarial"
          }
        ]}

        onClose={
          cerrarAperturaModal
        }

        onSave={
          handleGuardarApertura
        }

      />


      {/* ======================================================
          CONFIRMAR ELIMINACIÓN
      ====================================================== */}

      <ConfirmModal

        isOpen={
          !!aperturaAEliminar
        }

        title="Eliminar apertura"

        message={
          `¿Seguro que desea eliminar esta apertura de vacante?`
        }

        confirmText="Sí, eliminar"

        cancelText="Cancelar"

        onClose={() =>
          setAperturaAEliminar(null)
        }

        onConfirm={
          handleConfirmarEliminar
        }

      />

    </Layout>

  );

};


export default GrupoPracticaDetalle;