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
import Layout from "../../shared/Layouts/Layout";
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
      experiencia: "",
      fechaPostulacion: "",
      estado: "pendiente",
      hojaVida: null,
    }
  );

  const [modal, setModal] = useState(null);
  const [comentarioRechazo, setComentarioRechazo] = useState("");

  const handleAceptar = async () => {
    try {

      await aceptarPostulacion(
        postulacionRepository,
        candidato.id
      );

      setModal(null);
      navigate(-1);

    } catch (error) {

      console.error(
        "Error al aceptar la postulación:",
        error
      );

    }
  };

  const handleRechazar = async () => {
    try {

      await rechazarPostulacion(
        postulacionRepository,
        candidato.id,
        comentarioRechazo
      );

      setModal(null);
      setComentarioRechazo("");
      navigate(-1);

    } catch (error) {

      console.error(
        "Error al rechazar la postulación:",
        error
      );

    }
  };

  const estado = candidato.estado?.toLowerCase() || "pendiente";

  const estadoFinalizado =
    estado === "aceptado" || estado === "rechazado";

  const estadoStyle =
    ESTADO_STYLES[estado] ?? ESTADO_STYLES.pendiente;

  return (
    <Layout footerLabel="Empresa">

      {/* CONTENEDOR PRINCIPAL */}
      <div
        className="
          max-w-6xl
          mx-auto
          bg-white
          rounded-2xl
          border border-slate-200
          shadow-sm
          overflow-hidden
        "
      >

        {/* VOLVER (única línea, sin bloque de título aparte) */}
        <div className="px-6 md:px-8 pt-4">
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
            <ArrowLeft size={18} />
            Volver
          </button>
        </div>

        {/* ================= CONTENIDO ================= */}
        <div className="p-6 md:p-8 pt-4">

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8">

            {/* ================= VISOR (arriba del todo) ================= */}
            <section className="min-w-0">

              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-700">
                    Hoja de vida
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
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
                      border
                      border-slate-200
                      hover:bg-slate-50
                      transition-colors
                    "
                  >
                    <Download size={14} />
                    Descargar
                  </a>
                )}
              </div>

              {/* VISOR PDF */}
              <div
                className="
                  w-full
                  h-[480px]
                  rounded-xl
                  border
                  border-slate-200
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
                    <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4">
                      <FileText
                        size={26}
                        className="text-slate-300"
                      />
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

              {/* NOMBRE DEL ARCHIVO */}
              {candidato.hojaVida?.url && (
                <div className="flex items-center gap-2 mt-3 px-1">
                  <FileText
                    size={15}
                    className="text-slate-400"
                  />

                  <span className="text-xs text-slate-500 truncate">
                    {candidato.hojaVida.nombre || "Hoja de vida.pdf"}
                  </span>
                </div>
              )}
            </section>

            {/* ================= INFORMACIÓN ================= */}
            <aside className="min-w-0">

              {/* IDENTIDAD DEL CANDIDATO */}
              <div
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50/50
                  p-5
                "
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Candidato
                    </p>

                    <h1 className="text-xl font-bold text-slate-800 leading-tight">
                      {candidato.nombre || "Candidato"}
                    </h1>
                  </div>

                  <span
                    className={`
                      shrink-0
                      text-xs
                      font-semibold
                      px-3
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

                <div className="space-y-4">

                  <InfoRow
                    icon={<IdCard size={17} />}
                    label="Código"
                    value={candidato.codigo}
                  />

                  <InfoRow
                    icon={<Briefcase size={17} />}
                    label="Postulado a"
                    value={
                      candidato.vacante
                        ? `Vacante ${candidato.vacante}`
                        : ""
                    }
                  />

                  <InfoRow
                    icon={<Mail size={17} />}
                    label="Correo"
                    value={candidato.correo}
                  />

                  <InfoRow
                    icon={<Phone size={17} />}
                    label="Teléfono"
                    value={candidato.telefono}
                  />

                </div>
              </div>

              {/* POSTULACIÓN */}
              <div
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50/50
                  p-5
                  mt-5
                "
              >
                <h3 className="text-sm font-bold text-slate-700 mb-5">
                  Información de postulación
                </h3>

                <div className="space-y-4">

                  <InfoRow
                    icon={<Calendar size={17} />}
                    label="Fecha de postulación"
                    value={
                      candidato.fechaPostulacion
                        ? new Date(candidato.fechaPostulacion).toLocaleString("es-CO", {
                          timeZone: "America/Bogota",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                        : "-"
                    }
                  />

                  <InfoRow
                    icon={<Briefcase size={17} />}
                    label="Experiencia"
                    value={candidato.experiencia}
                  />

                </div>
              </div>

              {/* ACCIONES */}
              {/* ACCIONES */}
              <div className="grid grid-cols-2 gap-3 mt-5">

                <button
                  disabled={estadoFinalizado}
                  onClick={() => {
                    if (estadoFinalizado) return;
                    setModal("aceptar");
                  }}
                  className={`
      px-4
      py-2.5
      rounded-lg
      text-white
      text-sm
      font-semibold
      shadow-sm
      transition-colors
      ${estadoFinalizado
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                    }
    `}
                >
                  Aceptar
                </button>

                <button
                  disabled={estadoFinalizado}
                  onClick={() => {
                    if (estadoFinalizado) return;

                    setComentarioRechazo("");
                    setModal("rechazar");
                  }}
                  className={`
      px-4
      py-2.5
      rounded-lg
      text-white
      text-sm
      font-semibold
      shadow-sm
      transition-colors
      ${estadoFinalizado
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
        confirmLabel="Sí, aceptar"
        confirmColor="bg-green-600 hover:bg-green-700"
        onConfirm={handleAceptar}
        onCancel={() => setModal(null)}
      />

      {/* MODAL RECHAZAR */}
      <ConfirmModal
        isOpen={modal === "rechazar"}
        title="Rechazar candidato"
        message={`¿Seguro que desea rechazar al candidato ${candidato.nombre} para el cargo de ${candidato.vacante}?`}
        confirmLabel="Sí, rechazar"
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={handleRechazar}
        onCancel={() => {
          setModal(null);
          setComentarioRechazo("");
        }}
        showTextarea={true}
        textareaValue={comentarioRechazo}
        onTextareaChange={setComentarioRechazo}
        textareaPlaceholder="Indique el motivo por el cual se rechaza al candidato..."
      />
    </Layout>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">

    <div className="shrink-0 text-slate-400 mt-0.5">
      {icon}
    </div>

    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
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