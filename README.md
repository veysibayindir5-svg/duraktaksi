# 🚕 Kilis Merkez Taksi Portalı

Kilis merkezdeki tüm taksi duraklarını listeleyen, filtreleme ve arama özellikleri olan, Google AdSense uyumlu statik taksi portalı.

## 📋 Özellikler

- ✅ **Gelişmiş Arama**: Durak adı, mahalle veya hizmete göre arama
- ✅ **Akıllı Filtreleme**: Mahalle, 7/24, kartla ödeme, havalimanı/otogar transferi
- ✅ **Konum Bazlı Sıralama**: En yakın taksi duraklarını bul
- ✅ **Ücret Hesaplama**: Tahmini taksi ücretini hesapla
- ✅ **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu
- ✅ **Google AdSense Entegrasyonu**: Reklam yerleşimleri hazır
- ✅ **SEO Optimizasyonu**: Meta taglar ve structured data
- ✅ **Hızlı İletişim**: Tek tıkla arama, WhatsApp, yol tarifi

## 📂 Proje Yapısı

```
kilis-taksi-portali/
├── index.html              # Ana sayfa
├── duraklar.html          # Tüm duraklar listesi
├── durak-detay.html       # Durak detay sayfası
├── hakkimizda.html        # Hakkımızda
├── iletisim.html          # İletişim
├── sss.html               # SSS
├── ads.txt                # Google AdSense doğrulama
├── README.md              # Bu dosya
└── assets/
   ├── css/
   │  └── style.css        # Ana stil dosyası
   ├── js/
   │  └── app.js           # Tüm JavaScript fonksiyonları
   └── data/
      └── taksiler.json    # Taksi durağı veritabanı (JSON)
```

## 🚀 Kurulum ve Yayınlama

### 1. GitHub Repository Oluşturma

```bash
# Terminal/PowerShell'de proje klasörüne gidin
cd C:\Users\pc\.gemini\antigravity\scratch\kilis-taksi-portali

# Git repository başlatın
git init

# Tüm dosyaları ekleyin
git add .

# İlk commit'i yapın
git commit -m "İlk commit: Kilis Taksi Portalı"

# GitHub'da yeni bir repository oluşturun (örnek: kilis-taksi-portali)
# Ardından remote ekleyin (KULLANICI_ADINIZ yerine GitHub kullanıcı adınızı yazın)
git remote add origin https://github.com/KULLANICI_ADINIZ/kilis-taksi-portali.git

# Main branch oluşturun ve push yapın
git branch -M main
git push -u origin main
```

### 2. GitHub Pages Aktifleştirme

1. GitHub repository sayfanıza gidin
2. **Settings** → **Pages** bölümüne tıklayın
3. **Source** kısmında **"Deploy from a branch"** seçin
4. **Branch** kısmında **"main"** ve **"/ (root)"** seçin
5. **Save** butonuna tıklayın
6. Birkaç dakika içinde siteniz `https://KULLANICI_ADINIZ.github.io/kilis-taksi-portali/` adresinde yayında olacak

### 3. Özel Domain Bağlama (alanadim.com)

#### A) DNS Ayarları (Domain sağlayıcınızda)

Aşağıdaki A kayıtlarını ekleyin:

```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

CNAME kaydı ekleyin:

```
Type: CNAME
Name: www
Value: KULLANICI_ADINIZ.github.io
```

#### B) GitHub Pages'de Domain Ayarı

1. Repository → **Settings** → **Pages**
2. **Custom domain** alanına `alanadim.com` yazın
3. **Save** butonuna tıklayın
4. **Enforce HTTPS** kutucuğunu işaretleyin (DNS yayılması bitince otomatik aktif olur)

#### C) ads.txt Doğrulama

Domain bağlandıktan sonra, `https://alanadim.com/ads.txt` adresinin erişilebilir olduğunu kontrol edin.

### 4. Google AdSense Entegrasyonu

#### Adım 1: AdSense Yayıncı Kimliğinizi Güncelleyin

