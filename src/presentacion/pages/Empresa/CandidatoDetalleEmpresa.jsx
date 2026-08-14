import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Phone, IdCard, Briefcase } from "lucide-react";
import Layout from "../../shared/Layouts/Layout";
import ConfirmModal from "../../components/modals/ConfirmModal";

const CandidatoDetalleEmpresa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Si venimos de la tabla, el candidato ya viaja en el state de navegación.
  // Si no (ej: recarga de la página), aquí va la llamada al backend
  // usando el "id" para traer la info real: GET /candidatos/:id
  const [candidato] = useState(
    location.state?.candidato ?? {
      // TODO: reemplazar por el fetch real cuando esté listo el backend
      id,
      codigo: "",
      nombre: "",
      vacante: "",
      correo: "",
      telefono: "",
      estado: "",
    }
  );

  const [modal, setModal] = useState(null); // "aceptar" | "rechazar" | null

  const handleAceptar = () => {
    // TODO: llamada al backend para aceptar al candidato (PATCH /candidatos/:id)
    console.log("Candidato aceptado:", candidato.id);
    setModal(null);
    navigate(-1);
  };

  const handleRechazar = () => {
    // TODO: llamada al backend para rechazar al candidato (PATCH /candidatos/:id)
    console.log("Candidato rechazado:", candidato.id);
    setModal(null);
    navigate(-1);
  };

  return (
    <Layout footerLabel="Empresa">
      {/* HEADER CON VOLVER */}
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

        <h1 className="text-[28px] font-extrabold text-slate-800 tracking-tight">
          Candidato
        </h1>
      </div>

      <div
        className="
          bg-white
          rounded-2xl
          shadow-md
          border border-slate-200
          p-8
          max-w-5xl
          mx-auto
        "
      >
        <h2 className="text-lg font-bold text-slate-700 mb-6">
          Hoja de vida Candidato
        </h2>

        <div className="flex flex-col md:flex-row gap-12">
          {/* HOJA DE VIDA — TAMAÑO FIJO */}
          <div className="flex justify-center md:justify-start shrink-0">
            <div
              className="
                border-2 border-red-300
                rounded-xl
                p-3
                bg-white
                shadow-sm
                w-[300px] h-[420px]
                overflow-y-auto
                flex items-start justify-center
              "
            >
              {candidato.hojaDeVidaUrl ? (
                <img
                  src={candidato.hojaDeVidaUrl}
                  alt={`Hoja de vida de ${candidato.nombre}`}
                  className="w-full rounded-lg object-contain"
                  // TODO: visor real de PDF/imagen (para PDFs se puede
                  // usar un <iframe> o react-pdf en lugar de <img>)
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 text-center px-6">
                  Aquí se mostrará la hoja de vida del candidato
                </div>
              )}
            </div>
          </div>

          {/* INFO */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <InfoRow icon={<IdCard size={18} />} label="Código" value={candidato.codigo} />
              <InfoRow icon={<IdCard size={18} />} label="Nombre" value={candidato.nombre} />
              <InfoRow
                icon={<Briefcase size={18} />}
                label="Postulado a"
                value={`Vacante ${candidato.vacante}`}
              />
              <InfoRow
                icon={<Mail size={18} />}
                label="Correo"
                value={candidato.correo || "No disponible"}
              />
              <InfoRow
                icon={<Phone size={18} />}
                label="Teléfono"
                value={candidato.telefono || "No disponible"}
              />
            </div>

            <div className="flex gap-4 pt-8">
              <button
                onClick={() => setModal("aceptar")}
                className="
                  px-8 py-2.5
                  rounded-full
                  bg-green-600 hover:bg-green-700
                  text-white font-semibold
                  shadow-sm
                  transition-colors
                "
              >
                Aceptar
              </button>
              <button
                onClick={() => setModal("rechazar")}
                className="
                  px-8 py-2.5
                  rounded-full
                  bg-red-600 hover:bg-red-700
                  text-white font-semibold
                  shadow-sm
                  transition-colors
                "
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modal === "aceptar"}
        title="Aceptar candidato"
        message={`¿Seguro que desea aceptar al candidato ${candidato.nombre} para el cargo de ${candidato.vacante}?`}
        confirmLabel="Sí, aceptar"
        confirmColor="bg-green-600 hover:bg-green-700"
        onConfirm={handleAceptar}
        onCancel={() => setModal(null)}
      />

      <ConfirmModal
        isOpen={modal === "rechazar"}
        title="Rechazar candidato"
        message={`¿Seguro que desea rechazar al candidato ${candidato.nombre} para el cargo de ${candidato.vacante}?`}
        confirmLabel="Sí, rechazar"
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={handleRechazar}
        onCancel={() => setModal(null)}
      />
    </Layout>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="text-slate-400 mt-0.5">{icon}</span>
    <p className="text-slate-700">
      <span className="font-bold">{label}:</span> {value}
    </p>
  </div>
);

export default CandidatoDetalleEmpresa;