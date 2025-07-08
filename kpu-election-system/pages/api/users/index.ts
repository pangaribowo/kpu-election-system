import { NextApiRequest, NextApiResponse } from "next";
import { sampleUserData } from "../../../utils/sample-data";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  // Proteksi sederhana: cek header x-user-auth
  const userAuth = req.headers["x-user-auth"];
  if (!userAuth) {
    return res.status(401).json({ statusCode: 401, message: "Unauthorized: login required" });
  }

  try {
    if (!Array.isArray(sampleUserData)) {
      throw new Error("Cannot find user data");
    }

    res.status(200).json(sampleUserData);
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
