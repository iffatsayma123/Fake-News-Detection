import axios from "axios";


/*
============================================================
TRUTHLENS BACKEND API
============================================================
*/

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});


/*
============================================================
AUTHENTICATION INTERCEPTOR
============================================================
*/

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("token");


    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }


    return config;

  },

  (error) => {

    return Promise.reject(
      error
    );

  }
);


/*
============================================================
AUTOMATIC FULL PROJECT WAKE-UP
============================================================

Opening the frontend will call this function.

Flow:

Frontend
   ↓
Express Backend
   ↓
FastAPI AI Service
   ↓
BERT V4 QUInt8 + EfficientNet V2

IMPORTANT:

The API base URL already contains "/api".

Example production base URL:

https://your-backend.onrender.com/api

Therefore we call:

/health/full

NOT:

/api/health/full

============================================================
*/

export const wakeFullProject =
  async () => {

    try {

      console.log(
        "Starting TruthLens services..."
      );


      const response =
        await api.get(
          "/health/full",
          {

            /*
            Render Free services can require
            additional time after sleeping.
            */

            timeout:
              130000,
          }
        );


      console.log(
        "TruthLens startup status:",
        response.data
      );


      if (
        response.data?.project ===
        "ready"
      ) {

        console.log(
          "TruthLens is ready."
        );

      } else {

        console.log(
          "TruthLens AI service is still starting..."
        );

      }


      return response.data;


    } catch (error) {

      /*
      --------------------------------------------------------
      DO NOT BREAK THE WEBSITE
      --------------------------------------------------------

      The backend or AI service may still
      be waking on Render.

      The user can continue using the UI
      while the services start.
      --------------------------------------------------------
      */

      console.log(
        "TruthLens services are waking up..."
      );


      if (
        error.response
      ) {

        console.log(
          "Startup response status:",
          error.response.status
        );

      }


      return {

        success:
          false,

        backend:
          "starting",

        ai:
          "starting",

        project:
          "starting",

        message:
          "TruthLens services are waking up",
      };

    }

  };


/*
============================================================
EXPORT API CLIENT
============================================================
*/

export default api;