import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import * as XLSX from "xlsx";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const limpiar = (s = "") => String(s ?? "").replace(/\s+/g, " ").trim();
const sinTildes = (s = "") =>
    limpiar(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// ── PDF (listado UFPS) ───────────────────────────────────────────────────────
const leerPDF = async (file) => {
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let texto = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        texto += content.items.map((it) => it.str).join(" ") + "\n";
    }
    return texto;
};

const parsearPDF = async (file) => {
    const texto = await leerPDF(file);
    const regex =
        /(\d{7})\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)\s+([A-Za-z0-9._%+-]+@ufps\.edu\.co)/g;
    const alumnos = [];
    let m;
    while ((m = regex.exec(texto)) !== null) {
        alumnos.push({ codigo: m[1], nombre: limpiar(m[2]), correo: m[3].toLowerCase() });
    }
    return alumnos;
};

// ── Excel (ESTUDIANTES PRACTICAS) ────────────────────────────────────────────
// Columnas: N°, CÓDIGO, CEDULA, NOMBRE, APELLIDO, CORREO INSTITUCIONAL, N° CELULAR
const parsearExcel = async (file) => {
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const alumnos = [];

    wb.SheetNames.forEach((nombreHoja) => {
        const filas = XLSX.utils.sheet_to_json(wb.Sheets[nombreHoja], {
            header: 1,
            defval: "",
        });

        // Buscar la fila de encabezados (no está siempre en la fila 1)
        const idxHeader = filas.findIndex((f) => {
            const celdas = f.map(sinTildes);
            return celdas.includes("codigo") && celdas.some((c) => c.startsWith("correo"));
        });
        if (idxHeader === -1) return;

        const headers = filas[idxHeader].map(sinTildes);
        const col = (pred) => headers.findIndex(pred);

        const iCodigo = col((h) => h === "codigo");
        const iNombre = col((h) => h === "nombre" || h === "nombres");
        const iApellido = col((h) => h === "apellido" || h === "apellidos");
        const iCorreo = col((h) => h.startsWith("correo"));
        const iCedula = col((h) => h === "cedula");
        const iCelular = col((h) => h.includes("celular"));

        filas.slice(idxHeader + 1).forEach((f) => {
            const codigo = limpiar(f[iCodigo]);
            const correo = limpiar(f[iCorreo]).toLowerCase();
            if (!codigo && !correo) return; // fila vacía

            alumnos.push({
                codigo,
                nombre: limpiar(`${f[iNombre] ?? ""} ${iApellido >= 0 ? f[iApellido] : ""}`),
                correo,
                cedula: iCedula >= 0 ? limpiar(f[iCedula]) : "",
                celular: iCelular >= 0 ? limpiar(f[iCelular]) : "",
            });
        });
    });

    return alumnos;
};

export const parsearListado = async (file) => {
    const nombre = file.name.toLowerCase();
    if (nombre.endsWith(".pdf")) return parsearPDF(file);
    if (nombre.endsWith(".xlsx") || nombre.endsWith(".xls")) return parsearExcel(file);
    throw new Error("FORMATO_NO_SOPORTADO");
};

export const leerExcelCrudo = async (file) => {
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });

    for (const nombre of wb.SheetNames) {
        const filas = XLSX.utils
            .sheet_to_json(wb.Sheets[nombre], { header: 1, defval: "" })
            .filter((f) => f.some((c) => String(c).trim() !== ""));

        if (filas.length === 0) continue;

        // Quitamos columnas completamente vacías para que la tabla sea compacta
        const maxCols = Math.max(...filas.map((f) => f.length));
        const usadas = [];
        for (let c = 0; c < maxCols; c++) {
            if (filas.some((f) => String(f[c] ?? "").trim() !== "")) usadas.push(c);
        }
        return filas.map((f) => usadas.map((c) => f[c] ?? ""));
    }

    return [];
};