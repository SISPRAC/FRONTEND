import React, { useEffect, useState } from "react";
import Layout from "../../shared/Layouts/Layout";

import { obtenerMiPractica } from "../../../aplicacion/practicante/obtenerMiPractica.js";
import { practicanteRepository } from "../../../infraestructura/repository/practicanteRepository.js";


const ESTADO_STYLES = {
  activa: "bg-green-100 text-green-700",
  en_curso: "bg-green-100 text-green-700",
  finalizada: "bg-gray-100 text-gray-600",
  pendiente: "bg-yellow-100 text-yellow-700",
};

const HomePracticante = () => {
  const [practica, setPractica] = useState(null);
  const [vacante, setVacante] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatosPractica = async () => {
      try {
        setLoading(true);

        const data = await obtenerMiPractica(practicanteRepository);

        console.log("Datos de la práctica obtenidos:", data);

        setPractica(data.practica);
        setVacante(data.vacante);
        setEmpresa(data.empresa);
        setTutor(data.tutor);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información de la práctica.");
      } finally {
        setLoading(false);
      }
    };

    fetchDatosPractica();
  }, []);

  const handleDescargarArl = () => {
    if (!practica?.archivoArl?.url) {
      return;
    }

    window.open(
      practica.archivoArl.url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const estadoClase =
    ESTADO_STYLES[practica?.estado?.toLowerCase()] ||
    "bg-gray-100 text-gray-600";

  return (
    <Layout footerLabel="Practicante">
      <div className="h-full flex flex-col p-6">

        {/* ===== Barra superior: duración + estado ===== */}
        {practica && (
          <div className="flex items-center justify-center gap-3 text-xs text-gray-400 mb-1">
            <span>
              Inicio práctica: {practica.fecha_inicio} — Fin práctica: {practica.fecha_fin}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-medium uppercase ${estadoClase}`}
            >
              {practica.estado}
            </span>
          </div>
        )}

        <h1 className="text-3xl font-bold text-center mb-8">Bienvenido</h1>

        {loading && (
          <p className="text-center text-gray-500">Cargando información...</p>
        )}

        {error && <p className="text-center text-red-600">{error}</p>}

        {/* ===== Contenido centrado verticalmente en el espacio disponible ===== */}
        {!loading && !error && empresa && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col md:flex-row items-start gap-8 max-w-6xl w-full">

              {/* Logo grande a la izquierda */}
              <div className="flex flex-col items-center gap-3 w-full md:w-2/5">
                <p className="text-base font-semibold text-gray-700 border-b-2 border-red-500 pb-1">
                  Prácticas a realizar en
                </p>

                {empresa.logo ? (
                  <img
                    src={empresa.logo}
                    alt={`Logo ${empresa.nombre}`}
                    className="w-full max-w-xs h-auto object-contain"
                  />
                ) : (
                  <div className="w-full max-w-xs aspect-square flex items-center justify-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
                    Sin logo
                  </div>
                )}
              </div>

              {/* ===== Columna derecha: 3 cards separadas ===== */}
              <div className="w-full md:w-3/5 flex flex-col gap-5">

                {/* Fila: Empresa + Tutor, cada una en SU PROPIA card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Card Empresa */}
                  <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
                    <h2 className="text-red-600 font-bold text-sm uppercase tracking-wide mb-3">
                      Empresa
                    </h2>

                    <dl className="flex flex-col gap-2 text-sm text-gray-700">
                      <div>
                        <dt className="font-semibold inline">Nombre: </dt>
                        <dd className="inline">{empresa.nombre}</dd>
                      </div>

                      <div>
                        <dt className="font-semibold inline">Dirección: </dt>
                        <dd className="inline">{empresa.direccion}</dd>
                      </div>

                      {empresa.usuario && (
                        <div>
                          <dt className="font-semibold inline">Director: </dt>
                          <dd className="inline">
                            {empresa.usuario.nombres} {empresa.usuario.apellidos}
                          </dd>
                        </div>
                      )}

                      {empresa.usuario?.correo && (
                        <div>
                          <dt className="font-semibold inline">Correo: </dt>
                          <dd className="inline">{empresa.usuario.correo}</dd>
                        </div>
                      )}

                      {empresa.usuario?.telefono && (
                        <div>
                          <dt className="font-semibold inline">Teléfono: </dt>
                          <dd className="inline">{empresa.usuario.telefono}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Card Tutor Empresarial */}
                  {tutor && (
                    <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
                      <h2 className="text-red-600 font-bold text-sm uppercase tracking-wide mb-3">
                        Tutor Empresarial
                      </h2>

                      <dl className="flex flex-col gap-2 text-sm text-gray-700">
                        <div>
                          <dt className="font-semibold inline">Nombre: </dt>
                          <dd className="inline">
                            {tutor.usuario?.nombres} {tutor.usuario?.apellidos}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-semibold inline">Cargo: </dt>
                          <dd className="inline">{tutor.cargo}</dd>
                        </div>

                        {tutor.usuario?.correo && (
                          <div>
                            <dt className="font-semibold inline">Correo: </dt>
                            <dd className="inline">{tutor.usuario.correo}</dd>
                          </div>
                        )}

                        {tutor.usuario?.telefono && (
                          <div>
                            <dt className="font-semibold inline">Teléfono: </dt>
                            <dd className="inline">{tutor.usuario.telefono}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>

                {/* Card Vacante: dos columnas, cada una con su propio encabezado al mismo nivel */}
                {vacante && (
                  <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_2fr] gap-5">

                      {/* Columna izquierda: VACANTE + Área + Duración */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <h2 className="text-red-600 font-bold text-sm uppercase tracking-wide mb-3">
                            Vacante
                          </h2>

                          <p className="font-semibold text-sm text-gray-700 mb-1">
                            Área
                          </p>
                          <p className="text-sm text-gray-600">
                            {vacante.nombre}
                          </p>
                        </div>

                        {practica && (
                          <div className="mt-4">
                            <p className="font-semibold text-sm text-gray-700 mb-1">
                              Duración de la práctica
                            </p>
                            <p className="text-sm text-gray-600">
                              {practica.fecha_inicio} — {practica.fecha_fin}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Columna derecha: Descripción, con tope de alto + scroll interno */}
                      <div className="sm:border-l sm:border-gray-100 sm:pl-5">
                        <h2 className="text-red-600 font-bold text-sm uppercase tracking-wide mb-3">
                          Descripción de la vacante
                        </h2>

                        <p className="text-sm text-gray-600 leading-relaxed max-h-36 overflow-y-auto pr-2">
                          {vacante.descripcion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Botón ARL, anclado al fondo ===== */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleDescargarArl}
            disabled={!practica?.archivoArl?.url}
            className={`px-6 py-2.5 rounded-full font-semibold text-white text-sm transition ${practica?.archivoArl?.url
                ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            {practica?.archivoArl?.url
              ? "Descargar ARL"
              : "Documentos a subir"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default HomePracticante;