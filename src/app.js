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
  { value: 300 },
  { value: 300 },
  { value: 300 },
  { value: 300 },
  { value: 300 },
]

/** @type {{ type: string, name: string, payout: number }[]}} */
const bets = [
  { type: 'even', name: 'Even', payout: 1 },
  { type: 'odd', name: 'Odd', payout: 1 },
  { type: 'red', name: 'Red', payout: 1 },
  { type: 'black', name: 'Black', payout: 1 },
  { type: 'green', name: 'Green', payout: 10 },
  { type: 'half', name: '1 to 18', payout: 1 },
  { type: 'half', name: '19 to 36', payout: 1 },
  { type: 'dozen', name: '1st 12', payout: 2 },
  { type: 'dozen', name: '2nd 12', payout: 2 },
  { type: 'dozen', name: '3rd 12', payout: 2 },
  { type: 'column', name: '1st Column', payout: 2 },
  { type: 'column', name: '2nd Column', payout: 2 },
  { type: 'column', name: '3rd Column', payout: 2 },
]

const betIndexToPosition = [
  'top',
  'right',
  'left',
  'bottom'
]

const shuffleBets = () => bets.toSorted(() => 0.5 - Math.random()).slice(0, 4)
let currentBets = shuffleBets()
let winningBet = null

//@ts-ignore
document.querySelector('#app').innerHTML = `
  <div class="left-side">
    <div class="wheel" ${ref()
      .on('click', () => {
        if (winningBet) return
        
        winningBet = currentBets[Math.floor(Math.random() * 4)]
        setTimeout(() => {
          winningBet = null
          setTimeout(() => {
            currentBets = shuffleBets()
            setTimeout(() => {
              currentBets = shuffleBets()
              setTimeout(() => {
                currentBets = shuffleBets()
              }, 100)
            }, 100)
          }, 300)
        }, 1000)
      })
    }>
      ${repeat(
        () => currentBets, 
        (bet) => `
          <div ${ref()
            .property('className', () => `pie ${bet.type} ${betIndexToPosition[currentBets.indexOf(bet)]}`)
            .class('winner', () => bet === winningBet)
          }>
            <div class="payout">
              ${bet.name}
              <div style="font-weight: 200;">
                +${bet.payout}00
              </div>
            </div>
          </div>
        `
      )}
    </div>

    <hr style="width: 100%;"/>
    
    <div style="color: #fff; text-align: center;">
      Turns: 10
    </div>
    <div style="color: #fff; text-align: center;">
      Placements: 5
    </div>
    
    <hr style="width: 100%;"/>

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
