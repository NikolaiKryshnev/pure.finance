import { useWeb3React } from '@web3-react/core'
import { useTranslations } from 'next-intl'

import { useNumberFormat } from '../hooks/useNumberFormat'

import { ExplorerLink } from './ExplorerLink'
import JustifiedBetweenRow from './JustifiedBetweenRow'
import Modal from './Modal'
import SvgContainer from './svg/SvgContainer'

const TransactionModalRow = ({ text, value, tipLink = '' }) => (
  <JustifiedBetweenRow
    keyComponent={
      tipLink ? (
        <a
          className={'text-gray-350 flex justify-between text-sm'}
          href={tipLink}
          rel="noreferrer"
          target={'_blank'}
        >
          {text}
          <SvgContainer className="ml-1" name="questionmark" />
        </a>
      ) : (
        <p className={'text-gray-350 text-sm'}>{text}</p>
      )
    }
    valueComponent={<p className="text-sm font-semibold">{value}</p>}
  />
)

const TransactionsModal = function ({ transaction, modalIsOpen, closeModal }) {
  const { chainId } = useWeb3React()
  const t = useTranslations()
  const formatNumber = useNumberFormat()

  const isConfirmed = transaction.transactionStatus === 'confirmed'
  const isError =
    transaction.transactionStatus === 'canceled' ||
    transaction.transactionStatus === 'error'

  return (
    <Modal
      className="outline-none focus:outline-none relative flex h-screen w-full max-w-screen-sm flex-col border-0 bg-white shadow-lg md:h-auto md:rounded-lg"
      modalIsOpen={modalIsOpen}
      onRequestClose={closeModal}
    >
      <div className="p-6">
        {/* Header: operation name and closing "x" */}
        <div className="border-b">
          <button className="float-right" onClick={closeModal}>
            <SvgContainer name="close" />
          </button>
          <p className="mb-2 text-left font-bold">{t(transaction.operation)}</p>
        </div>
        <div className="mt-4">
          {/* Values sent and received */}
          {transaction.sent && (
            <div className="flex items-center justify-between border-b border-gray-300 pb-2 text-lg font-bold">
              <div className="w-2/5 text-left">
                {`${formatNumber(transaction.sent)} ${transaction.sentSymbol}`}
              </div>
              <div className="w-1/5 text-2xl">→</div>
              <div className="w-2/5 text-right">
                {transaction.received.map((token, i) => (
                  <div key={i}>{`${formatNumber(token.value)} ${
                    token.symbol
                  }`}</div>
                ))}
              </div>
            </div>
          )}
          {!transaction.sent &&
            (transaction.received || []).map(({ symbol, value }) => (
              <div
                className="flex items-center justify-between border-b border-gray-300 pb-2 text-lg font-bold"
                key={symbol}
              >
                <div className="w-2/5 text-left">{symbol}</div>
                <div className="w-3/5 text-right">{formatNumber(value)}</div>
              </div>
            ))}

          {/* General operation information: total txs, fees, status */}
          <div className="py-4">
            <TransactionModalRow
              text={t('total-transactions')}
              value={transaction.suffixes.length}
            />
            <TransactionModalRow
              text={isConfirmed ? t('total-tx-fee') : t('estimated-tx-fee')}
              value={`${formatNumber(
                isConfirmed ? transaction.actualFee : transaction.expectedFee
              )} ETH`}
            />
            <JustifiedBetweenRow
              keyComponent={
                <p className="text-gray-350 text-sm">{t('global-tx-status')}</p>
              }
              valueComponent={
                <p className="text-sm font-semibold">
                  {t(`status-${transaction.transactionStatus}`)}
                </p>
              }
            />
          </div>

          {/* Transactions list and status: name, number, status, hash */}
          {transaction.suffixes.map((suffix, idx) => (
            <div className="border-t border-gray-300 py-4" key={suffix}>
              <TransactionModalRow
                text={`${t('transaction')}: ${t(suffix)}`}
                value={`${idx + 1}/${transaction.suffixes.length}`}
              />
              <TransactionModalRow
                text={t('status')}
                value={
                  transaction[`transactionStatus-${idx}`]
                    ? t(`status-${transaction[`transactionStatus-${idx}`]}`)
                    : t('status-waiting-wallet')
                }
              />
              {transaction[`transactionHash-${idx}`] && (
                <TransactionModalRow
                  text={t('transaction-hash')}
                  value={
                    <ExplorerLink
                      chainId={chainId}
                      tx={transaction[`transactionHash-${idx}`]}
                    />
                  }
                />
              )}
            </div>
          ))}

          {/* Status icon and error message */}
          <div className="border-t border-gray-300 pt-4">
            <SvgContainer
              className="m-auto"
              name={isConfirmed ? 'checkmark' : isError ? 'cross' : 'loading'}
            />
            {transaction.message && (
              <p className="mt-1 text-center">
                <span className="text-sm font-semibold text-red-600">
                  {transaction.message}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TransactionsModal
