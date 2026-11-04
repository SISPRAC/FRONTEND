import { useEffect, useState, useRef } from "react";

import { convenioRepository } from "../../../infraestructura/repository/convenioRepository";
import { getConveniosByEmpresa } from "../../../aplicacion/convenio/getConveniosByEmpresa";
import { getConvenioByEmpresa } from "../../../aplicacion/convenio/getConvenioByEmpresa";
import { subirConvenio } from "../../../aplicacion/convenio/subirConvenio";

import GenericTable from "../../components/Table/GenericTable";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge";

import {
  UploadCloud,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Download,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

// ===============================================================
// USUARIO DE SESIÓN
// ===============================================================

function getUsuarioSesion() {
  try {
    const raw = localStorage.getItem("user");

    if (!raw) return null;

    return JSON.parse(raw);
  } catch (err) {
    console.error("No se pudo leer el usuario:", err);
    return null;
  }
}

// ===============================================================
// SKELETON
// ===============================================================

function SkeletonConvenio() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-40 bg-slate-200 rounded-lg mx-auto mb-5" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* COLUMNA IZQUIERDA */}

        <div className="flex flex-col gap-4">

          {/* FECHAS */}

          <div>
            <div className="h-4 w-36 bg-slate-200 rounded mb-3" />

            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((item) => (
                <div key={item}>
                  <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
                  <div className="h-9 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* FORMATO */}

          <div>
            <div className="flex justify-between mb-2">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-4 w-28 bg-slate-200 rounded" />
            </div>

            <div className="h-32 rounded-2xl bg-slate-200" />
          </div>

          {/* BOTÓN */}

          <div className="flex justify-center">
            <div className="h-10 w-40 rounded-2xl bg-slate-200" />
          </div>

          {/* TABLA */}

          <div>
            <div className="h-5 w-28 bg-slate-200 rounded mb-3" />

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="h-10 bg-slate-200" />

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-12 border-t border-slate-100 px-4 flex items-center justify-between"
                >
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                  <div className="h-6 w-14 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}

        <div className="flex flex-col gap-4">

          <div className="h-20 rounded-[24px] bg-slate-200" />

          <div>
            <div className="h-4 w-28 bg-slate-200 rounded mb-3" />

            <div className="h-[300px] max-h-[420px] rounded-2xl border border-slate-200 bg-white p-5">
              <div className="space-y-8">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />

                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-28 bg-slate-200 rounded" />
                      <div className="h-3 w-40 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ===============================================================
// PANEL DE ESTADO
// ===============================================================

function EstadoPanel({ estado }) {
  const config = {
    PENDIENTE: {
      bg: "bg-amber-400",
      icon: <Clock size={20} className="text-white" />,
      title: "Pendiente",
      subtitle: "Esperando revisión",
    },

    OBSERVACION: {
      bg: "bg-slate-400",
      icon: <FileText size={20} className="text-white" />,
      title: "Con observaciones",
      subtitle: "Revisa el comentario y actualiza el convenio",
    },

    ACTUALIZADO: {
      bg: "bg-blue-500",
      icon: <UploadCloud size={20} className="text-white" />,
      title: "Actualizado",
      subtitle: "Convenio reenviado a revisión",
    },

    APROBADO: {
      bg: "bg-emerald-500",
      icon: <CheckCircle2 size={20} className="text-white" />,
      title: "Aprobado",
      subtitle: "Convenio validado",
    },

    RECHAZADO: {
      bg: "bg-red-500",
      icon: <XCircle size={20} className="text-white" />,
      title: "Rechazado",
      subtitle: "Revisa el comentario",
    },

    VENCIDO: {
      bg: "bg-slate-500",
      icon: <Clock size={20} className="text-white" />,
      title: "Vencido",
      subtitle: "El convenio llegó a su fecha de finalización",
    },

    CARGADO: {
      bg: "bg-blue-500",
      icon: <UploadCloud size={20} className="text-white" />,
      title: "Cargado",
      subtitle: "Convenio enviado a revisión",
    },
  };

  const actual = config[estado] || config.PENDIENTE;

  return (
    <div
      className={`
        ${actual.bg}
        rounded-[24px]
        px-5
        py-4
        flex
        items-center
        gap-3
        shadow-sm
        min-h-[80px]
      `}
    >
      <div className="
        w-10 h-10 rounded-full border-2 border-white/70
        flex items-center justify-center shrink-0
      ">
        {actual.icon}
      </div>

      <div>
        <p className="text-white font-bold text-base leading-tight">
          {actual.title}
        </p>

        <p className="text-white/80 text-xs">
          {actual.subtitle}
        </p>
      </div>
    </div>
  );
}

// ===============================================================
// TRAZABILIDAD
// ===============================================================

function TrazabilidadTimeline({ eventos }) {
  const config = {
    CARGADO: {
      color: "bg-blue-500",
      icon: <UploadCloud size={16} className="text-white" />,
    },

    ACTUALIZADO: {
      color: "bg-blue-500",
      icon: <UploadCloud size={16} className="text-white" />,
    },

    PENDIENTE: {
      color: "bg-amber-400",
      icon: <Clock size={16} className="text-white" />,
    },

    APROBADO: {
      color: "bg-emerald-500",
      icon: <CheckCircle2 size={16} className="text-white" />,
    },

    RECHAZADO: {
      color: "bg-red-500",
      icon: <XCircle size={16} className="text-white" />,
    },

    OBSERVACION: {
      color: "bg-slate-400",
      icon: <FileText size={16} className="text-white" />,
    },

    VENCIDO: {
      color: "bg-slate-500",
      icon: <Clock size={16} className="text-white" />,
    },
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
      return fecha;
    }

    return date.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const eventosOrdenados = [...eventos].sort(
    (a, b) =>
      new Date(a.fecha).getTime() -
      new Date(b.fecha).getTime()
  );

  return (
    <div className="h-full overflow-y-auto pr-2">
      {eventosOrdenados.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-slate-400 text-sm">
            Sin movimientos aún
          </p>
        </div>
      ) : (
        <div className="relative pl-2">
          {eventosOrdenados.map((ev, i) => {
            const c = config[ev.accion] || config.OBSERVACION;

            const esUltimo = i === eventosOrdenados.length - 1;

            return (
              <div
                key={ev.id ?? i}
                className="relative flex gap-3 pb-6 last:pb-0"
              >
                {!esUltimo && (
                  <div className="
                    absolute left-[15px] top-[30px]
                    bottom-0 w-[2px] bg-slate-200
                  " />
                )}

                <div className={`
                  relative z-10 w-[30px] h-[30px]
                  rounded-full ${c.color}
                  flex items-center justify-center
                  shrink-0 shadow-sm
                `}>
                  {c.icon}
                </div>

                <div className="flex-1 min-w-0 pt-[1px]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                      {ev.accion}
                    </p>

                    <p className="text-[11px] text-slate-400 whitespace-nowrap">
                      {formatearFecha(ev.fecha)}
                    </p>
                  </div>

                  {ev.comentario && (
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      {ev.comentario}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===============================================================
// COMPONENTE PRINCIPAL
// ===============================================================

export default function CargarConvenio() {
  const fileInputRef = useRef(null);

  const usuarioSesion = getUsuarioSesion();

  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [enviando, setEnviando] = useState(false);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [estado, setEstado] = useState("PENDIENTE");

  const [trazabilidad, setTrazabilidad] = useState([]);
  const [rows, setRows] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [convenioId, setConvenioId] = useState(null);
  const [archivoActual, setArchivoActual] = useState(null);

  // CARGAS

  const [cargando, setCargando] = useState(true);
  const [cargandoConvenio, setCargandoConvenio] = useState(false);

  // MODAL PDF

  const [modalPDF, setModalPDF] = useState({
    abierto: false,
    url: null,
    titulo: "Convenio",
  });

  const [errores, setErrores] = useState({
    fechaInicio: false,
    fechaFin: false,
    archivo: false,
  });

  // =============================================================
  // ESTADOS DEL CONVENIO
  // =============================================================

  const tieneConvenio = Boolean(convenioId);

  const convenioBloqueado =
    estado === "APROBADO" ||
    estado === "VENCIDO";

  const esNuevoConvenio =
    estado === "VENCIDO";

  // =============================================================
  // CARGA INICIAL
  // =============================================================

  useEffect(() => {
    const empresaId = usuarioSesion?.Empresa?.id;

    if (empresaId) {
      loadConvenios(empresaId);
    } else {
      setCargando(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Liberar URL temporal al desmontar el componente.

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // =============================================================
  // CARGAR TODOS LOS CONVENIOS
  // =============================================================

  const loadConvenios = async (empresaId) => {
    setCargando(true);

    try {
      if (!empresaId) {
        limpiarFormulario();
        return;
      }

      const data = await getConveniosByEmpresa(
        convenioRepository,
        empresaId
      );

      console.log("Convenios cargados:", data);

      setRows(data);
      setCurrentPage(1);

      if (data.length > 0) {
        const convenioMasReciente = [...data].sort(
          (a, b) => b.id - a.id
        )[0];

        await loadConvenioActual(convenioMasReciente.id);

        return;
      }

      limpiarFormulario();

    } catch (error) {
      console.error(error);

      toast.error("No se pudieron cargar los convenios");

    } finally {
      setCargando(false);
    }
  };

  // =============================================================
  // PREPARAR NUEVO CONVENIO
  // =============================================================

  const prepararNuevoConvenio = () => {
    setConvenioId(null);
    setEstado("PENDIENTE");

    setTrazabilidad([]);

    setFechaInicio("");
    setFechaFin("");

    setArchivo(null);
    setArchivoActual(null);

    setErrores({
      fechaInicio: false,
      fechaFin: false,
      archivo: false,
    });

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =============================================================
  // LIMPIAR FORMULARIO
  // =============================================================

  const limpiarFormulario = () => {
    prepararNuevoConvenio();
  };

  // =============================================================
  // CARGAR CONVENIO SELECCIONADO
  // =============================================================

  const loadConvenioActual = async (convenioIdSeleccionado) => {
    setCargandoConvenio(true);

    try {
      if (!convenioIdSeleccionado) {
        prepararNuevoConvenio();
        return;
      }

      const convenio = await getConvenioByEmpresa(
        convenioRepository,
        convenioIdSeleccionado
      );

      console.log("Convenio seleccionado:", convenio);

      if (!convenio) {
        prepararNuevoConvenio();
        return;
      }

      setConvenioId(convenio.id);

      setFechaInicio(convenio.fechaInicio || "");
      setFechaFin(convenio.fechaFin || "");

      setEstado(convenio.estado || "PENDIENTE");

      setTrazabilidad(convenio.historial || []);

      setArchivoActual(convenio.archivo || null);

      setArchivo(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setErrores({
        fechaInicio: false,
        fechaFin: false,
        archivo: false,
      });

    } catch (error) {
      console.error("No se pudo cargar el convenio:", error);

      toast.error("No se pudo cargar la información del convenio");

    } finally {
      setCargandoConvenio(false);
    }
  };

  // =============================================================
  // SELECCIONAR ARCHIVO
  // =============================================================

  const setArchivoSeleccionado = (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrores((prev) => ({
        ...prev,
        archivo: true,
      }));

      toast.error("El archivo debe ser un PDF");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setArchivo(file);

    setPreviewUrl(URL.createObjectURL(file));

    setErrores((prev) => ({
      ...prev,
      archivo: false,
    }));
  };

  // =============================================================
  // INPUT ARCHIVO
  // =============================================================

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setArchivoSeleccionado(file);
    }
  };

  // =============================================================
  // DRAG & DROP
  // =============================================================

  const handleDrop = (e) => {
    e.preventDefault();

    if (convenioBloqueado) return;

    const file = e.dataTransfer.files?.[0];

    if (file) {
      setArchivoSeleccionado(file);
    }
  };

  // =============================================================
  // QUITAR ARCHIVO
  // =============================================================

  const handleQuitarArchivo = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setArchivo(null);
    setPreviewUrl(null);

    if (!tieneConvenio) {
      setErrores((prev) => ({
        ...prev,
        archivo: true,
      }));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =============================================================
  // MODAL PDF
  // =============================================================

  const abrirModalPDF = (url, titulo = "Convenio") => {
    if (!url) {
      toast.error("No hay un documento disponible para visualizar");
      return;
    }

    setModalPDF({
      abierto: true,
      url,
      titulo,
    });
  };

  const cerrarModalPDF = () => {
    setModalPDF({
      abierto: false,
      url: null,
      titulo: "Convenio",
    });
  };

  // =============================================================
  // VISUALIZAR PDF NUEVO
  // =============================================================

  const handleVerPreview = () => {
    if (!previewUrl) return;

    abrirModalPDF(
      previewUrl,
      archivo?.name || "Nuevo convenio"
    );
  };

  // =============================================================
  // DESCARGAR PDF
  // =============================================================

  const handleDescargarConvenio = async (
    url,
    nombre = "convenio.pdf"
  ) => {
    if (!url) {
      toast.error("Este convenio no tiene archivo disponible");
      return;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("No se pudo descargar el documento");
      }

      const blob = await response.blob();

      const urlDescarga = URL.createObjectURL(blob);

      const enlace = document.createElement("a");

      enlace.href = urlDescarga;

      enlace.download = nombre.toLowerCase().endsWith(".pdf")
        ? nombre
        : `${nombre}.pdf`;

      document.body.appendChild(enlace);

      enlace.click();

      document.body.removeChild(enlace);

      // Liberar URL después de iniciar la descarga.

      setTimeout(() => {
        URL.revokeObjectURL(urlDescarga);
      }, 1000);

    } catch (error) {
      console.error("Error descargando convenio:", error);

      toast.error(
        "No se pudo descargar el PDF. Verifica que el archivo esté disponible."
      );
    }
  };

  // =============================================================
  // DESCARGAR FORMATO
  // =============================================================

  const handleDescargarFormato = () => {
    const urlFormatoBase = "/formatos/formato-convenio-base.pdf";

    const enlace = document.createElement("a");

    enlace.href = urlFormatoBase;
    enlace.download = "formato-convenio-base.pdf";

    document.body.appendChild(enlace);

    enlace.click();

    document.body.removeChild(enlace);
  };

  // =============================================================
  // VALIDAR FORMULARIO
  // =============================================================

  const validarFormulario = () => {
    const nuevosErrores = {
      fechaInicio: false,
      fechaFin: false,
      archivo: false,
    };

    let valido = true;

    if (!fechaInicio) {
      nuevosErrores.fechaInicio = true;
      valido = false;
    }

    if (!fechaFin) {
      nuevosErrores.fechaFin = true;
      valido = false;
    }

    if (
      fechaInicio &&
      fechaFin &&
      fechaInicio > fechaFin
    ) {
      nuevosErrores.fechaInicio = true;
      nuevosErrores.fechaFin = true;

      valido = false;

      toast.error(
        "La fecha de inicio no puede ser posterior a la fecha de fin"
      );
    }

    if (esNuevoConvenio && !archivo) {
      nuevosErrores.archivo = true;
      valido = false;

      toast.error("Selecciona un PDF antes de enviar");
    }

    if (!tieneConvenio && !archivo) {
      nuevosErrores.archivo = true;
      valido = false;

      toast.error("Selecciona un PDF antes de enviar");
    }

    setErrores(nuevosErrores);

    return valido;
  };

  // =============================================================
  // ENVIAR / EDITAR / CREAR
  // =============================================================

  const handleEnviar = async () => {
    if (estado === "APROBADO") {
      toast.error("No puedes modificar un convenio aprobado");
      return;
    }

    const modo =
      !tieneConvenio || estado === "VENCIDO"
        ? "NUEVO"
        : "EDITAR";

    const creandoNuevo = modo === "NUEVO";

    if (!validarFormulario()) {
      return;
    }

    if (!usuarioSesion?.id) {
      toast.error("No se encontró la sesión del usuario");
      return;
    }

    const empresaId = usuarioSesion?.Empresa?.id;

    if (!empresaId) {
      toast.error("No se encontró la empresa del usuario");
      return;
    }

    setEnviando(true);

    try {
      const formData = new FormData();

      formData.append("modo", modo);

      if (archivo) {
        formData.append("archivo", archivo);
      }

      formData.append("empresa_id", empresaId);

      formData.append("fecha_inicio", fechaInicio);

      formData.append("fecha_fin", fechaFin);

      formData.append("usuario_id", usuarioSesion.id);

      if (modo === "EDITAR" && convenioId) {
        formData.append("convenio_id", convenioId);
      }

      console.log("Enviando convenio:", {
        modo,
        convenio_id: modo === "EDITAR" ? convenioId : null,
        empresa_id: empresaId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        archivo: archivo?.name || null,
      });

      await subirConvenio(
        convenioRepository,
        formData
      );

      toast.success(
        creandoNuevo
          ? "Nuevo convenio enviado a revisión"
          : "Convenio actualizado y enviado a revisión"
      );

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setArchivo(null);
      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadConvenios(empresaId);

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Ocurrió un error al enviar el convenio"
      );

    } finally {
      setEnviando(false);
    }
  };

  // =============================================================
  // CLASE INPUT FECHA
  // =============================================================

  const claseFecha = (tieneError) => {
    return `
      w-full
      h-9
      px-3
      rounded-xl
      border
      text-sm
      text-slate-700
      focus:outline-none
      transition-all

      ${
        tieneError
          ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] focus:border-red-500"
          : "border-slate-200 focus:border-red-400"
      }

      disabled:bg-slate-100
      disabled:cursor-not-allowed
    `;
  };

  // =============================================================
  // SKELETON DE CARGA
  // =============================================================

  if (cargando || cargandoConvenio) {
    return <SkeletonConvenio />;
  }

  // =============================================================
  // RENDER
  // =============================================================

  return (
    <>
      <div>
        <h1 className="text-[24px] font-extrabold text-slate-800 text-center mb-5 tracking-tight">
          Convenio
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* =====================================================
              COLUMNA IZQUIERDA
          ===================================================== */}

          <div className="flex flex-col gap-4">

            {/* FECHAS */}

            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-2">
                Fechas del convenio
              </h2>

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Fecha inicio
                  </label>

                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => {
                      setFechaInicio(e.target.value);

                      setErrores((prev) => ({
                        ...prev,
                        fechaInicio: false,
                      }));
                    }}
                    disabled={convenioBloqueado}
                    className={claseFecha(errores.fechaInicio)}
                  />

                  {errores.fechaInicio && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {fechaInicio && fechaFin
                        ? "La fecha de inicio debe ser anterior o igual a la fecha de fin."
                        : "La fecha de inicio es obligatoria."}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Fecha fin
                  </label>

                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => {
                      setFechaFin(e.target.value);

                      setErrores((prev) => ({
                        ...prev,
                        fechaFin: false,
                      }));
                    }}
                    disabled={convenioBloqueado}
                    className={claseFecha(errores.fechaFin)}
                  />

                  {errores.fechaFin && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {fechaInicio && fechaFin
                        ? "La fecha de fin debe ser posterior o igual a la fecha de inicio."
                        : "La fecha de fin es obligatoria."}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* CARGAR FORMATO */}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-800">
                  Cargar Formato Convenido
                </h2>

                <button
                  onClick={handleDescargarFormato}
                  className="
                    flex items-center gap-1
                    text-xs font-semibold text-slate-500
                    hover:text-red-600 transition-colors
                  "
                >
                  <Download size={13} />
                  Descargar formato
                </button>
              </div>

              {/* APROBADO */}

              {estado === "APROBADO" ? (
                <div className="
                  w-full h-32 border-2 border-slate-200
                  rounded-2xl bg-slate-50
                  flex flex-col items-center justify-center
                ">
                  <CheckCircle2
                    size={24}
                    className="text-emerald-500 mb-1"
                  />

                  <p className="text-sm font-semibold text-slate-700">
                    Convenio aprobado
                  </p>

                  <p className="text-xs text-slate-400 text-center px-4">
                    No puedes modificar este convenio mientras esté vigente.
                  </p>

                  {archivoActual && (
                    <button
                      onClick={() =>
                        abrirModalPDF(
                          archivoActual,
                          "Convenio aprobado"
                        )
                      }
                      className="
                        flex items-center gap-1
                        text-xs font-bold text-blue-600
                        hover:text-blue-800 mt-1
                      "
                    >
                      <Eye size={13} />
                      Ver convenio
                    </button>
                  )}
                </div>

              ) : estado === "VENCIDO" ? (

                /* VENCIDO */

                <div className="
                  w-full h-32 border-2 border-slate-300
                  rounded-2xl bg-slate-50
                  flex flex-col items-center justify-center px-6
                ">
                  <Clock
                    size={24}
                    className="text-slate-500 mb-1"
                  />

                  <p className="text-sm font-semibold text-slate-700">
                    Convenio vencido
                  </p>

                  <p className="text-xs text-slate-400 text-center">
                    Este convenio no puede modificarse.
                    Debes cargar uno nuevo.
                  </p>

                  <button
                    onClick={prepararNuevoConvenio}
                    className="
                      mt-2 flex items-center gap-1
                      text-xs font-bold text-red-600
                      hover:text-red-700
                    "
                  >
                    <UploadCloud size={13} />
                    Cargar nuevo convenio
                  </button>
                </div>

              ) : archivo ? (

                /* PDF NUEVO */

                <div className="
                  w-full h-32 border-2 rounded-2xl bg-white
                  flex flex-col items-center justify-center
                  px-6 relative border-slate-200
                ">
                  <button
                    onClick={handleQuitarArchivo}
                    className="
                      absolute top-2 right-2
                      text-slate-400 hover:text-red-600
                    "
                    title="Quitar archivo"
                  >
                    <X size={16} />
                  </button>

                  <FileText
                    size={24}
                    className="text-red-500 mb-1"
                  />

                  <p className="
                    text-sm font-semibold text-slate-700
                    text-center truncate max-w-[220px]
                  ">
                    {archivo.name}
                  </p>

                  <p className="text-xs text-slate-400 mb-1.5">
                    {(archivo.size / 1024).toFixed(0)} KB
                  </p>

                  <button
                    onClick={handleVerPreview}
                    className="
                      flex items-center gap-1
                      text-xs font-bold text-blue-600
                      hover:text-blue-800
                    "
                  >
                    <Eye size={13} />
                    Ver
                  </button>
                </div>

              ) : archivoActual ? (

                /* ARCHIVO ACTUAL */

                <div className="
                  w-full h-32 border-2 rounded-2xl bg-white
                  flex flex-col items-center justify-center
                  px-6 relative border-slate-200
                ">
                  <FileText
                    size={24}
                    className="text-red-500 mb-1"
                  />

                  <p className="
                    text-sm font-semibold text-slate-700
                    text-center truncate max-w-[260px]
                  ">
                    Convenio actual
                  </p>

                  <p className="text-xs text-slate-400 mb-1.5">
                    Se conservará si no seleccionas otro archivo
                  </p>

                  <button
                    onClick={() =>
                      abrirModalPDF(
                        archivoActual,
                        "Convenio actual"
                      )
                    }
                    className="
                      flex items-center gap-1
                      text-xs font-bold text-blue-600
                      hover:text-blue-800
                    "
                  >
                    <Eye size={13} />
                    Ver
                  </button>
                </div>

              ) : (

                /* CARGAR PDF */

                <label
                  htmlFor="convenio-pdf"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`
                    flex flex-col items-center justify-center
                    w-full h-32 border-2 border-dashed
                    rounded-2xl bg-white cursor-pointer
                    transition-colors

                    ${
                      errores.archivo
                        ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] bg-red-50/20"
                        : "border-red-300 hover:bg-red-50/40"
                    }
                  `}
                >
                  <UploadCloud
                    size={24}
                    className="text-slate-800 mb-1.5"
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    Cargar el PDF
                  </span>

                  {errores.archivo && (
                    <span className="text-[11px] text-red-500 mt-1">
                      Debes seleccionar un archivo PDF
                    </span>
                  )}

                  <input
                    id="convenio-pdf"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleSelectFile}
                  />
                </label>
              )}
            </div>

            {/* BOTÓN ENVIAR */}

            <button
              onClick={handleEnviar}
              disabled={
                enviando ||
                estado === "APROBADO"
              }
              className="
                mx-auto flex items-center justify-center gap-2
                bg-red-600 hover:bg-red-700
                disabled:opacity-60 disabled:cursor-not-allowed
                text-white font-bold text-sm
                px-7 py-2.5 rounded-2xl transition-colors
              "
            >
              {modoBoton(estado, tieneConvenio, enviando)}
            </button>

            {/* TABLA */}

            <div>
              <h2 className="text-base font-extrabold text-slate-800 mb-2">
                Convenios
              </h2>

              <GenericTable
                rows={rows}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                columns={[
                  {
                    key: "fechaFin",
                    label: "Fecha de fin",
                    primary: true,
                  },
                  {
                    key: "estado",
                    label: "Estado",
                    render: (row) => (
                      <EstadoBadge estado={row.estado} />
                    ),
                  },
                ]}
                actions={[
                  {
                    icon: <Eye size={16} />,
                    className: "text-blue-600 hover:bg-blue-50",
                    onClick: (id) => {
                      loadConvenioActual(id);
                    },
                  },
                  {
                    icon: <Download size={16} />,
                    className: "text-slate-600 hover:bg-slate-100",
                    onClick: (id) => {
                      const convenio = rows.find(
                        (item) => item.id === id
                      );

                      handleDescargarConvenio(
                        convenio?.archivo,
                        `convenio-${id}.pdf`
                      );
                    },
                  },
                ]}
                emptyMessage="No hay convenios registrados."
                pageSize={3}
              />
            </div>
          </div>

          {/* =====================================================
              COLUMNA DERECHA
          ===================================================== */}

          <div className="flex flex-col gap-4">

            <EstadoPanel estado={estado} />

            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-sm font-bold text-slate-800 mb-2">
                Trazabilidad
              </h2>

              <div className="
                flex-1 bg-white border border-slate-200
                rounded-2xl p-4 min-h-[300px] max-h-[420px]
              ">
                <TrazabilidadTimeline eventos={trazabilidad} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL VISUALIZAR PDF
      ========================================================= */}

      {modalPDF.abierto && (
        <div
          className="
            fixed inset-0 z-[100]
            bg-black/60 backdrop-blur-sm
            flex items-center justify-center
            p-3 sm:p-6
          "
          onClick={cerrarModalPDF}
        >
          <div
            className="
              bg-white w-full max-w-5xl
              h-[90vh] rounded-2xl shadow-2xl
              flex flex-col overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER */}

            <div className="
              flex items-center justify-between gap-3
              px-5 py-4 border-b border-slate-200 shrink-0
            ">
              <div className="flex items-center gap-3 min-w-0">

                <div className="
                  w-10 h-10 rounded-xl bg-red-50
                  flex items-center justify-center shrink-0
                ">
                  <FileText
                    size={21}
                    className="text-red-600"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-800">
                    Visualizar convenio
                  </h2>

                  <p className="text-xs text-slate-400 truncate">
                    {modalPDF.titulo}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2 shrink-0">

                <button
                  onClick={() =>
                    handleDescargarConvenio(
                      modalPDF.url,
                      modalPDF.titulo
                    )
                  }
                  className="
                    flex items-center gap-2
                    px-3 py-2 rounded-xl
                    text-xs font-semibold text-slate-600
                    hover:bg-slate-100 transition-colors
                  "
                >
                  <Download size={16} />

                  <span className="hidden sm:inline">
                    Descargar
                  </span>
                </button>

                <button
                  onClick={cerrarModalPDF}
                  className="
                    w-9 h-9 rounded-xl
                    flex items-center justify-center
                    text-slate-400 hover:text-red-600
                    hover:bg-red-50 transition-colors
                  "
                  title="Cerrar"
                >
                  <X size={20} />
                </button>

              </div>
            </div>

            {/* VISOR PDF */}

            <div className="flex-1 min-h-0 bg-slate-100 p-2 sm:p-3">
              <iframe
                src={modalPDF.url}
                title="Visualizador de convenio"
                className="
                  w-full h-full rounded-xl
                  border border-slate-200 bg-white"
              />
            </div>

          </div>
        </div>
      )}
    </>
  );
}

// ===============================================================
// BOTÓN SEGÚN ESTADO
// ===============================================================

function modoBoton(estado, tieneConvenio, enviando) {
  if (estado === "VENCIDO") {
    return (
      <>
        <UploadCloud size={16} />
        {enviando ? "Enviando..." : "Cargar nuevo convenio"}
      </>
    );
  }

  if (tieneConvenio) {
    return (
      <>
        <FileText size={16} />
        {enviando ? "Guardando..." : "Editar"}
      </>
    );
  }

  return (
    <>
      <Send size={16} />
      {enviando ? "Enviando..." : "Enviar"}
    </>
  );
}
