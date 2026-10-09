export default async function handler(req, res) {
  if (req.method === "POST") {
    // Proses data sensor dari ESP32
  }

  if (req.method === "GET") {
    // Ambil data sensor yang tersimpan
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({
    status: "error",
    message: "Method tidak diizinkan"
  });
}
