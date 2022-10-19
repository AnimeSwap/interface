import { Trans } from '@lingui/macro'
import { DEFAULT_DEADLINE_FROM_NOW, MAX_DEADLINE_FROM_NOW, MIN_DEADLINE_FROM_NOW } from 'constants/misc'
import { darken } from 'polished'
import { useContext, useState } from 'react'
import { useSetUserSlippageTolerance, useUserSlippageTolerance, useUserTransactionTTL } from 'state/user/hooks'
import styled, { ThemeContext } from 'styled-components/macro'

import { ThemedText } from '../../theme'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

const FancyButton = styled.button`
  color: ${({ theme }) => theme.deprecated_text1};
  align-items: center;
  height: 2rem;
  border-radius: 36px;
  font-size: 1rem;
  width: auto;
  min-width: 3.5rem;
  border: 1px solid ${({ theme }) => theme.deprecated_bg3};
  outline: none;
  background: ${({ theme }) => theme.deprecated_bg1};
  :hover {
    border: 1px solid ${({ theme }) => theme.deprecated_bg4};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.deprecated_primary1};
  }
`

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 4px;
  :hover {
    cursor: pointer;
  }
  background-color: ${({ active, theme }) => active && theme.deprecated_primary1};
  color: ${({ active, theme }) => (active ? theme.deprecated_white : theme.deprecated_text1)};
`

const Input = styled.input`
  background: ${({ theme }) => theme.deprecated_bg1};
  font-size: 16px;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, color }) => (color === 'red' ? theme.deprecated_red1 : theme.deprecated_text1)};
  text-align: right;
`

const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  border: ${({ theme, active, warning }) =>
    active
      ? `1px solid ${warning ? theme.deprecated_red1 : theme.deprecated_primary1}`
      : warning && `1px solid ${theme.deprecated_red1}`};
  :hover {
    border: ${({ theme, active, warning }) =>
      active && `1px solid ${warning ? darken(0.1, theme.deprecated_red1) : darken(0.1, theme.deprecated_primary1)}`};
  }

  input {
    width: 100%;
    height: 100%;
    border: 0px;
    border-radius: 2rem;
  }
`

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

interface TransactionSettingsProps {
  placeholderSlippage: number // varies according to the context in which the settings dialog is placed
}

const DEFAULT_TOLERANCE = 50 // 50 BP = 0.5%

