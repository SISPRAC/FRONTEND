import axios from "axios";

const convenioApi = axios.create({
  baseURL: "http://localhost:3000/api/convenio",
  withCredentials: true
});

export const getConveniosRequest = () => convenioApi.get("/all");

export const getConvenioRequest = (id) => {
  return convenioApi.get(`/${id}`);
};

export const actualizarEstadoConvenioRequest = (id, data) => {
    return convenioApi.put(
        `/${id}/estado`,
        data
    );
};
 