Tüm HTML dosyalarında (`index.html`, `duraklar.html`, vb.) şu satırı bulun:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```

`pub-XXXXXXXXXXXXXXX` kısmını kendi AdSense yayıncı kimliğinizle değiştirin.

#### Adım 2: ads.txt Dosyasını Güncelleyin

`ads.txt` dosyasını açın ve yayıncı kimliğinizi ekleyin:

```
google.com, pub-GERCEK_YAYINCI_KIMLIGINIZ, DIRECT, f08c47fec0942fa0
```

#### Adım 3: Reklam Yerleşimlerini Oluşturun

1. Google AdSense hesabınıza giriş yapın
2. **Ads** → **By ad unit** → **Display ads** seçin
3. Her bir reklam alanı için ad unit oluşturun:
   - Header banner (728×90 - Desktop, 320×50 - Mobile)
   - Sidebar (300×250)
   - In-feed (fluid)
   - Footer (auto)

4. Oluşturduğunuz her ad unit için kodu kopyalayın
5. HTML dosyalarındaki ilgili `data-ad-slot="XXXXXXXXXX"` kısımlarını güncelleyin

## 📝 Taksi Verilerini Güncelleme

`assets/data/taksiler.json` dosyasını düzenleyerek gerçek taksi durağı bilgilerini ekleyin:

```json
{
  "id": "unique-id",
  "durakAdi": "Durak Adı",
  "telefonlar": ["0348 XXX XX XX"],
  "calismaSaatleri": "7/24",
  "whatsapp": "905XXXXXXXXX",
  "konum": "36.7166,37.1208",
  "konumAdres": "Adres bilgisi",
  "aracTipi": "Sedan",
  "odeme": ["nakit", "kart"],
  "hizmetler": ["7/24", "havalimani", "otogar"],
  "mahalle": "Mahalle Adı",
  "oneCikar": false,
  "aciklama": "Durak hakkında açıklama"
}
```

### Önemli Notlar:

- **id**: Benzersiz bir ID (URL'de kullanılacak, küçük harf ve tire ile)
- **konum**: Google Maps'ten alınacak "latitude,longitude" formatında
- **whatsapp**: Ülke kodu ile (90 ile başlayan, boşluksuz)
- **oneCikar**: `true` ise "⭐ Sponsorlu" olarak işaretlenir

## 🔧 Geliştirme

### Yerel Olarak Test Etme

Statik site olduğu için herhangi bir sunucuya ihtiyaç yoktur. Ancak CORS nedeniyle `taksiler.json` dosyasını yüklemek için basit bir HTTP sunucusu kullanmalısınız:

**Python kullanarak:**
```bash
# Python 3
python -m http.server 8000

# Tarayıcıda http://localhost:8000 adresine gidin
```

**Node.js kullanarak:**
```bash
npx http-server -p 8000

# Tarayıcıda http://localhost:8000 adresine gidin
```

**VS Code Live Server uzantısı:**
- VS Code'da "Live Server" uzantısını yükleyin
- `index.html` dosyasına sağ tıklayın
- "Open with Live Server" seçin

### Değişiklikleri GitHub'a Yükleme

```bash
# Değişiklikleri ekleyin
git add .

# Commit yapın
git commit -m "Değişiklik açıklaması"

# GitHub'a gönderin
git push origin main
```

GitHub Pages otomatik olarak güncellenir (1-2 dakika sürebilir).

## 🎨 Özelleştirme

### Renk Temasını Değiştirme

`assets/css/style.css` dosyasındaki CSS değişkenlerini düzenleyin:

```css
:root {
  --color-primary: #FFB300;       /* Sarı */
  --color-secondary: #1E3A8A;     /* Mavi */
  --color-accent: #FF6B35;        /* Turuncu */
  /* ... */
}
```

### Logo Ekleme

Navbar'daki emoji yerine logo görseli eklemek için:

```html
<!-- Emoji yerine -->
<span class="navbar-logo-icon">🚕</span>

<!-- Logo görseli kullanın -->
<img src="./assets/images/logo.png" alt="Logo" style="height: 40px;">
```

## 🐛 Sorun Giderme

### Reklam Görünmüyor
- AdSense hesabınızın onaylandığından emin olun
- `pub-` kimliğinin doğru olduğunu kontrol edin
- Tarayıcı ad-blocker kapalı olmalı
- Onay süreci 1-2 gün sürebilir

### JSON Verisi Yüklenmiyor
- Tarayıcı konsolunu kontrol edin (F12)
- HTTP sunucusu üzerinden çalıştığınızdan emin olun
- `taksiler.json` dosya yolunun doğru olduğunu kontrol edin

### Konum İzni Çalışmıyor
- HTTPS üzerinden çalışması gerekir (HTTP'de çalışmaz)
- GitHub Pages otomatik HTTPS sağlar
- Tarayıcı konum iznini engellememiş olmalı

## 📱 Tarayıcı Desteği

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 Lisans

Bu proje açık kaynaklıdır ve özgürce kullanılabilir.

## 💬 Destek

Sorularınız için:
- E-posta: info@kilistaksi.com
- Telefon: 0348 XXX XX XX

---

**Geliştirici:** Kilis Taksi Portalı Ekibi  
**Versiyon:** 1.0.0  
**Son Güncelleme:** Ocak 2026
