const countdown = document.querySelector(".countdown");
const uploadForm = document.querySelector("#upload-form");
const uploadStatus = document.querySelector("#upload-status");
const uploadProgress = document.querySelector("#upload-progress");
const uploadButton = document.querySelector("#upload-button");
const rsvpForm = document.querySelector("#rsvp-form");
const rsvpStatus = document.querySelector("#rsvp-status");
const rsvpButton = document.querySelector("#rsvp-button");
const guestCountField = document.querySelector("#guest-count-field");
const attendanceInputs = document.querySelectorAll('input[name="attendance"]');
const guestCountInputs = document.querySelectorAll('input[name="guestCount"]');
// Supabase istemcisi: config eksikse null doner, formlar kendini devre disi birakir.
const getSupabaseClient = () => {
  const config = window.SUPABASE_CONFIG;

  if (!config || !config.url || !config.anonKey || !window.supabase) {
    return null;
  }

  return window.supabase.createClient(config.url, config.anonKey);
};

const setUploadStatus = (message, state = "") => {
  if (!uploadStatus) {
    return;
  }

  uploadStatus.textContent = message;
  uploadStatus.classList.remove("is-success", "is-error");

  if (state) {
    uploadStatus.classList.add(state);
  }
};

const setRsvpStatus = (message, state = "") => {
  if (!rsvpStatus) {
    return;
  }

  rsvpStatus.textContent = message;
  rsvpStatus.classList.remove("is-success", "is-error");

  if (state) {
    rsvpStatus.classList.add(state);
  }
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "misafir";

const createProgressItem = (fileName) => {
  if (!uploadProgress) {
    return null;
  }

  const item = document.createElement("div");
  item.className = "progress-item";
  item.innerHTML = `
    <strong>${fileName}</strong>
    <div class="progress-bar"><span style="width:0%"></span></div>
  `;
  uploadProgress.appendChild(item);
  return item.querySelector(".progress-bar span");
};

const simulateProgress = (bar) => {
  if (!bar) {
    return () => {};
  }

  let width = 0;
  bar.style.width = "0%";
  const timer = window.setInterval(() => {
    width = Math.min(width + 8, 92);
    bar.style.width = `${width}%`;
  }, 180);

  return () => {
    window.clearInterval(timer);
    bar.style.width = "100%";
  };
};

if (countdown) {
  const targetDate = new Date(countdown.dataset.targetDate).getTime();
  const units = {
    days: countdown.querySelector('[data-unit="days"]'),
    hours: countdown.querySelector('[data-unit="hours"]'),
    minutes: countdown.querySelector('[data-unit="minutes"]'),
    seconds: countdown.querySelector('[data-unit="seconds"]'),
  };

  const updateCountdown = () => {
    const now = Date.now();
    const distance = targetDate - now;

    if (distance <= 0) {
      units.days.textContent = "00";
      units.hours.textContent = "00";
      units.minutes.textContent = "00";
      units.seconds.textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    units.days.textContent = String(days).padStart(2, "0");
    units.hours.textContent = String(hours).padStart(2, "0");
    units.minutes.textContent = String(minutes).padStart(2, "0");
    units.seconds.textContent = String(seconds).padStart(2, "0");
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

if (attendanceInputs.length) {
  attendanceInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const isComing = input.value === "Evet" && input.checked;

      if (guestCountField) {
        guestCountField.classList.toggle("is-hidden", !isComing);
      }

      guestCountInputs.forEach((countInput) => {
        countInput.required = isComing;

        if (!isComing) {
          countInput.checked = false;
        }
      });
    });
  });
}

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const client = getSupabaseClient();

    if (!client) {
      setRsvpStatus(
        "Katılım formu şu an aktif değil. Lütfen daha sonra tekrar deneyin.",
        "is-error"
      );
      return;
    }

    const formData = new FormData(rsvpForm);
    const fullName = (formData.get("fullName") || "").toString().trim();
    const attendance = (formData.get("attendance") || "").toString();
    const guestCount = formData.get("guestCount");

    if (fullName.length < 2) {
      setRsvpStatus("Lütfen ad soyad bilginizi yazın.", "is-error");
      return;
    }

    if (!attendance) {
      setRsvpStatus("Lütfen katılım durumunuzu seçin.", "is-error");
      return;
    }

    if (attendance === "Evet" && !guestCount) {
      setRsvpStatus("Lütfen kaç kişi olacağınızı seçin.", "is-error");
      return;
    }

    // "5+" secenegi veritabaninda 5 olarak saklanir (5 ve uzeri anlaminda).
    const guestCountValue =
      attendance === "Evet"
        ? Number.parseInt(guestCount.toString(), 10) || 1
        : null;

    if (rsvpButton) {
      rsvpButton.disabled = true;
    }

    setRsvpStatus("Yanıtınız gönderiliyor...");

    try {
      const { error } = await client
        .from(window.SUPABASE_CONFIG.rsvpTable || "rsvps")
        .insert({
          full_name: fullName,
          attendance,
          guest_count: guestCountValue,
        });

      if (error) {
        throw error;
      }

      setRsvpStatus(
        attendance === "Evet"
          ? "Teşekkür ederiz, yanıtınızı aldık. Sizi aramızda görmek için sabırsızlanıyoruz."
          : "Yanıtınız için teşekkür ederiz. Sizi özleyeceğiz.",
        "is-success"
      );
      rsvpForm.reset();
      guestCountInputs.forEach((countInput) => {
        countInput.required = false;
      });
      if (guestCountField) {
        guestCountField.classList.add("is-hidden");
      }
    } catch (error) {
      setRsvpStatus(
        `Gönderim sırasında bir sorun oluştu: ${error.message || "Bilinmeyen hata"}`,
        "is-error"
      );
    } finally {
      if (rsvpButton) {
        rsvpButton.disabled = false;
      }
    }
  });
}

