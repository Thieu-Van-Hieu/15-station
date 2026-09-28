import { createContext, useContext, useState, type ReactNode } from "react";
import type { Document as EngineDoc, DocumentDef } from "../engine/types";
import { content } from "../content";
import { playSfx } from "../audio";
import { Modal, PaperClip, SealMark, cx, s, unit } from "./ui";
import { InkMark, type Ink } from "./stamping";

/** Bút chì đối chất (V8): khi bật, bấm vào dòng trên giấy để khoanh thay vì phóng to giấy. */
export interface Pencil {
  active: boolean;
  selected: readonly string[];
  onSelect: (factId: string) => void;
}

const PencilContext = createContext<{ pencil: Pencil | null; docIndex: number }>({ pencil: null, docIndex: 0 });

/** Cho phép khoanh các dòng nằm ngoài giấy tờ (ví dụ hàng thực mang theo). */
export function PencilScope({ pencil, children }: { pencil: Pencil; children: ReactNode }) {
  return <PencilContext.Provider value={{ pencil, docIndex: -1 }}>{children}</PencilContext.Provider>;
}

/** Một chỗ khoanh được. Khi bút chì bật thì bấm để khoanh; chỗ đã khoanh có vòng bút chì đỏ. */
export function Circlable({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  const { pencil } = useContext(PencilContext);
  const on = pencil?.selected.includes(id) ?? false;
  if (!pencil?.active) {
    return <div className={cx("relative", className)}>{children}{on && <PencilRing />}</div>;
  }
  return (
    <div
      role="button"
      tabIndex={0}
      data-fact={id}
      onClick={(e) => {
        e.stopPropagation();
        pencil.onSelect(id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          pencil.onSelect(id);
        }
      }}
      className={cx("relative cursor-crosshair rounded-sm outline-1 outline-dashed outline-transparent hover:outline-son/60 hover:bg-son/5 -mx-1 px-1", className)}
    >
      {children}
      {on && <PencilRing />}
    </div>
  );
}

function PencilRing() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-x-1.5 -inset-y-1 rounded-[50%] border-2 border-son/80 -rotate-1 animate-truot-vao"
      style={{ borderTopColor: "rgba(192,57,43,0.55)", borderLeftWidth: 1.5 }}
    />
  );
}

interface DocumentPaperProps {
  doc: EngineDoc;
  def?: DocumentDef;
  tilt?: number;
  className?: string;
  style?: React.CSSProperties;
  onFocus?: () => void;
  /** Vị trí giấy trên bàn, dùng cho mã chỗ khoanh (`d<vị trí>.<trường>`) và vùng nhận dấu. */
  index?: number;
  /** Vệt mực đã đóng lên giấy này (V5). */
  inks?: Ink[];
  pencil?: Pencil;
}

type Layout = "giay-doc" | "giay-ngang" | "so" | "phieu-nho" | "the";

type ItemLike = { ma?: string; ten?: string; so_luong: number; don_vi: string };

const WIDTH: Record<Layout, string> = {
  "giay-doc": "w-[290px]",
  "giay-ngang": "w-[350px]",
  so: "w-[290px]",
  "phieu-nho": "w-[230px]",
  the: "w-[270px]",
};

