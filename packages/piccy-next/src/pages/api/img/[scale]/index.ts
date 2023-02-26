import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { scale: data } = req.query as { scale: string };
  

  res.redirect(302,  '/api/img/1/' + data);
}