if (uploadForm) {
  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const client = getSupabaseClient();

    if (!client || !window.SUPABASE_CONFIG.bucket) {
      setUploadStatus(
        "Yükleme şu an aktif değil. Lütfen daha sonra tekrar deneyin.",
        "is-error"
      );
      return;
    }

    const formData = new FormData(uploadForm);
    const files = Array.from(formData.getAll("mediaFiles")).filter(
      (file) => file instanceof File && file.size > 0
    );

    if (!files.length) {
      setUploadStatus("Lütfen en az bir fotoğraf veya video seçin.", "is-error");
      return;
    }

    const guestName = (formData.get("guestName") || "").toString().trim();
    const guestMessage = (formData.get("guestMessage") || "").toString().trim();

    const { bucket, folder } = window.SUPABASE_CONFIG;
    const guestSlug = slugify(guestName || "misafir");
    const batchId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (uploadButton) {
      uploadButton.disabled = true;
    }

    if (uploadProgress) {
      uploadProgress.innerHTML = "";
    }

    setUploadStatus("Yükleme başlatıldı. Dosyalar sırayla gönderiliyor...");

    const uploadedPaths = [];

    try {
      for (const file of files) {
        const extension = file.name.includes(".")
          ? file.name.split(".").pop().toLowerCase()
          : "bin";
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = [
          folder || "wedding-uploads",
          guestSlug,
          `${batchId}-${safeName || `media.${extension}`}`,
        ].join("/");

        const progressBar = createProgressItem(file.name);
        const finishProgress = simulateProgress(progressBar);

        const { error } = await client.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

        finishProgress();

        if (error) {
          throw error;
        }

        uploadedPaths.push(path);
      }

      // Misafirin adi ve notu dosyalarla birlikte kaydedilir.
      let noteSaved = true;

      if (uploadedPaths.length && (guestName || guestMessage)) {
        const { error: noteError } = await client
          .from(window.SUPABASE_CONFIG.uploadsTable || "guest_uploads")
          .insert(
            uploadedPaths.map((filePath) => ({
              guest_name: guestName || null,
              message: guestMessage || null,
              file_path: filePath,
            }))
          );

        noteSaved = !noteError;
      }

      setUploadStatus(
        noteSaved
          ? "Yükleme tamamlandı. Fotoğraf ve videolarınız başarıyla kaydedildi. Teşekkür ederiz."
          : "Fotoğraf ve videolarınız yüklendi, ancak notunuz kaydedilemedi. Teşekkür ederiz.",
        noteSaved ? "is-success" : "is-error"
      );
      uploadForm.reset();
    } catch (error) {
      setUploadStatus(
        `Yükleme sırasında bir sorun oluştu: ${error.message || "Bilinmeyen hata"}`,
        "is-error"
      );
    } finally {
      if (uploadButton) {
        uploadButton.disabled = false;
      }
    }
  });
}

// ---------------------------------------------------------------
// GIRIS: 3D zarf acilisi
// ---------------------------------------------------------------
const envelopeIntro = document.querySelector("#envelope-intro");

