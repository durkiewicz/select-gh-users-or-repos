import './auto-complete.css';
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';
import { useDebouncedValue } from '../utils/useDebouncedValue';
import {
  AsyncState,
  isEmptySuccess,
  isError,
  isLoading,
  isNonEmptySuccess,
} from '../utils/AsyncState';

type AutoCompleteProps<Option> = {
  /**
   * Function to get options based on the text input.
   * @param text - The text input from the user.
   * @param abortSignal - An AbortSignal to cancel the request if needed.
   */
  getOptions: (text: string, abortSignal: AbortSignal) => Promise<Option[]>;
  /**
   * Function to format the option for display.
   * @param option - The option to format.
   */
  formatOption?: (option: Option) => string;
  /**
   * Function to format the error message.
   * @param error - The error that occurred.
   */
  formatError?: (error: unknown) => string;
  /**
   * Placeholder text for the input field.
   */
  placeholder?: string;
  /**
   * Minimum length of text before fetching options.
   * @default 3
   */
  minTextLength?: number;
  /**
   * Delay in milliseconds before fetching options after the user stops typing.
   * @default 300
   */
  debounceDelay?: number;
  /**
   * Message to display when there are no options available.
   */
  emptyMessage?: string;
  /**
   * Additional class name for the auto-complete component.
   */
  className?: string;
  /**
   * Function to be called when an option is selected. An option is selected either
   * by clicking on it or by pressing Enter or Space when focused on it.
   * @param option - The selected option.
   */
  onOptionSelected?: (option: Option) => void;
};

/**
 * A component that provides an auto-complete input field. It fetches options
 * based on user input and allows the user to select an option.
 * The user can browse through the options using mouse or keyboard (Tab / Shift+Tab or Up / Down Arrow keys).
 * The option can be selected by clicking on it or, when it is focused, by pressing Enter or Space.
 */
export function AutoComplete<Option>({
  placeholder = 'Type to search...',
  getOptions,
  minTextLength = 3,
  debounceDelay = 300,
  formatOption = (option: Option) => `${option}`,
  formatError = () => 'Failed to get options',
  emptyMessage = 'No options to choose from. Make sure your text is correct.',
  className,
  onOptionSelected = () => {},
}: AutoCompleteProps<Option>) {
  const optionsRef = useRef<HTMLUListElement>(null);
  const { text, setText, setSelectedOption, options } = useAutoCompleteState({
    getOptions,
    minTextLength,
    debounceDelay,
    formatOption,
  });
  const selectOption = useSelectOption(setSelectedOption, onOptionSelected);

  return (
    <div
      className={
        'auto-complete' +
        (isError(options) ? ' auto-complete--error' : '') +
        (className ?? '')
      }
    >
      <input
        className='auto-complete__input'
        type='text'
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && optionsRef.current) {
            focusFirstChildElement(e, optionsRef.current);
          }
        }}
      />
      {isLoading(options) && <div className='auto-complete__loader' />}
      {isError(options) && (
        <div className='auto-complete__options'>
          <div className='auto-complete__error'>
            {formatError(options.error)}
          </div>
        </div>
      )}
      {isEmptySuccess(options) && (
        <div className='auto-complete__options'>
          <div className='auto-complete__no-options'>{emptyMessage}</div>
        </div>
      )}
      {isNonEmptySuccess(options) && (
        <ul className='auto-complete__options' ref={optionsRef}>
          {options.value.map((option, index) => (
            <li
              key={index}
              className='auto-complete__option'
              onClick={(ev) => selectOption(ev, option)}
              onKeyDown={(ev) =>
                handleOptionKeyEvent(ev, () => selectOption(ev, option))
              }
              tabIndex={0}
              role='button'
            >
              {formatOption(option)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function useAutoCompleteState<Option>({
  getOptions,
  debounceDelay,
  minTextLength,
  formatOption,
}: Pick<
  Required<AutoCompleteProps<Option>>,
  'getOptions' | 'debounceDelay' | 'minTextLength' | 'formatOption'
>) {
  const [rawText, setRawText] = useState('');
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const debouncedText = useDebouncedValue(rawText, debounceDelay);
  const [options, setOptions] = useState<AsyncState<Option[]>>({
    type: 'idle',
  });

  useEffect(() => {
    if (debouncedText.length < minTextLength) {
      setOptions({ type: 'idle' });
      return;
    }
    const abortController = new AbortController();
    setOptions({ type: 'loading' });

    (async () => {
      try {
        const result = await getOptions(debouncedText, abortController.signal);
        setOptions({ type: 'success', value: result });
      } catch (e) {
        if (isAbortError(e)) {
          return;
        }
        console.error(e);
        setOptions({ type: 'error', error: e });
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [getOptions, minTextLength, debouncedText]);

  return {
    text: selectedOption == null ? rawText : formatOption(selectedOption),
    setText: useCallback((text: string) => {
      setSelectedOption(null);
      setRawText(text);
    }, []),
    setSelectedOption,
    options,
  };
}

function useSelectOption<Option>(
  setSelectedOption: (option: Option) => void,
  onOptionSelected: (option: Option) => void,
) {
  return useCallback(
    (ev: SyntheticEvent<HTMLElement>, option: Option) => {
      ev.preventDefault();
      setSelectedOption(option);
      blur(ev.target);
      onOptionSelected(option);
    },
    [onOptionSelected, setSelectedOption],
  );
}

function handleOptionKeyEvent(
  ev: KeyboardEvent<HTMLElement>,
  selectOption: () => void,
) {
  switch (ev.key) {
    case 'Enter':
    case ' ':
      return selectOption();
    case 'Escape':
      return blur(ev.target);
    case 'ArrowDown':
      return focusSiblingElement(ev, 'nextElementSibling');
    case 'ArrowUp':
      return focusSiblingElement(ev, 'previousElementSibling');
  }
}

function blur(element: EventTarget) {
  if (element instanceof HTMLElement) {
    element.blur();
  }
}

function focusFirstChildElement(
  event: SyntheticEvent<HTMLElement>,
  referenceElement: HTMLElement,
) {
  return focusOtherElement(event, referenceElement, 'firstElementChild');
}

type SiblingElement = 'previousElementSibling' | 'nextElementSibling';

function focusSiblingElement(
  event: SyntheticEvent<HTMLElement>,
  elementToFocus: SiblingElement,
) {
  return focusOtherElement(event, event.currentTarget, elementToFocus);
}

function focusOtherElement(
  event: SyntheticEvent<HTMLElement>,
  referenceElement: HTMLElement,
  elementToFocus: SiblingElement | 'firstElementChild',
) {
  const toFocus = referenceElement[elementToFocus];
  if (toFocus instanceof HTMLElement) {
    event.preventDefault();
    toFocus.focus();
  }
}

function isAbortError(e: unknown): e is DOMException {
  return e instanceof DOMException && e.name === 'AbortError';
}
