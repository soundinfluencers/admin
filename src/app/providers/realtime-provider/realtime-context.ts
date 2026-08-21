import { createContext } from "react";
import type { Socket } from "socket.io-client";
import type {
  ActiveAccountAccountsUpdate,
  NotificationFinishedRefreshingAccounts, RefreshAccountStatusUpdate,
} from "@/app/providers/realtime-provider/realtime.types.ts";

export type WhatsappMessageStatus = "sending" | "sent" | "failed";

export type WhatsappMessageStatusUpdate = {
  campaignId: string;
  influencerId: string;
  phone: string;
  status: WhatsappMessageStatus;
  date: string;
  error?: string;
};

export type RealtimeContextType = {
  socket: Socket | null;
  isConnected: boolean;
  clientId: string | null;
  lastWhatsappStatus: WhatsappMessageStatusUpdate | null;

  activeAccountAccountsUpdates: ActiveAccountAccountsUpdate[];
  lastRefreshAccountStatus: RefreshAccountStatusUpdate | null;
  lastFinishedRefreshingAccountsNotification: NotificationFinishedRefreshingAccounts | null;

  isAccountAccountsUpdating: (params: {
    socialMedia?: string;
    accountId?: string;
    influencerId?: string;
  }) => boolean;
};

export const RealtimeContext = createContext<RealtimeContextType | undefined>(
    undefined,
);

// Состояние активных обновлений (массивы)
//
// - activeAccountPostDetailsUpdates — список кампаний и их аккаунтов, у которых прямо сейчас идёт обновление постов. Фронт использует это чтобы показать спиннеры/индикаторы на нужных строках. Обновляется при каждом start/finish вызове.
// - activeAccountAccountsUpdates — то же самое, но для обновления самих аккаунтов (фолловеры, лого и т.д.) по соцсети.
//
// ---
//   Статус конкретного элемента (по одному)
//
// - refreshPostDetailsStatusUpdate — результат скрейпинга одного поста: успех/неудача, новые impressions и likes. Фронт обновляет строку в таблице как только пришёл ответ, не дожидаясь конца всей операции.
// - refreshAccountStatusUpdate — то же самое для одного аккаунта: успех/неудача, новые followers, logo, engagementRate, averageViews.
//
// ---
//   Финальные уведомления (конец всей операции)
//
// - notificationFinishedRefreshingPostDetails — вся кампания обработана. Содержит campaignName и statusCode. Фронт показывает тост/уведомление "обновление завершено".
// - notificationFinishedRefreshingAccounts — все аккаунты выбранной соцсети обработаны. Содержит socialMedia и statusCode. Аналогичное финальное уведомление.
//
// ---
//   Поток событий для одной операции выглядит так:
//
//   start → activeAccountPostDetailsUpdates (добавили аккаунты)
// └─ для каждого аккаунта: refreshPostDetailsStatusUpdate (результат)
// └─ для каждого аккаунта: finish → activeAccountPostDetailsUpdates (убрали аккаунт)
// end → notificationFinishedRefreshingPostDetails (всё готово)
