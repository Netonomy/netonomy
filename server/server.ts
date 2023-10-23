import app from './app/createExpressApp.js'

const port = process.env.PORT || 3000

app.get('/', (req, res) => res.send({ hello: 'world' }))

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
