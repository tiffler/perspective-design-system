import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { Input } from './Input';

/**
 * Multi-line text input for collecting longer freeform content such as comments, descriptions, or messages.
 * Use when expected input exceeds a single line. Always include a visible label.
 */
const meta = {
  title: 'Design System/Textarea',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'focus', 'error', 'disabled'] },
  },
  args: { multiline: true, rows: 5, onChange: fn() },
  decorators: [
    (Story) => <div style={{ width: 320 }}><Story /></div>,
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Idle state, ready for multi-line text input. */
export const Default: Story = {
  args: { variant: 'default', label: 'Label', helperText: 'Help text goes here', placeholder: 'Enter text...' },
};

/** Active state on user interaction. */
export const Focus: Story = {
  args: { variant: 'focus', label: 'Label', placeholder: 'Enter text...' },
};

/** Invalid input. Requires an error message explaining what went wrong. */
export const Error: Story = {
  args: { variant: 'error', label: 'Label', placeholder: 'Enter text...' },
};

/** Temporarily unavailable. Never use to hide fields that should be removed. */
export const Disabled: Story = {
  args: { variant: 'disabled', label: 'Label', placeholder: 'Enter text...' },
};
