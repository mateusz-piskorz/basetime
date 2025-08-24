'use client'

import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUser } from '@/lib/actions/example'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './components/ui/form'
import { trpc } from './lib/trpc/client'
import { formSchema } from './lib/zod/my-schema'
import { ModeToggle } from './components/common/mode-toggle'

export const MyFrontendComponent = () => {
  const { data, isLoading, refetch } = trpc.getUsers.useQuery()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    
      await createUser(values)
    
    form.reset()
    refetch()
  }

  return (
    <div style={{ padding: '24px', borderRadius: '8px', maxWidth: '400px', margin: '32px auto', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
      <ModeToggle />
      <Button onClick={() => refetch()} variant="secondary">
        Refetch23
      </Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" style={{ marginBottom: '16px' }}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      {isLoading && <h2 style={{ color: '#a3a3a3', marginBottom: '12px' }}>Loading...</h2>}
      <pre style={{ background: '#27272a', padding: '12px', borderRadius: '4px', border: '1px solid #333', fontSize: '14px', overflowX: 'auto', color: '#fff' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
