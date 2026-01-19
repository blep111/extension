var stringToBlob = function (str, mimetype) {
    var raw = str;
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {  
        uInt8Array[i] = raw.charCodeAt(i);  
    }  

    var bb = new Blob([uInt8Array.buffer], {  
        type: mimetype  
    });  
    return bb;
};

window.onload = function () {
    document.getElementById("import").onchange = function (e) {
        if (e.currentTarget.files[0]) {
            console.log(e.currentTarget.files[0]);
            if (e.currentTarget.files[0].type != "application/json") {
                alert("Invalid file given");
                return;
            }
            var fr = new FileReader();
            fr.readAsText(e.currentTarget.files[0], "UTF-8");
            fr.onload = function (evt) {
                try {
                    var j = JSON.parse(evt.target.result);
                    if (Array.isArray(j)) {
                        chrome.cookies.getAll({
                            domain: "facebook.com"
                        }, async function (cookies) {
                            // Remove existing cookies
                            for (let i in cookies) {
                                await new Promise(resolve => {
                                    chrome.cookies.remove({
                                        url: `https://facebook.com${cookies[i].path}`,
                                        name: cookies[i].name
                                    }, resolve);
                                });
                            }

                            // Set new cookies from JSON
                            for (let i in j) {  
                                if (j[i].domain == "facebook.com") {  
                                    await new Promise(resolve => {  
                                        chrome.cookies.set({  
                                            url: `https://facebook.com${j[i].path}`,  
                                            name: j[i].key,  
                                            value: j[i].value,  
                                            expirationDate: (Date.now() / 1000) + (84600 * 30),  
                                            domain: ".facebook.com"  
                                        }, resolve);  
                                    });  
                                }  
                            }  
                            // Refresh tab if on Facebook
                            chrome.tabs.query({ active: true }, function (tabs) {  
                                if (tabs[0]) {
                                    var { host } = new URL(tabs[0].url);  
                                    if (host.split(".")[1] == "facebook") {  
                                        chrome.tabs.update(tabs[0].id, { url: tabs[0].url });  
                                    }  
                                }
                            });  
                        });  
                    } else {  
                        alert("Invalid JSON file (not a FBState JSON file).");  
                    }  
                } catch (_) {  
                    alert("Failed to load JSON file (malformed?)");  
                }  
            }  
        }  
    };
    
    document.getElementById("export").onclick = function () {  
        chrome.cookies.getAll({  
            domain: "facebook.com"  
        }, function (cookies) {  
            var cok = cookies.map(v => ({  
                key: v.name,  
                value: v.value,  
                domain: "facebook.com",  
                path: v.path,  
                hostOnly: v.hostOnly,  
                creation: new Date().toISOString(),  
                lastAccessed: new Date().toISOString()  
            }));  
            var fbstate = JSON.stringify(cok, null, 4);  
            var blob = stringToBlob(fbstate, "application/json");  
            var url = window.webkitURL || window.URL || window.mozURL || window.msURL;  
            var a = document.createElement('a');  
            a.download = 'appstate.json';  
            a.href = url.createObjectURL(blob);  
            a.textContent = '';  
            a.dataset.downloadurl = ['json', a.download, a.href].join(':');  
            a.click();  
            a.remove();  
        });  
    };
};