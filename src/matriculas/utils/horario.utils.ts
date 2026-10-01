export function existeTraslapeHorario(
  h1: { diaSemana: string; horaInicio: string; horaFin: string },
  h2: { diaSemana: string; horaInicio: string; horaFin: string },
): boolean {
  if (h1.diaSemana !== h2.diaSemana) return false;

  // Convierte "08:30" a minutos totales (8 * 60 + 30 = 510)
  const aInicio = timeToMinutes(h1.horaInicio);
  const aFin = timeToMinutes(h1.horaFin);
  const bInicio = timeToMinutes(h2.horaInicio);
  const bFin = timeToMinutes(h2.horaFin);

  return aInicio < bFin && aFin > bInicio;
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
