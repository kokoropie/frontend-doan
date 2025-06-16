import axios from "axios";
import { ltrim, rtrim } from "./utils";
import localforage from "localforage";
import nProgress from "nprogress";
import { toast } from "sonner";

const baseUrl = rtrim(process.env.NEXT_PUBLIC_BACKEND_BASE_URL, "/") + "/api";

const axiosInstance = axios.create({
  baseURL: baseUrl
})

axiosInstance.interceptors.request.use(async (config) => {
  config.headers["Accept-Language"] = "vi";
  const token = await localforage.getItem("token");
  const refreshToken = await localforage.getItem("refreshToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["X-Refresh-Token"] = refreshToken ?? null;
  }
  nProgress.start();
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    nProgress.done();
    return response;
  },
  (error) => {
    nProgress.done();
    return Promise.reject(error);
  }
);

export async function http(method = 'get', url, data = {}, options = {}, doCatch = true) {
  url = ltrim(url, "/");
  return axiosInstance({ method, url, data, ...options }).then((response) => {
    const data = response.data;
    const dataData = data.data || data;
    if (dataData.token) {
      document.cookie = `token=${dataData.token}; path=/; expires=${new Date(dataData.expires_at * 1000)}`;
    }
    if (dataData.refresh_token) {
      localforage.setItem("refreshToken", dataData.refresh_token);
    }
    if (data.token) {
      document.cookie = `token=${data.token}; path=/; expires=${new Date(data.expires_at * 1000)}`;
    }
    if (data.refresh_token) {
      localforage.setItem("refreshToken", data.refresh_token);
    }
    return response
  }).catch((error) => {
    if (doCatch) {
      const response = error.response;
      if (response) {
        const data = response.data;
        if (data.errors) {
          Object.keys(data.errors).forEach((key) => {
            toast.error(data.errors[key][0]);
          });
        } else if (data.message) {
          toast.error(data.message);
        } else {
          toast.error("Có lỗi xảy ra trong quá trình kết nối đến máy chủ. Vui lòng thử lại sau.");
        }
      } else {
        toast.error("Có lỗi xảy ra trong quá trình kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }
    throw error;
  });
}

export function httpGet(url, options = {}, doCatch = true) {
  return http("get", url, {}, options, doCatch);
}

export function httpPost(url, data = {}, options = {}, method = 'POST', doCatch = true) {
  if (method.toUpperCase() !== 'POST') {
    if (data instanceof FormData) {
      data.append("_method", method);
      options.headers = {
        ...options.headers,
        'Content-Type': 'multipart/form-data',
      }
    } else {
      try {
        data["_method"] = method;
      } catch (e) {
        console.error(e);
      }
    }
  }

  return http("post", url, data, options, doCatch);
}

export function httpPut(url, data = {}, options = {}, doCatch = true) {
  return httpPost(url, data, options, 'PUT', doCatch);
}

export function httpPatch(url, data = {}, options = {}, doCatch = true) {
  return httpPost(url, data, options, 'PATCH', doCatch);
}

export function httpDelete(url, data = {}, options = {}, doCatch = true) {
  return httpPost(url, data, options, 'DELETE', doCatch);
}

export default {
  http,
  httpGet,
  httpPost,
  httpPut,
  httpPatch,
  httpDelete
}