if (envelopeIntro) {
  const heartsWrap = document.querySelector("#hearts");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HEART_TONES = ["#c2705f", "#d99a86", "#b66d5d", "#e0b48b", "#a8544a"];
  let opened = false;

  const finishIntro = () => {
    envelopeIntro.classList.add("is-done");
    document.documentElement.classList.remove("intro-active");
  };

  const releaseHearts = () => {
    if (!heartsWrap) {
      return;
    }

    for (let i = 0; i < 26; i += 1) {
      const heart = document.createElement("i");
      const size = 10 + Math.random() * 16;

      heart.style.setProperty("--x", `${6 + Math.random() * 88}%`);
      heart.style.setProperty("--size", `${size}px`);
      heart.style.setProperty("--tone", HEART_TONES[i % HEART_TONES.length]);
      heart.style.setProperty("--rise", `${window.innerHeight * (0.6 + Math.random() * 0.55)}px`);
      heart.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
      heart.style.setProperty("--dur", `${2.4 + Math.random() * 1.8}s`);
      heart.style.setProperty("--delay", `${Math.random() * 0.9}s`);
      heart.style.setProperty("--peak", `${0.55 + Math.random() * 0.4}`);

      heartsWrap.appendChild(heart);
    }
  };

  const openEnvelope = () => {
    if (opened) {
      return;
    }

    opened = true;

    if (reduceMotion) {
      finishIntro();
      return;
    }

    // 1) Kapak acilir, muhur kirilir, kart yukselir
    envelopeIntro.classList.add("is-opening");

    // 2) Kalpler ucusmaya baslar, zarf buyuyup kameradan gecer
    //    (kapak 850ms + kart 800ms gecikme/850ms yukselis bittikten sonra)
    window.setTimeout(() => {
      releaseHearts();
      envelopeIntro.classList.add("is-flying");
    }, 1750);

    // 3) Perde kalkar, sitenin kendi akisi baslar
    window.setTimeout(finishIntro, 3400);
  };

  envelopeIntro.addEventListener("click", openEnvelope);
  envelopeIntro.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEnvelope();
    }
  });
}

const fxReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!fxReducedMotion) {
  const fxCanvas = document.createElement("canvas");
  fxCanvas.className = "fx-canvas";
  document.body.appendChild(fxCanvas);
  const fxCtx = fxCanvas.getContext("2d");

  const FX_COLORS = ["#d9b36c", "#e8c98f", "#b66d5d", "#d18a76", "#fff3df"];
  let fxParticles = [];
  let fxRaf = null;

  const resizeFxCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    fxCanvas.width = window.innerWidth * dpr;
    fxCanvas.height = window.innerHeight * dpr;
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  window.addEventListener("resize", resizeFxCanvas);
  resizeFxCanvas();

  const drawFxStar = (x, y, r, rotation) => {
    fxCtx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const radius = i % 2 === 0 ? r : r * 0.4;
      const angle = rotation + (Math.PI * i) / 4;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        fxCtx.moveTo(px, py);
      } else {
        fxCtx.lineTo(px, py);
      }
    }
    fxCtx.closePath();
    fxCtx.fill();
  };

  const fxTick = () => {
    fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    fxCtx.globalCompositeOperation = "lighter";

    fxParticles = fxParticles.filter((p) => {
      p.life += 1;
      const t = p.life / p.maxLife;

      if (t >= 1) {
        return false;
      }

      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + p.gravity;
      p.x += p.vx;
      p.y += p.vy;

      const flicker = 0.7 + 0.3 * Math.sin(p.life * 0.5 + p.spin * 9);
      fxCtx.globalAlpha = Math.max(0, 1 - t) * flicker;
      fxCtx.fillStyle = p.color;

      if (p.star) {
        drawFxStar(p.x, p.y, p.size * 2.2, p.spin + p.life * 0.08);
      } else {
        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fxCtx.fill();
      }

      return true;
    });

    fxCtx.globalAlpha = 1;
    fxCtx.globalCompositeOperation = "source-over";

    if (fxParticles.length) {
      fxRaf = requestAnimationFrame(fxTick);
    } else {
      fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      fxRaf = null;
    }
  };

  const pushFxParticle = (particle) => {
    fxParticles.push(particle);

    if (fxParticles.length > 500) {
      fxParticles.splice(0, fxParticles.length - 500);
    }

    if (!fxRaf) {
      fxRaf = requestAnimationFrame(fxTick);
    }
  };

  const spawnFirework = (x, y) => {
    const count = 26 + Math.floor(Math.random() * 12);

    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 2 + Math.random() * 5;

      pushFxParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.4,
        gravity: 0.11,
        life: 0,
        maxLife: 55 + Math.random() * 35,
        size: 1.6 + Math.random() * 2,
        color: FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)],
        star: Math.random() < 0.2,
        spin: Math.random() * Math.PI * 2,
      });
    }
  };

  let fxTrailX = null;
  let fxTrailY = null;

  window.addEventListener("pointerdown", (event) => {
    spawnFirework(event.clientX, event.clientY);
  });

  window.addEventListener("pointermove", (event) => {
    if (fxTrailX !== null) {
      const dx = event.clientX - fxTrailX;
      const dy = event.clientY - fxTrailY;

      if (dx * dx + dy * dy < 1600) {
        return;
      }
    }

    fxTrailX = event.clientX;
    fxTrailY = event.clientY;

    pushFxParticle({
      x: event.clientX + (Math.random() - 0.5) * 10,
      y: event.clientY + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 0.6,
      vy: 0.2 + Math.random() * 0.5,
      gravity: 0.02,
      life: 0,
      maxLife: 30 + Math.random() * 20,
      size: 1 + Math.random() * 1.2,
      color: FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)],
      star: Math.random() < 0.12,
      spin: Math.random() * Math.PI * 2,
    });
  });
}
