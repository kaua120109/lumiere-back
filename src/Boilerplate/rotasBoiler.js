import { Router } from "express";
import { boiler } from "./repoBoiler.js";

const router = Router();

router.post("/rota-nova", async (req, res) => {
  try {
    const response = await boiler.nomeFuncao(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error("Erro Descritivo No Console Pretinho", error);
    res.status(500).json({ message: "Erro Descritivo no Console do Front" });
  }
});


export default router; 
