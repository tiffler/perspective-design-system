import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { Input } from './Input';

const meta = {
  title: 'Design System/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'focus', 'error', 'disabled'],
    },
  },
  args: { onChange: fn() },
  decorators: [
    (Story) => <div style={{ width: 320 }}><Story /></div>,
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default single-line input for collecting user text in forms, search, and settings. */
export const Default: Story = {
  args: {
    variant: 'default',
    helperText: 'Help text goes here',
    label: 'Label',
    placeholder: 'Input',
  },
};

/** Focus state activates on user interaction — never set manually in static designs. */
export const Focus: Story = {
  args: {
    variant: 'focus',
    label: 'Label',
    placeholder: 'Input',
  },
};

/** Error state requires an accompanying error message explaining what went wrong. */
export const Error: Story = {
  args: {
    variant: 'error',
    label: 'Label',
    placeholder: 'Input',
  },
};

/** Disabled for fields that are temporarily unavailable — never use to hide fields that should be removed. */
export const Disabled: Story = {
  args: {
    variant: 'disabled',
    label: 'Label',
    placeholder: 'Input',
  },
};
