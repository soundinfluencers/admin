# SoundInfluencers Offer Builder / Offer Matrix — документация для Codex

> Статус: рабочая документация для первого этапа реализации.
> Цель: дать Codex понятный, ограниченный scope и не позволить ему переписать весь модуль хаотично.

---

## 0. Контекст

Проект: **SoundInfluencers**.

Модуль: **Influencers Offers / Offer Builder / Offer Matrix** в админ-панели.

Страница является рабочим пространством администратора для сборки коммерческих офферов из influencer/social accounts.

Оффер в UI представлен как динамическая колонка таблицы. Аккаунты представлены строками. Один аккаунт может входить в несколько офферов, то есть связь `Offer ↔ Account` является many-to-many.

Важно: это не просто read-only таблица. Это editor workspace, где админ создает офферы, включает колонки в режим редактирования, добавляет/убирает аккаунты и затем публикует подготовленные офферы.

---

## 1. Текущее состояние

В проекте уже существует замороженная заготовка Offer Matrix.

Известно, что уже было реализовано или частично подготовлено:

- `GET /admin/offers`;
- URL state через `nuqs`;
- фильтры platform/genre;
- вертикальный infinite scroll по accounts;
- горизонтальный infinite scroll по offers;
- matrix render через `offerHeaders`, `accountRows`, `links`;
- custom scrollbars;
- skeleton/empty/overlay states;
- links map для проверки membership.

Фильтры были пересобраны:

- platform filter использует backend enum-like values;
- genre filter использует `OFFER_MUSIC_GENRES`;
- значения фильтров являются API values;
- `label/subLabel` используются только для UI;
- фильтры single-select;
- fetch после пересборки фильтров работает корректно.

Codex должен сам просмотреть текущую реализацию в репозитории и сохранить то, что работает, если оно не конфликтует с текущим scope.

---

## 2. Backend-модель на текущий этап

### 2.1. Draft model

На текущем этапе считаем:

```ts
isPublished: false
```

это draft / unpublished / work-in-progress состояние offer.

```ts
isPublished: true
```

это published / visible-to-clients состояние offer.

Отдельного draft endpoint на текущем этапе нет и не требуется.

Frontend хранит только transient UI-state:

```ts
activeOfferIds: string[]
openedModal
pending state
```

Backend хранит persisted business state:

```ts
created offers
offer-account links
offer price
isPublished
```

Нельзя хранить состав оффера только в Zustand/localStorage как source of truth.

---

## 3. API contracts

### 3.1. Fetch matrix

```http
GET /admin/offers
```

Назначение: получить cursor-paginated offers × accounts matrix.

Query params:

```ts
{
  offersCursor?: string;
  offersTake?: number;

  accountsCursor?: string;
  accountsTake?: number;

  socialMedia: string;
  genre: string;
}
```

Response shape:

```ts
{
  statusCode: number;
  message: string;
  data: {
    offerHeaders: Array<{
      offerId: string;
      title: string;
      isPublished: boolean;
      price: number;
      createdAt: string;
    }>;

    accountRows: Array<{
      influencerId: string;
      accountId: string;
      username: string;
      logoUrl: string | null;
    }>;

    links: Array<{
      offerId: string;
      influencerId: string;
      accountId: string;
    }>;

    offersNextCursor: string | null;
    accountsNextCursor: string | null;
  }
}
```

Notes:

- `offerHeaders` are dynamic offer columns.
- `accountRows` are account rows.
- `links` represent account-offer membership.
- `links` are used to highlight selected cells.
- `offersNextCursor` drives horizontal infinite loading.
- `accountsNextCursor` drives vertical infinite loading.

---

### 3.2. Create offer

```http
POST /admin/offers
```

Назначение: создать новый пустой offer.

Request body:

```ts
{
  socialMedia: string;
  genre: string;
  offerName: string;
}
```

Frontend behavior:

- открыть modal по кнопке `+`;
- ввести offer name;
- взять `socialMedia` и `genre` из текущих URL/filter state;
- вызвать `POST /admin/offers`;
- после успеха invalidation/refetch matrix query;
- новый offer должен появиться как новая колонка.

---

