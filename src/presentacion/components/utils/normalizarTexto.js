/**
 * "  cARlos   aNDRés " -> "Carlos Andrés"
 * Para nombres y apellidos.
 */
export const normalizarNombre = (valor = "") =>
  valor
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-CO")
    .replace(
      /(^|[\s'-])(\p{L})/gu,
      (_, sep, letra) => sep + letra.toLocaleUpperCase("es-CO")
    );

const CONECTORES = new Set([
  "de", "del", "la", "las", "el", "los", "y", "e", "o", "u",
  "en", "para", "con", "a", "al", "por",
]);

// Siglas que deben quedar en mayúscula completa
const SIGLAS = new Set([
  "ti", "it", "ceo", "cto", "cio", "cfo", "coo", "rrhh", "qa", "ux", "ui", "erp", "crm",
]);

/**
 * "  ingeniero DE   redes " -> "Ingeniero de Redes"
 * "jefe de ti"             -> "Jefe de TI"
 * Para cargos.
 */
export const normalizarCargo = (valor = "") =>
  valor
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-CO")
    .split(" ")
    .map((palabra, i) => {
      if (SIGLAS.has(palabra)) return palabra.toLocaleUpperCase("es-CO");
      if (i > 0 && CONECTORES.has(palabra)) return palabra;
      return palabra.replace(
        /(^|[-'])(\p{L})/gu,
        (_, sep, letra) => sep + letra.toLocaleUpperCase("es-CO")
      );
    })
    .join(" ");

    /**
 * Descripción: limpia espacios y mayúscula al inicio de cada oración.
 * "  desarrollo web.   trabajo en equipo " -> "Desarrollo web. Trabajo en equipo"
 * Respeta los saltos de línea.
 */
export const normalizarDescripcion = (valor = "") =>
  valor
    .replace(/[ \t]+/g, " ")        // espacios repetidos
    .replace(/ *\n */g, "\n")       // espacios alrededor de saltos de línea
    .replace(/\n{3,}/g, "\n\n")     // máximo una línea en blanco seguida
    .trim()
    .replace(
      /(^|[.!?]\s+|\n)(\p{Ll})/gu,
      (_, sep, letra) => sep + letra.toLocaleUpperCase("es-CO")
    );