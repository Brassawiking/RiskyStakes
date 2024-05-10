import { ref, repeat, text } from '../feppla/feppla.js'
/** @type {{ value: string, color: string }[]}} */
const tableNumbers = []

tableNumbers.push({
  value: '0',
  color: 'green'
})

for (let i = 1 ; i <= 36 ; ++i) {
  let colorOffset = 0
  if (i > 10) {
    colorOffset += 1
  }
  if (i > 18) {
    colorOffset += 1
  }
  if (i > 28) {
    colorOffset += 1
  }

  tableNumbers.push({
    value: String(i),
    color: (i + colorOffset) % 2 ? 'red' : 'black'
  })
}

tableNumbers.push({
  value: '00',
  color: 'green'
})

/** @type {{ value: number }[]}} */
const playerChips = [
  { value: 100 },
  { value: 200 },
  { value: 300 },
  { value: 400 },
  { value: 500 },
  { value: 9000 },
  { value: 10000 },
]

/** @type {{ type: string }[]}} */
const payouts = [
  {
    type: 'even',
  },
  {
    type: 'odd',
  },
  {
    type: 'red',
  },
  {
    type: 'black',
  },
  {
    type: 'zeros',
  },
]

const pieIndexToPosition = [
  'top',
  'right',
  'left',
  'bottom'
]

let currentWheel = payouts.toSorted(() => 0.5 - Math.random()).slice(0, 4)

//@ts-ignore
document.querySelector('#app').innerHTML = `
  <div class="left-side">
    <div class="wheel" ${ref()
      .on('click', () => {
        currentWheel = payouts.toSorted(() => 0.5 - Math.random()).slice(0, 4)
      })
    }>
      ${repeat(
        () => currentWheel, 
        (pie) => `
          <div ${ref()
            .property('className', () => `pie ${pie.type} ${pieIndexToPosition[currentWheel.indexOf(pie)]}`)
          }>
            <div class="payout">
              ${pie.type}
              <br/>
              1:1
            </div>
          </div>
        `
      )}
    </div>

    <div class="player-stash">
      ${repeat(() => playerChips, (chip) => `
        <div class="chip player" tabindex="-1">
          ${text(() => chip.value >= 10000 ? `${chip.value / 1000}K` : chip.value)}
        </div>
      `)}
    </div>

  </div>

  <div class="table">
    ${repeat(() => tableNumbers, (tableNumber) => `
      <div class="number ${tableNumber.color}">
        ${text(() => tableNumber.value)}
      </div>
    `)}
  </div>
`