### 3.3. Add/remove account-offer link

```http
PATCH /admin/offers/{offerId}/links/{influencerId}/{accountId}/{connected}
```

Назначение: добавить или убрать связь account-offer.

Path params:

```ts
{
  offerId: string;
  influencerId: string;
  accountId: string;
  connected: boolean;
}
```

Frontend behavior:

- если `connected = true`, account добавляется в offer;
- если `connected = false`, account удаляется из offer;
- endpoint одиночный, batch endpoint нет;
- при multi-edit frontend вызывает несколько PATCH-запросов, по одному на каждый active offer.

---

### 3.4. Publish offer

```http
PATCH /admin/offers/published?offerId={offerId}
```

Назначение: установить offer как published / visible to clients.

Frontend behavior for this stage:

- treat endpoint as per-offer publish action;
- если UI содержит глобальную кнопку `Publish`, Codex должен проверить текущий UI и предложить минимально безопасную реализацию;
- не выдумывать batch publish endpoint;
- если глобальный publish реализуется в текущем scope, он должен вызывать per-offer endpoint для конкретных офферов, а не придумывать новый API.

Open point:

- точное поведение глобального `Publish` может быть уточнено после review.
- На первом этапе допустимо реализовать минимальную publish-интеграцию только если текущий UI позволяет сделать это без неявных бизнес-правил.

---

### 3.5. Delete offer

```http
DELETE /admin/offers/{offerId}
```

Есть backend endpoint, но **в текущий этап реализации delete не входит**.

Codex не должен реализовывать delete offer в первой пачке задач.

---

### 3.6. XLSX import/export

XLSX import не входит в текущий этап.

Codex не должен трогать XLSX flow в первой пачке задач.

---

## 4. UI / business behavior

### 4.1. Matrix mode

Matrix mode — основной режим редактирования.

Таблица состоит из:

- левой sticky/static части с account data;
- правой горизонтально скроллящейся части с offer columns.

Левая часть:

- account/brand name;
- в текущем backend response доступны только `username`, `logoUrl`, `influencerId`, `accountId`;
- followers / price per follower не приходят в текущем response, поэтому Codex не должен придумывать эти значения.

Правая часть:

- offer title;
- offer active/edit toggle;
- membership cells;
- offer price из `offerHeader.price`;
- published state из `offerHeader.isPublished`.

---

### 4.2. Active offer edit state

Header toggle в offer column не является backend state.

Это frontend-only state:

```ts
activeOfferIds: string[]
```

Правила:

- toggle ON добавляет `offerId` в `activeOfferIds`;
- toggle OFF убирает `offerId` из `activeOfferIds`;
- одновременно может быть активно несколько offer columns;
- active state нужен только для того, чтобы row checkbox понимал, какие offers редактировать.

---

### 4.3. Row checkbox / membership editing

Row checkbox/action работает относительно active offer columns.

Правила:

```text
Если activeOfferIds пустой:
  checkbox/action disabled или no-op.

Если account отсутствует хотя бы в одном active offer:
  click добавляет account во все active offers, где его еще нет.

Если account уже находится во всех active offers:
  click удаляет account из всех active offers.
```

Пример:

```text
Account уже есть в IG 5M.
Активны IG 5M и IG 7M.

Первый клик:
  добавляет account в IG 7M.

Второй клик:
  удаляет account из IG 5M и IG 7M.
```

Cell highlight:

```text
cell highlighted = link exists for offerId + influencerId + accountId
```

Cell highlight не зависит от active toggle.

---

### 4.4. Mutation strategy

На первом этапе предпочтительно использовать простую стратегию:

```text
mutation success → invalidate/refetch matrix query
```

Optimistic update можно делать только если это не усложняет реализацию и соответствует текущим project patterns.

Codex должен посмотреть существующие React Query mutation patterns в проекте и следовать им.

Ожидаемая организация:

- API functions: entity-level, рядом с текущим `getInfluencersOffersMatrixApi`;
- query keys: entity-level, рядом с текущими offer query keys;
- mutations/hooks: feature-level;
- UI state: локально внутри page/widget/feature, без Zustand.

---

## 5. Что входит в текущий implementation scope

