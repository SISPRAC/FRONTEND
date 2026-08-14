export const getPracticantes = async ({ practicanteRepository }) => {

    const practicantes = await practicanteRepository.getAll();


    return practicantes.map((practicante) => {

        const candidato = practicante.candidato;
        const usuario = candidato?.Usuario;

        return {
            id: practicante.id,

            tipoDoc: usuario?.tipo_documento || "",
            numDoc: usuario?.cedula || "",

            nombres: usuario?.nombres || "",
            apellidos: usuario?.apellidos || "",

            fechaNac: practicante.fecha_nacimiento || "",
            sexo: practicante.genero || "",

            eps: practicante.eps || "",

            codDepto: practicante.codigoDepResidencia?.trim() || "",
            codMunicipio: practicante.codigoMunResidencia?.trim() || "",

            direccion: practicante.direccion || "",

            telefono: usuario?.telefono || "",
            correo: usuario?.correo || ""
        };
    });
};