// Bibliotecas
import React, { useEffect, useState } from "react";
import { replace, useSearchParams, useNavigate } from "react-router-dom";
import SHA256 from "crypto-js/sha256";

// API
import api from "../../services/api";

import {
  Container,
  Header,
  Title,
  Content,
  Sheets,
  SheetGas,
  SheetWater,
  SectionTitle,
  TableWrapper,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
  CellInput,
} from "./style";
import { formatDate } from "../../utils/FomatData";

export function Daily() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const columsNumber = 30;

  // Váriaveis de urls opcionais
  const day = searchParams.get("day");
  if (!day) {
    const data = new Date();
    const dataFormatada = formatDate(data).replaceAll("/", "-");
    window.location.replace(`daily?day=${dataFormatada}`);
  }

  const columns = [
    "id",
    "local",
    "produto",
    "quantidade",
    "preco",
    "desconto",
    "dinheiro",
    "cartao",
    "pix",
    "obs",
  ];

  const buildInitialState = () => {
    return Array.from({ length: columsNumber }, (_, index) => ({
      id: index + 1,
      id_db: "",
      local: "",
      produto: "",
      quantidade: "",
      preco: "",
      desconto: "",
      dinheiro: "",
      cartao: "",
      pix: "",
      obs: "",
      save_id: "",
      date: "",
    }));
  };

  // Itens das planilhas
  const [gas, setGas] = useState(buildInitialState());
  const [water, setWater] = useState(buildInitialState());

  const [change, setChange] = useState(0); // Marca se tem alguma mudança feita
  const [timer, setTimer] = useState(0);

  console.log("tempo: ", timer);

  // Busca dados no back_end
  useEffect(() => {
    const getDaily = async () => {
      // Busca a diária no banco de dados como array
      const { data: daily } = await api.get(`/daily/${criarData(day)}`);

      if (daily.length > 0) {
        // Formata a diária para o mmodelo usado no front_end
        const daily_formated = daily.map((item) => {
          const newItem = {
            id: Number(item.id.split("-")[1]),
            id_db: item.id,
            local:
              item.location === null || item.location === undefined
                ? ""
                : item.location,
            produto:
              item.item_id === null || item.item_id === undefined
                ? ""
                : item.item_id,
            quantidade:
              item.quantity === null || item.quantity === undefined
                ? ""
                : item.quantity,
            preco:
              item.price === null || item.price === undefined ? "" : item.price,
            desconto:
              item.discount === null || item.discount === undefined
                ? ""
                : item.discount,
            dinheiro:
              item.money === null || item.money === undefined ? "" : item.money,
            cartao:
              item.card === null || item.card === undefined ? "" : item.card,
            pix: item.pix === null || item.pix === undefined ? "" : item.pix,
            obs:
              item.observation === null || item.observation === undefined
                ? ""
                : item.observation,
            save_id:
              item.save_id === null || item.save_id === undefined
                ? ""
                : item.save_id,
            date:
              item.date === null || item.date === undefined ? "" : item.date,
          };

          return newItem;
        });

        // Filtra as linhas para adicionar os itens nos lugares certos
        const newGas = gas.map((item) => {
          const newDaily = daily_formated.filter(
            (dailyItem) => dailyItem.id === item.id,
          );

          if (newDaily.length > 0) {
            let elementReturn;

            newDaily.forEach((element) => {
              if (element.id_db.split("-")[2] === "GAS") {
                elementReturn = element;
              } else {
                return item;
              }
            });

            return elementReturn;
          } else {
            return item;
          }
        });

        const newWater = water.map((item) => {
          const newDaily = daily_formated.filter(
            (dailyItem) => dailyItem.id === item.id,
          );

          if (newDaily.length > 0) {
            let elementReturn;

            newDaily.forEach((element) => {
              if (element.id_db.split("-")[2] === "WATER") {
                elementReturn = element;
              } else {
                return item;
              }
            });

            return elementReturn;
          } else {
            return item;
          }
        });

        console.log("DAILY", daily_formated);

        setGas(newGas);
        setWater(newWater);
      }
    };

    getDaily();
  }, []);

  // Temporizador
  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (change === 1) {
      setChange(0);
      verification();
    }
  }, [timer]);

  // Função de verificação e envio
  const verification = async () => {
    let sendPost = [];
    let sendPut = [];

    // Verifica item por item, adiciona save_id nos novos itens marcados, confere se algum item foi atualizado, após isso integra arrays com os itens novos e os atualizados.

    const sendGas = gas.map((item) => {
      if (item.save_id !== "") {
        const saveHash = SHA256(
          `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.obs}`,
        ).toString();

        if (item.save_id !== saveHash) {
          const newItem = {
            ...item,
            id_db: `LINE-${item.id}-GAS-${day}`,
            date: criarData(day),
            save_id: saveHash,
          };

          sendPut.push(newItem);
          return newItem;
        } else {
          return item;
        }
      } else if (
        item.save_id === "" &&
        (item.local !== "" ||
          item.produto !== "" ||
          item.quantidade !== "" ||
          item.preco !== "" ||
          item.desconto !== "" ||
          item.dinheiro !== "" ||
          item.cartao !== "" ||
          item.pix !== "" ||
          item.obs !== "")
      ) {
        const newItem = {
          ...item,
          id_db: `LINE-${item.id}-GAS-${day}`,
          date: criarData(day),
          save_id: SHA256(
            `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.obs}`,
          ).toString(),
        };

        sendPost.push(newItem);
        return newItem;
      } else {
        return item;
      }
    });

    const sendWater = water.map((item) => {
      if (item.save_id !== "") {
        const saveHash = SHA256(
          `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.obs}`,
        ).toString();

        if (item.save_id !== saveHash) {
          const newItem = {
            ...item,
            id_db: `LINE-${item.id}-WATER-${day}`,
            date: criarData(day),
            save_id: saveHash,
          };

          sendPut.push(newItem);
          return newItem;
        } else {
          return item;
        }
      } else if (
        item.save_id === "" &&
        (item.local !== "" ||
          item.produto !== "" ||
          item.quantidade !== "" ||
          item.preco !== "" ||
          item.desconto !== "" ||
          item.dinheiro !== "" ||
          item.cartao !== "" ||
          item.pix !== "" ||
          item.obs !== "")
      ) {
        const newItem = {
          ...item,
          id_db: `LINE-${item.id}-WATER-${day}`,
          date: criarData(day),
          save_id: SHA256(
            `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.obs}`,
          ).toString(),
        };

        sendPost.push(newItem);
        return newItem;
      } else {
        return item;
      }
    });

    setGas(sendGas);
    setWater(sendWater);

    // Verifica se o item está salvo

    if (sendPost.length > 0) {
      console.log("itens para enviar: ", sendPost);

      try {
        const response = await api.post("/daily", { daily: sendPost });

        console.log("response back_end", response);
      } catch (error) {
        console.log("deu errado");
        console.log(error);
      }
    }

    if (sendPut.length > 0) {
      console.log("itens para atualizar: ", sendPut);

      try {
        const response = await api.put("/daily", { daily: sendPut });

        console.log("response back_end", response);
      } catch (error) {
        console.log("deu errado");
        console.log(error);
      }
    }

    //
  };

  // Função de registro gás
  const handleGasChange = (index, field, value) => {
    const newGas = [...gas];
    newGas[index] = { ...newGas[index], [field]: value };
    setGas(newGas);

    setChange(1); //
    if (timer === 0) {
      setTimer(5);
    }
  };

  // Função de registro água
  const handleWaterChange = (index, field, value) => {
    const newWater = [...water];
    newWater[index] = { ...newWater[index], [field]: value };
    setWater(newWater);

    setChange(1);
    if (timer === 0) {
      setTimer(5);
    }
  };

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
  console.log(gas);

  return (
    <Container>
      <Header>
        <Title>Ferreira Gás e Água - Controle Diário</Title>
      </Header>
      <Content>
        <Sheets>
          <SheetGas>
            <SectionTitle themeColor="#e67e22">Gás</SectionTitle>
            <TableWrapper>
              <Table>
                <THead themeColor="#e67e22">
                  <Tr>
                    {columns.map((col) => (
                      <Th key={col}>{col}</Th>
                    ))}
                  </Tr>
                </THead>

                <TBody>
                  {gas.map((row, i) => (
                    <Tr key={`gas-${i}`}>
                      {columns.map((col) => (
                        <Td key={`gas-${i}-${col}`}>
                          {col === "ID" ? (
                            <div
                              style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                padding: "10px 12px",
                              }}
                            >
                              {row.id}
                            </div>
                          ) : (
                            <CellInput
                              type="text"
                              focusColor="#e67e22"
                              value={row[col]}
                              onChange={(e) =>
                                handleGasChange(i, col, e.target.value)
                              }
                            />
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableWrapper>
          </SheetGas>

          <SheetWater>
            <SectionTitle themeColor="#2980b9">Água</SectionTitle>
            <TableWrapper>
              <Table>
                <THead themeColor="#2980b9">
                  <Tr>
                    {columns.map((col) => (
                      <Th key={col}>{col}</Th>
                    ))}
                  </Tr>
                </THead>
                <TBody>
                  {water.map((row, i) => (
                    <Tr key={`water-${i}`}>
                      {columns.map((col) => (
                        <Td key={`water-${i}-${col}`}>
                          {col === "ID" ? (
                            <div
                              style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                padding: "10px 12px",
                              }}
                            >
                              {row.id}
                            </div>
                          ) : (
                            <CellInput
                              type="text"
                              focusColor="#2980b9"
                              value={row[col]}
                              onChange={(e) =>
                                handleWaterChange(i, col, e.target.value)
                              }
                            />
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableWrapper>
          </SheetWater>
        </Sheets>
      </Content>
      <button
        onClick={() => {
          console.log(2);
        }}
      >
        console.log
      </button>
    </Container>
  );
}
