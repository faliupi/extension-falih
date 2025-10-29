import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Emodu v2 Extension",
  version: "1.0",
  key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqkSwpVEsNGNOkTcuAHSixqXUp+y6/CSXy+2fSSOK2M+Np4G0L66SuD09My6nX4mEFgBRA4r2IZc6LKAS3f5MG/h147QI4ckQw+m86v4o1Yk7zFF9f7G4k0WH41lW1Z1KOzKndTqcKsPBwuRybd/FncJOA3MrjFPPSywhsSPsNeXCJeaBOhEOLEKBe+e/qPiBW8Wgt7AGo7PCl4EsmEK7QWGbHBpJ7LwyCMnbgImhYsDK0+0oe24m4+TpDOaigzqKFyK9n8HwtYtvrIP+vYXu+UKMONS9aAVxBsEvONqIdUgsOpii9GgTs4zHA5V0DaJgio/xufU/7D9FRczXKK7FMwIDAQAB",
  description:
    "Chrome Extension untuk Google Meet menggunakan React, Vite, dan JavaScript",
  permissions: ["tabs", "activeTab", "scripting", "storage"],
  host_permissions: ["<all_urls>"],
  action: {
    default_popup: "index.html",
    default_icon: {
      72: "icon-72x72.png",
      96: "icon-96x96.png",
      128: "icon-128x128.png",
    },
  },
  background: {
    service_worker: "src/scripts/background.js",
  },
  content_scripts: [
    {
      matches: ["https://meet.google.com/*"],
      js: ["src/scripts/content.js"],
    },
  ],
  web_accessible_resources: [
    {
      resources: ["555.wav", "inject.js"],
      matches: ["<all_urls>"],
    },
  ],
});
