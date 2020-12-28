import { NextApiHandler } from "next";
import { Client, query } from "faunadb";

interface Movie {
  id: string;
  name: string;
  sawAt?: string;
}

const handler: NextApiHandler = async (req, res) => {
  const { id } = req.body;
  const client = new Client({ secret: process.env.FAUNADB_SECRET });
  const q = query;

  const response = await client.query<{ data: { data: Movie; ref: any }[] }>(
    q.Delete(q.Ref(q.Collection("movies"), id))
  );

  res.json(response.data);
};

export default handler;
