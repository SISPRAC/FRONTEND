
import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  IdCard,
  Briefcase,
  Calendar,
  FileText,
  Download,
} from "lucide-react";

import ConfirmModal from "../../components/modals/ConfirmModal";

import { aceptarPostulacion } from "../../../aplicacion/postulacion/aceptarPostulacion";
import { rechazarPostulacion } from "../../../aplicacion/postulacion/rechazarPostulacion";
import { postulacionRepository } from "../../../infraestructura/repository/postulacionRepository";

const ESTADO_STYLES = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  aceptado: "bg-green-50 text-green-700 border-green-200",
  rechazado: "bg-red-50 text-red-700 border-red-200",
};

const CandidatoDetalleEmpresa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [candidato] = useState(
    location.state?.candidato ?? {
      id,
      codigo: "",
      nombre: "",
      vacante: "",
      correo: "",
      telefono: "",
      fechaPostulacion: "",
      estado: "pendiente",
      hojaVida: null,
    }
  );

  const [modal, setModal] = useState(null);
  const [comentarioRechazo, setComentarioRechazo] = useState("");
  const [procesando, setProcesando] = useState(false);

  // ACEPTAR POSTULACIÓN
  const handleAceptar = async () => {
    if (procesando) return;

    try {
      setProcesando(true);

      await aceptarPostulacion(
        postulacionRepository,
        candidato.id
      );

      setModal(null);
      navigate(-1);

    } catch (error) {
      console.error("Error al aceptar la postulación:", error);
    } finally {
      setProcesando(false);
    }
  };

  // RECHAZAR POSTULACIÓN
  const handleRechazar = async () => {
    if (procesando) return;

    try {
      setProcesando(true);

      await rechazarPostulacion(
        postulacionRepository,
        candidato.id,
        comentarioRechazo
      );

      setModal(null);
      setComentarioRechazo("");
      navigate(-1);

    } catch (error) {
      console.error("Error al rechazar la postulación:", error);
    } finally {
      setProcesando(false);
    }
  };

  const estado = candidato.estado?.toLowerCase() || "pendiente";

  const estadoFinalizado =
    estado === "aceptado" || estado === "rechazado";

  const estadoStyle =
    ESTADO_STYLES[estado] ?? ESTADO_STYLES.pendiente;

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col">

      <div
        className="
          w-full
          max-w-6xl
          mx-auto
          flex-1
          min-h-0
          bg-white
          rounded-2xl
          border border-slate-200
          shadow-sm
          overflow-hidden
          flex flex-col
        "
      >

        {/* VOLVER */}
        <div className="px-5 md:px-7 pt-3 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-slate-500
              hover:text-slate-800
              transition-colors
            "
          >
            <ArrowLeft size={17} />
            Volver
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="p-5 md:px-7 md:pb-5 pt-3 flex-1 min-h-0">

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-[minmax(0,1fr)_320px]
              gap-5
              h-full
              min-h-0
            "
          >

            {/* VISOR PDF */}
            <section className="min-w-0 min-h-0 flex flex-col">

              <div className="flex items-center justify-between mb-2 shrink-0">
                <div>
                  <h2 className="text-base font-bold text-slate-700">
                    Hoja de vida
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Documento adjunto del candidato
                  </p>
                </div>

                {candidato.hojaVida?.url && (
                  <a
                    href={candidato.hojaVida.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-3
                      py-2
                      rounded-lg
                      text-xs
                      font-medium
                      text-slate-600
                      border border-slate-200
                      hover:bg-slate-50
                      transition-colors
                    "
                  >
                    <Download size={14} />
                    Descargar
                  </a>
                )}
              </div>

              {/* DOCUMENTO */}
              <div
                className="
                  flex-1
                  min-h-0
                  rounded-xl
                  border border-slate-200
                  bg-slate-100
                  overflow-hidden
                  shadow-sm
                "
              >
                {candidato.hojaVida?.url ? (
                  <iframe
                    src={candidato.hojaVida.url}
                    title={`Hoja de vida de ${candidato.nombre}`}
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div
                      className="
                        w-12 h-12
                        rounded-full
                        bg-white
                        border border-slate-200
                        flex items-center justify-center
                        mb-3
                      "
                    >
                      <FileText size={24} className="text-slate-300" />
                    </div>

                    <p className="text-sm font-medium text-slate-500">
                      No hay hoja de vida disponible
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      El candidato no tiene un documento adjunto.
                    </p>
                  </div>
                )}
              </div>

              {/* NOMBRE ARCHIVO */}
              {candidato.hojaVida?.url && (
                <div className="flex items-center gap-2 mt-2 px-1 shrink-0">
                  <FileText size={14} className="text-slate-400" />

                  <span className="text-xs text-slate-500 truncate">
                    {candidato.hojaVida.nombre || "Hoja de vida.pdf"}
                  </span>
                </div>
              )}

            </section>

            {/* INFORMACIÓN */}
            <aside className="min-w-0 flex flex-col gap-3">

              {/* IDENTIDAD */}
              <div
                className="
                  rounded-xl
                  border border-slate-200
                  bg-slate-50/50
                  p-4
                "
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Candidato
                    </p>

                    <h1 className="text-lg font-bold text-slate-800 leading-tight break-words">
                      {candidato.nombre || "Candidato"}
                    </h1>
                  </div>

                  <span
                    className={`
                      shrink-0
                      text-[11px]
                      font-semibold
                      px-2.5
                      py-1
                      rounded-full
                      border
                      capitalize
                      ${estadoStyle}
                    `}
                  >
                    {candidato.estado || "Pendiente"}
                  </span>
                </div>

                <div className="space-y-3">

                  <InfoRow
                    icon={<IdCard size={16} />}
                    label="Código"
                    value={candidato.codigo}
                  />

                  <InfoRow
                    icon={<Briefcase size={16} />}
                    label="Postulado a"
                    value={
                      candidato.vacante
                        ? `Vacante ${candidato.vacante}`
                        : ""
                    }
                  />

                  <InfoRow
                    icon={<Mail size={16} />}
                    label="Correo"
                    value={candidato.correo}
                  />

                  <InfoRow
                    icon={<Phone size={16} />}
                    label="Teléfono"
                    value={candidato.telefono}
                  />

                </div>
              </div>

              {/* POSTULACIÓN */}
              <div
                className="
                  rounded-xl
                  border border-slate-200
                  bg-slate-50/50
                  p-4
                "
              >
                <h3 className="text-sm font-bold text-slate-700 mb-3">
                  Información de postulación
                </h3>

                <InfoRow
                  icon={<Calendar size={16} />}
                  label="Fecha de postulación"
                  value={
                    candidato.fechaPostulacion
                      ? new Date(candidato.fechaPostulacion).toLocaleString(
                          "es-CO",
                          {
                            timeZone: "America/Bogota",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )
                      : "-"
                  }
                />
              </div>

              {/* ACCIONES */}
              <div className="grid grid-cols-2 gap-3 mt-auto">

                <button
                  disabled={estadoFinalizado || procesando}
                  onClick={() => setModal("aceptar")}
                  className={`
                    px-3 py-2.5
                    rounded-lg
                    text-white
                    text-sm
                    font-semibold
                    shadow-sm
                    transition-colors
                    ${
                      estadoFinalizado || procesando
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }
                  `}
                >
                  Aceptar
                </button>

                <button
                  disabled={estadoFinalizado || procesando}
                  onClick={() => {
                    setComentarioRechazo("");
                    setModal("rechazar");
                  }}
                  className={`
                    px-3 py-2.5
                    rounded-lg
                    text-white
                    text-sm
                    font-semibold
                    shadow-sm
                    transition-colors
                    ${
                      estadoFinalizado || procesando
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  `}
                >
                  Rechazar
                </button>

              </div>

            </aside>

          </div>
        </div>
      </div>

      {/* MODAL ACEPTAR */}
      <ConfirmModal
        isOpen={modal === "aceptar"}
        title="Aceptar candidato"
        message={`¿Seguro que desea aceptar al candidato ${candidato.nombre} para el cargo de ${candidato.vacante}?`}
        confirmLabel={procesando ? "Confirmando..." : "Sí, aceptar"}
        confirmColor="bg-green-600 hover:bg-green-700"
        onConfirm={handleAceptar}
        onCancel={() => {
          if (procesando) return;
          setModal(null);
        }}
      />

      {/* MODAL RECHAZAR */}
      <ConfirmModal
        isOpen={modal === "rechazar"}
        title="Rechazar candidato"
        message={`¿Seguro que desea rechazar al candidato ${candidato.nombre} para el cargo de ${candidato.vacante}?`}
        confirmLabel={procesando ? "Rechazando..." : "Sí, rechazar"}
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={handleRechazar}
        onCancel={() => {
          if (procesando) return;
          setModal(null);
          setComentarioRechazo("");
        }}
        showTextarea={true}
        textareaValue={comentarioRechazo}
        onTextareaChange={setComentarioRechazo}
        textareaPlaceholder="Indique el motivo por el cual se rechaza al candidato..."
      />

    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">

    <div className="shrink-0 text-slate-400 mt-0.5">
      {icon}
    </div>

    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`
          text-sm
          mt-0.5
          break-words
          ${value ? "text-slate-700" : "text-slate-400"}
        `}
      >
        {value || "No disponible"}
      </p>
    </div>

  </div>
);

export default CandidatoDetalleEmpresa;
