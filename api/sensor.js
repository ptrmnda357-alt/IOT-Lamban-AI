
export default async function handler(req, res) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const deviceToken = process.env.DEVICE_TOKEN;

  // Pastikan konfigurasi penyimpanan tersedia
  if (!redisUrl || !redisToken || !deviceToken) {
    return res.status(500).json({
      status: "error",
      message: "Konfigurasi Redis atau token belum lengkap"
    });
  }

  // ESP32 mengirim data dengan POST
  if (req.method === "POST") {
    if (req.headers.authorization !== `Bearer ${deviceToken}`) {
      return res.status(401).json({
        status: "error",
        message: "Token perangkat tidak valid"
      });
    }

    const { temperature, humidity, distance } = req.body || {};

    if (
      typeof temperature !== "number" ||
      typeof humidity !== "number" ||
      typeof distance !== "number" ||
      !Number.isFinite(temperature) ||
      !Number.isFinite(humidity) ||
      !Number.isFinite(distance) ||
      distance < 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Data sensor tidak valid"
      });
    }

    const data = {
      status: "success",
      source: "esp32",
      simulated: false,
      temperature,
      humidity,
      distance,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(redisUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify([
          "SET",
          "lamban:sensor",
          JSON.stringify(data)
        ])
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error("Redis gagal menyimpan data");
      }

      return res.status(200).json({
        status: "success",
        message: "Data sensor berhasil disimpan"
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Gagal menyimpan data sensor"
      });
    }
  }

  // Browser dan n8n mengambil data dengan GET
  if (req.method === "GET") {
    try {
      const response = await fetch(redisUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["GET", "lamban:sensor"])
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error("Redis gagal membaca data");
      }

      if (!result.result) {
        return res.status(404).json({
          status: "error",
          message: "Belum ada data dari ESP32"
        });
      }

      return res.status(200).json(JSON.parse(result.result));
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Gagal membaca data sensor"
      });
    }
  }

  res.setHeader("Allow", "GET, POST");

  return res.status(405).json({
    status: "error",
    message: "Method tidak diizinkan"
  });
}
