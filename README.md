# Broadcast — Teste Prático Full Stack

Aplicação SaaS multi-tenant de broadcast de mensagens (envio simulado), feita com **React + TypeScript + Vite**, **Material UI + Tailwind CSS** e **Firebase** (Authentication, Firestore, Cloud Functions e Hosting).

> **Status da publicação:** o app está publicado em <https://broadcast-guilherme.web.app> no plano gratuito (Spark): Authentication, Firestore (regras + índices) e Hosting.
> As Cloud Functions (`/functions`) estão implementadas e compilando, mas **não foram publicadas** porque o Firebase exige o plano Blaze (com cartão / crédito pré-pago) para publicar functions. Por isso, no link publicado, mensagens agendadas permanecem como "Agendada". Com o projeto no Blaze, basta `firebase deploy --only functions` para ativar o disparo automático e a exclusão em cascata.

## Funcionalidades

- **Autenticação**: cadastro e login com e-mail/senha. Cada usuário é um cliente (tenant).
- **Conexões**: CRUD completo, em tempo real.
- **Contatos**: CRUD por conexão (nome e telefone), com busca.
- **Broadcast**:
  - escolha de um ou mais contatos (com "selecionar todos");
  - envio imediato ou agendado para data/hora futura;
  - lista de mensagens em tempo real com filtro Todas / Enviadas / Agendadas;
  - edição e exclusão. Uma mensagem agendada pode ser reagendada ou enviada na hora; uma enviada só tem texto e destinatários editáveis.
- **Agendamento no backend**: a Cloud Function `dispatchScheduledMessages` roda a cada minuto e muda para `sent` as mensagens `scheduled` cujo horário já passou, sem depender do app estar aberto. Como a tela usa `onSnapshot`, a mudança aparece sozinha.

## Estrutura

```
.
├── firebase.json            # Hosting, Functions, Firestore e emuladores
├── firestore.rules          # Isolamento entre clientes e validação dos dados
├── firestore.indexes.json   # Índices compostos usados pelas queries
├── functions/               # Cloud Functions (TypeScript)
│   └── src/
│       ├── index.ts         # Exporta as funções
│       ├── messages.ts      # dispatchScheduledMessages (agendada, a cada 1 min)
│       ├── cascade.ts       # Exclusão em cascata de conexão e de contato
│       ├── firestore.ts     # Helpers de batch (paginação + update/delete)
│       └── config.ts        # Região e tamanho de batch
└── web/                     # Frontend (Vite)
    └── src/
        ├── lib/             # Firebase, datas, telefone, validação (funções puras)
        ├── services/        # Acesso ao Firestore/Auth por entidade
        ├── hooks/           # Auth, tempo real, formulário, feedback
        ├── components/      # UI (dialogs, painéis, lista de mensagens)
        └── pages/           # Login, Conexões, Detalhe da conexão
```

## Modelagem de dados (sem subcoleções)

Todas as collections ficam na raiz e **todo documento carrega `clientId`** (o `uid` do dono). A hierarquia cliente → conexão → contatos/mensagens é feita por referência (`clientId`, `connectionId`).

| Collection    | Campos                                                                                                   |
|---------------|----------------------------------------------------------------------------------------------------------|
| `clients`     | id = `uid` · `name`, `email`, `createdAt`                                                                |
| `connections` | `clientId`, `name`, `createdAt`, `updatedAt`                                                             |
| `contacts`    | `clientId`, `connectionId`, `name`, `phone` (só dígitos), `createdAt`, `updatedAt`                       |
| `messages`    | `clientId`, `connectionId`, `contactIds[]`, `body`, `status` (`scheduled` \| `sent`), `scheduledAt`, `sentAt`, `createdAt`, `updatedAt` |

Por que `contactIds[]` dentro da mensagem: uma mensagem é um único broadcast para N contatos. Isso deixa a listagem e o filtro simples (uma leitura por mensagem) e permite `array-contains` para limpar referências quando um contato é excluído.

## Isolamento entre clientes

Em duas camadas:

1. **Firestore Security Rules** (a garantia de verdade):
   - leitura, edição e exclusão só quando `resource.data.clientId == request.auth.uid`;
   - na criação, `clientId` precisa ser o `uid` de quem cria;
   - `clientId`, `connectionId` e `createdAt` não podem mudar depois;
   - contatos e mensagens só podem ser criados em conexões do próprio cliente (`get()` na conexão);
   - campos permitidos (`hasOnly`), tamanho de textos e formato do telefone são validados;
   - mensagem agendada precisa estar no futuro; envio imediato precisa usar `sentAt == request.time`; mensagem enviada não volta a ser agendada.
