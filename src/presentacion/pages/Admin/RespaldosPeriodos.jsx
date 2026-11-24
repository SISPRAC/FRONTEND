import { useEffect, useState } from "react";
import { FolderOpen, FileArchive, TriangleAlert, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";

import GenericTable from "../../components/Table/GenericTable";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge";
import { periodoRespaldoRepository } from "../../../infraestructura/repository/periodoRespaldoRepository";
import { getRespaldos } from "../../../aplicacion/periodoRespaldo/getRespaldos";

const formatearFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Bogota",
      })
    : "—";

// Estado + (si ya hubo reintentos) cuántos intentos van
const EstadoConIntentos = ({ etapa }) => (
  <div className="flex flex-col items-center gap-1">
    <EstadoBadge estado={etapa.estado} />
    {etapa.estado === "FALLO" && (
      <span className="text-[11px] text-slate-400">
        {etapa.intentos} {etapa.intentos === 1 ? "intento" : "intentos"}
      </span>
    )}
  </div>
);

const EnlaceDrive = ({ url, icon, label }) =>
  url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
    >
      {icon}
      {label}
    </a>
  ) : null;

export default function RespaldosPeriodos() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorDetalle, setErrorDetalle] = useState(null);

  const cargar = async (mostrarLoading = false) => {
    try {
      if (mostrarLoading) setLoading(true);

      const data = await getRespaldos({ periodoRespaldoRepository });
      setRows(data);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error al cargar los respaldos"
      );
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  useEffect(() => {
    cargar(true);
  }, []);

  const hayFallo = (row) =>
    row.subida.estado === "FALLO" || row.compresion.estado === "FALLO";

  return (
    <div>
      <div className="relative mb-7">
        <h1 className="text-[26px] font-extrabold text-slate-800 text-center tracking-tight">
          Respaldos de Períodos
        </h1>

        <button
          onClick={() => cargar(true)}
          disabled={loading}
          title="Actualizar"
          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      <GenericTable
        rows={rows}
        rowKey="periodo_id"
        loading={loading}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        columns={[
          { key: "periodo", label: "Período", primary: true },
          {
            key: "subida",
            label: "Subida a Drive",
            render: (row) => <EstadoConIntentos etapa={row.subida} />,
          },
          {
            key: "fecha_subida",
            label: "Fecha de subida",
            render: (row) => formatearFecha(row.subida.fecha),
          },
          {
            key: "compresion",
            label: "Compresión",
            render: (row) => <EstadoConIntentos etapa={row.compresion} />,
          },
          {
            key: "fecha_compresion",
            label: "Fecha de compresión",
            render: (row) => formatearFecha(row.compresion.fecha),
          },
          {
            key: "drive",
            label: "Drive",
            render: (row) => {
              const comprimido = row.compresion.estado === "COMPRIMIDO";
              // Comprimido -> solo el ZIP; sin comprimir -> solo la carpeta
              const urlCarpeta = comprimido ? null : row.subida.url;
              const urlZip = comprimido ? row.compresion.url : null;

              return (
                <div className="flex items-center justify-center gap-1">
                  <EnlaceDrive
                    url={urlCarpeta}
                    icon={<FolderOpen size={14} />}
                    label="Carpeta"
                  />
                  <EnlaceDrive
                    url={urlZip}
                    icon={<FileArchive size={14} />}
                    label="ZIP"
                  />
                  {!urlCarpeta && !urlZip && "—"}
                </div>
              );
            },
          },
        ]}
        // La columna "Acciones" solo existe si hay algún período con fallo
        actions={
          rows.some(hayFallo)
            ? [
                {
                  icon: <TriangleAlert size={22} />,
                  className: "text-red-500 hover:bg-red-100",
                  show: hayFallo,
                  onClick: (id) =>
                    setErrorDetalle(rows.find((r) => r.periodo_id === id) ?? null),
                },
              ]
            : []
        }
        emptyMessage="Aún no hay respaldos registrados."
        pageSize={8}
      />

      {/* Detalle del error */}
      {errorDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Errores del período {errorDetalle.periodo}
              </h2>
              <button
                onClick={() => setErrorDetalle(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {[
              { titulo: "Subida a Drive", etapa: errorDetalle.subida },
              { titulo: "Compresión", etapa: errorDetalle.compresion },
            ]
              .filter(({ etapa }) => etapa.estado === "FALLO")
              .map(({ titulo, etapa }) => (
                <div key={titulo} className="mb-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {titulo}
                    </span>
                    <EstadoBadge estado={etapa.estado} size="sm" />
                    <span className="text-[11px] text-slate-400">
                      {etapa.intentos} {etapa.intentos === 1 ? "intento" : "intentos"}
                      {" · "}
                      {formatearFecha(etapa.fecha)}
                    </span>
                  </div>
                  <p className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-red-50 p-3 text-xs text-red-700">
                    {etapa.error || "Sin detalle"}
                  </p>
                </div>
              ))}

            <div className="flex justify-end">
              <button
                onClick={() => setErrorDetalle(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}