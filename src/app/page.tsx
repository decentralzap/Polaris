"use client";

import {
  Button,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { useCallback, useState } from "react";
import {
  Chain,
  createWalletClient,
  Hex,
  http,
  isAddress,
  parseEther,
  SendTransactionErrorType,
  stringToHex,
  webSocket,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

import Log from "@/components/Log";
import { ChainKey, inscriptionChains } from "@/config/chains";
import useInterval from "@/hooks/useInterval";
import { handleAddress, handleLog } from "@/utils/helper";

const example =
  'data:,{"p":"asc-20","op":"mint","tick":"aval","amt":"100000000"}';

type RadioType = "meToMe" | "manyToOne";

type GasRadio = "all" | "tip";

export default function Home() {
  const [chain, setChain] = useState<Chain>(mainnet);
  const [privateKeys, setPrivateKeys] = useState<Hex[]>([]);
  const [radio, setRadio] = useState<RadioType>("meToMe");
  const [toAddress, setToAddress] = useState<Hex>();
  const [rpc, setRpc] = useState<string>();
  const [inscription, setInscription] = useState<string>("");
  const [gas, setGas] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [delay, setDelay] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [gasRadio, setGasRadio] = useState<GasRadio>("tip");

  const pushLog = useCallback((log: string, state?: string) => {
    setLogs((logs) => [
      handleLog(log, state),
      ...(logs.length >= 1000 ? logs.slice(0, 1000) : logs),
    ]);
  }, []);

  const client = createWalletClient({
    chain,
    transport: rpc && rpc.startsWith("wss") ? webSocket(rpc) : http(rpc),
  });
  const accounts = privateKeys.map((key) => privateKeyToAccount(key));

  useInterval(
    async () => {
      const results = await Promise.allSettled(
        accounts.map((account) => {
          return client.sendTransaction({
            account,
            to: radio === "meToMe" ? account.address : toAddress,
            value: 0n,
            ...(inscription
              ? {
                data: stringToHex(inscription),
              }
              : {}),
            ...(gas > 0
              ? gasRadio === "all"
                ? {
                  gasPrice: parseEther(gas.toString(), "gwei"),
                }
                : {
                  maxPriorityFeePerGas: parseEther(gas.toString(), "gwei"),
                }
              : {}),
          });
        }),
      );
      results.forEach((result, index) => {
        const address = handleAddress(accounts[index].address);
        if (result.status === "fulfilled") {
          pushLog(`${address} ${result.value}`, "success");
          setSuccessCount((count) => count + 1);
        }
        if (result.status === "rejected") {
          const e = result.reason as SendTransactionErrorType;
          let msg = `${e.name as string}: `;
          if (e.name === "TransactionExecutionError") {
            msg = msg + e.details;
          }
          if (e.name == "Error") {
            msg = msg + e.message;
          }
          pushLog(`${address} ${msg}`, "error");
        }
      });
    },
    running ? delay : null,
  );

  const run = useCallback(() => {
    if (privateKeys.length === 0) {
      pushLog("Pas de clé privée", "error");
      setRunning(false);
      return;
    }

    if (radio === "manyToOne" && !toAddress) {
      pushLog("Pas d'adresse", "error");
      setRunning(false);
      return;
    }

    // if (!inscription) {
    //   setLogs((logs) => [handleLog("没有铭文", "error"), ...logs]);
    //   setRunning(false);
    //   return;
    // }

    setRunning(true);
  }, [privateKeys.length, pushLog, radio, toAddress]);

  return (
    <div className=" flex flex-col gap-4">
      <div className=" flex flex-col gap-2">
        <span>Chaîne (choisir la chaîne pour l'inscription) :</span>
        <TextField
          select
          defaultValue="eth"
          size="small"
          disabled={running}
          onChange={(e) => {
            const text = e.target.value as ChainKey;
            setChain(inscriptionChains[text]);
          }}
        >
          {Object.entries(inscriptionChains).map(([key, chain]) => (
            <MenuItem
              key={chain.id}
              value={key}
            >
              {chain.name}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div className=" flex flex-col gap-2">
        <span>Clé privée (obligatoire, une par ligne) :</span>
        <TextField
          multiline
          minRows={2}
          size="small"
          placeholder="Clé privée, avec ou sans 0x, le programme gérera automatiquement"
          disabled={running}
          onChange={(e) => {
            const text = e.target.value;
            const lines = text.split("\n");
            const keys = lines
              .map((line) => {
                const key = line.trim();
                if (/^[a-fA-F0-9]{64}$/.test(key)) {
                  return `0x${key}`;
                }
                if (/^0x[a-fA-F0-9]{64}$/.test(key)) {
                  return key as Hex;
                }
              })
              .filter((x) => x) as Hex[];
            setPrivateKeys(keys);
          }}
        />
      </div>

      <RadioGroup
        row
        defaultValue="meToMe"
        onChange={(e) => {
          const value = e.target.value as RadioType;
          setRadio(value);
        }}
      >
        <FormControlLabel
          value="meToMe"
          control={<Radio />}
          label="Rotation automatique"
          disabled={running}
        />
        <FormControlLabel
          value="manyToOne"
          control={<Radio />}
          label="Plusieurs vers un"
          disabled={running}
        />
      </RadioGroup>

      {radio === "manyToOne" && (
        <div className=" flex flex-col gap-2">
          <span>Adresse du destinataire (obligatoire) :</span>
          <TextField
            size="small"
            placeholder="adresse"
            disabled={running}
            onChange={(e) => {
              const text = e.target.value;
              isAddress(text) && setToAddress(text);
            }}
          />
        </div>
      )}

      <div className=" flex flex-col gap-2">
        <span>Inscription (facultatif, inscription originale, pas l'hexadécimal encodé) :</span>
        <TextField
          size="small"
          placeholder={`Inscription, faites attention à ne pas vous tromper, vérifiez plusieurs fois, exemple：\n${example}`}
          disabled={running}
          onChange={(e) => {
            const text = e.target.value;
            setInscription(text.trim());
          }}
        />
      </div>

      <div className=" flex flex-col gap-2">
        <span>
          RPC (facultatif, par défaut le public échoue souvent, mieux vaut utiliser un service payant, http ou ws) :
        </span>
        <TextField
          size="small"
          placeholder="RPC"
          disabled={running}
          onChange={(e) => {
            const text = e.target.value;
            setRpc(text);
          }}
        />
      </div>

      <RadioGroup
        row
        defaultValue="tip"
        onChange={(e) => {
          const value = e.target.value as GasRadio;
          setGasRadio(value);
        }}
      >
        <FormControlLabel
          value="tip"
          control={<Radio />}
          label="Pourboire supplémentaire pour le mineur"
          disabled={running}
        />
        <FormControlLabel
          value="all"
          control={<Radio />}
          label="Gas total"
          disabled={running}
        />
      </RadioGroup>

      <div className=" flex flex-col gap-2">
        <span>{gasRadio === "tip" ? "Pourboire supplémentaire pour le mineur" : "Gas total"} (选填):</span>
        <TextField
          type="number"
          size="small"
          placeholder={`${gasRadio === "tip" ? "Défaut 0" : "Dernier par défaut"
            }, en gwei, exemple : 10`}
          disabled={running}
          onChange={(e) => {
            const num = Number(e.target.value);
            !Number.isNaN(num) && num >= 0 && setGas(num);
          }}
        />
      </div>

      <div className=" flex flex-col gap-2">
        <span>Intervalle de temps entre chaque transaction (facultatif, minimum 0 ms) :</span>
        <TextField
          type="number"
          size="small"
          placeholder="Défaut 0 ms"
          disabled={running}
          onChange={(e) => {
            const num = Number(e.target.value);
            !Number.isNaN(num) && num >= 0 && setDelay(num);
          }}
        />
      </div>

      <Button
        variant="contained"
        color={running ? "error" : "success"}
        onClick={() => {
          if (!running) {
            run();
          } else {
            setRunning(false);
          }
        }}
      >
        {running ? "En cours d'exécution" : "Exécuter"}
      </Button>

      <Log
        title={`Journal (nombre de succès => ${successCount}）:`}
        logs={logs}
        onClear={() => {
          setLogs([]);
        }}
      />
    </div>
  );
}
