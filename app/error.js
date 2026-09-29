'use client'

export default function Error({ error, reset }) {
  return (
    <div style={{padding: '2rem'}}>
      <h2>Error: {error?.message}</h2>
      <pre style={{background:'#fee',padding:'1rem'}}>{error?.stack}</pre>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}