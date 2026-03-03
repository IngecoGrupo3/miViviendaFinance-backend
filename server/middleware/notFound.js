export function notFound(_req, res) {
    res.status(404).json({ message: "Not Found" });
}