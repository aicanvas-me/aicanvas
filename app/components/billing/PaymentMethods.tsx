// Accepted payment methods + Paddle attribution for the paywall modal. White
// logo chips over the dark modal, using the shared /public/payment SVGs (the
// same assets the pricing page's TrustStrip draws). Plain <img> — the SVGs are
// tiny and static, no next/image SVG config needed.

const METHODS = [
  { src: '/payment/visa.svg', alt: 'Visa' },
  { src: '/payment/mastercard.svg', alt: 'Mastercard' },
  { src: '/payment/amex.svg', alt: 'American Express' },
  { src: '/payment/paypal.svg', alt: 'PayPal' },
  { src: '/payment/unionpay.svg', alt: 'UnionPay' },
]

export function PaymentMethods({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className ?? ''}`}>
      {METHODS.map((m) => (
        <span key={m.alt} className="flex h-7 items-center rounded-md bg-white px-1.5 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.src} alt={m.alt} className="h-4 w-auto" />
        </span>
      ))}
      <a
        href="https://www.paddle.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-1 text-xs text-sand-600 underline-offset-2 hover:underline dark:text-sand-400"
      >
        powered by Paddle
      </a>
    </div>
  )
}
