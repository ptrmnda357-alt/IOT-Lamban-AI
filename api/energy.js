
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
    message: "Data energi simulasi Lamban AI",
    voltage: 220,
    current: 0.45,
    power: 99,
    energy: 1.25,
    unit: {
      voltage: "V",
      current: "A",
      power: "W",
      energy: "kWh"
    }
  });
}
