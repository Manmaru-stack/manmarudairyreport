import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Megaphone } from "lucide-react";
import { changelogEntries, latestChangelogVersion } from "@/lib/changelog";

const LAST_SEEN_VERSION_KEY = "announcements-last-seen-version";

export function AnnouncementsCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    try {
      const lastSeenVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);
      setHasUnread(lastSeenVersion !== latestChangelogVersion);
    } catch {
      // localStorage が利用できない環境では常に既読扱いとする
    }
  }, []);

  const markAsRead = () => {
    if (!hasUnread) return;
    setHasUnread(false);
    try {
      localStorage.setItem(LAST_SEEN_VERSION_KEY, latestChangelogVersion);
    } catch {
      // 保存に失敗しても表示上は既読にしておく
    }
  };

  const latestEntry = changelogEntries[0];

  return (
    <Card className="mb-6 gap-0 overflow-hidden py-0">
      <CardHeader className="px-2 py-1.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium leading-none">
            <Megaphone className="h-4 w-4 text-primary" />
            お知らせ
            {hasUnread && (
              <Badge className="px-1.5 py-0 text-[10px] leading-4">NEW</Badge>
            )}
          </CardTitle>
          <Button
            size="sm"
            className="h-8 px-3"
            variant="outline"
            onClick={(event) => {
              event.preventDefault();
              setIsOpen((prev) => !prev);
              markAsRead();
            }}
          >
            {isOpen ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                隠す
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                表示
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {!isOpen && latestEntry && (
        <CardContent className="px-2 pb-2 pt-0 text-xs text-muted-foreground">
          Ver {latestEntry.version}（{latestEntry.date}）: {latestEntry.items[0]}
          {latestEntry.items.length > 1 ? ` 他${latestEntry.items.length - 1}件` : ""}
        </CardContent>
      )}
      {isOpen && (
        <CardContent className="px-2 pb-2 pt-0 text-sm">
          <div className="space-y-4">
            {latestEntry && (
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Ver {latestEntry.version}</span>
                  <span className="text-xs text-muted-foreground">{latestEntry.date}</span>
                </div>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                  {latestEntry.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
