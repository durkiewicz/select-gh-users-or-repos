import { AutoComplete } from './AutoComplete';
import { getCombinedUsersAndRepos } from '../api/gitHubApi';

type Props = {
  /**
   * GitHub API token for authentication (optional).
   */
  apiToken?: string;
};

/**
 * Component to select a GitHub user or repository.
 */
export function SelectGitHubUserOrRepo({ apiToken }: Props) {
  return (
    <AutoComplete
      getOptions={(query, abortSignal) =>
        getCombinedUsersAndRepos({ query, apiToken, abortSignal })
      }
      onOptionSelected={({ url }) => {
        window.open(url, '_blank');
      }}
      formatOption={({ name, type }) => `${name} (${type})`}
    />
  );
}
