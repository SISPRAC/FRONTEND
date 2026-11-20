import {
  forgotPasswordRequest,
  resetPasswordRequest,
  googleLoginRequest
} from "../api/auth.api.js";


export const passwordResetRepository = {

  async forgotPassword(data) {

    const response =
      await forgotPasswordRequest(data);

    return response.data;
  },


  async resetPassword(data) {

    const response =
      await resetPasswordRequest(data);

    return response.data;
  },

  async googleLogin(idToken) {
    const response = await googleLoginRequest({ idToken });
    return response.data;
  },

};