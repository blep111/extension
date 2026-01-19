function copy(text) {
  navigator.clipboard.writeText(text);
}

chrome.cookies.getAll(
  { domain: "facebook.com" },
  function (cookies) {

    // JSON format
    const json = cookies.map(c => ({
      key: c.name,
      value: c.value,
      domain: "facebook.com",
      path: c.path,
      hostOnly: c.hostOnly,
      expirationDate: c.expirationDate || null
    }));

    // STRING format
    const str = cookies.map(c => `${c.name}=${c.value}`).join("; ");

    document.getElementById("cookieJson").value =
      JSON.stringify(json, null, 2);

    document.getElementById("cookieString").value = str;

    document.getElementById("copyJson").onclick =
      () => copy(JSON.stringify(json));

    document.getElementById("copyString").onclick =
      () => copy(str);
  }
);