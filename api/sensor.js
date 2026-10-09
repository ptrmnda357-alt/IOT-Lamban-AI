
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: "error",
      message: "Method tidak diizinkan"
    });
  }

  return res.status(200).json({
    status: "success",
    source: "simulation",
    simulated: true,
    message: "Data sensor simulasi Lamban AI",
    temperature: 28,
    humidity: 70,
    distance: 25,
    unit: {
      temperature: "°C",
      humidity: "%",
      distance: "cm"
    }
  });
}
