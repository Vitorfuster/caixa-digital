export const formatDate = (date) => {
  const data = new Date(date);

  // Formata para o padrão brasileiro
  const dataFormatada = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return dataFormatada;
};

export const formatDateShort = (date) => {
  const data = new Date(date);

  // Formata para o padrão brasileiro
  const dataFormatada = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return dataFormatada;
};

export const formatHour = (hourIn) => {
  const hour = new Date(hourIn);

  // Formata apenas horas e minutos no padrão brasileiro
  const hourFormatada = hour.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24h
    timeZone: "America/Sao_Paulo", // garante horário do Brasil
  });

  return hourFormatada;
};

export const formatDateFull = (date) => {
  const data = new Date(date);

  // Formata para o padrão brasileiro
  const dataFormatada = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return dataFormatada;
};
