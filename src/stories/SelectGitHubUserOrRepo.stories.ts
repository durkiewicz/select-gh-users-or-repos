import type { Meta, StoryObj } from '@storybook/react';

import { SelectGitHubUserOrRepo } from '../components/SelectGitHubUserOrRepo';

const meta: Meta<typeof SelectGitHubUserOrRepo> = {
  component: SelectGitHubUserOrRepo,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SelectGitHubUserOrRepo>;

export const Default: Story = {
  args: {},
};
