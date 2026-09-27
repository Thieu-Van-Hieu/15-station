import { useState } from "react";
import type { Document as EngineDoc, DocumentDef } from "../engine/types";
import { content } from "../content";
import { playSfx } from "../audio";

interface DocumentPaperProps {
  doc: EngineDoc;
  def?: DocumentDef;
}

export function DocumentPaper({ doc, def }: DocumentPaperProps) {
  const [zoomed, setZoomed] = useState(false);
  const docDef = def ?? content.documents.find((d) => d.code === doc.type);

  if (!docDef) {
    return null;
  }

  const fields = doc.fields as Record<string, any>;

  return (
    <div
      onClick={() => {
        playSfx("paper_rustle");
        setZoomed(!zoomed);
      }}
      className={`cursor-pointer transition-all duration-200 border-2 border-nau bg-giay text-muc shadow-md select-none ${
        zoomed
          ? "fixed inset-8 z-50 overflow-y-auto p-8 max-w-2xl mx-auto shadow-2xl ring-4 ring-nau/40"
          : "relative p-4 w-72 min-h-64 hover:shadow-xl hover:-translate-y-1"
      }`}
    >
      <div className="border-b border-nau/40 pb-2 mb-3 text-center">
        <h3 className="font-bold text-base tracking-wide text-dau-do">{docDef.name}</h3>
        <p className="text-xs text-muc/70 italic">{docDef.code}</p>
      </div>

      <div className="space-y-2 text-xs leading-relaxed">
        {docDef.fields.map((f) => {
          const val = fields[f.key];
          if (val === undefined || val === null) return null;

          if (f.kind === "items" && Array.isArray(val)) {
            return (
              <div key={f.key} className="pt-1">
                <span className="font-semibold text-nau">{f.label}:</span>
                <ul className="list-disc list-inside mt-1 pl-1 space-y-0.5">
                  {val.map((item, idx) => (
                    <li key={idx} className="text-xs">
                      {item.ten ?? item.ma}: {item.so_luong} {item.don_vi}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          if (f.kind === "item" && typeof val === "object") {
            return (
              <div key={f.key} className="flex justify-between border-b border-dashed border-nau/20 pb-0.5">
                <span className="font-semibold text-nau">{f.label}:</span>
                <span>
                  {val.ten ?? val.ma} ({val.so_luong} {val.don_vi})
                </span>
              </div>
            );
          }

          return (
            <div key={f.key} className="flex justify-between border-b border-dashed border-nau/20 pb-0.5">
              <span className="font-semibold text-nau">{f.label}:</span>
              <span className="font-mono text-right">{String(val)}</span>
            </div>
          );
        })}
      </div>

      {doc.seal && (
        <div className="mt-4 pt-2 border-t border-nau/30 flex justify-end">
          <div
            className={`border-2 border-dau-do rounded-full p-2 text-center text-[10px] uppercase font-bold text-dau-do transform -rotate-6 ${
              doc.seal.legible ? "opacity-90" : "opacity-40 filter blur-[0.5px]"
            }`}
          >
            <div>{doc.seal.kind}</div>
            <div className="text-[9px] font-normal">{doc.seal.place}</div>
          </div>
        </div>
      )}
    </div>
  );
}
