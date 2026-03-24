import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../../services/api";

import { formatDate } from "../../utils/FomatData";

import { Container } from "./style";

export function CloseBox() {
  const [searchParams] = useSearchParams();
  const [daily, setDaily] = useState();

  // Váriaveis de urls opcionais
  const day = searchParams.get("day");
  if (!day) {
    const data = new Date();
    const dataFormatada = formatDate(data).replaceAll("/", "-");
    window.location.replace(`closebox?day=${dataFormatada}`);
  }

  function criarData(dataString) {
    const partes = dataString.split("-");

    if (partes.length !== 3) return null;

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);

    const data = new Date(ano, mes - 1, dia);

    // valida se a data realmente existe
    if (
      data.getFullYear() !== ano ||
      data.getMonth() !== mes - 1 ||
      data.getDate() !== dia
    ) {
      return null;
    }

    return data;
  }

  useEffect(() => {
    const findItens = async () => {
      // Busca a diária no banco de dados como array
      const { data } = await api.get(`/daily/${criarData(day)}`);

      setDaily(data);
    };

    findItens();
  }, []);

  console.log("Diaria data: ", day, "itens: ", daily);

  return (
    <Container>
      <h1>Fechar caixa página</h1>
    </Container>
  );
}
