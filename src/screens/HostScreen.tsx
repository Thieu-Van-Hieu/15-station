import { useCallback, useId, useState } from "react";
import { ClassroomSession } from "../components/ClassroomSession";
import { Label, s } from "../components/ui";
import { caseFor, classroomTurns } from "../classroom";
import { readHostToken, saveHostToken } from "../hostApi";

const HOST_ROOM_KEY = "tram15_host_room";
const DEFAULT_ROOM = "T15";
const BTN = "border border-vien px-2.5 py-1 font-nhan text-chu-ban-phu hover:border-ho-phach hover:text-ho-phach";

function initialRoom(): string {
  try {
    const r = new URLSearchParams(window.location.search).get("room");
    if (r && r.trim()) return r.trim().toUpperCase();
    return localStorage.getItem(HOST_ROOM_KEY) || DEFAULT_ROOM;
  } catch {
    return DEFAULT_ROOM;
  }
}

/**
 * Màn máy chiếu /host: mở phiên hội đồng lớp học cho một lượt khách bất kỳ mà không cần chơi tới lượt đó.
 * Khi bàn game mở vòng cho lượt khác, màn này tự chuyển sang lượt ấy.
 */
export function HostScreen() {
  const turns = classroomTurns();
  const [room, setRoom] = useState(initialRoom);
  const [roomInput, setRoomInput] = useState(room);
  const [tokenInput, setTokenInput] = useState(readHostToken);
  const [turnId, setTurnId] = useState<string>(turns[0] ?? "d3-t3");
  const [sessionKey, setSessionKey] = useState(0);
  const roomId = useId();
  const tokenId = useId();
  const turnSelectId = useId();

  const onRemoteTurn = useCallback((id: string) => setTurnId(id), []);

  function saveRoom(e: React.FormEvent) {
    e.preventDefault();
    const clean = roomInput.trim().toUpperCase();
    if (!clean) return;
    setRoom(clean);
    try {
      localStorage.setItem(HOST_ROOM_KEY, clean);
      const url = new URL(window.location.href);
      url.searchParams.set("room", clean);
      window.history.replaceState(null, "", url.toString());
    } catch {
      // Bỏ qua
    }
  }

  function saveToken(e: React.FormEvent) {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) return;
    saveHostToken(clean);
    // Dựng lại phiên để nó đọc token mới.
    setSessionKey((k) => k + 1);
  }

  const turnPicker = (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={turnSelectId}>
        <Label className="text-chu-ban-phu/70">{s("host.turn_label")}</Label>
      </label>
      <select
        id={turnSelectId}
        value={turnId}
        onChange={(e) => setTurnId(e.target.value)}
        className="border border-vien bg-ban-1 px-3 py-2 font-nhan text-sm text-giay focus:outline-none focus:border-ho-phach"
      >
        {turns.map((id) => (
          <option key={id} value={id}>
            {id.toUpperCase()} · {caseFor(id)?.name ?? id}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="mat-ban lop-nhieu min-h-screen text-chu-ban font-may-chu">
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-vien/70 bg-ban/90 px-6 py-3 backdrop-blur-sm max-sm:px-3">
        <span className="w-2.5 h-2.5 rounded-full bg-ho-phach animate-nhap-nhay" />
        <div className="min-w-0">
          <h1 className="font-tieu-de text-xl font-bold tracking-wide text-giay">{s("class.title")}</h1>
          <Label className="text-chu-ban-phu/60 text-[10px]">{s("host.title")}</Label>
        </div>
        <span className="border border-ho-phach/60 px-2 py-0.5 font-nhan text-xs font-bold text-ho-phach">
          {s("host.room_label")}: {room}
        </span>
        <a
          href="/"
          className="ml-auto border border-vien px-3 py-1.5 font-nhan text-[11px] font-bold uppercase tracking-wider text-chu-ban-phu hover:text-giay hover:border-vien-sang"
        >
          {s("host.back_game")}
        </a>
      </header>

      <main className="mx-auto max-w-7xl p-6 max-sm:p-3">
        <ClassroomSession
          key={`${sessionKey}-${room}`}
          variant="page"
          room={room}
          turnId={turnId}
          onRemoteTurn={onRemoteTurn}
          lobbyExtra={turnPicker}
        />

        <details className="mt-10 border-t border-vien/60 pt-3 text-xs">
          <summary className="cursor-pointer select-none font-nhan text-[11px] uppercase tracking-wider text-chu-ban-phu/50 hover:text-ho-phach">
            {s("class.settings")}
          </summary>
          <div className="mt-3 flex flex-wrap gap-6">
            <form onSubmit={saveRoom} className="flex items-center gap-2">
              <label htmlFor={roomId} className="font-nhan text-chu-ban-phu/70">
                {s("host.room_label")}
              </label>
              <input
                id={roomId}
                type="text"
                maxLength={10}
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                className="w-28 border border-vien bg-ban-1 px-2 py-1 font-nhan text-giay"
              />
              <button type="submit" className={BTN}>
                OK
              </button>
            </form>
            <form onSubmit={saveToken} className="flex items-center gap-2">
              <label htmlFor={tokenId} className="font-nhan text-chu-ban-phu/70">
                {s("host.token_label")}
              </label>
              <input
                id={tokenId}
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder={s("host.token_placeholder")}
                className="w-48 border border-vien bg-ban-1 px-2 py-1 font-nhan text-giay"
              />
              <button type="submit" className={BTN}>
                OK
              </button>
            </form>
          </div>
        </details>
      </main>
    </div>
  );
}
