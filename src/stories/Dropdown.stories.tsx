import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { Input } from './Input';

/**
 * A select input that reveals a list of options on click.
 * Use for choosing one option from a predefined set of 5 or more items.
 * Always include a visible label above the dropdown.
 */
const meta = {
  title: 'Design System/Dropdown',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'focus', 'error', 'disabled'] },
  },
  args: { onChange: fn() },
  decorators: [
    (Story) => <div style={{ width: 320 }}><Story /></div>,
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Idle state, ready for interaction. */
export const Default: Story = {
  args: { variant: 'default', label: 'Label', helperText: 'Help text goes here', placeholder: 'Select an option' },
};

/** Active state when the dropdown is open or focused. */
export const Focus: Story = {
  args: { variant: 'focus', label: 'Label', placeholder: 'Select an option' },
};

/** Invalid selection. Pair with an error message below. */
export const Error: Story = {
  args: { variant: 'error', label: 'Label', placeholder: 'Select an option' },
};

/** Temporarily unavailable. Never use to hide fields that should be removed. */
export const Disabled: Story = {
  args: { variant: 'disabled', label: 'Label', placeholder: 'Select an option' },
};
