// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const dummyData = {
    query: req.query.query,
    name: "Hello",
    items: [
      {
        name: "Miyagmi BV",
        kvk: "432442432",
        href: "http://miyagami.com"
      },
      {
        name: "Miyagmi BV",
        kvk: "432442432",
        href: "http://miyagami.com"
      },
      {
        name: "Miyagmi BV",
        kvk: "432442432",
        href: "http://miyagami.com"
      },
      {
        name: "Miyagmi BV",
        kvk: "432442432",
        href: "http://miyagami.com"
      }
    ]
  }

  res.status(200).json(dummyData)
}