export default function TransactionSettings({ placeholderSlippage }: TransactionSettingsProps) {
  const theme = useContext(ThemeContext)

  const userSlippageTolerance = useUserSlippageTolerance()
  const setUserSlippageTolerance = useSetUserSlippageTolerance()

  const [deadline, setDeadline] = useUserTransactionTTL()

  const [slippageInput, setSlippageInput] = useState('')
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(false)

  function parseSlippageInput(value: string) {
    // populate what the user typed and clear the error
    setSlippageInput(value)
    setSlippageError(false)

    if (value.length === 0) {
      setUserSlippageTolerance(DEFAULT_TOLERANCE)
    } else {
      const parsed = Math.floor(Number.parseFloat(value) * 100) // unit: 1BP

      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
        setUserSlippageTolerance(DEFAULT_TOLERANCE)
        if (value !== '.') {
          setSlippageError(SlippageError.InvalidInput)
        }
      } else {
        setUserSlippageTolerance(parsed)
      }
    }
  }

  const tooLow = userSlippageTolerance < 5 // 0.05%
  const tooHigh = userSlippageTolerance > 500 // 5%

  function parseCustomDeadline(value: string) {
    // populate what the user typed and clear the error
    setDeadlineInput(value)
    setDeadlineError(false)

    if (value.length === 0) {
      setDeadline(DEFAULT_DEADLINE_FROM_NOW)
    } else {
      try {
        const parsed: number = Math.floor(Number.parseFloat(value))
        if (!Number.isInteger(parsed) || parsed < MIN_DEADLINE_FROM_NOW || parsed > MAX_DEADLINE_FROM_NOW) {
          setDeadlineError(DeadlineError.InvalidInput)
        } else {
          setDeadline(parsed)
        }
      } catch (error) {
        console.error(error)
        setDeadlineError(DeadlineError.InvalidInput)
      }
    }
  }

  const showCustomDeadlineRow = true

  return (
    <AutoColumn gap="md">
      <AutoColumn gap="sm">
        <RowFixed>
          <ThemedText.DeprecatedBlack fontWeight={400} fontSize={14} color={theme.deprecated_text2}>
            <Trans>Slippage tolerance</Trans>
          </ThemedText.DeprecatedBlack>
          <QuestionHelper
            text={
              <Trans>Your transaction will revert if the price changes unfavorably by more than this percentage.</Trans>
            }
          />
        </RowFixed>
        <RowBetween>
          <Option
            onClick={() => {
              parseSlippageInput('0.5')
            }}
            active={userSlippageTolerance === 50}
          >
            <Trans>0.5%</Trans>
          </Option>
          <Option
            onClick={() => {
              parseSlippageInput('1.0')
            }}
            active={userSlippageTolerance === 100}
          >
            <Trans>1.0%</Trans>
          </Option>
          <Option
            onClick={() => {
              parseSlippageInput('2.0')
            }}
            active={userSlippageTolerance === 200}
          >
            <Trans>2.0%</Trans>
          </Option>
          <OptionCustom
            active={[50, 100, 200].indexOf(userSlippageTolerance) === -1}
            warning={!!slippageError}
            tabIndex={-1}
          >
            <RowBetween>
              {tooLow || tooHigh ? (
                <SlippageEmojiContainer>
                  <span role="img" aria-label="warning">
                    ⚠️
                  </span>
                </SlippageEmojiContainer>
              ) : null}
              <Input
                placeholder={'Custom'}
                value={
                  slippageInput.length > 0
                    ? slippageInput
                    : [50, 100, 200].indexOf(userSlippageTolerance) === -1
                    ? (userSlippageTolerance / 100).toFixed(2)
                    : ''
                }
                onChange={(e) => parseSlippageInput(e.target.value)}
                onBlur={() => {
                  setSlippageInput('')
                  setSlippageError(false)
                }}
                color={slippageError ? 'red' : ''}
              />
              %
            </RowBetween>
          </OptionCustom>
        </RowBetween>
        {slippageError || tooLow || tooHigh ? (
          <RowBetween
            style={{
              fontSize: '14px',
              paddingTop: '7px',
              color: slippageError ? 'red' : '#F3841E',
            }}
          >
            {slippageError ? (
              <Trans>Enter a valid slippage percentage</Trans>
            ) : tooLow ? (
              <Trans>Your transaction may fail</Trans>
            ) : (
              <Trans>Your transaction may be frontrun</Trans>
            )}
          </RowBetween>
        ) : null}
      </AutoColumn>

      {showCustomDeadlineRow && (
        <AutoColumn gap="sm">
          <RowFixed>
            <ThemedText.DeprecatedBlack fontSize={14} fontWeight={400} color={theme.deprecated_text2}>
              <Trans>Transaction deadline</Trans>
            </ThemedText.DeprecatedBlack>
            <QuestionHelper
              text={<Trans>Your transaction will revert if it is pending for more than this period of time.</Trans>}
            />
          </RowFixed>
          <RowFixed>
            <OptionCustom style={{ width: '80px' }} warning={!!deadlineError} tabIndex={-1}>
              <Input
                placeholder={Math.floor(DEFAULT_DEADLINE_FROM_NOW).toString()}
                value={
                  deadlineInput.length > 0
                    ? deadlineInput
                    : deadline === DEFAULT_DEADLINE_FROM_NOW
                    ? ''
                    : deadline.toString()
                }
                onChange={(e) => parseCustomDeadline(e.target.value)}
                onBlur={() => {
                  setDeadlineInput('')
                  setDeadlineError(false)
                }}
                color={deadlineError ? 'red' : ''}
              />
            </OptionCustom>
            <ThemedText.DeprecatedBody style={{ paddingLeft: '8px' }} fontSize={14}>
              <Trans>Seconds</Trans>
            </ThemedText.DeprecatedBody>
          </RowFixed>
        </AutoColumn>
      )}
    </AutoColumn>
  )
}
