# Nesrin & Emrah — Düğün Davetiyesi

Nesrin ve Emrah'ın düğün davetiye sitesi. **Canlı:** https://nesrin-emrah.github.io/

- **Düğün:** 12 Eylül 2026 Cumartesi, 19:00 — Tuzla Özel Eğitim Merkezi Komutanlığı (Tuzla Ordu Evi)

## Özellikler

- Basılı davetiye tasarımından birebir uyarlanan hero (yağlıboya doku, çift çerçeve, el yazısı isimler)
- İsimlerde kalemle yazılıyormuş gibi write-on animasyonu ve parıltı efektleri
- Tıklamada havai fişek parçacık efekti, fare izinde ince parıltı
- Nikaha geri sayım
- Program akışı, mekan ve yol tarifi (Google Maps + QR)
- Misafirlerden fotoğraf/video toplama (Supabase Storage)
- RSVP katılım formu

## Dosyalar

- `index.html` — tüm içerik
- `styles.css` — tasarım (davetiye paleti `:root` değişkenlerinde)
- `script.js` — geri sayım, yükleme/RSVP formları, animasyon efektleri
- `config.js` — Supabase ayarları (publishable anon key; erişim RLS politikalarıyla korunur)
- `supabase-policies.sql` — Storage yükleme politikaları

## Yayınlama

Site GitHub Pages'ten `main` dalı kökünden yayınlanır. Değişiklik için:

```sh
git add -A && git commit -m "..." && git push
```

Push sonrası Pages birkaç dakika içinde otomatik güncellenir.

## Yerelde Çalıştırma

Statik sitedir; herhangi bir HTTP sunucusu yeterli:

```sh
python3 -m http.server 8000   # http://localhost:8000
```
