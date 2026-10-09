const DEVICE_KEY = "lamban:devices";

const DEFAULT_DEVICES = {
  lampu: false,
  tv: false,
  kulkas: false,
  ac: false,
  mesinCuci: false,
  radio: false,
};

const ALLOWED_DEVICES = Object.keys(DEFAULT_DEVICES);

async function redisCommand(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Konfigurasi Redis belum lengkap");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  const result = await response.json();

  if (!response.ok || result.error) {
    throw new Error("Operasi Redis gagal");
  }

  return result.result;
}

function authorized(req) {
  const expected = process.env.DEVICE_TOKEN;
  const received = req.headers.authorization;

  return Boolean(
    expected &&
    received === `Bearer ${expected}`
  );
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({
      status: "error",
      message: "Method tidak didukung",
    });
  }

  if (!authorized(req)) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  try {
    if (req.method === "GET") {
      const saved = await redisCommand([
        "GET",
        DEVICE_KEY,
      ]);

      let devices = DEFAULT_DEVICES;

      if (saved) {
        const parsed = JSON.parse(saved);
        devices = { ...DEFAULT_DEVICES };

        for (const name of ALLOWED_DEVICES) {
          if (typeof parsed[name] === "boolean") {
            devices[name] = parsed[name];
          }
        }
      }

      return res.status(200).json({
        status: "success",
        devices,
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({
        status: "error",
        message: "Body JSON tidak valid",
      });
    }

    const { device, state } = body;

    if (
      device !== "semua" &&
      !ALLOWED_DEVICES.includes(device)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Nama perangkat tidak valid",
      });
    }

    if (
      state !== "on" &&
      state !== "off"
    ) {
      return res.status(400).json({
        status: "error",
        message: "State harus on atau off",
      });
    }

    const saved = await redisCommand([
      "GET",
      DEVICE_KEY,
    ]);

    let devices = { ...DEFAULT_DEVICES };

    if (saved) {
      const parsed = JSON.parse(saved);

      for (const name of ALLOWED_DEVICES) {
        if (typeof parsed[name] === "boolean") {
          devices[name] = parsed[name];
        }
      }
    }

    const isOn = state === "on";

    if (device === "semua") {
      for (const name of ALLOWED_DEVICES) {
        devices[name] = isOn;
      }
    } else {
      devices[device] = isOn;
    }

    await redisCommand([
      "SET",
      DEVICE_KEY,
      JSON.stringify(devices),
    ]);

    return res.status(200).json({
      status: "success",
      message: "Perintah berhasil disimpan",
      devices,
    });
  } catch (error) {
    console.error("Device API error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Gagal memproses perintah perangkat",
    });
  }
}
