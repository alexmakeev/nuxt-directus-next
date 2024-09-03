import { eventHandler, H3Event, getCookie, setCookie } from 'h3'

export default eventHandler(async (event: H3Event) => {
  const existingCookie = getCookie(event, 'my-cookie-name')

  // Simulate an asynchronous operation, like fetching data
  const data = await new Promise<{ msg: string }>((resolve) => {
    setTimeout(() => resolve({ msg: 'hello world' }), 1000)
  })
  return data // Nuxt will automatically serialize this to JSON
})

