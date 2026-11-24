import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { candidatoRepository } from "../../infraestructura/repository/candidatoRepository";
import { perfilRepository } from "../../infraestructura/repository/perfilRepository";
import { habilidadBlandaRepository } from "../../infraestructura/repository/habilidadBlandaRepository";
import { idiomaRepository } from "../../infraestructura/repository/idiomaRepository";

const NIVELES_PERFIL = [
  { value: "R", label: "Regular" },
  { value: "B", label: "Bien" },
  { value: "MB", label: "Muy bien" },
];
const NIVELES_IDIOMA = ["A1", "A2", "B1", "B2", "C1", "C2", "NATIVO"];

const input =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 disabled:text-gray-500";
const btnLink = "text-sm font-semibold text-red-600 hover:text-red-700";

export default function PerfilProfesionalSection() {
  const [cat, setCat] = useState({ perfiles: [], habilidades: [], idiomas: [] });
  const [data, setData] = useState({ perfiles: [], habilidadesBlandas: [], idiomas: [] });
  const [original, setOriginal] = useState(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nuevaHabilidad, setNuevaHabilidad] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [perfiles, habilidades, idiomas, mio] = await Promise.all([
          perfilRepository.getAll(),
          habilidadBlandaRepository.getAll(),
          idiomaRepository.getAll(),
          candidatoRepository.getMiPerfilProfesional(),
        ]);
        setCat({ perfiles, habilidades, idiomas });
        setData(mio);
        setOriginal(mio);
      } catch (e) {
        toast.error(e.response?.data?.message || "No se pudo cargar el perfil profesional");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (key, fn) => setData((d) => ({ ...d, [key]: fn(d[key]) }));
  const upd = (key, i, patch) =>
    set(key, (arr) => arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const del = (key, i) => set(key, (arr) => arr.filter((_, idx) => idx !== i));

  const nombreDe = (lista, id) => lista.find((x) => x.id === Number(id))?.nombre || "";

  const toggleHabilidad = (h) =>
    set("habilidadesBlandas", (arr) =>
      arr.some((x) => x.habilidad_blanda_id === h.id)
        ? arr.filter((x) => x.habilidad_blanda_id !== h.id)
        : [...arr, { habilidad_blanda_id: h.id, nombre: h.nombre }]
    );

  const agregarHabilidadNueva = () => {
    const nombre = nuevaHabilidad.trim();
    if (!nombre) return;
    const existente = cat.habilidades.find((h) => h.nombre.toLowerCase() === nombre.toLowerCase());
    if (existente) { if (!data.habilidadesBlandas.some((x) => x.habilidad_blanda_id === existente.id)) toggleHabilidad(existente); }
    else set("habilidadesBlandas", (arr) => [...arr, { habilidad_blanda_id: "", nombre }]);
    setNuevaHabilidad("");
  };

  const validar = () => {
    if (!data.perfiles.length || data.perfiles.some((p) => !p.perfil_id || !p.nivel))
      return "Completa al menos un perfil técnico con su nivel";
    if (data.idiomas.some((i) => !i.idioma_id || !i.lee || !i.habla || !i.escucha))
      return "Completa los niveles de cada idioma";
    return null;
  };

  const guardar = async () => {
    const error = validar();
    if (error) return toast.error(error);
    try {
      setSaving(true);
      await candidatoRepository.updateMiPerfilProfesional(data);
      const fresco = await candidatoRepository.getMiPerfilProfesional();
      const habilidades = await habilidadBlandaRepository.getAll();
      setCat((c) => ({ ...c, habilidades }));
      setData(fresco);
      setOriginal(fresco);
      setEditando(false);
      toast.success("Perfil profesional actualizado");
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const cancelar = () => { setData(original); setEditando(false); };

  if (loading) return null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Perfil profesional</h2>
          <p className="mt-1 text-sm text-gray-500">Perfiles técnicos, habilidades blandas e idiomas.</p>
        </div>
        {!editando ? (
          <button type="button" onClick={() => setEditando(true)}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={cancelar} disabled={saving}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">Cancelar</button>
            <button type="button" onClick={guardar} disabled={saving}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        )}
      </div>

      {/* PERFILES TÉCNICOS */}
      <h3 className="mb-2 text-sm font-semibold text-gray-700">Perfiles técnicos</h3>
      <div className="space-y-2">
        {data.perfiles.map((p, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_200px_auto]">
            <select disabled={!editando} className={input} value={p.perfil_id}
              onChange={(e) => upd("perfiles", i, { perfil_id: Number(e.target.value) })}>
              <option value="">Selecciona un perfil</option>
              {cat.perfiles.map((x) => (
                <option key={x.id} value={x.id}
                  disabled={data.perfiles.some((o, j) => j !== i && o.perfil_id === x.id)}>{x.nombre}</option>
              ))}
            </select>
            <select disabled={!editando} className={input} value={p.nivel}
              onChange={(e) => upd("perfiles", i, { nivel: e.target.value })}>
              <option value="">Nivel</option>
              {NIVELES_PERFIL.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
            {editando && data.perfiles.length > 1 &&
              <button type="button" className={btnLink} onClick={() => del("perfiles", i)}>Quitar</button>}
          </div>
        ))}
      </div>
      {editando && (
        <button type="button" className={`${btnLink} mt-2`}
          onClick={() => set("perfiles", (a) => [...a, { perfil_id: "", nivel: "" }])}>
          + Agregar perfil
        </button>
      )}

      {/* HABILIDADES BLANDAS */}
      <h3 className="mb-2 mt-8 text-sm font-semibold text-gray-700">Habilidades blandas</h3>
      <div className="flex flex-wrap gap-2">
        {(editando ? cat.habilidades : []).map((h) => {
          const activa = data.habilidadesBlandas.some((x) => x.habilidad_blanda_id === h.id);
          return (
            <button type="button" key={h.id} onClick={() => toggleHabilidad(h)}
              className={`rounded-full border px-3 py-1 text-sm transition ${activa
                ? "border-red-600 bg-red-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-red-300"}`}>
              {h.nombre}
            </button>
          );
        })}
        {/* Habilidades nuevas (aún sin id) y modo lectura */}
        {(editando ? data.habilidadesBlandas.filter((x) => !x.habilidad_blanda_id) : data.habilidadesBlandas)
          .map((h, i) => (
            <span key={`${h.nombre}-${i}`} className="rounded-full bg-red-50 px-3 py-1 text-sm text-red-700">
              {h.nombre}
            </span>
          ))}
        {!editando && !data.habilidadesBlandas.length &&
          <p className="text-sm text-gray-400">Sin habilidades registradas.</p>}
      </div>
      {editando && (
        <div className="mt-3 flex gap-2">
          <input className={input} placeholder="Otra habilidad..." value={nuevaHabilidad}
            onChange={(e) => setNuevaHabilidad(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarHabilidadNueva(); } }} />
          <button type="button" className={btnLink} onClick={agregarHabilidadNueva}>Agregar</button>
        </div>
      )}

      {/* IDIOMAS */}
      <h3 className="mb-2 mt-8 text-sm font-semibold text-gray-700">Idiomas</h3>
      <div className="space-y-2">
        {data.idiomas.map((idm, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_110px_110px_110px_auto]">
            <select disabled={!editando} className={`${input} col-span-2 md:col-span-1`} value={idm.idioma_id}
              onChange={(e) => upd("idiomas", i, { idioma_id: Number(e.target.value) })}>
              <option value="">Idioma</option>
              {cat.idiomas.map((x) => (
                <option key={x.id} value={x.id}
                  disabled={data.idiomas.some((o, j) => j !== i && o.idioma_id === x.id)}>{x.nombre}</option>
              ))}
            </select>
            {["lee", "habla", "escucha"].map((campo) => (
              <select key={campo} disabled={!editando} className={input} value={idm[campo]}
                onChange={(e) => upd("idiomas", i, { [campo]: e.target.value })}>
                <option value="">{campo[0].toUpperCase() + campo.slice(1)}</option>
                {NIVELES_IDIOMA.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            ))}
            {editando && <button type="button" className={btnLink} onClick={() => del("idiomas", i)}>Quitar</button>}
          </div>
        ))}
        {!editando && !data.idiomas.length && <p className="text-sm text-gray-400">Sin idiomas registrados.</p>}
      </div>
      {editando && data.idiomas.length < cat.idiomas.length && (
        <button type="button" className={`${btnLink} mt-2`}
          onClick={() => set("idiomas", (a) => [...a, { idioma_id: "", lee: "", habla: "", escucha: "" }])}>
          + Agregar idioma
        </button>
      )}
    </section>
  );
}