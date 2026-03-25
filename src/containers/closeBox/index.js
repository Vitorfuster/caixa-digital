import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../../services/api";

import { formatDate } from "../../utils/FomatData";

import {
  Container,
  Header,
  ContentContainer,
  TableSection,
  Table,
  Thead,
  Tbody,
  Th,
  Td,
} from "./style";

export function CloseBox() {
  const [searchParams] = useSearchParams();
  const [daily, setDaily] = useState();
  const [expenses, setExpenses] = useState();
  const [observations, setObservations] = useState();
  const [resume, setResume] = useState();

  const [stock, setStock] = useState({});

  const [fechamento, setFechamento] = useState({});

  const stockMap = [
    { key: "p13", label: "P13" },
    { key: "p45", label: "P45" },
    { key: "aguas", label: "ÁGUAS" },
  ];

  const fechamentoMap = [
    { key: "p13_portaria", label: "P13 portaria" },
    { key: "p13_entrega", label: "P13 entrega" },
    { key: "p13_completo", label: "P13 completo" },
    { key: "p13_vazio", label: "P13 vazio" },
    { key: "p45", label: "P45" },
    { key: "p45_completo", label: "P45 completo" },
    { key: "p45_vazio", label: "P45 vazio" },
    { key: "agua_portaria", label: "Água portaria" },
    { key: "agua_entrega", label: "Água entrega" },
    { key: "agua_completo", label: "Água completo" },
    { key: "agua_vazio", label: "Água galão" },
    { key: "total", label: "Total" },
  ];

  const formatMoney = (val) => {
    if (!val && val !== 0) return "";
    let num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

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
      let obs = [];

      try {
        // Busca a diária no banco de dados como array
        const { data: diaria } = await api.get(`/daily/${criarData(day)}`);
        const { data: estoque } = await api.get("/stock");
        const { data: items } = await api.get("/item");
        const { data: despesas } = await api.get(`/expense/${criarData(day)}`);
        const { data: movement } = await api.get(`/movement/${criarData(day)}`);

        // Envia as despesas para o estado
        setExpenses(despesas);

        // Mapeia as observações no array
        movement.forEach((line) => {
          obs.push(
            `${line.type === "in" ? "Entrada" : "Saida"} ${line.quantity} ${line.item.name}`,
          );
        });

        // Filtra o estoque para os dados importantes
        let newStock = {
          p13: { cheio: undefined, vazio: undefined, estoque: undefined },
          p45: { cheio: undefined, vazio: undefined, estoque: undefined },
          aguas: { cheio: undefined, vazio: undefined, estoque: undefined },
        };
        estoque.forEach((line) => {
          if (line.item_id === 5) {
            newStock.p13.cheio = line.quantity;
          }

          if (line.item_id === 2) {
            newStock.p13.vazio = line.quantity;
          }

          if (line.item_id === 8) {
            newStock.p45.cheio = line.quantity;
          }

          if (line.item_id === 9) {
            newStock.p45.vazio = line.quantity;
          }

          if (line.item_id === 6) {
            newStock.aguas.cheio = line.quantity;
          }

          if (line.item_id === 4) {
            newStock.aguas.vazio = line.quantity;
          }
        });

        // Somando o valor de estoque
        newStock.p13.estoque = newStock.p13.cheio + newStock.p13.vazio;
        newStock.p45.estoque = newStock.p45.cheio + newStock.p45.vazio;
        newStock.aguas.estoque = newStock.aguas.cheio + newStock.aguas.vazio;

        // Reverter o estoque para 1 dia atrás (padrão de envio)
        diaria.forEach((day) => {
          if (day.item_id === 1) {
            newStock.p13.cheio += day.quantity;
            newStock.p13.vazio -= day.quantity;
          }

          if (day.item_id === 5) {
            newStock.p13.cheio += day.quantity;
          }

          if (day.item_id === 2) {
            newStock.p13.vazio += day.quantity;
          }

          if (day.item_id === 3) {
            newStock.aguas.cheio += day.quantity;
            newStock.aguas.vazio -= day.quantity;
          }

          if (day.item_id === 6) {
            newStock.aguas.cheio += day.quantity;
          }

          if (day.item_id === 4) {
            newStock.aguas.vazio += day.quantity;
          }

          if (day.item_id === 7) {
            newStock.p45.cheio += day.quantity;
            newStock.p45.vazio -= day.quantity;
          }

          if (day.item_id === 8) {
            newStock.p45.cheio += day.quantity;
          }

          if (day.item_id === 9) {
            newStock.p45.vazio += day.quantity;
          }
        });
        setStock(newStock);

        // Mapeamento fechamento
        let newFechamento = {};
        let resumeArray = { money: 0, card: 0, pix: 0, expense: 0, term: 0 };

        diaria.forEach((day, index) => {
          const itemInformations = items.filter(
            (item) => item.id === day.item_id,
          );

          if (index === 0) {
            console.log("INDEX 0");
            newFechamento = {
              ...newFechamento,
              total: {
                total: 0,
                lucro: 0,
              },
            };
          }

          // Gás P13 PORTARIA / ENTREGA
          if (day.item_id === 1 && day.location === "Portaria") {
            if (newFechamento.p13_portaria) {
              newFechamento.p13_portaria.quantidade += day.quantity;
              newFechamento.p13_portaria.total += day.total;

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.p13_portaria.media -
                  newFechamento.p13_portaria.custo) *
                day.quantity;

              newFechamento.p13_portaria.media =
                newFechamento.p13_portaria.total /
                newFechamento.p13_portaria.quantidade;

              newFechamento.p13_portaria.lucro =
                (newFechamento.p13_portaria.media -
                  newFechamento.p13_portaria.custo) *
                newFechamento.p13_portaria.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                p13_portaria: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          } else if (day.item_id === 1 && day.location === "Entrega") {
            if (newFechamento.p13_entrega) {
              newFechamento.p13_entrega.quantidade += day.quantity;
              newFechamento.p13_entrega.total += day.total;
              console.log("TOTAL DE ENTREGA", day.total);

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.p13_entrega.media -
                  newFechamento.p13_entrega.custo) *
                day.quantity;

              newFechamento.p13_entrega.media =
                newFechamento.p13_entrega.total /
                newFechamento.p13_entrega.quantidade;

              newFechamento.p13_entrega.lucro =
                (newFechamento.p13_entrega.media -
                  newFechamento.p13_entrega.custo) *
                newFechamento.p13_entrega.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                p13_entrega: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          }

          // Água 20L PORTARIA / ENTREGA
          if (day.item_id === 3 && day.location === "Portaria") {
            // const itemInformations = items.filter(
            //   (item) => item.id === day.item_id,
            // );

            if (newFechamento.agua_portaria) {
              newFechamento.agua_portaria.quantidade += day.quantity;
              newFechamento.agua_portaria.total += day.total;

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.agua_portaria.media -
                  newFechamento.agua_portaria.custo) *
                day.quantity;

              newFechamento.agua_portaria.media =
                newFechamento.agua_portaria.total /
                newFechamento.agua_portaria.quantidade;

              newFechamento.agua_portaria.lucro =
                (newFechamento.agua_portaria.media -
                  newFechamento.agua_portaria.custo) *
                newFechamento.agua_portaria.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                agua_portaria: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };

              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          } else if (day.item_id === 3 && day.location === "Entrega") {
            if (newFechamento.agua_entrega) {
              newFechamento.agua_entrega.quantidade += day.quantity;
              newFechamento.agua_entrega.total += day.total;

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.agua_entrega.media -
                  newFechamento.agua_entrega.custo) *
                day.quantity;

              newFechamento.agua_entrega.media =
                newFechamento.agua_entrega.total /
                newFechamento.agua_entrega.quantidade;

              newFechamento.agua_entrega.lucro =
                (newFechamento.agua_entrega.media -
                  newFechamento.agua_entrega.custo) *
                newFechamento.agua_entrega.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                agua_entrega: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          }

          // Gás COMPLETO
          if (day.item_id === 5) {
            obs.push(`Venda ${day.quantity} ${day.item.name}`);

            if (newFechamento.p13_completo) {
              newFechamento.p13_completo.quantidade += day.quantity;
              newFechamento.p13_completo.total += day.total;

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.p13_completo.media -
                  newFechamento.p13_completo.custo) *
                day.quantity;

              newFechamento.p13_completo.media =
                newFechamento.p13_completo.total /
                newFechamento.p13_completo.quantidade;

              newFechamento.p13_completo.lucro =
                (newFechamento.p13_completo.media -
                  newFechamento.p13_completo.custo) *
                newFechamento.p13_completo.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                p13_completo: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          }

          // Água COMPLETO
          if (day.item_id === 6) {
            obs.push(`Venda ${day.quantity} ${day.item.name}`);

            if (newFechamento.agua_completo) {
              newFechamento.agua_completo.quantidade += day.quantity;
              newFechamento.agua_completo.total += day.total;

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.agua_completo.media -
                  newFechamento.agua_completo.custo) *
                day.quantity;

              newFechamento.agua_completo.media =
                newFechamento.agua_completo.total /
                newFechamento.agua_completo.quantidade;

              newFechamento.agua_completo.lucro =
                (newFechamento.agua_completo.media -
                  newFechamento.agua_completo.custo) *
                newFechamento.agua_completo.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                agua_completo: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          }

          // Gás VAZIO
          if (day.item_id === 2) {
            obs.push(`Venda ${day.quantity} ${day.item.name}`);

            if (newFechamento.p13_vazio) {
              newFechamento.p13_vazio.quantidade += day.quantity;
              newFechamento.p13_vazio.total += day.total;

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.p13_vazio.media -
                  newFechamento.p13_vazio.custo) *
                day.quantity;

              newFechamento.p13_vazio.media =
                newFechamento.p13_vazio.total /
                newFechamento.p13_vazio.quantidade;

              newFechamento.p13_vazio.lucro =
                (newFechamento.p13_vazio.media -
                  newFechamento.p13_vazio.custo) *
                newFechamento.p13_vazio.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                p13_vazio: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };
              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          }

          // Água Vazio
          if (day.item_id === 4) {
            obs.push(`Venda ${day.quantity} ${day.item.name}`);

            if (newFechamento.agua_vazio) {
              newFechamento.agua_vazio.quantidade += day.quantity;
              newFechamento.agua_vazio.total += day.total;

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.agua_vazio.media -
                  newFechamento.agua_vazio.custo) *
                day.quantity;

              newFechamento.agua_vazio.media =
                newFechamento.agua_vazio.total /
                newFechamento.agua_vazio.quantidade;

              newFechamento.agua_vazio.lucro =
                (newFechamento.agua_vazio.media -
                  newFechamento.agua_vazio.custo) *
                newFechamento.agua_vazio.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                agua_vazio: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          }

          // P45
          if (day.item_id === 7) {
            if (newFechamento.p45) {
              newFechamento.p45.quantidade += day.quantity;
              newFechamento.p45.total += day.total;

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.p45.media - newFechamento.p45.custo) *
                day.quantity;

              newFechamento.p45.media =
                newFechamento.p45.total / newFechamento.p45.quantidade;

              newFechamento.p45.lucro =
                (newFechamento.p45.media - newFechamento.p45.custo) *
                newFechamento.p45.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                p45: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };
              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          }

          // P45 COMPLETO
          if (day.item_id === 8) {
            obs.push(`Venda ${day.quantity} ${day.item.name}`);

            if (newFechamento.p45) {
              newFechamento.p45_completo.quantidade += day.quantity;
              newFechamento.p45_completo.total += day.total;

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.p45_completo.media -
                  newFechamento.p45_completo.custo) *
                day.quantity;

              newFechamento.p45_completo.media =
                newFechamento.p45_completo.total /
                newFechamento.p45_completo.quantidade;

              newFechamento.p45_completo.lucro =
                (newFechamento.p45_completo.media -
                  newFechamento.p45_completo.custo) *
                newFechamento.p45_completo.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                p45_completo: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };
              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          }

          // P45 VAZIO
          if (day.item_id === 9) {
            obs.push(`Venda ${day.quantity} ${day.item.name}`);

            if (newFechamento.p45) {
              newFechamento.p45_vazio.quantidade += day.quantity;
              newFechamento.p45_vazio.total += day.total;

              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (newFechamento.p45_vazio.media -
                  newFechamento.p45_vazio.custo) *
                day.quantity;

              newFechamento.p45_vazio.media =
                newFechamento.p45_vazio.total /
                newFechamento.p45_vazio.quantidade;

              newFechamento.p45_vazio.lucro =
                (newFechamento.p45_vazio.media -
                  newFechamento.p45_vazio.custo) *
                newFechamento.p45_vazio.quantidade;
            } else {
              newFechamento = {
                ...newFechamento,
                p45_vazio: {
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: itemInformations[0].purchase_price,
                  lucro:
                    (day.total / day.quantity -
                      itemInformations[0].purchase_price) *
                    day.quantity,
                },
              };
              newFechamento.total.total += day.total;

              newFechamento.total.lucro +=
                (day.total / day.quantity -
                  itemInformations[0].purchase_price) *
                day.quantity;
            }
          }

          // Soma valores para a tabela Resume
          resumeArray.money += day.money === null ? 0 : day.money;
          resumeArray.card += day.card === null ? 0 : day.card;
          resumeArray.pix += day.pix === null ? 0 : day.pix;
        });

        despesas.forEach((line) => {
          resumeArray.expense += line.value === null ? 0 : line.value;
        });

        resumeArray.total =
          resumeArray.money + resumeArray.card + resumeArray.pix;

        resumeArray.money = resumeArray.money - resumeArray.expense;

        setResume(resumeArray);

        setObservations(obs);
        setFechamento(newFechamento);

        console.log("Despesas: ", despesas);

        setDaily(diaria);
      } catch (error) {
        console.log(error);
      }
    };

    findItens();
  }, []);

  console.log("Diaria data: ", day, "itens: ", daily, "Stock: ");

  console.log("observações: ", observations);

  console.log("Fechamento", fechamento);

  console.log("resume: ", resume);

  return (
    <Container>
      <Header>FERREIRA GÁS</Header>

      <ContentContainer>
        <TableSection>
          <h2>Estoque</h2>
          <Table>
            <Thead>
              <tr>
                <Th>Produto</Th>
                <Th>CHEIO</Th>
                <Th>VAZIO</Th>
                <Th>ESTOQUE</Th>
              </tr>
            </Thead>
            <Tbody>
              {stockMap.map(
                (item) =>
                  stock[item.key] && (
                    <tr key={item.key}>
                      <Td>{item.label}</Td>
                      <Td>{stock[item.key].cheio}</Td>
                      <Td>{stock[item.key].vazio}</Td>
                      <Td>{stock[item.key].estoque}</Td>
                    </tr>
                  ),
              )}
            </Tbody>
          </Table>
        </TableSection>

        <TableSection>
          <h2>Fechamento</h2>
          <Table>
            <Thead>
              <tr>
                <Th>Item</Th>
                <Th>Quantidade</Th>
                <Th>Total</Th>
                <Th>Média</Th>
                <Th>Custo</Th>
                <Th>Lucro</Th>
              </tr>
            </Thead>
            <Tbody>
              {fechamentoMap.map(
                (item) =>
                  fechamento[item.key] && (
                    <tr key={item.key}>
                      <Td>{item.label}</Td>
                      <Td>{fechamento[item.key].quantidade}</Td>
                      <Td>{formatMoney(fechamento[item.key].total)}</Td>
                      <Td>{formatMoney(fechamento[item.key].media)}</Td>
                      <Td>{formatMoney(fechamento[item.key].custo)}</Td>
                      <Td>{formatMoney(fechamento[item.key].lucro)}</Td>
                    </tr>
                  ),
              )}
            </Tbody>
          </Table>
        </TableSection>

        <TableSection>
          <h2>Despesas</h2>
          <Table>
            <Thead>
              <tr>
                <Th>Descrição</Th>
                <Th>Valor</Th>
              </tr>
            </Thead>
            <Tbody>
              {expenses &&
                expenses.map((expense, index) => (
                  <tr key={expense.id || index}>
                    <Td>{expense.description}</Td>
                    <Td>{formatMoney(expense.value)}</Td>
                  </tr>
                ))}
            </Tbody>
          </Table>
        </TableSection>

        <TableSection>
          <h2>Observações</h2>
          <Table>
            <Thead>
              <tr>
                <Th>Descrição</Th>
              </tr>
            </Thead>
            <Tbody>
              {observations &&
                observations.map((obs, index) => (
                  <tr key={index}>
                    <Td>{obs}</Td>
                  </tr>
                ))}
            </Tbody>
          </Table>
        </TableSection>

        <TableSection>
          <h2>Resumo</h2>
          <Table>
            <Tbody>
              {resume && (
                <>
                  <tr>
                    <Td>Despesas</Td>
                    <Td>{formatMoney(resume.expense)}</Td>
                  </tr>
                  <tr>
                    <Td>Á prazo</Td>
                    <Td>{formatMoney(resume.term)}</Td>
                  </tr>
                  <tr>
                    <Td>PIX</Td>
                    <Td>{formatMoney(resume.pix)}</Td>
                  </tr>
                  <tr>
                    <Td>Cartão</Td>
                    <Td>{formatMoney(resume.card)}</Td>
                  </tr>
                  <tr>
                    <Td>Dinheiro</Td>
                    <Td>{formatMoney(resume.money)}</Td>
                  </tr>
                  <tr>
                    <Td style={{ fontWeight: 600 }}>Total</Td>
                    <Td style={{ fontWeight: 600 }}>
                      {formatMoney(resume.total)}
                    </Td>
                  </tr>
                </>
              )}
            </Tbody>
          </Table>
        </TableSection>
      </ContentContainer>
    </Container>
  );
}
