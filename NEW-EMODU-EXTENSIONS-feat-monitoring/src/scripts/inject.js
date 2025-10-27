(async () => {
  if (document.getElementById("meet-monitor-popup")) return;
  const key = "popup_count";
  const result = await chrome.storage.local.get([key]);
  const count = result[key] || 0;
  chrome.storage.local.set({ [key]: count + 1 });

  const modal = document.createElement("div");
  modal.id = "meet-monitor-popup";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "rgba(0, 0, 0, 0.5)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "999999";

  let countdown = 30;
  const interval = setInterval(() => {
    const label = document.getElementById("countdown-label");
    if (label) {
      label.textContent = `Pop-up akan hilang dalam ${countdown} detik...`;
    }
    if (countdown <= 0) {
      clearInterval(interval);
      closePopup();
    }
    countdown--;
  }, 1000);

  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 10px;
      padding: 30px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      text-align: center;
      font-family: 'Segoe UI', sans-serif;
      box-sizing: border-box;
    ">
      <h2 style="color: maroon; margin-bottom: 10px;">⚠️ PERHATIAN</h2>
      <p style="margin-bottom: 20px;">Kamu terdeteksi keluar dari Google Meet.<br>Harap segera kembali ke ruang kelas.</p>
      <button id="close-popup-btn" style="
        background-color: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        font-size: 14px;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s ease;
      ">Saya akan kembali</button>
      <p id="countdown-label" style="margin-top: 10px; font-size: 12px; color: gray;">Pop-up akan hilang dalam 30 detik...</p>
    </div>
  `;

  chrome.runtime.sendMessage({ type: "UPDATE_STATUS" });

  document.body.appendChild(modal);

  const closePopup = () => {
    const el = document.getElementById("meet-monitor-popup");
    if (el) el.remove();
    clearInterval(interval);
  };

  const btn = document.getElementById("close-popup-btn");
  btn.addEventListener("click", closePopup);
  btn.addEventListener("mouseenter", () => {
    btn.style.padding = "12px 24px";
    btn.style.fontSize = "15px";
    btn.style.backgroundColor = "#218838";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.padding = "10px 20px";
    btn.style.fontSize = "14px";
    btn.style.backgroundColor = "#28a745";
  });
})();
