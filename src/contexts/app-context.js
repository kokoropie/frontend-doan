'use client'

import { httpGet } from "@/lib/http";
import { rtrim } from "@/lib/utils";
import localforage from "localforage";
import { createContext, useEffect, useLayoutEffect, useState } from "react";

export const AppContext = createContext(null);
export const AppProvider = ({ children }) => {
  const [routes, setRoutes] = useState({});
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [init, setInit] = useState(false);

  useEffect(() => {
    (async () => {
      await httpGet("routes").then(res => {
        if (res.status === 200) {
          setRoutes(res.data);
        }
      });

      const storedToken = await localforage.getItem("token");
      const storedUser = await localforage.getItem("user");
      const storedRole = await localforage.getItem("role");
      const storedRefreshToken = await localforage.getItem("refreshToken");

      setToken(storedToken);
      setUser(storedUser);
      setRole(storedRole);
      setRefreshToken(storedRefreshToken);
      setInit(true);
    })();
  }, [])

  useLayoutEffect(() => {
    if (init) {
      localforage.setItem("user", user).catch(() => {});
      localforage.setItem("role", role).catch(() => {});
      localforage.setItem("token", token).catch(() => {});
      localforage.setItem("refreshToken", refreshToken).catch(() => {});
    }
  }, [token, user, role, refreshToken, init])

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      httpGet("routes").then(res => {
        if (res.status === 200) {
          setRoutes(res.data);
        }
      }).catch(() => {});
      httpGet("profile").then(res => {
        if (res.status === 200) {
          setUser(res.data.data);
        }
      }).catch(() => {});
    }, 120 * 1000)
    return () => clearInterval(interval);
  }, [token])

  return (
    <AppContext.Provider value={{
      loading: !init,
      init,
      token,
      setToken,
      user,
      setUser,
      role,
      setRole,
      refreshToken,
      setRefreshToken,
      getRoute(route, replacements = {}, withApi = false) {
        const routeKeyWithRole = `api.${role}.${route}`;
        const routeKeyWithoutRole = `api.${route}`;
        const str = routes[routeKeyWithRole] ?? routes[routeKeyWithoutRole] ?? route;
        let index = 0;
        return (withApi ? rtrim(process.env.NEXT_PUBLIC_BACKEND_BASE_URL, "/") + "/api/" : "") + str.replace(/\{(\w+)\}/g, (match, key) => {
          if (Array.isArray(replacements)) {
            return replacements[index++] ?? match;
          }
          return replacements[key] ?? match;
        });
      },
      hasRole(...roles) {
        if (Array.isArray(roles[0])) {
          roles = roles[0];
        }
        return roles.includes(role);
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};