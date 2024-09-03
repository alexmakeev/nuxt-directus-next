export default async () => {
  const data = await new Promise<{ msg: string }>((resolve) => {
    setTimeout(() => resolve({ msg: 'hello world' }), 1000)
  })
  return data
}