В первую пачку реализации входит:

1. Review текущей реализации Offer Matrix.
2. Сохранить/починить working fetch flow.
3. Убедиться, что фильтры platform/genre подключены к `GET /admin/offers`.
4. Реализовать create offer modal.
5. Реализовать `POST /admin/offers`.
6. После create success делать invalidate/refetch matrix query.
7. Реализовать active offer toggle state.
8. Реализовать row checkbox/action behavior.
9. Реализовать `PATCH /admin/offers/{offerId}/links/{influencerId}/{accountId}/{connected}`.
10. Реализовать membership highlight через `links`.
11. Реализовать или подготовить publish integration через `PATCH /admin/offers/published?offerId=...`, если это не требует спорных бизнес-решений.
12. Убрать устаревшие TODO/комментарии только если они больше не соответствуют реальности.
13. Сделать self-review.

---

## 6. Что НЕ входит в текущий implementation scope

В текущий этап не входит:

- delete offer;
- XLSX import;
- XLSX export, если он не был явно согласован отдельно;
- summary rows с `ourCost`;
- followers summary;
- price per follower;
- body cell price/cost;
- формулы расчёта стоимости;
- отдельная draft модель на frontend;
- Zustand/localStorage как source of truth;
- batch endpoint, если его нет;
- card mode, если он требует отдельной бизнес/API логики;
- глобальное переписывание архитектуры проекта;
- вынос новых частей в `shared`;
- unrelated refactoring.

---

## 7. Ограничения по backend response

Текущий `GET /admin/offers` не содержит:

- `followers`;
- `pricePerFollower`;
- `ourCost`;
- `totalFollowers`;
- `pagesIncluded`;
- cell price/cost;
- description.

Поэтому Codex не должен реализовывать эти значения через выдуманные формулы.

Если UI требует эти поля, Codex должен оставить placeholder / скрыть часть UI / описать blocker в отчёте.

---

## 8. Рекомендованный порядок задач для Codex

### FE-001 — Review current implementation and align docs

Status: todo

Goal:
Понять текущую структуру модуля, найти существующие files, API layer, query hooks, matrix widget, filters, actions.

Scope:
- Просмотреть текущий код.
- Не менять бизнес-логику.
- Составить краткий implementation plan в ответе.
- Найти существующие patterns для API functions, query keys, mutation hooks, modals.

Acceptance criteria:
- Codex перечислил релевантные файлы.
- Codex понял, что уже работает.
- Codex не начал реализацию будущих задач.

---

### FE-002 — Normalize API contracts and query keys

Status: todo

Goal:
Привести entity-level API/types/query keys под текущие backend endpoints.

Scope:
- Проверить типы для `GET /admin/offers`.
- Добавить API functions для:
  - `POST /admin/offers`;
  - `PATCH /admin/offers/{offerId}/links/{influencerId}/{accountId}/{connected}`;
  - `PATCH /admin/offers/published?offerId=...`.
- Не реализовывать delete.
- Не трогать XLSX.

Acceptance criteria:
- API functions типизированы.
- Query keys позволяют invalidate matrix.
- Existing fetch не сломан.

---

### FE-003 — Create offer modal

Status: todo

Goal:
Реализовать создание offer через modal.

Scope:
- Подключить кнопку `+`.
- Открывать modal.
- Input для offer name.
- Submit вызывает `POST /admin/offers`.
- Body включает текущие `socialMedia`, `genre`, `offerName`.
- После успеха invalidate/refetch matrix.

Acceptance criteria:
- Offer создается.
- После создания появляется в matrix после refetch.
- Loading/error state обработаны минимально.
- Нет delete/XLSX logic.

---

### FE-004 — Active offer edit toggles

Status: todo

Goal:
Реализовать frontend-only state активных offer columns.

Scope:
- Добавить `activeOfferIds`.
- Header toggle включает/выключает offer.
- Не отправлять active state на backend.
- Передать active state в row checkbox/cell logic.

Acceptance criteria:
- Можно включить один offer.
- Можно включить несколько offers.
- Выключение offer убирает его из active list.
- Reload сбрасывает active state.

---

### FE-005 — Membership editing

Status: todo

