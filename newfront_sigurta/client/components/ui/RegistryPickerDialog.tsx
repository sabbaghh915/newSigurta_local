import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export type RegistryCandidate = {
  from: "syrian_vehicles" | "vehicle_registry";
  score: number;
  preview: Record<string, any>;
  patch: Record<string, any>;
};

export function RegistryPickerDialog({
  open,
  onOpenChange,
  candidates,
  onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  candidates: RegistryCandidate[];
  onApply: (patch: Record<string, any>, mode: "fill-empty" | "override") => void;
}) {
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (open) setSelected(0);
  }, [open]);

  const c = candidates[selected];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>وجدنا أكثر من سجل مطابق</DialogTitle>
          <DialogDescription>
            اختر السجل الصحيح. (هذا يحدث عندما تتكرر اللوحة/الاسم أو توجد سجلات متشابهة)
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScrollArea className="h-[360px] rounded-md border p-2">
            <div className="space-y-2">
              {candidates.map((x, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={[
                    "w-full text-right rounded-md border p-3 transition",
                    i === selected ? "border-primary ring-1 ring-primary" : "hover:bg-muted",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold truncate">{x.preview.ownerName || x.patch.ownerName || "بدون اسم"}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={x.from === "syrian_vehicles" ? "default" : "secondary"}>
                        {x.from === "syrian_vehicles" ? "من سجلات المنصة" : "من الإكسل القديم"}
                      </Badge>
                      <Badge variant="outline">Score: {x.score}</Badge>
                    </div>
                  </div>

                  <div className="mt-2 text-sm opacity-80 space-y-1">
                    <div>اللوحة: {x.preview.plateRegion || x.patch.plateRegion || ""} {x.preview.plateNumber || x.patch.plateNumber || "-"}</div>
                    <div>الهيكل: {x.preview.chassisNumber || x.patch.chassisNumber || "-"}</div>
                    <div>المحرك: {x.preview.engineNumber || x.patch.engineNumber || "-"}</div>
                    <div>وطني: {x.preview.nationalId || x.patch.nationalId || "-"}</div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="rounded-md border p-4">
            <div className="font-semibold mb-2">السجل المحدد</div>
            <div className="text-sm opacity-90 space-y-1">
              <div>الاسم: {c?.patch?.ownerName || "-"}</div>
              <div>اللوحة: {c?.patch?.plateRegion ? `${c.patch.plateRegion} / ` : ""}{c?.patch?.plateNumber || "-"}</div>
              <div>الهيكل: {c?.patch?.chassisNumber || "-"}</div>
              <div>المحرك: {c?.patch?.engineNumber || "-"}</div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button type="button" onClick={() => c && onApply(c.patch, "fill-empty")}>
                تعبئة الحقول الفارغة فقط (آمن)
              </Button>
              <Button type="button" variant="outline" onClick={() => c && onApply(c.patch, "override")}>
                استبدال جميع الحقول (غير آمن)
              </Button>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
