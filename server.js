const https = require("https");

const TINYFISH_API_KEY = "sk-tinyfish-22xHvUjCtmZO-Ul_y7ZnA-OkIYDM7dVK";

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(404).end("Not found");
    return;
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.status(400).end("bad json");
      return;
    }

    const { url, goal } = parsed;
    const payload = JSON.stringify({ url, goal });

    // Stream our own SSE back to the browser
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
      "X-Accel-Buffering": "no",
    });

    const send = (obj) => {
      res.write("data: " + JSON.stringify(obj) + "\n\n");
    };

    const options = {
      hostname: "agent.tinyfish.ai",
      path: "/v1/automation/run-sse",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "X-API-Key": TINYFISH_API_KEY,
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let buffer = "";
      let fullText = "";
      let sentStreamingUrl = false;

      proxyRes.on("data", (chunk) => {
        buffer += chunk.toString();

        // Process complete lines as they arrive
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const evt = JSON.parse(data);

            // Send streaming_url to frontend immediately
            if (evt.type === "STREAMING_URL" && evt.streaming_url && !sentStreamingUrl) {
              sentStreamingUrl = true;
              send({ type: "streaming_url", url: evt.streaming_url });
            }

            // Accumulate text output
            if (evt.type === "text" || evt.type === "content") {
              fullText += evt.text || evt.content || "";
            } else if (evt.output) {
              fullText = evt.output;
            } else if (evt.result) {
              fullText += JSON.stringify(evt.result);
            }
          } catch {
            // non-JSON SSE line — skip
          }
        }
      });

      proxyRes.on("end", () => {
        // Extract JSON array of listings from accumulated text
        const match = fullText.match(/\[[\s\S]*\]/);
        let listings = [];
        if (match) {
          try {
            listings = JSON.parse(match[0]);
          } catch {}
        }

        send({ type: "done", listings });
        res.end();
      });
    });

    proxyReq.on("error", (e) => {
      send({ type: "error", message: e.message });
      res.end();
    });

    proxyReq.setTimeout(58000, () => {
      proxyReq.destroy();
      send({ type: "error", message: "timeout" });
      res.end();
    });

    proxyReq.write(payload);
    proxyReq.end();
  });
};
