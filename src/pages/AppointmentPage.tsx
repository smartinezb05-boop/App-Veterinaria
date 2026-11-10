import { useEffect, useState } from "react";
import { AppointmentCard } from "../components/AppointmentCard";
import { StatCard } from "../components/StatCard";
import { actualizarEstado, obtenerCitas, crearCita } from "../services/citasApi";
import type { Cita, EstadoCita, NuevaCita } from "../types";

type Filtro = "todas" | EstadoCita;

export function AppointmentsPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  // Estados para el formulario de nueva cita
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState<NuevaCita>({
    mascota: "",
    cliente: "",
    servicio: "",
    fecha: "",
    hora: ""
  });

  useEffect(() => {
    async function cargarCitas() {
      try {
        setCargando(true);
        setCitas(await obtenerCitas());
      } catch (error) {
        setError(error instanceof Error ? error.message : "Ocurrió un error.");
      } finally {
        setCargando(false);
      }
    }
    void cargarCitas();
  }, []);

  async function confirmarCita(id: number) {
    try {
      const actualizada = await actualizarEstado(id, "confirmada");
      setCitas((actuales) =>
        actuales.map((cita) => (cita.id === id ? actualizada : cita)),
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al confirmar.");
    }
  }

  // Función que conecta el formulario con tu backend
  async function registrarNuevaCita(e: React.FormEvent) {
    e.preventDefault();
    try {
      const citaCreada = await crearCita(formData);
      // Actualizamos el estado agregando la nueva cita para no recargar la página
      setCitas([...citas, citaCreada]); 
      setMostrarFormulario(false);
      setFormData({ mascota: "", cliente: "", servicio: "", fecha: "", hora: "" });
      setMensaje("Cita registrada exitosamente.");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al registrar cita.");
      setTimeout(() => setError(""), 3000);
    }
  }

  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [mensaje, setMensaje] = useState("");

  const citasFiltradas =
    filtro === "todas" ? citas : citas.filter((cita) => cita.estado === filtro);

  const pendientes = citas.filter((c) => c.estado === "solicitada").length;
  const confirmadas = citas.filter((c) => c.estado === "confirmada").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Agenda de citas</h2>
          <p className="mt-1 text-slate-600">
            Consulta y administra las citas del día.
          </p>
        </div>
        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 transition-colors"
        >
          {mostrarFormulario ? "Cancelar registro" : "+ Nueva cita"}
        </button>
      </section>

      {/* Formulario que se despliega al dar clic en Nueva cita */}
      {mostrarFormulario && (
        <form onSubmit={registrarNuevaCita} className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Mascota</label>
            <input required type="text" value={formData.mascota} onChange={e => setFormData({...formData, mascota: e.target.value})} className="mt-1 w-full rounded-lg border border-slate-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Cliente</label>
            <input required type="text" value={formData.cliente} onChange={e => setFormData({...formData, cliente: e.target.value})} className="mt-1 w-full rounded-lg border border-slate-300 p-2" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Servicio</label>
            <input required type="text" value={formData.servicio} onChange={e => setFormData({...formData, servicio: e.target.value})} className="mt-1 w-full rounded-lg border border-slate-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Fecha</label>
            <input required type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} className="mt-1 w-full rounded-lg border border-slate-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Hora</label>
            <input required type="time" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} className="mt-1 w-full rounded-lg border border-slate-300 p-2" />
          </div>
          <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setMostrarFormulario(false)} className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-teal-700 px-6 py-2 font-medium text-white hover:bg-teal-800">
              Guardar Cita
            </button>
          </div>
        </form>
      )}

      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard titulo="Citas de hoy" valor={citas.length} color="text-teal-700" />
        <StatCard titulo="Pendientes" valor={pendientes} color="text-amber-600" />
        <StatCard titulo="Confirmadas" valor={confirmadas} color="text-green-600" />
      </section>

      <section className="mt-8">
        <label htmlFor="filtro" className="mb-2 block font-semibold text-slate-700">
          Filtrar por estado
        </label>
        <select
          id="filtro"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as Filtro)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 sm:w-64"
        >
          <option value="todas">Todas</option>
          <option value="solicitada">Solicitadas</option>
          <option value="confirmada">Confirmadas</option>
          <option value="atendida">Atendidas</option>
        </select>
      </section>

      {mensaje && (
        <p aria-live="polite" className="mt-6 rounded-xl bg-green-100 px-4 py-3 text-green-800">
          {mensaje}
        </p>
      )}
      {error && (
        <p aria-live="polite" className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-red-800">
          {error}
        </p>
      )}

      <section className="mt-6 grid gap-4">
        {citasFiltradas.length > 0 ? (
          citasFiltradas.map((cita) => (
            <AppointmentCard key={cita.id} cita={cita} onConfirmar={confirmarCita} />
          ))
        ) : (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500">
            No se encontraron citas con ese estado.
          </p>
        )}
      </section>
    </main>
  );
}