export type EstadoCita = 'solicitada' | 'confirmada' | 'atendida' | 'rechazada' | 'cancelada';

export type Cita = {
  id: number;
  mascota: string;
  cliente: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: EstadoCita;
  nuevaCita?: boolean;
};

export type NuevaCita = {
  mascota: string;
  cliente: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado?: EstadoCita;
};