import MenuMain from '../components/MenuMain'
import FormMain from '../components/FormMain'

const address = `HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH`
const displayedAddress = `${address.slice(0, 4)}…${address.slice(-4)}`

const Claimed = () => {
  return (
    <>
      <MenuMain current="claimed" />
      <FormMain>
        <p>
          <data value={17_842.36}>17,842.36 $XENO</data>
          have been sent to
          <button type="button" className="ghost" title="Connect another wallet">
            <u>{displayedAddress}</u>
          </button>
        </p>
        <output>Claim successful!</output>
        <img src="/xeno-coin.png" aria-hidden="true" alt="" />
        <img src="/xeno-coin.png" aria-hidden="true" alt="" />
        <img src="/xeno-coin.png" aria-hidden="true" alt="" />
        <img src="/xeno-coin.png" aria-hidden="true" alt="" />
      </FormMain>
      <button type="button" className="ghost">
        <u>Connect another wallet</u>
      </button>
    </>
  )
}
export default Claimed

// <style>
//     output {
//         font-size: 2rem;
//         color: var(--color-success-1);
//         font-weight: 700;
//         line-height: 3em;
//     }
//
//     button[type="button"] {
//         margin-inline: auto;
//         color: color-mix(var(--color-mix), currentColor, 15% transparent);
//
//         /* reset */
//         inline-size: fit-content;
//         padding: unset;
//         background-color: unset;
//         font-weight: 200;
//
//         &:not([disabled]):hover {
//             color: currentColor;
//         }
//
//         &[disabled]:hover {
//             scale: 1;
//             cursor: not-allowed;
//         }
//     }
//
//     img {
//         z-index: -1;
//         position: absolute;
//         pointer-events: none;
//
//         opacity: 0;
//         animation: --appears ease-out 500ms forwards;
//
//         &:nth-of-type(1) {
//             inset-block-end: 1cap;
//             inset-inline-start: 5ch;
//         }
//
//         &:nth-of-type(2) {
//             inset-block-end: 5.6cap;
//             inset-inline-start: 2ch;
//             scale: 0.65 0.65;
//             filter: blur(0.3165rem);
//             opacity: 0.65;
//             animation-delay: 100ms;
//         }
//
//         &:nth-of-type(3) {
//             inset-block-start: 1cap;
//             inset-inline-end: 0ch;
//             scale: -0.65 0.65;
//             filter: blur(0.3165rem);
//             opacity: 0.35;
//             animation-delay: 250ms;
//         }
//
//         &:nth-of-type(4) {
//             inset-block-start: 5cap;
//             inset-inline-end: 2ch;
//             scale: -1 1;
//             animation-delay: 200ms;
//         }
//
//         @media (width <= 600px) {
//             display: none;
//         }
//     }
//
//     @keyframes --appears {
//         from {
//             opacity: 0;
//             translate: 0 8cap;
//         }
//
//         65% {
//             opacity: 0;
//         }
//
//         to {
//             opacity: 1;
//             translate: 0 0;
//         }
//     }
// </style>
