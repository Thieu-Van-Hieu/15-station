import { content } from "./content";

/**
 * Trang tạm của P1: chỉ để kiểm khung dự án (React chạy, Tailwind có tác dụng,
 * đọc được data/). Sẽ được thay bằng bộ chọn màn hình theo state.phase ở P6,
 * và khi đó mọi chữ phải lấy từ strings.json.
 */
export default function App() {
  const soLuong = Object.entries(content).map(([ten, duLieu]) => ({
    ten,
    so: Array.isArray(duLieu) ? duLieu.length : Object.keys(duLieu).length,
  }));

  return (
    <main className="min-h-screen bg-xi-mang p-8 font-may-chu text-muc">
      <div className="mx-auto max-w-xl border border-nau bg-giay p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-dau-do">TRẠM 15</h1>
        <p className="mt-1 text-sm">Khung dự án P1 — trang tạm</p>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {soLuong.map(({ ten, so }) => (
              <tr key={ten} className="border-t border-nau/30">
                <td className="py-1">data/{ten}.json</td>
                <td className="py-1 text-right">{so}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
