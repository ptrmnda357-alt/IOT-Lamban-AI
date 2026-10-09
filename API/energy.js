
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method tidak diizinkan"
    });
  }

  return res.status(200).json({
    status: "success",
    message: "API Energy Lamban AI aktif",
    voltage: null,
    current: null,
    power: null,
    energy: null
  });
}