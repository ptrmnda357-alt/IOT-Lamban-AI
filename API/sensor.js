
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method tidak diizinkan"
    });
  }

  return res.status(200).json({
    status: "success",
    message: "API Sensor Lamban AI aktif",
    temperature: null,
    humidity: null,
    distance: null
  });
}