Goal:
Реализовать добавление/удаление account из active offers.

Scope:
- Row checkbox/action работает по правилам active offers.
- Проверка существующих links через links map.
- Для каждого affected offer вызвать PATCH link endpoint.
- После успеха invalidate/refetch matrix или аккуратный optimistic update.
- Если active offers нет — action disabled/no-op.

Acceptance criteria:
- Account добавляется в один active offer.
- Account удаляется из одного active offer.
- Account добавляется в несколько active offers.
- Если account уже есть во всех active offers, повторный click удаляет его из всех.
- Cell highlight соответствует links после refetch.

---

### FE-006 — Publish integration

Status: todo / blocked-by-review

Goal:
Подключить publish endpoint без выдумывания новой бизнес-логики.

Scope:
- Использовать `PATCH /admin/offers/published?offerId=...`.
- Проверить текущий UI: есть ли per-offer publish или только global Publish.
- Если только global Publish, предложить минимально безопасную реализацию и остановиться на review, если бизнес-правило неоднозначно.

Acceptance criteria:
- Codex не придумывает batch publish endpoint.
- Codex не публикует offers без явного правила.
- После publish matrix refetch показывает `isPublished: true`.

---

## 9. Codex working rules

Codex должен соблюдать правила:

1. Сначала прочитать эту документацию.
2. Затем самостоятельно изучить текущий код в репозитории.
3. Не требовать от пользователя вручную пересказывать всю структуру.
4. Не переписывать весь модуль без необходимости.
5. Сохранять working fetch/infinite scroll, если он не конфликтует с задачей.
6. Не выносить код в shared в этом этапе.
7. Не реализовывать delete.
8. Не трогать XLSX flow.
9. Не придумывать backend поля, которых нет в response.
10. Не хранить persisted offer state в Zustand/localStorage.
11. Использовать React Query и backend как source of truth.
12. Работать маленькими шагами.
13. После каждой задачи:
    - описать изменённые файлы;
    - описать что реализовано;
    - написать какие проверки запущены;
    - указать риски;
    - остановиться на human review.

---

## 10. Prompt для запуска Codex

```text
We are implementing the SoundInfluencers Offer Builder / Offer Matrix admin module.

Read the documentation in this message first.

Your first task is FE-001 only.

Important context:
- The existing module already has a read-only matrix prototype with GET /admin/offers, URL filters, vertical accounts cursor, horizontal offers cursor, offerHeaders/accountRows/links rendering, custom scrollbars, skeleton/empty/overlay states.
- Filters were already rebuilt to backend enum values and should not be rewritten unless broken.
- isPublished=false should be treated as draft/unpublished/work-in-progress.
- Backend is source of truth for created offers and offer-account links.
- Frontend owns only transient UI state like activeOfferIds and modal state.
- Do not use Zustand/localStorage as source of truth for offers.
- Do not implement delete offer.
- Do not touch XLSX import/export flow.
- Do not invent summary formulas or backend fields.

Your task FE-001:
1. Inspect the current implementation of Influencers Offers / Offer Matrix.
2. Find relevant files for:
   - page;
   - entity API/types/query keys;
   - filters/parsers;
   - infinite query;
   - matrix widget;
   - matrix actions;
   - modals if any;
   - existing mutation patterns in the project.
3. Report:
   - what already works;
   - what should be preserved;
   - what needs to change for FE-002–FE-006;
   - any blockers.
4. Do not implement code yet.
5. Stop after the report and wait for human approval.
```

---

## 11. Prompt для старта реализации после FE-001 approval

```text
Approved. Continue with FE-002 only.

Implement API contracts and query/mutation foundations for Offer Builder.

Scope:
- Keep existing GET /admin/offers working.
- Add typed API function for POST /admin/offers.
- Add typed API function for PATCH /admin/offers/{offerId}/links/{influencerId}/{accountId}/{connected}.
- Add typed API function for PATCH /admin/offers/published?offerId=...
- Update/extend query keys if needed for matrix invalidation.
- Follow existing project patterns.
- Do not implement UI yet.
- Do not implement delete.
- Do not touch XLSX.
- Stop after implementation and self-review.
```
