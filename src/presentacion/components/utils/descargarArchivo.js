// Descarga real: trae el archivo como blob y fuerza la descarga
// (el atributo "download" no funciona con URLs de otro dominio).
export async function descargarArchivo(url, nombreBase = "documento") {

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error("No se pudo descargar el archivo");
    }

    const blob = await respuesta.blob();

    const ruta = url.split("?")[0];
    const punto = ruta.lastIndexOf(".");
    const extension =
        punto !== -1 && ruta.length - punto <= 6
            ? ruta.slice(punto)
            : "";

    const objectUrl = URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = objectUrl;
    enlace.download = `${nombreBase}${extension}`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

}