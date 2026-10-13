# Meu Fichário — Pokédex

Aplicação React + Vite para marcar uma espécie de cada Pokémon e acompanhar o progresso da coleção.

## Requisitos
- Node.js 18 ou superior
- npm

## Executar localmente
```bash
npm install
npm run dev
```
Abra o endereço local mostrado pelo Vite no terminal.

## Gerar versão de produção
```bash
npm run build
npm run preview
```

## Funcionalidades
- Visão geral da Pokédex nacional (1.025 espécies).
- Nove gerações com progresso individual.
- Grid com seis colunas em telas maiores e layout adaptado para celular.
- Marcar/desmarcar Pokémon como capturado.
- Filtros Todos, Capturados e Faltantes.
- Busca por nome ou número.
- Salvamento automático usando `localStorage`.

## Observações
- Os nomes são carregados da PokéAPI quando há conexão com a internet.
- As artes oficiais são servidas pelo repositório de sprites da PokéAPI.
- O progresso fica salvo no navegador/dispositivo atual. Limpar os dados do navegador apaga o progresso; sincronização entre dispositivos e exportação ainda não estão implementadas.
- Este projeto acompanha espécies, não edições ou cópias individuais de cartas.