2. **Queries do frontend** sempre filtram por `where("clientId", "==", uid)`, o que as regras exigem para listar.

As Cloud Functions usam o Admin SDK (passa por cima das regras) e só mexem em `status`/`sentAt` e na exclusão em cascata.

## Decisões técnicas

- **Paradigma funcional**: nada de classes. Serviços são funções puras ou que retornam Promises; estado fica em hooks; validação são funções `valores → erros`.
- **Tempo real**: conexões, contatos, mensagens e o documento da conexão usam `onSnapshot` (hooks `useRealtimeQuery` / `useRealtimeDoc`).
- **Envio imediato**: a mensagem já nasce com `status: "sent"` (envio simulado), sem precisar passar por uma função.
- **Exclusão em cascata** (sem subcoleções, ela precisa ser explícita): `onConnectionDeleted` remove contatos e mensagens da conexão; `onContactDeleted` tira o contato das mensagens e apaga as que ficam sem destinatário.
- **MUI + Tailwind**: MUI para os componentes, Tailwind para layout e espaçamento. O `preflight` do Tailwind fica desligado (o reset é do `CssBaseline`), e `StyledEngineProvider injectFirst` + `important: "#root"` evitam conflito de especificidade.

## Como rodar

### Pré-requisitos

- Node.js 20+
- Firebase CLI: `npm i -g firebase-tools`
- Um projeto Firebase no **plano Blaze**: Cloud Functions e funções agendadas (Cloud Scheduler) exigem esse plano. A cota gratuita cobre um teste como este.

### 1. Configurar o projeto Firebase

1. Crie o projeto em <https://console.firebase.google.com> e ative o plano Blaze.
2. **Authentication** → Sign-in method → ative **E-mail/senha**.
3. **Firestore Database** → criar banco em modo produção. Use a região `nam5 (us-central)` ou altere `REGION` em `functions/src/config.ts` para a mesma região do banco (ex.: `southamerica-east1`).
4. **Configurações do projeto** → Seus apps → adicione um app **Web** e copie a configuração.
5. Na raiz do repositório:

```bash
firebase login
firebase use --add            # selecione o projeto (atualiza o .firebaserc)
cp web/.env.example web/.env  # preencha com a configuração do app web
```

### 2. Instalar dependências

```bash
npm --prefix functions install
npm --prefix web install
```

### 3. Rodar localmente (opcional, com emuladores)

```bash
# em web/.env: VITE_USE_EMULATORS=true
firebase emulators:start      # Auth, Firestore, Functions
npm --prefix web run dev      # http://localhost:5173
```

> No emulador, funções agendadas não disparam sozinhas. Para testar o agendamento de ponta a ponta, use o projeto publicado.

### 4. Publicar

```bash
# em web/.env: VITE_USE_EMULATORS=false
firebase deploy
```

Esse comando publica regras, índices, functions e hosting (o build do `web` e das functions roda automaticamente via `predeploy`). Ao final, o CLI mostra a URL `https://<projeto>.web.app`.

> Os índices compostos podem levar alguns minutos para ficar prontos depois do primeiro deploy.

## Testes automatizados

Rodam no emulador do Firestore com as mesmas regras publicadas:

- `tests/rules.test.mjs`: 29 casos de isolamento entre clientes e validação (leitura/escrita cruzada, `clientId` imutável, telefone, agendamento no passado, `sentAt` forjado, etc.);
- `tests/functions.test.cjs`: 5 casos das Cloud Functions (disparo de agendadas, remoção de contato das mensagens, exclusão em cascata da conexão).

```bash
npm --prefix functions install
npm --prefix tests install
npm --prefix tests test
```

## Fluxo para testar

1. Criar conta → criar uma conexão → abrir.
2. Aba **Contatos**: cadastrar, editar e excluir contatos.
3. Aba **Broadcast**: selecionar contatos, escrever e **Enviar agora**, ou **Agendar** para 1–2 minutos no futuro.
4. Esperar o horário: o status muda de **Agendada** para **Enviada** sozinho (também com o app fechado).
5. Criar uma segunda conta e confirmar que ela não vê os dados da primeira.
