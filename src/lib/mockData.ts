/**
 * 開発用テストデータ
 *
 * Graph API（SharePoint）へ接続できない開発環境（Python トークン取得スクリプトや
 * Azure 認証情報が未設定）でも、UI 確認ができるようにするためのインメモリデータ。
 * graphClient.ts から Graph API 接続に失敗した場合のフォールバックとして利用される。
 * ページを再読み込みすると内容はリセットされる。
 */
import { SP_LISTS } from "./sharepointConfig";
import type {
  SPCustomerFields,
  SPSystemFields,
  SPWorkNumberFields,
  SPWorkTypeFields,
  SPReportFields,
  SPPlanFields,
  SPWorkDayFields,
} from "@/types/sharepoint";

type MockItem<F> = {
  id: string;
  fields: F;
  createdDateTime: string;
  createdByName: string;
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  return daysAgo(-n);
}

function iso(date: Date): string {
  return date.toISOString();
}

const DEV_USERS = ["開発ユーザー", "鈴木一郎", "佐藤花子"];

// ---------- マスタデータ ----------

const mockCustomers: MockItem<SPCustomerFields>[] = [
  { id: "1", fields: { Title: "サンプル商事株式会社", SortOrder: 10 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "2", fields: { Title: "テスト工業株式会社", SortOrder: 20 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "3", fields: { Title: "デモシステムズ株式会社", SortOrder: 30, _x76f4__x8ca9_: true }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "4", fields: { Title: "社内", SortOrder: 90 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
];

const mockSystems: MockItem<SPSystemFields>[] = [
  { id: "1", fields: { Title: "基幹業務システム", CustomerLookupId: 1, SortOrder: 10 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "2", fields: { Title: "Webポータル", CustomerLookupId: 1, SortOrder: 20 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "3", fields: { Title: "在庫管理システム", CustomerLookupId: 2, SortOrder: 10 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "4", fields: { Title: "会員システム", CustomerLookupId: 3, SortOrder: 10 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "5", fields: { Title: "社内ツール", CustomerLookupId: 4, SortOrder: 90 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
];

const mockWorkTypes: MockItem<SPWorkTypeFields>[] = [
  { id: "1", fields: { Title: "開発", SortOrder: 10 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "2", fields: { Title: "保守", SortOrder: 20 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "3", fields: { Title: "会議", SortOrder: 30 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "4", fields: { Title: "資料作成", SortOrder: 40 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
];

const mockWorkNumbers: MockItem<SPWorkNumberFields>[] = [
  { id: "1", fields: { Title: "24-001", WorkNumberName: "基幹業務システム改修", _x30b7__x30b9__x30c6__x30e0_ID: 1, _x767a__x6ce8__x5143_LookupId: 1 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "2", fields: { Title: "24-002", WorkNumberName: "Webポータルリニューアル", _x30b7__x30b9__x30c6__x30e0_ID: 2, _x767a__x6ce8__x5143_LookupId: 1 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "3", fields: { Title: "24-003", WorkNumberName: "在庫管理保守", _x30b7__x30b9__x30c6__x30e0_ID: 3, _x767a__x6ce8__x5143_LookupId: 2 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
  { id: "4", fields: { Title: "24-004", WorkNumberName: "会員システム導入", _x30b7__x30b9__x30c6__x30e0_ID: 4, _x767a__x6ce8__x5143_LookupId: 3 }, createdDateTime: iso(daysAgo(365)), createdByName: "開発ユーザー" },
];

// ---------- 作業実績（過去約5週間分）----------

const REPORT_PAIRS = [
  { customerId: 1, systemId: 1 },
  { customerId: 1, systemId: 2 },
  { customerId: 2, systemId: 3 },
  { customerId: 3, systemId: 4 },
  { customerId: 4, systemId: 5 },
];
const REPORT_DESCRIPTIONS = ["定例会議対応", "仕様検討", "機能改修", "不具合対応", "資料作成", "テスト実施", "朝会"];
const REPORT_HOURS = [2, 3, 4, 1, 5, 0.5];

function buildMockReports(): MockItem<SPReportFields>[] {
  const items: MockItem<SPReportFields>[] = [];
  let id = 1;
  for (let offset = 0; offset < 35; offset++) {
    const date = daysAgo(offset);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // 土日は除外
    const entryCount = offset % 3 === 0 ? 1 : 2;
    for (let i = 0; i < entryCount; i++) {
      const user = DEV_USERS[(offset + i) % DEV_USERS.length];
      const pair = REPORT_PAIRS[(offset + i) % REPORT_PAIRS.length];
      const workTypeId = (((offset + i * 2) % 4) + 1);
      const desc = REPORT_DESCRIPTIONS[(offset + i) % REPORT_DESCRIPTIONS.length];
      const hours = REPORT_HOURS[(offset + i) % REPORT_HOURS.length];
      const isProject = pair.customerId !== 4;
      items.push({
        id: String(id++),
        fields: {
          Title: `${desc} - ${user}`,
          ReportDate: iso(date),
          RegistrationDate: iso(date),
          PlannedHours: hours,
          CustomerLookupId: pair.customerId,
          SystemLookupId: pair.systemId,
          WorkTypeLookupId: workTypeId,
          WorkDescription: desc,
          WorkHours: hours,
          ReporterName: user,
          IsProject: isProject,
          Achievement: "○",
        },
        createdDateTime: iso(date),
        createdByName: user,
      });
    }
  }
  return items;
}

// ---------- 作業予定（今後2週間分）----------

function buildMockPlans(): MockItem<SPPlanFields>[] {
  const items: MockItem<SPPlanFields>[] = [];
  let id = 1;
  for (let offset = 0; offset < 14; offset++) {
    const date = daysFromNow(offset);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const user = DEV_USERS[offset % DEV_USERS.length];
    const pair = REPORT_PAIRS[offset % REPORT_PAIRS.length];
    const workTypeId = ((offset % 4) + 1);
    const desc = REPORT_DESCRIPTIONS[offset % REPORT_DESCRIPTIONS.length];
    const hours = REPORT_HOURS[offset % REPORT_HOURS.length];
    items.push({
      id: String(id++),
      fields: {
        Title: `${desc} - ${user}`,
        PlanDate: iso(date),
        CustomerLookupId: pair.customerId,
        SystemLookupId: pair.systemId,
        WorkTypeLookupId: workTypeId,
        WorkDescription: desc,
        PlannedHours: hours,
        IsProject: pair.customerId !== 4,
        AssigneeName: user,
      },
      createdDateTime: iso(daysAgo(1)),
      createdByName: user,
    });
  }
  return items;
}

// ---------- 作業日（過去2週間・開発ユーザー分）----------

function buildMockWorkDays(): MockItem<SPWorkDayFields>[] {
  const items: MockItem<SPWorkDayFields>[] = [];
  let id = 1;
  for (let offset = 0; offset < 14; offset++) {
    const date = daysAgo(offset);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    items.push({
      id: String(id++),
      fields: {
        Title: `作業日 ${date.toISOString().slice(0, 10)}`,
        WorkDate: iso(date),
        WorkStartTime: "09:00",
        WorkEndTime: "18:00",
        BreakHours: 1,
        TodayNote: offset === 0 ? "テストデータ表示中です。" : "",
        ReporterName: "開発ユーザー",
      },
      createdDateTime: iso(date),
      createdByName: "開発ユーザー",
    });
  }
  return items;
}

// ---------- ストア ----------

const store = new Map<string, MockItem<unknown>[]>([
  [SP_LISTS.customers, mockCustomers],
  [SP_LISTS.systems, mockSystems],
  [SP_LISTS.workTypes, mockWorkTypes],
  [SP_LISTS.reports, buildMockReports()],
  [SP_LISTS.plans, buildMockPlans()],
  [SP_LISTS.workDays, buildMockWorkDays()],
]);

if (SP_LISTS.workNumbers) {
  store.set(SP_LISTS.workNumbers, mockWorkNumbers);
}

const nextIdByList = new Map<string, number>();

function nextId(listId: string): string {
  const current = nextIdByList.get(listId) ?? (store.get(listId)?.length ?? 0) + 1;
  nextIdByList.set(listId, current + 1);
  return String(current);
}

export function getMockListItems<F>(listId: string): Array<{ id: string; fields: F; createdDateTime?: string; createdByName?: string }> {
  const items = (store.get(listId) as MockItem<F>[] | undefined) ?? [];
  return items.map((item) => ({ ...item, fields: { ...item.fields } }));
}

export function addMockListItem<F>(listId: string, fields: Record<string, unknown>): { id: string; fields: F } {
  const items = (store.get(listId) as MockItem<F>[] | undefined) ?? [];
  const item: MockItem<F> = {
    id: nextId(listId),
    fields: fields as F,
    createdDateTime: new Date().toISOString(),
    createdByName: "開発ユーザー",
  };
  items.push(item);
  store.set(listId, items as MockItem<unknown>[]);
  return { id: item.id, fields: item.fields };
}

export function updateMockListItem(listId: string, itemId: string, fields: Record<string, unknown>): void {
  const items = store.get(listId) ?? [];
  const target = items.find((item) => item.id === itemId);
  if (target) {
    target.fields = { ...(target.fields as Record<string, unknown>), ...fields };
  }
}

export function deleteMockListItem(listId: string, itemId: string): void {
  const items = store.get(listId) ?? [];
  store.set(listId, items.filter((item) => item.id !== itemId));
}
