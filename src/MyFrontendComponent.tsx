'use client'

import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { createUser, getAllUsers } from './actions/example'
import { Button } from './components/ui/button'


export const MyFrontendComponent = () => {
      const {data,isLoading,refetch} = useQuery({ queryKey: ['getAllUsers'], queryFn: getAllUsers })
      const [name, setName] = React.useState('')
      const [email, setEmail] = React.useState('')
      const [password, setPassword] = React.useState('')

      const handleSubmit = async () => {
        await createUser({name,email,password})
      }
  return (
    <div style={{ padding: '24px', background: '#18181b', borderRadius: '8px', maxWidth: '400px', margin: '32px auto', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
      <Button 
      onClick={() => refetch()}
      variant='secondary'
      >
      Refetch23
      </Button>
      <div>
      <form
        onSubmit={e => {
        e.preventDefault()
        handleSubmit()
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}
      >
        <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#27272a', color: '#fff' }}
        />
        <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#27272a', color: '#fff' }}
        />
        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#27272a', color: '#fff' }}
        />
        <button
        type="submit"
        style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
        Submit
        </button>
      </form>
      </div>
      {isLoading && <h2 style={{ color: '#a3a3a3', marginBottom: '12px' }}>Loading...</h2>}
      <pre style={{ background: '#27272a', padding: '12px', borderRadius: '4px', border: '1px solid #333', fontSize: '14px', overflowX: 'auto', color: '#fff' }}>
      {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
