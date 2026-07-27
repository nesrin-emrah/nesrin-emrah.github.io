# Wedding Invitation Template

Bu klasor, duzenlemesi kolay bir dugun davetiye sitesi taslagi icerir.

## Dosyalar

- `index.html`: Tum icerik alanlari burada.
- `styles.css`: Renkler, tipografi ve yerlesim.
- `script.js`: Geri sayim alani.

## Ilk Duzenlenecek Alanlar

`index.html` icinde asagidaki yer tutuculari degistir:

- `[Gelin Adi]`
- `[Damat Adi]`
- `[Mekan Adi]`
- `[Mahalle / Sokak / Ilce / Sehir]`
- `[Telefon Numarasi]`
- `[E-posta Adresi]`

## Hizli Kisisellestirme

- Tarihi degistirmek icin `data-target-date` alanini guncelle.
- Harita icin `href="#"` olan linklere kendi konum linklerini yapistir.
- Yukleme alani icin `Fotograf / Video Yukle` butonuna Google Drive, Dropbox File Request, WeTransfer Portals ya da benzeri bir link ekleyebilirsin.
- Galeri alaninda `Foto 01` gibi kutularin yerine `img` etiketi koyarak kendi fotograflarini ekle.
- Renkleri degistirmek icin `styles.css` icindeki `:root` altindaki degiskenleri duzenle.

## Fotograf ve Video Toplama

Bu surum, Supabase ile ucretsiz planda calisabilecek sekilde hazirlandi.

## Supabase ile Ucretsiz Kurulum

1. [Supabase](https://supabase.com/) uzerinden ucretsiz bir proje olustur.
2. `Storage` altinda ornegin `wedding-media` isimli bir bucket ac.
3. Bucket'i `public` yapma. Dosyalar misafirler tarafindan yuklenecek ama herkese acik olmak zorunda degil.
4. Masaustundeki template klasorunde `config.example.js` dosyasini kopyalayip `config.js` yap.
5. `config.js` icine `Project URL`, `anon public key`, `bucket` adini yaz.
6. Supabase SQL Editor icinde `supabase-policies.sql` dosyasindaki sorgulari calistir.
7. Siteyi yayinla ve formu test et.

## Gerekli Dosyalar

- `config.js`: Sana ozel Supabase ayarlari burada olacak.
- `script.js`: Yükleme formu buradan Supabase'e dosya yollar.
- `supabase-policies.sql`: Upload icin gerekli temel policy ornekleri.

## Notlar

- Ucretsiz planda baslangic icin yeterlidir.
- Cok buyuk videolarda misafirlerin internet hizina gore yukleme suresi uzayabilir.
- Istersen daha sonra admin paneli veya galeri sayfasi da ekleyebiliriz.

## Alternatifler

- Google Drive paylasim klasoru veya Google Form dosya yukleme
- Dropbox File Request
- WeTransfer Portals

## Onemli

Supabase tarafinda `Storage` politikalari ayarlanmadan yukleme calismaz. Bu repo icine hazir bir SQL dosyasi eklendi.

## Calistirma

`index.html` dosyasini tarayicida acman yeterli.
