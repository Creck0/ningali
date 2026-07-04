import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const DataContext = createContext(null);

const emptyDashboard = { usagePerMonth: [], usagePerRegion: [], fuelTrend: [] };

export function DataProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [serviceLogs, setServiceLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookings = useCallback(() => api.get("/bookings").then(({ data }) => setBookings(data.data)), []);
  const fetchVehicles = useCallback(() => api.get("/vehicles").then(({ data }) => setVehicles(data.data)), []);
  const fetchFuelLogs = useCallback(() => api.get("/fuel-logs").then(({ data }) => setFuelLogs(data.data)), []);
  const fetchServiceLogs = useCallback(() => api.get("/service-logs").then(({ data }) => setServiceLogs(data.data)), []);
  const fetchDashboard = useCallback(() => api.get("/dashboard").then(({ data }) => setDashboard(data.data)), []);
  const fetchActivityLogs = useCallback(() => {
    if (user?.role !== "admin") return Promise.resolve();
    return api.get("/activity-logs").then(({ data }) => setActivityLogs(data.data));
  }, [user]);

  // Initial load once a user is authenticated — every page reads from this
  // shared store instead of each screen fetching its own slice.
  useEffect(() => {
    if (!isAuthenticated) {
      setBookings([]);
      setVehicles([]);
      setDrivers([]);
      setApprovers([]);
      setRegions([]);
      setFuelLogs([]);
      setServiceLogs([]);
      setActivityLogs([]);
      setDashboard(emptyDashboard);
      return;
    }

    setIsLoading(true);
    Promise.all([
      fetchBookings(),
      fetchVehicles(),
      fetchFuelLogs(),
      fetchServiceLogs(),
      fetchDashboard(),
      fetchActivityLogs(),
      api.get("/drivers").then(({ data }) => setDrivers(data.data)),
      api.get("/approvers").then(({ data }) => setApprovers(data.data)),
      api.get("/regions").then(({ data }) => setRegions(data.data)),
    ]).finally(() => setIsLoading(false));
  }, [isAuthenticated, fetchBookings, fetchVehicles, fetchFuelLogs, fetchServiceLogs, fetchDashboard, fetchActivityLogs]);

  async function addBooking(form) {
    const { data } = await api.post("/bookings", form);
    await Promise.all([fetchBookings(), fetchDashboard()]);
    return data.data;
  }

  async function decideBooking(id, decision, note = "") {
    await api.post(`/bookings/${id}/decision`, { decision, note });
    await Promise.all([fetchBookings(), fetchVehicles(), fetchActivityLogs()]);
  }

  async function completeBooking(id, { odometerEnd, liters, cost }) {
    await api.post(`/bookings/${id}/complete`, { odometerEnd, liters, cost });
    await Promise.all([fetchBookings(), fetchVehicles(), fetchFuelLogs(), fetchActivityLogs(), fetchDashboard()]);
  }

  async function addFuelLog(entry) {
    await api.post("/fuel-logs", entry);
    await Promise.all([fetchFuelLogs(), fetchActivityLogs(), fetchDashboard()]);
  }

  async function addServiceLog(entry) {
    await api.post("/service-logs", entry);
    await Promise.all([fetchServiceLogs(), fetchActivityLogs()]);
  }

  async function updateVehicleStatus(id, status) {
    await api.patch(`/vehicles/${id}/status`, { status });
    await Promise.all([fetchVehicles(), fetchActivityLogs()]);
  }

  async function exportBookingsReport(from, to) {
    const response = await api.get("/reports/bookings/export", {
      params: { from, to },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-pemesanan_${from}_${to}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  const approversL1 = approvers.filter((a) => a.level === 1);
  const approversL2 = approvers.filter((a) => a.level === 2);

  return (
    <DataContext.Provider
      value={{
        bookings,
        vehicles,
        drivers,
        approversL1,
        approversL2,
        regions,
        fuelLogs,
        serviceLogs,
        activityLogs,
        dashboard,
        isLoading,
        addBooking,
        decideBooking,
        completeBooking,
        addFuelLog,
        addServiceLog,
        updateVehicleStatus,
        exportBookingsReport,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
