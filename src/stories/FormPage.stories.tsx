import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';

const FormPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--token-surface-section-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--token-font-default)',
    }}>
      <div style={{
        background: 'var(--token-surface-page-default)',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 600, color: 'var(--token-text-default)' }}>
          Get in touch
        </h2>
        <p style={{ margin: '0 0 32px', fontSize: '14px', color: 'var(--token-text-subtle)' }}>
          Fill out the form below and we'll get back to you shortly.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Input
            label="Name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Message"
            placeholder="How can we help?"
            value={message}
            multiline
            rows={5}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          <Button variant="ghost" intent="default" label="Cancel" />
          <Button variant="solid" intent="default" label="Submit" />
        </div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Examples/Form Page',
  component: FormPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
