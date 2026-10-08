# AI Artifact Viewer

Web app tĩnh (Vite + React + TypeScript) để lưu, xem và export các artifact HTML do AI tạo ra.
Không cần backend — build ra thư mục `dist/` gồm toàn file tĩnh, sẵn sàng đóng gói Android bằng Capacitor.

## Cấu trúc

```
src/
  main.tsx                     # mount App trong <StorageProvider>
  App.tsx                      # layout, kéo thả, export ZIP, điều phối
  index.css                    # CSS responsive (desktop: sidebar + preview; mobile: từng màn hình)
  components/
    ArtifactList.tsx           # danh sách + tìm kiếm + sắp xếp + mở/tải/xóa
    ArtifactPreview.tsx        # iframe sandbox + reload / tab mới / đổi tên / export
    ArtifactForm.tsx           # dán HTML, upload file (FileReader)
  hooks/useArtifacts.ts        # state + CRUD, chỉ gọi qua interface storage
  storage/
    types.ts                   # Artifact, ArtifactStorage (interface)
    indexedDbStorage.ts        # implement bằng localForage (IndexedDB)
    StorageProvider.tsx        # React context để thay backend storage
  lib/
    filename.ts                # sanitizeName (chống path traversal), formatSize
    files.ts                   # SANDBOX, đọc file, download, ZIP (fflate), mở tab mới
tests/filename.test.ts         # test sanitizeName (node:test)
```

## Chạy local

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # test sanitizeName
npm run build      # xuất dist/ (file tĩnh)
npm run preview    # xem bản build
```

Cần Node ≥ 22.18 (test chạy file `.ts` trực tiếp bằng `node --test`).

## Storage hoạt động thế nào

- Component **không** gọi IndexedDB. Chúng dùng `useArtifacts()` → `useStorage()` → một object implement `ArtifactStorage`
  (`listArtifacts / getArtifact / saveArtifact / updateArtifact / deleteArtifact`).
- Bản web dùng `indexedDbStorage`: một instance localForage ép driver `INDEXEDDB` (không fallback localStorage).
  Mỗi artifact là một bản ghi, key = `id`.
- `saveArtifact`/`updateArtifact` luôn chạy `sanitizeName` nên mọi đường vào (dán, upload, kéo thả, đổi tên) đều được chuẩn hoá:
  bỏ đường dẫn, ký tự cấm, dấu chấm đầu; tên rỗng → `artifact-<timestamp>.html`; thiếu đuôi → thêm `.html`.
- Đổi backend: viết object mới implement `ArtifactStorage` rồi truyền vào `<StorageProvider storage={...}>` trong `main.tsx`.

## Bảo mật preview

- iframe dùng `srcdoc` + `sandbox="allow-scripts allow-forms allow-modals allow-popups"`, **không** có `allow-same-origin`
  → artifact chạy ở origin `null`, không đọc được IndexedDB/localStorage/DOM của app (đã kiểm tra: `localStorage` và `parent.document` đều bị chặn).
- "Tab mới" không mở thẳng blob của artifact (blob URL mang origin của app). Nó mở một trang bọc không có script,
  chứa iframe sandbox giống hệt.
- Không đặt CSP cho app vì iframe `srcdoc` thừa hưởng CSP của trang cha, sẽ chặn script/CDN của artifact.

## Đóng gói Android bằng Capacitor

```bash
npm i @capacitor/core @capacitor/android
npm i -D @capacitor/cli
npx cap init "AI Artifact Viewer" com.example.artifactviewer --web-dir dist
npm run build
npx cap add android
npx cap sync android
npx cap open android      # build/run bằng Android Studio
```

- `vite.config.ts` đặt `base: './'`, toàn bộ asset là file tĩnh; WebView load `dist/` trực tiếp, không cần localhost hay Node.
- IndexedDB vẫn chạy trong WebView, nên app dùng được ngay. Muốn lưu ra file thật: viết `capacitorStorage` implement
  `ArtifactStorage` bằng `@capacitor/filesystem` (mỗi artifact một file `<id>.json` hoặc `.html` + index) hoặc
  `@capacitor-community/sqlite`, rồi chọn trong `main.tsx`:
  `Capacitor.isNativePlatform() ? capacitorStorage : indexedDbStorage`.
- Tên file khi ghi ra filesystem phải đi qua `sanitizeName` (đã có sẵn).

## Chưa làm / giới hạn (ghi chú rõ)

- **Download/export trên Android**: `<a download>` không hoạt động trong WebView. Cần thay `downloadFile` trong `lib/files.ts`
  bằng `Filesystem.writeFile` + `@capacitor/share`. Trên web chạy bình thường.
- **"Tab mới" trên Android**: `window.open` trong WebView không mở tab; nên ẩn nút này hoặc dùng `@capacitor/browser` khi native.
- **Nút back phần cứng Android**: chưa xử lý; thêm listener `App.addListener('backButton', ...)` từ `@capacitor/app` để gọi "quay lại danh sách".
- **File System Access API ("Chọn thư mục lưu trên máy")**: chưa làm (yêu cầu là tuỳ chọn). Nếu cần, viết thêm một `ArtifactStorage`
  dùng `showDirectoryPicker()` — chỉ bật khi `'showDirectoryPicker' in window`.
- **Kéo thả**: nếu con trỏ đi thẳng từ ngoài cửa sổ vào vùng iframe, trình duyệt gửi sự kiện cho iframe nên lớp phủ có thể không hiện;
  kéo qua vùng danh sách/thanh công cụ thì luôn nhận.
- Không có chỉnh sửa nội dung HTML (chỉ đổi tên). Toàn bộ HTML được giữ trong bộ nhớ — ổn với vài trăm artifact; nhiều hơn thì tách metadata/nội dung.
