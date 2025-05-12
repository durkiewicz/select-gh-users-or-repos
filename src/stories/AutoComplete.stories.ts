import type { Meta, StoryObj } from '@storybook/react';

import { AutoComplete } from '../components/AutoComplete';
import { sleep } from '../utils/sleep';

const meta: Meta<typeof AutoComplete> = {
  component: AutoComplete,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof AutoComplete>;

export const Successful: Story = {
  args: {
    getOptions(text: string, abortSignal: AbortSignal) {
      return randomSleepAndGetOptions(abortSignal, () =>
        new Array(10).fill(0).map((_, i) => `${text} option ${i + 1}`),
      );
    },
    onOptionSelected: (value: unknown) => {
      alert(`Selected: ${value}`);
    },
  },
};

export const Failing: Story = {
  args: {
    async getOptions(_: string, abortSignal: AbortSignal) {
      return randomSleepAndGetOptions(abortSignal, (): string[] => {
        throw new Error('Failed to fetch options');
      });
    },
  },
};

export const Empty: Story = {
  args: {
    async getOptions(_: string, abortSignal: AbortSignal) {
      return randomSleepAndGetOptions(abortSignal, () => []);
    },
  },
};

async function randomSleepAndGetOptions(
  abortSignal: AbortSignal,
  getOptions: () => string[],
) {
  await sleep(200 + Math.random() * 800);
  if (abortSignal.aborted) {
    throw new AbortError('Aborted');
  }
  return getOptions();
}

class AbortError extends DOMException {
  constructor(message: string) {
    super(message, 'AbortError');
  }
}
