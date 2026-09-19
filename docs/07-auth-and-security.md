# 07. Authentication, Security, & Privacy Governance

Dokumen ini menguraikan standar keamanan tingkat enterprise, arsitektur otentikasi hibrida, serta mitigasi celah kerentanan data pada DataLoka.

---

## 1. Arsitektur Otentikasi Hibrida (`src/core/auth/auth-service.ts`)

DataLoka mengimplementasikan **Dual-Layer Authentication Strategy**:

```
+-------------------------------------------------------------------------------+
|                            AUTHENTICATION PIPELINE                            |
+-------------------------------------------------------------------------------+
|                                                                               |
|  [ User Action: Register / Login / Reset Password ]                           |
|                       |                                                       |
|                       v                                                       |
|  [ Check Firebase Initialization Status ]                                     |
|                       |                                                       |
|        +--------------+--------------+                                        |
|        | (Firebase Online)           | (Firebase Config Kosong/Error)         |
|        v                             v                                        |
|  [ Firebase Auth Engine ]      [ Local Resilient Auth Engine ]                |
|  - `createUserWithEmail...`    - Enkripsi password lokal (PBKDF2/SHA-256)     |
|  - `signInWithEmail...`        - State tersimpan di `localStorage` terisolasi |
|  - `sendPasswordResetEmail`    - Simulasi token pemulihan via email           |
|        |                             |                                        |
|        +--------------+--------------+                                        |
|                       |                                                       |
|                       v                                                       |
|        [ Commit Session to useAuthStore ]                                     |
|        - Set Active User & Subscription Tier                                  |
|        - Sinkronisasi Akses Dasbor Workspace                                  |
+-------------------------------------------------------------------------------+
```

### Fitur Pemulihan Kata Sandi (*Password Reset*)
- Mendukung pemulihan kata sandi via email terdaftar.
- Pada mode lokal, tautan pemulihan dicatat secara aman dalam sesi diagnostik untuk memudahkan pengujian tanpa dependensi SMTP eksternal.

---

## 2. Mitigasi CSV Formula Injection (CWE-1236)

Kerentanan formula injection terjadi apabila sel data yang diawali dengan karakter operator (`=`, `+`, `-`, `@`, `\t`, `\r`) dieksekusi sebagai perintah formula berbahaya saat dibuka di Microsoft Excel atau LibreOffice.

### Mekanisme Sanitasi (`src/core/export/csv-sanitizer.ts`)

Setiap data string yang diekspor melalui fungsi `exportToCsv()` atau endpoint `/api/export/data` melewati filter pengamanan berikut:

```typescript
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);

  // Jika string diawali dengan karakter eksekusi formula spreadsheet
  const formulaChars = ["=", "+", "-", "@", "\t", "\r"];
  if (formulaChars.some((char) => stringValue.startsWith(char))) {
    // Sisipkan petik tunggal (') di awal karakter untuk memaksa Excel membacanya sebagai literal teks
    return `'${stringValue}`;
  }

  return stringValue;
}
```

---

## 3. Isolasi Privasi Data Klien (*Zero-Cloud Raw Data Exposure*)

DataLoka menerapkan prinsip kepatuhan privasi ketat (GDPR & UU PDP):
1. **Tidak Ada Database Cloud untuk Raw Data**: Seluruh baris transaksi pengguna disimpan hanya di memory browser dan IndexedDB lokal.
2. **Metadata-Only AI Transmissions**: Saat fitur "Tanya Data AI" dipanggil, payload yang dikirim ke endpoint `/api/ai/query` **hanya** berisi skema nama kolom dan tipe data, tanpa menyertakan record PII (nama pelanggan, alamat, NIK, dll.).
3. **Penyimpanan Lokal Terenkripsi**: Snapshot yang disimpan di peramban menggunakan kompresi Base64 URL-safe dengan hash integritas.

---

## 4. Keamanan Header & Content Security Policy (CSP)

File `next.config.ts` mengonfigurasi header respons keamanan ketat:

- **`X-Frame-Options: DENY`**: Mencegah serangan *Clickjacking*.
- **`X-Content-Type-Options: nosniff`**: Mencegah *MIME-type sniffing*.
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Menjaga kerahasiaan URL asal.
- **`Permissions-Policy: camera=(), microphone=(), geolocation=()`**: Membatasi akses hardware yang tidak diperlukan.
