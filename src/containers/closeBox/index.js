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

  const [fechamento, setFechamento] = useState([]);

  const stockMap = [
    { key: "p13", label: "P13" },
    { key: "p45", label: "P45" },
    { key: "aguas", label: "ÁGUAS" },
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

        let newClose = [];
        let somaTotal = {};

        let resumeArray = { money: 0, card: 0, pix: 0, expense: 0, term: 0 };

        // Fechamento
        diaria.forEach((day) => {
          if (newClose.length === 0) {
            if (day.item.observation === false) {
              const newItem = {
                item: `${day.item.name} ${day.location}`,
                quantidade: day.quantity,
                total: day.total,
                media: day.total / day.quantity,
                custo: day.item.purchase_price,
                lucro:
                  (day.total / day.quantity - day.item.purchase_price) *
                  day.quantity,
                obs: day.item.observation,
              };
              newClose.push(newItem);

              somaTotal = {
                item: "Total",
                total: day.total,
                lucro:
                  (day.total / day.quantity - day.item.purchase_price) *
                  day.quantity,
              };
            } else {
              const newItem = {
                item: day.item.name,
                quantidade: day.quantity,
                total: day.total,
                media: day.total / day.quantity,
                custo: day.item.purchase_price,
                lucro:
                  (day.total / day.quantity - day.item.purchase_price) *
                  day.quantity,
                obs: day.item.observation,
              };
              newClose.push(newItem);

              somaTotal = {
                item: "Total",
                total: day.total,
                lucro:
                  (day.total / day.quantity - day.item.purchase_price) *
                  day.quantity,
              };
            }
          } else {
            if (day.item.observation === false) {
              const index = newClose.findIndex(
                (line) => line.item === `${day.item.name} ${day.location}`,
              );

              if (index !== -1) {
                newClose[index].quantidade += day.quantity;
                newClose[index].total += day.total;
                newClose[index].media =
                  newClose[index].total / newClose[index].quantidade;
                newClose[index].lucro =
                  (newClose[index].total / newClose[index].quantidade -
                    day.item.purchase_price) *
                  newClose[index].quantidade;

                somaTotal.total += day.total;
                somaTotal.lucro +=
                  (day.total / day.quantity - day.item.purchase_price) *
                  day.quantity;
              } else {
                const newItem = {
                  item: `${day.item.name} ${day.location}`,
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: day.item.purchase_price,
                  lucro:
                    (day.total / day.quantity - day.item.purchase_price) *
                    day.quantity,
                  obs: day.item.observation,
                };
                newClose.push(newItem);

                somaTotal.total += day.total;
                somaTotal.lucro +=
                  (day.total / day.quantity - day.item.purchase_price) *
                  day.quantity;
              }
            } else {
              const index = newClose.findIndex(
                (line) => line.item === day.item.name,
              );

              if (index !== -1) {
                newClose[index].quantidade += day.quantity;
                newClose[index].total += day.total;
                newClose[index].media =
                  newClose[index].total / newClose[index].quantidade;
                newClose[index].lucro =
                  (newClose[index].total / newClose[index].quantidade -
                    day.item.purchase_price) *
                  newClose[index].quantidade;

                somaTotal.total += day.total;
                somaTotal.lucro +=
                  (day.total / day.quantity - day.item.purchase_price) *
                  day.quantity;
              } else {
                const newItem = {
                  item: day.item.name,
                  quantidade: day.quantity,
                  total: day.total,
                  media: day.total / day.quantity,
                  custo: day.item.purchase_price,
                  lucro:
                    (day.total / day.quantity - day.item.purchase_price) *
                    day.quantity,
                  obs: day.item.observation,
                };
                newClose.push(newItem);
                somaTotal.total += day.total;
                somaTotal.lucro +=
                  (day.total / day.quantity - day.item.purchase_price) *
                  day.quantity;
              }
            }
          }

          // Soma valores para a tabela Resume
          resumeArray.money += day.money === null ? 0 : day.money;
          resumeArray.card += day.card === null ? 0 : day.card;
          resumeArray.pix += day.pix === null ? 0 : day.pix;
          resumeArray.term += day.vale === null ? 0 : day.vale;
        });

        // Adiciona observação
        newClose.forEach((line) => {
          if (line.obs == true) {
            obs.push(`Venda ${line.quantidade} ${line.item}`);
          }
        });

        // Calcula despesas
        despesas.forEach((line) => {
          resumeArray.expense += line.value === null ? 0 : line.value;
        });

        // Mapeia as observações no array
        movement.forEach((line) => {
          obs.push(
            `${line.type === "in" ? "Entrada" : "Saida"} ${line.quantity} ${line.item.name}`,
          );
        });

        // Calcula resumo
        resumeArray.total =
          resumeArray.money +
          resumeArray.card +
          resumeArray.pix +
          resumeArray.term;

        resumeArray.money = resumeArray.money - resumeArray.expense;

        setFechamento(newClose);
        newClose.push(somaTotal);
        setObservations(obs);
        setResume(resumeArray);
        setExpenses(despesas);

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

        // Reverter o estoque para 1 dia atrás diaria (padrão de envio)
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

        // Reverter o estoque antes da movimentação
        movement.forEach((line) => {
          if (line.item_id === 5) {
            if (line.type === "in") {
              newStock.p13.cheio -= line.quantity;
            } else {
              newStock.p13.cheio += line.quantity;
            }
          }

          if (line.item_id === 2) {
            if (line.type === "in") {
              newStock.p13.vazio -= line.quantity;
            } else {
              newStock.p13.vazio += line.quantity;
            }
          }

          if (line.item_id === 6) {
            if (line.type === "in") {
              newStock.aguas.cheio -= line.quantity;
            } else {
              newStock.aguas.cheio += line.quantity;
            }
          }

          if (line.item_id === 4) {
            if (line.type === "in") {
              newStock.aguas.vazio -= line.quantity;
            } else {
              newStock.aguas.vazio += line.quantity;
            }
          }

          if (line.item_id === 8) {
            if (line.type === "in") {
              newStock.p45.cheio -= line.quantity;
            } else {
              newStock.p45.cheio += line.quantity;
            }
          }

          if (line.item_id === 9) {
            if (line.type === "in") {
              newStock.p45.vazio -= line.quantity;
            } else {
              newStock.p45.vazio += line.quantity;
            }
          }
        });

        // Somando o valor de estoque
        newStock.p13.estoque = newStock.p13.cheio + newStock.p13.vazio;
        newStock.p45.estoque = newStock.p45.cheio + newStock.p45.vazio;
        newStock.aguas.estoque = newStock.aguas.cheio + newStock.aguas.vazio;

        setStock(newStock);

        setDaily(diaria);
      } catch (error) {
        console.log(error);
      }
    };

    findItens();
  }, []);

  console.log("Diaria data: ", day, "itens: ", daily, "Stock: ");

  console.log("observações: ", observations);

  console.log("Fechamento att", fechamento);

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
              {fechamento &&
                fechamento.length > 0 &&
                fechamento.map((item, index) => (
                  <tr key={index}>
                    <Td>{item.item}</Td>
                    <Td>{item.quantidade}</Td>
                    <Td>{formatMoney(item.total)}</Td>
                    <Td>{formatMoney(item.media)}</Td>
                    <Td>{formatMoney(item.custo)}</Td>
                    <Td>{formatMoney(item.lucro)}</Td>
                  </tr>
                ))}
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
