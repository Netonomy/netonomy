import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// const MAX_RETRIES = 3;
// let RETRY_COUNT = 0;

/**
 * Axios interceptors for handling authentication and refreshing tokens
 *
 * Note: we have to use localStorage here to access tokens in every request and response,
 * since we can't use useAtom in the axios interceptors
 */

api.interceptors.request.use(
  (config) => {
    console.log(JSON.parse(localStorage.getItem("auth-state") || "{}"));
    const appState = JSON.parse(localStorage.getItem("auth-state") || "{}");

    if (appState?.state.token) {
      // Ensure config.headers is defined
      config.headers = config.headers || {};

      // Set the Authorization header on the config object
      config.headers["Authorization"] = `Bearer ${appState.state.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// const refreshUrlSuffix = "v1/auth/refresh-token";
// const refreshUrl = `${process.env.REACT_APP_API_URI}/${refreshUrlSuffix}`;

// api.interceptors.response.use(
//   (response) => {
//     const appVersion = localStorage.getItem("app-version") || "1.0.0";
//     if (response.headers["x-version"] !== appVersion) {
//       window.localStorage.setItem("version-update-needed", "true");
//       window.localStorage.setItem("app-version", response.headers["x-version"]);
//     }

//     if (
//       response.status === 200 &&
//       response.config.url?.includes(refreshUrlSuffix) &&
//       response.data.accessToken &&
//       response.data.refreshToken
//     ) {
//       localStorage.setItem("token", JSON.stringify(response.data));

//       axios.defaults.headers.common[
//         "Authorization"
//       ] = `Bearer ${response.data.accessToken}`;
//     }

//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     const token = JSON.parse(localStorage.getItem("token") || "{}");

//     if (
//       error.response.status === 401 &&
//       ["Refresh token has expired", "No user found"].includes(
//         error.response.data.message
//       ) &&
//       originalRequest.url.includes(refreshUrlSuffix)
//     ) {
//       window.location.href = "/login";
//     } else if (
//       error.response.status === 401 &&
//       error.response.data.message === "Access token has expired" &&
//       !originalRequest._retry &&
//       RETRY_COUNT < MAX_RETRIES
//     ) {
//       RETRY_COUNT++;
//       originalRequest._retry = true;
//       const refreshToken = token?.refreshToken;

//       const refreshResponse = await axios.post(refreshUrl, {
//         refreshToken,
//       });

//       localStorage.setItem("token", JSON.stringify(refreshResponse.data));

//       axios.defaults.headers.common[
//         "Authorization"
//       ] = `Bearer ${refreshResponse.data.accessToken}`;

//       originalRequest.headers[
//         "Authorization"
//       ] = `Bearer ${refreshResponse.data.accessToken}`;

//       return axios(originalRequest);
//     }

//     return Promise.reject(error);
//   }
// );

export default api;