export function DocumentPaper({ doc, def, tilt = 0, className, style, onFocus, index = 0, inks, pencil }: DocumentPaperProps) {
  const [zoomed, setZoomed] = useState(false);
  const docDef = def ?? content.documents.find((d) => d.code === doc.type);

  if (!docDef) return null;
  const layout = (docDef.layout as Layout) in WIDTH ? (docDef.layout as Layout) : "giay-doc";

  function toggle() {
    if (pencil?.active) return;
    playSfx("paper");
    setZoomed((z) => !z);
    onFocus?.();
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle())}
        data-stamp-target={`d${index}`}
        className={cx(
          "relative select-none transition-transform duration-200 hover:z-20 focus-visible:outline-2 focus-visible:outline-ho-phach",
          pencil?.active ? "cursor-default" : "cursor-zoom-in hover:-translate-y-1",
          WIDTH[layout],
          className,
        )}
        style={{ transform: `rotate(${tilt}deg)`, ...style }}
      >
        <PencilContext.Provider value={{ pencil: pencil ?? null, docIndex: index }}>
          <Sheet doc={doc} def={docDef} layout={layout} />
        </PencilContext.Provider>
        {inks?.map((ink, i) => <InkMark key={i} ink={ink} />)}
      </div>

      {zoomed && (
        <Modal onClose={toggle} className="cursor-zoom-out">
          <div className="w-full max-w-[520px] animate-truot-vao text-[15px]" style={{ transform: "rotate(-0.6deg)" }}>
            <Sheet doc={doc} def={docDef} layout={layout} large />
          </div>
        </Modal>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tờ giấy theo từng kiểu trình bày
// ---------------------------------------------------------------------------

function Sheet({ doc, def, layout, large }: { doc: EngineDoc; def: DocumentDef; layout: Layout; large?: boolean }) {
  const fields = doc.fields as Record<string, unknown>;
  const rows = <Fields def={def} fields={fields} layout={layout} />;
  const seal = doc.seal && <SealMark seal={doc.seal} className={large ? "w-28 h-28" : undefined} />;
  const damage = doc.damaged && <Damage />;
  const textSize = large ? "text-sm" : "text-[11px]";

  switch (layout) {
    case "so":
      return (
        <div className={cx("relative shadow-giay border border-[#2f3a2a]", textSize)}>
          <div className="bg-[#3b4632] text-bia px-4 py-3 text-center border-b-4 border-double border-bia/40">
            <div className="font-nhan text-[9px] tracking-[0.2em] uppercase opacity-80">{s("doc.nation")}</div>
            <div className="font-tieu-de font-bold text-lg tracking-wide uppercase mt-1">{def.name}</div>
            <div className="font-nhan text-[10px] tracking-widest opacity-70">{def.code}</div>
          </div>
          <div className="giay-hat p-4 text-muc">
            {rows}
            {seal && <div className="flex justify-end -mt-2">{seal}</div>}
          </div>
          {damage}
        </div>
      );

    case "the":
      return (
        <div className={cx("relative shadow-giay border-2 border-son-dam bg-[#7a1f1c] p-2", textSize)}>
          <div className="flex items-center gap-2 px-2 pb-2 text-ho-phach">
            <span className="text-lg leading-none">★</span>
            <div>
              <div className="font-tieu-de font-bold uppercase tracking-wide text-sm leading-tight">{def.name}</div>
              <div className="font-nhan text-[10px] tracking-widest opacity-80">{def.code}</div>
            </div>
          </div>
          <div className="giay-hat p-3 text-muc flex gap-3">
            <div className="w-14 h-[72px] shrink-0 border border-muc/40 bg-giay-than grid place-items-center text-muc/30 text-2xl">
              ☺
            </div>
            <div className="flex-1 min-w-0">{rows}</div>
          </div>
          {seal && <div className="flex justify-end -mt-8 -mb-3 mr-1 scale-75 origin-bottom-right">{seal}</div>}
          {damage}
        </div>
      );

    case "phieu-nho":
      return (
        <div
          className={cx(
            "relative shadow-giay p-3 text-muc border-2 border-dashed border-ke outline outline-1 outline-giay-vien -outline-offset-[5px]",
            doc.type === "DT" ? "bg-[#f7f3e8]" : "giay-than-hat",
            textSize,
          )}
        >
          <div className="text-center border-b border-muc/30 pb-1.5 mb-2">
            <div className="font-tieu-de font-bold uppercase tracking-wide text-son text-sm">{def.name}</div>
            <div className="font-nhan text-[10px] tracking-widest text-muc-nhat">{def.code}</div>
          </div>
          {rows}
          {seal && <div className="flex justify-end -mb-2 -mr-1 scale-90 origin-bottom-right">{seal}</div>}
          {damage}
        </div>
      );

    case "giay-ngang":
      return (
        <div className={cx("relative shadow-giay border border-giay-vien p-4 text-muc bg-[#dcd6c6]", textSize)}>
          <div className="absolute inset-0 opacity-40 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05)_0_1px,transparent_1px_4px)]" />
          <div className="relative flex items-start justify-between gap-3 border-b-2 border-muc/50 pb-2 mb-3">
            <div>
              <div className="font-tieu-de font-bold uppercase tracking-wide text-[15px] leading-tight">{def.name}</div>
              <div className="font-nhan text-[10px] tracking-widest text-muc-nhat">{def.code}</div>
            </div>
            <div className="font-nhan text-[9px] text-right text-muc-nhat leading-tight max-w-[45%]">
              {s("doc.nation")}
            </div>
          </div>
          <div className="relative">{rows}</div>
          {seal && <div className="relative flex justify-end -mt-3">{seal}</div>}
          {damage}
        </div>
      );

    default:
      return (
        <div className={cx("relative giay-hat shadow-giay border border-giay-vien px-4 pt-3 pb-4 text-muc", textSize)}>
          <PaperClip className="-top-4 -left-1.5" />
          <div className="text-center leading-tight">
            <div className="font-nhan font-bold text-[9px] tracking-[0.12em]">{s("doc.nation")}</div>
            <div className="text-[10px] italic underline underline-offset-2">{s("doc.motto")}</div>
          </div>
          <div className="text-center mt-2.5 mb-3">
            <div className="font-tieu-de font-bold uppercase text-son text-base tracking-wide">{def.name}</div>
            <div className="font-nhan text-[10px] tracking-widest text-muc-nhat">{def.code}</div>
          </div>
          {rows}
          {seal && <div className="flex justify-end -mt-1">{seal}</div>}
          {damage}
        </div>
      );
  }
}

function Fields({ def, fields, layout }: { def: DocumentDef; fields: Record<string, unknown>; layout: Layout }) {
  const { docIndex } = useContext(PencilContext);
  const fid = (key: string, i?: number) => `d${docIndex}.${key}${i === undefined ? "" : `.${i}`}`;
  return (
    <div className="space-y-1.5 leading-snug">
      {def.fields.map((f) => {
        const val = fields[f.key];
        if (val === undefined || val === null) return null;

        if (f.kind === "items" && Array.isArray(val)) {
          return (
            <div key={f.key} className="pt-1">
              <Circlable id={fid(f.key)}>
                <div className="font-nhan text-[10px] uppercase tracking-wider text-muc-nhat">{f.label}:</div>
              </Circlable>
              <div className="mt-1">
                {(val as ItemLike[]).map((item, idx) => (
                  <Circlable key={idx} id={fid(f.key, idx)}>
                    <div className="flex justify-between gap-2 border-b border-dotted border-muc/30 py-0.5">
                      <span>{item.ten ?? item.ma}</span>
                      <span className="font-bold whitespace-nowrap">
                        {item.so_luong} {unit(item.don_vi)}
                      </span>
                    </div>
                  </Circlable>
                ))}
              </div>
            </div>
          );
        }

        let shown: ReactNode = String(val);
        if (f.kind === "item" && typeof val === "object") {
          const item = val as ItemLike;
          shown = (
            <>
              {item.ten ?? item.ma} ({item.so_luong} {unit(item.don_vi)})
            </>
          );
        }

        return (
          <Circlable key={f.key} id={fid(f.key)}>
            <div className={cx("flex items-baseline gap-2", layout === "giay-ngang" && "text-[0.95em]")}>
              <span className="text-muc-nhat whitespace-nowrap">{f.label}:</span>
              <span className="flex-1 border-b border-dotted border-muc/40 translate-y-[-3px]" />
              <span className="font-bold text-right">{shown}</span>
            </div>
          </Circlable>
        );
      })}
    </div>
  );
}

function Damage() {
  return (
    <>
      <div className="pointer-events-none absolute right-6 top-10 w-20 h-14 rounded-[50%] bg-[#6b4a22]/25 blur-[2px]" />
      <div
        className="pointer-events-none absolute -right-px bottom-10 w-5 h-16 bg-ban/90"
        style={{ clipPath: "polygon(100% 0, 30% 20%, 80% 40%, 10% 60%, 70% 80%, 100% 100%)" }}
      />
      <div className="absolute left-2 bottom-2 font-nhan text-[9px] uppercase tracking-wider text-son-dam">{s("desk.damaged")}</div>
    </>
  );
}
