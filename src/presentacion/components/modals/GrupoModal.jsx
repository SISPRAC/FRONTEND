import { useEffect, useState, useRef } from "react";
import GenericTable from "../Table/GenericTable";
import { Trash, X, Plus, Paperclip, Check } from "lucide-react";
import toast from "react-hot-toast";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import InviteModal from "./InviteModal";
import ConfirmModal from "./ConfirmModal";
import { candidatoRepository } from "../../../infraestructura/repository/candidatoRepository";
import { tutorDocenteRepository } from "../../../infraestructura/repository/tutorDocenteRepository";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;


// ── GrupoModal ───────────────────────────────────────────────────────────────
export default function GrupoModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  grupo,
  candidatos = [],
  practicas = [],   // [{ id, nombre }]
  tutorDocentes = [],   // [{ id, nombre }]
}) {
  const initialForm = {
    nombre: "",
    practica_id: "",
    tutorDocente_id: "",
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [practicantes, setPracticantes] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCandidato, setSelectedCandidato] = useState(null);
  const [docenteDetectado, setDocenteDetectado] = useState(null);
  const [docenteNoRegistrado, setDocenteNoRegistrado] = useState(null);

  const [errors, setErrors] = useState({});
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [grupoDetectado, setGrupoDetectado] = useState("");
  const [noEncontrados, setNoEncontrados] = useState([]);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);

  const [mostrarInviteModal, setMostrarInviteModal] = useState(false);
  const [mostrarConfirmarDocente, setMostrarConfirmarDocente] = useState(false);
  const [correoDocente, setCorreoDocente] = useState("");
  const [enviandoInvitaciones, setEnviandoInvitaciones] = useState(false);
  const [progresoInvitaciones, setProgresoInvitaciones] = useState({
    actual: 0,
    total: 0
  });
  const [invitacionesEnviadas, setInvitacionesEnviadas] = useState(false);

  const handleSeleccionarPDF = async (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {

      toast.error("Solo se permiten archivos PDF.");

      e.target.value = "";

      return;

    }

    try {

      const texto = await leerPDF(file);

      const datos = parsearListadoUFPS(texto);

      // Nombre del grupo
      if (datos.grupo) {

        setGrupoDetectado(datos.grupo);
        if (datos.docente) {

          setDocenteDetectado(datos.docente);

          let tutor = tutorDocentes.find(t =>

            t.codigo === datos.docente.codigo

          );

          // Si no existe por código, buscar por nombre
          if (!tutor) {

            tutor = tutorDocentes.find(t =>

              t.nombre
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim() ===

              datos.docente.nombre
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim()

            );

          }

          if (tutor) {

            setFormData(prev => ({

              ...prev,

              tutorDocente_id: tutor.id

            }));

            setDocenteNoRegistrado(null);

          } else {

            setDocenteNoRegistrado(datos.docente);

          }

        }

        setFormData(prev => ({
          ...prev,
          nombre: datos.grupo
        }));

      }

      const encontrados = [];
      const candidatosNoRegistrados = [];

      datos.alumnos.forEach(alumno => {

        // Buscar por código
        let candidato = candidatos.find(c =>
          c.codigo === alumno.codigo
        );

        // Si no existe, buscar por nombre
        if (!candidato) {

          candidato = candidatos.find(c =>
            c.nombre
              .toLowerCase()
              .replace(/\s+/g, " ")
              .trim() ===
            alumno.nombre
              .toLowerCase()
              .replace(/\s+/g, " ")
              .trim()
          );

        }

        if (candidato) {

          // Evitar duplicados
          const existe = practicantes.some(
            p => p.id === candidato.id
          );

          if (!existe) {

            encontrados.push(candidato);

          }

        } else {
          candidatosNoRegistrados.push(alumno);
        }

      });

      setNoEncontrados(candidatosNoRegistrados);

      if (encontrados.length > 0) {

        setPracticantes(prev => [

          ...prev,

          ...encontrados

        ]);

      }

      // -----------------------------
      // Toasts
      // -----------------------------

      if (encontrados.length > 0) {

        toast.success(
          `${encontrados.length} practicante(s) agregado(s).`
        );

      }

      if (candidatosNoRegistrados.length > 0) {
        toast(
          `${candidatosNoRegistrados.length} candidato(s) no están registrados.`,
          {
            icon: "⚠️"
          }
        );
      }

      if (
        encontrados.length === 0 &&
        candidatosNoRegistrados.length === 0
      ) {
        toast.error("No se encontraron candidatos en el PDF.");
      }

    } catch (error) {

      console.error(error);

      toast.error("No fue posible leer el PDF.");

    }

    e.target.value = "";
  };

  // ── Cargar datos en modo edición ─────────────────────────────────────────
  useEffect(() => {

    if (!isOpen) return;

    if (mode === "edit" && grupo) {
      setFormData({
        id: grupo.id,
        nombre: grupo.nombre,
        practica_id: grupo.practica_id ?? "",
        tutorDocente_id: grupo.tutorDocente_id ?? "",
      });
      setPracticantes(grupo.practicantes ?? []);
    }

    if (mode === "create") {
      setFormData(initialForm);
      setPracticantes([]);

      setGrupoDetectado("");
      setNoEncontrados([]);
      setDocenteDetectado(null);
      setDocenteNoRegistrado(null);
      setMostrarBusqueda(false);

      setInvitacionesEnviadas(false);
      setProgresoInvitaciones({
        actual: 0,
        total: 0
      });
    }

    setErrors({});
  }, [mode, grupo, isOpen]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const clearForm = () => {
    setFormData(initialForm);
    setPracticantes([]);
    setSearch("");
    setSelectedCandidato(null);
    setErrors({});

    limpiarDatosPDF();

    setMostrarBusqueda(false);
  };

  const limpiarDatosPDF = () => {
    setGrupoDetectado("");
    setNoEncontrados([]);
    setDocenteDetectado(null);
    setDocenteNoRegistrado(null);
    setInvitacionesEnviadas(false);
    setProgresoInvitaciones({
      actual: 0,
      total: 0
    });
  };

  const handleClose = () => {
    if (mode !== "edit") {
      clearForm();
    } else {
      limpiarDatosPDF();
    }

    setErrors({});
    onClose();
  };

  const handleField = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  // ── Agregar practicante ──────────────────────────────────────────────────
  const handleAddPracticante = () => {

    if (!selectedCandidato) {
      toast.error("Seleccione un practicante");
      return;
    }

    setPracticantes(prev => [
      ...prev,
      selectedCandidato
    ]);

    setSearch("");
    setSelectedCandidato(null);
  };

  // ── Eliminar practicante ─────────────────────────────────────────────────
  const handleRemovePracticante = (id) => {
    setPracticantes((prev) => prev.filter((p) => p.id !== id));
  };

  const fileInputRef = useRef(null);
  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      nombre: !formData.nombre.trim(),
      practica_id: !formData.practica_id,
      tutorDocente_id: !formData.tutorDocente_id,
    };
    setErrors(newErrors);

    if (Object.values(newErrors).includes(true)) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    if (mode === "create" && practicantes.length === 0) {
      toast.error("Agrega al menos un practicante");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        candidatos: practicantes.map(p => p.id)
      });

      if (mode === "create") clearForm();
      setErrors({});
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al guardar");
    }
  };

  const leerPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    let texto = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      const content = await page.getTextContent();

      texto += content.items.map(item => item.str).join(" ");
      texto += "\n";
    }

    return texto;
  };

  const parsearListadoUFPS = (texto) => {

    // -----------------------------
    // Obtener Grupo
    // -----------------------------
    let nombreGrupo = "";

    const grupoMatch = texto.match(/Materia:\s*\d+-([A-Z])/i);

    if (grupoMatch) {
      nombreGrupo = `Grupo ${grupoMatch[1]}`;
    }

    // -----------------------------
    // Obtener alumnos
    // -----------------------------
    const alumnos = [];

    const regex =
      /(\d{7})\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)\s+([A-Za-z0-9._%+-]+@ufps\.edu\.co)/g;

    let match;

    while ((match = regex.exec(texto)) !== null) {

      alumnos.push({

        codigo: match[1],

        nombre: match[2]
          .replace(/\s+/g, " ")
          .trim(),

        correo: match[3]

      });

    }

    // -----------------------------
    // Obtener docente
    // -----------------------------

    let docente = null;

    const docenteMatch = texto.match(
      /Docente:\s*(\d+)\s+(.+?)\s+Seccional:/i
    );

    if (docenteMatch) {

      docente = {

        codigo: docenteMatch[1],

        nombre: docenteMatch[2]
          .replace(/\s+/g, " ")
          .trim()

      };

    }

    return {

      grupo: nombreGrupo,

      docente,

      alumnos

    };

  };

  const enviarInvitaciones = async (candidatosNoRegistrados) => {

    if (!candidatosNoRegistrados?.length) {
      return;
    }

    const candidatos = [...candidatosNoRegistrados];

    setEnviandoInvitaciones(true);

    setProgresoInvitaciones({
      actual: 0,
      total: candidatos.length
    });

    try {

      console.log("CANDIDATOS A INVITAR:", candidatos);

      for (let i = 0; i < candidatos.length; i++) {

        const candidato = candidatos[i];

        console.log("CANDIDATO:", candidato);

        console.log("DATOS QUE SE VAN A ENVIAR:", {
          nombre: candidato.nombre,
          correo: candidato.correo,
          codigo: candidato.codigo
        });

        await candidatoRepository.invitar({
          nombre: candidato.nombre,
          correo: candidato.correo,
          codigo: candidato.codigo
        });

        // Actualizar progreso
        setProgresoInvitaciones({
          actual: i + 1,
          total: candidatos.length
        });
      }

      toast.success(
        `${candidatos.length} invitación(es) enviada(s) correctamente.`
      );

      // Ya fueron enviados
      setNoEncontrados([]);
      setInvitacionesEnviadas(true);

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "No fue posible enviar las invitaciones."
      );

    } finally {

      setEnviandoInvitaciones(false);

    }
  };

  const handleInvitar = () => {

    if (noEncontrados.length === 0 && !docenteNoRegistrado) {
      toast.error("No hay personas pendientes por invitar.");
      return;
    }

    if (docenteNoRegistrado) {
      setMostrarConfirmarDocente(true);
      return;
    }

    enviarInvitaciones(noEncontrados);
  };



  const filteredCandidatos = candidatos.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) &&
    !practicantes.some(p => p.id === c.id)
  );

  if (!isOpen) return null;

  const inputCls = (field) =>
    `border p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#e8192c]/30 ${errors[field] ? "border-red-500" : "border-gray-300"
    }`;



  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className={`
    bg-white
    w-full
    ${grupoDetectado ? "max-w-6xl" : "max-w-2xl"}
    rounded-2xl
    p-8
    shadow-xl
    relative
    max-h-[90vh]
    overflow-y-auto
  `}
      >

        {/* Cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-lg leading-none"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 text-center">
          {mode === "edit" ? "Editar Grupo" : "Agregar Grupo"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div
            className={
              grupoDetectado
                ? "grid grid-cols-[2fr_1fr] gap-6"
                : ""
            }
          >
            <div>
              {/* Nombre */}
              <div>
                <label className="block mb-1 font-semibold text-sm">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  placeholder="Ingrese el nombre del grupo"
                  onChange={handleField("nombre")}
                  className={inputCls("nombre")}
                />
              </div>

              {/* Período y TutorDocente en fila */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold text-sm">
                    Práctica
                  </label>

                  <select
                    value={formData.practica_id}
                    onChange={handleField("practica_id")}
                    className={inputCls("practica_id")}
                  >
                    <option value="" disabled>
                      Seleccione una práctica
                    </option>

                    {practicas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.Periodo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-sm">Tutor Docente</label>
                  <select
                    value={formData.tutorDocente_id}
                    onChange={handleField("tutorDocente_id")}
                    className={inputCls("tutorDocente_id")}
                  >
                    <option value="" disabled>
                      Seleccione un Tutor Docente
                    </option>
                    {tutorDocentes.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sección practicantes */}
              <div>


                {/* Botones */}
                <div className="flex gap-2 mb-4 justify-center mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleSeleccionarPDF}
                    className="hidden"
                  />


                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="
      flex items-center gap-2
      px-4 py-2
      border
      rounded-lg
      text-sm
      font-semibold
      hover:bg-gray-100
    "
                  >
                    <Paperclip size={18} />
                    Importar PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
                    className="
      flex items-center gap-2
      px-4 py-2
     bg-[#e8192c] text-white hover:bg-[#c8111f]
      rounded-lg
      text-sm
      font-semibold
    "
                  >
                    <Plus size={18} />
                    Agregar manualmente
                  </button>

                </div>
                <p className="font-semibold text-sm mb-2">Practicantes</p>
                {mostrarBusqueda && (

                  <div className="relative flex gap-2 mb-3">

                    <div className="flex-1">

                      <input
                        type="text"
                        placeholder="Buscar practicante..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setSelectedCandidato(null);
                        }}
                        className="border p-2 rounded w-full text-sm"
                      />

                      {search && !selectedCandidato && filteredCandidatos.length > 0 && (
                        <div
                          className="
          absolute
          z-50
          bg-white
          border
          rounded
          shadow-lg
          mt-1
          w-full
          max-h-48
          overflow-y-auto
        "
                        >
                          {filteredCandidatos.map(candidato => (
                            <div
                              key={candidato.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setSelectedCandidato(candidato);
                                setSearch(candidato.nombre);
                              }}
                            >
                              {candidato.nombre}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                    <button
                      type="button"
                      onClick={handleAddPracticante}
                      className="
    flex items-center gap-2
    px-4 py-2
    bg-[#e8192c] text-white hover:bg-[#c8111f]
    rounded-lg
    text-sm
    font-semibold
  "
                    >
                      <Plus size={18} />
                      Agregar
                    </button>
                    <input
                      type="file"
                      accept=".pdf"
                      ref={fileInputRef}
                      onChange={handleSeleccionarPDF}
                      className="hidden"
                    />


                  </div>
                )}

                {/* Tabla */}
                <GenericTable
                  rows={practicantes}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  columns={[
                    {
                      key: "nombre",
                      label: "Practicante",
                      primary: true
                    },
                  ]}
                  actions={[
                    {
                      icon: <Trash size={20} />,
                      className: "hover:bg-red-100",
                      onClick: handleRemovePracticante
                    }
                  ]}
                  emptyMessage="Sin practicantes agregados"
                  pageSize={2}
                />
                {/* Botones */}
                <div className="flex justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#e8192c] text-white hover:bg-[#c8111f] text-sm font-semibold"
                  >
                    {mode === "edit" ? "Actualizar" : "Guardar"}
                  </button>
                </div>


              </div>
            </div>


            {grupoDetectado && (

              <div className="mb-4 rounded-lg border bg-slate-50 p-4">

                <p className="font-semibold text-green-700">
                  <Check /> Grupo detectado:
                  <span className="font-normal ml-2">
                    {grupoDetectado}
                  </span>
                </p>

                {docenteDetectado && (

                  <p className="mt-2">

                    Tutor docente:

                    <strong className="ml-2">

                      {docenteDetectado.nombre}

                    </strong>

                  </p>

                )}


                <p className="mt-2">
                  <Check /> Practicantes agregados:
                  <strong className="ml-2">
                    {practicantes.length}
                  </strong>
                </p>


                {invitacionesEnviadas ? (

                  <div className="
    mt-4
    rounded-lg
    border
    border-green-200
    bg-green-50
    p-4
    text-center
  ">

                    <Check
                      size={32}
                      className="mx-auto mb-2 text-green-600"
                    />

                    <p className="font-semibold text-green-700">
                      Invitaciones enviadas correctamente
                    </p>

                    <p className="text-sm text-green-600 mt-1">
                      Todos los candidatos pendientes fueron invitados.
                    </p>

                  </div>

                ) : (

                  <>
                    <p className="mt-2 text-orange-600 font-semibold">

                      ⚠ No registrados:

                      <span className="ml-2">
                        {noEncontrados.length}
                      </span>

                    </p>

                    {noEncontrados.length > 0 && (

                      <div className="mt-3">

                        <div className="
          max-h-36
          overflow-y-auto
          rounded
          border
          bg-white
          p-2
        ">

                          {noEncontrados.map((candidato, index) => (

                            <div
                              key={index}
                              className="border-b py-1 text-sm"
                            >
                              {candidato.codigo}
                              {" - "}
                              {candidato.nombre}
                              {" - "}
                              {candidato.correo}
                            </div>

                          ))}

                        </div>

                      </div>

                    )}

                    {(noEncontrados.length > 0 || docenteNoRegistrado) && (

                      <button
                        type="button"
                        disabled={enviandoInvitaciones}
                        className={`
          mt-3
          px-4
          py-2
          rounded-lg
          text-white
          ${enviandoInvitaciones
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#e8192c] hover:bg-[#c8111f]"
                          }
        `}
                        onClick={handleInvitar}
                      >

                        {enviandoInvitaciones
                          ? `Enviando... ${progresoInvitaciones.actual}/${progresoInvitaciones.total}`
                          : "Enviar invitaciones"
                        }

                      </button>

                    )}

                  </>

                )}

              </div>

            )}

          </div> {/* Fin del grid */}


        </form>
      </div>

      <ConfirmModal
        isOpen={mostrarConfirmarDocente}
        title="Tutor docente no registrado"
        message={`¿Está seguro de que desea enviar invitaciones a ${noEncontrados.length} candidato(s) y al tutor docente ${docenteNoRegistrado?.nombre}?`}
        confirmLabel="Sí, invitar docente"
        cancelLabel="No, solo candidatos"
        onConfirm={() => {
          setMostrarConfirmarDocente(false);
          setMostrarInviteModal(true);
        }}
        onCancel={async () => {
          setMostrarConfirmarDocente(false);
          await enviarInvitaciones(noEncontrados);
        }}
      />

      <InviteModal
        isOpen={mostrarInviteModal}
        onClose={() => setMostrarInviteModal(false)}
        nombre={docenteNoRegistrado?.nombre}
        onSubmit={async (correo) => {

  try {

    // Invitar tutor docente
    await tutorDocenteRepository.invitar(correo);

    // Invitar candidatos si existen
    if (noEncontrados.length > 0) {
      await enviarInvitaciones(noEncontrados);
    }

    // Marcar todo como enviado
    setInvitacionesEnviadas(true);

    setMostrarInviteModal(false);

    toast.success(
      "Todas las invitaciones fueron enviadas correctamente."
    );

  } catch (error) {

    console.error(error);

    throw error;
  }

}}
      />
    </div>


  );
}
